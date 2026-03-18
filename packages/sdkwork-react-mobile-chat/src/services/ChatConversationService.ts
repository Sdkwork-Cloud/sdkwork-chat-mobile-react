import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Agent } from '../config/agentRegistry';
import { createChatSdkService } from './ChatSdkService';
import type { IChatSdkService } from './ChatSdkService';

export interface ChatConversationReplyTo {
  id: string;
  name: string;
  content: string;
}

export interface ChatConversationImage {
  mimeType: string;
  data: string;
}

export interface ChatConversationHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export interface ChatConversationStreamInput {
  sessionId: string;
  history: ChatConversationHistoryItem[];
  prompt: string;
  agent: Agent;
  images?: ChatConversationImage[];
}

export interface IChatConversationService {
  buildPrompt(text: string, replyTo?: ChatConversationReplyTo, images?: ChatConversationImage[]): string;
  streamReply(input: ChatConversationStreamInput): AsyncGenerator<string>;
  clearSessionState(sessionId: string): void;
}

type GoalKind = 'none' | 'general' | 'shopping' | 'coding' | 'writing' | 'english' | 'image';

interface ConversationGoal {
  kind: GoalKind;
  topic: string;
  step: number;
  updatedAt: number;
}

interface ReplyRuntime {
  now: () => number;
  createId: (prefix: string) => string;
}

const CONTINUE_KEYWORDS = [
  '\u7ee7\u7eed',
  '\u5c55\u5f00',
  '\u7ec6\u5316',
  '\u8be6\u7ec6',
  '\u7136\u540e',
  '\u518d\u6765',
  'go on',
  'continue',
  'more',
];
const ORDER_KEYWORDS = ['\u4e0b\u5355', '\u7ed3\u8d26', '\u7acb\u5373\u8d2d\u4e70', 'buy now', 'checkout'];
const SHOPPING_KEYWORDS = [
  '\u63a8\u8350',
  '\u8d2d\u4e70',
  '\u5546\u54c1',
  'shopping',
  '\u8033\u673a',
  '\u5976\u8336',
  '\u996e\u54c1',
  'headphones',
];
const GOAL_TTL_MS = 30 * 60 * 1000;
const STREAM_CHUNK_SIZE = 6;
const STREAM_DELAY_MS = 16;

const EMPTY_GOAL: ConversationGoal = {
  kind: 'none',
  topic: '',
  step: 0,
  updatedAt: 0,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stripReplyPrefix = (prompt: string): string =>
  prompt.replace(/^\[In reply to ".*?"\]\s*/i, '').trim();

const includesAny = (text: string, list: string[]) => list.some((item) => text.includes(item));

const isContinuation = (prompt: string): boolean => {
  const lower = prompt.toLowerCase();
  return includesAny(lower, CONTINUE_KEYWORDS);
};

const pickProductCards = (prompt: string) => {
  const lower = prompt.toLowerCase();

  if (
    lower.includes('\u5976\u8336') ||
    lower.includes('\u996e\u54c1') ||
    lower.includes('drink') ||
    lower.includes('coffee')
  ) {
    return [
      {
        id: 'drink_1',
        name: 'Mango Pomelo (Large)',
        price: 22,
        originalPrice: 28,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
        reason: 'Fresh flavor profile with balanced sweetness.',
        tags: ['Popular', 'Low sugar'],
        shopName: 'OpenTea',
        rating: 4.8,
      },
      {
        id: 'drink_2',
        name: 'Coconut Latte (Hot)',
        price: 19,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
        reason: 'Clear milk and coffee layers, good for quick focus.',
        tags: ['Energy', 'Warm'],
        shopName: 'Lucky Bean',
        rating: 4.7,
      },
      {
        id: 'drink_3',
        name: 'Cheese Grape',
        price: 29,
        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600',
        reason: 'Strong fruit notes with rich mouthfeel.',
        tags: ['Fresh fruit', 'Cheese foam'],
        shopName: 'Fresh Wave',
        rating: 4.6,
      },
    ];
  }

  return [
    {
      id: 'sony_xm5',
      name: 'Sony WH-1000XM5',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      reason: 'Strong ANC and stable battery life for commute and travel.',
      tags: ['ANC', 'Battery'],
      shopName: 'Sony Official Store',
      rating: 4.9,
    },
    {
      id: 'bose_qc45',
      name: 'Bose QC45',
      price: 1999,
      originalPrice: 2299,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
      reason: 'Comfortable for long sessions with balanced sound signature.',
      tags: ['Comfort', 'Classic'],
      shopName: 'Bose Flagship Store',
      rating: 4.7,
    },
    {
      id: 'airpods_max',
      name: 'AirPods Max',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600',
      reason: 'Excellent integration with Apple devices and spatial audio.',
      tags: ['Ecosystem', 'Premium'],
      shopName: 'Apple Store',
      rating: 4.8,
    },
  ];
};

const buildOrderCard = (prompt: string, runtime: ReplyRuntime) => {
  const cleaned = stripReplyPrefix(prompt).replace(/^\u4e0b\u5355|^\u7ed3\u8d26/i, '').replace(/[:\uff1a]/g, '').trim();
  const name = cleaned || 'Recommended Item';
  return [
    {
      id: runtime.createId('order'),
      name: `${name} (Pending payment)`,
      price: 199,
      image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600',
      reason: 'Order created. Please complete payment within 15 minutes.',
      tags: ['Instant discount', 'Refund supported'],
      shopName: 'OpenChat Store',
      rating: 5,
    },
  ];
};

const buildContinuationReply = (
  history: ChatConversationHistoryItem[],
  agent: Agent,
  goal?: ConversationGoal,
): string => {
  const behaviorId = agent.behaviorId || agent.id;
  if (goal?.kind === 'shopping') {
    if (goal.step <= 0) {
      return [
        `Here is a direct recommendation for "${goal.topic || 'shopping'}":`,
        '1. Best value: Bose QC45.',
        '2. Strongest ANC: Sony XM5.',
        '3. Best Apple integration: AirPods Max.',
        '',
        'Reply with your budget and I will give one final pick.',
      ].join('\n');
    }
    if (goal.step === 1) {
      return [
        'Pre-order checklist:',
        '1. Check 30-day price trend.',
        '2. Verify return and warranty policy.',
        '3. Confirm compatibility with your main devices.',
      ].join('\n');
    }
    return 'If you want, I can provide one final pick + reason + purchase suggestion based on your budget.';
  }

  if (goal?.kind === 'coding') {
    if (goal.step <= 0) {
      return [
        `Deep-dive plan for "${goal.topic || 'debugging'}":`,
        '1. Add guard clauses before the failing line.',
        '2. Verify update order with logs to isolate race conditions.',
        '3. Extract core logic into pure functions for tests.',
      ].join('\n');
    }
    if (goal.step === 1) {
      return [
        'Patch strategy:',
        '1. Ship a minimal safe fix first.',
        '2. Refactor duplicate paths.',
        '3. Add one key regression test.',
      ].join('\n');
    }
    return 'Share your code and I can provide a line-by-line patch.';
  }

  if (goal?.kind === 'writing') {
    if (goal.step <= 0) {
      return [
        `Writing expansion for "${goal.topic || 'draft'}":`,
        '1. Start with one-sentence context and pain point.',
        '2. Add 2-3 concrete facts and benefits.',
        '3. End with one clear CTA.',
      ].join('\n');
    }
    if (goal.step === 1) {
      return [
        'Polish pass:',
        '1. Replace vague adjectives with measurable outcomes.',
        '2. Keep each paragraph within 3 sentences.',
        '3. Keep title concise.',
      ].join('\n');
    }
    return 'Send your draft and I can polish it into a publish-ready version.';
  }

  if (goal?.kind === 'english') {
    return [
      'Sure, let us continue.',
      'Write one sentence about your goal today.',
      'I will refine it into a more natural native-style version.',
    ].join('\n');
  }

  const lastModel = [...history].reverse().find((msg) => msg.role === 'model')?.content || '';
  if (lastModel.includes('[\u5546\u54c1]') || lastModel.includes('[product]')) {
    return [
      'More purchase suggestions:',
      '1. Budget 1000-2000: Bose QC45.',
      '2. Budget 2000-3000: Sony XM5.',
      '3. Apple ecosystem first: AirPods Max.',
      '',
      'Tell me your budget and commute needs, and I will provide one final pick.',
    ].join('\n');
  }

  if (behaviorId === 'agent_coder') {
    return [
      'Further debugging suggestions:',
      '1. Add logs around key state transitions.',
      '2. Verify stale closures in async callbacks.',
      '3. Add a minimal test for the core path.',
    ].join('\n');
  }

  if (behaviorId === 'agent_writer') {
    return [
      'Writing structure suggestions:',
      '1. Opening: one sentence to define the pain point.',
      '2. Body: 2-3 verifiable benefits.',
      '3. Ending: a clear call to action.',
    ].join('\n');
  }

  return [
    'I can continue with an executable plan:',
    '1. Clarify goals and constraints.',
    '2. Provide 2-3 practical options.',
    '3. Recommend one default path.',
  ].join('\n');
};

const buildGoalFromPrompt = (
  prompt: string,
  agent: Agent,
  history: ChatConversationHistoryItem[],
  previousGoal: ConversationGoal,
  now: number,
): ConversationGoal => {
  const clean = stripReplyPrefix(prompt);
  const lower = clean.toLowerCase();
  const behaviorId = agent.behaviorId || agent.id;

  if (isContinuation(clean)) {
    const isGoalFresh = now - previousGoal.updatedAt < GOAL_TTL_MS;
    if (previousGoal.kind !== 'none') {
      if (!isGoalFresh) return { kind: 'general', topic: clean || 'general task', step: 0, updatedAt: now };
      return { ...previousGoal, updatedAt: now };
    }

    if (behaviorId === 'agent_coder') return { kind: 'coding', topic: 'coding issue', step: 0, updatedAt: now };
    if (behaviorId === 'agent_writer') return { kind: 'writing', topic: 'writing task', step: 0, updatedAt: now };
    if (behaviorId === 'agent_english') return { kind: 'english', topic: 'english practice', step: 0, updatedAt: now };

    const lastUser = [...history].reverse().find((item) => item.role === 'user')?.content || '';
    const infer = `${lastUser} ${clean}`.toLowerCase();
    if (includesAny(infer, SHOPPING_KEYWORDS) || includesAny(infer, ORDER_KEYWORDS)) {
      return { kind: 'shopping', topic: lastUser || 'product recommendation', step: 0, updatedAt: now };
    }
    return { kind: 'general', topic: lastUser || 'general task', step: 0, updatedAt: now };
  }

  if (behaviorId === 'agent_image') return { kind: 'image', topic: clean, step: 0, updatedAt: now };
  if (behaviorId === 'agent_coder') return { kind: 'coding', topic: clean, step: 0, updatedAt: now };
  if (behaviorId === 'agent_writer') return { kind: 'writing', topic: clean, step: 0, updatedAt: now };
  if (behaviorId === 'agent_english') return { kind: 'english', topic: clean, step: 0, updatedAt: now };

  if (includesAny(lower, SHOPPING_KEYWORDS) || includesAny(lower, ORDER_KEYWORDS)) {
    return { kind: 'shopping', topic: clean, step: 0, updatedAt: now };
  }

  return { kind: 'general', topic: clean, step: 0, updatedAt: now };
};

const buildResponse = (
  history: ChatConversationHistoryItem[],
  prompt: string,
  agent: Agent,
  images: ChatConversationImage[] | undefined,
  goal: ConversationGoal,
  runtime: ReplyRuntime,
): string => {
  const cleanPrompt = stripReplyPrefix(prompt);
  const lower = cleanPrompt.toLowerCase();
  const lastUserMessage = [...history].reverse().find((msg) => msg.role === 'user')?.content || '';
  const behaviorId = agent.behaviorId || agent.id;

  if (images && images.length > 0) {
    if (behaviorId === 'agent_image') {
      return [
        'Image received. You can specify a direction:',
        '1. Style transfer: cyberpunk / illustration / cinematic.',
        '2. Content redraw: background / outfit / lighting.',
        '3. Commercial adaptation: product cover / poster / banner.',
      ].join('\n');
    }
    return 'Image received. Tell me a specific goal such as OCR or style analysis.';
  }

  if (isContinuation(cleanPrompt)) {
    return buildContinuationReply(history, agent, goal);
  }

  if (includesAny(lower, ORDER_KEYWORDS)) {
    const orderCard = buildOrderCard(cleanPrompt, runtime);
    return `Order details generated:\n\n[product] ${JSON.stringify(orderCard)}`;
  }

  if (includesAny(lower, SHOPPING_KEYWORDS)) {
    const cards = pickProductCards(cleanPrompt);
    return `Based on your request, here are 3 options for direct comparison:\n\n[product] ${JSON.stringify(cards)}`;
  }

  if (behaviorId === 'agent_coder') {
    if (lower.includes('typeerror') || lower.includes('cannot read properties') || lower.includes('\u62a5\u9519')) {
      return [
        'This error usually means a value is null or undefined. Debug in this order:',
        '1. Add optional chaining and default values before the failing line.',
        '2. Trace data origin and async timing.',
        '3. Log type/value at key points to find where undefined first appears.',
        '',
        'Share the component code and I can provide an exact patch.',
      ].join('\n');
    }

    return [
      'Received your dev issue. Recommended sequence:',
      '1. Build a minimal reproduction and pin boundaries.',
      '2. Trace state flow (props/store/effect) for race conditions.',
      '3. Add tests for key interaction paths.',
      '',
      'If you share stack trace and code, I can provide a directly applicable fix.',
    ].join('\n');
  }

  if (behaviorId === 'agent_writer') {
    if (lower.includes('\u5468\u62a5') || lower.includes('\u65e5\u62a5')) {
      return [
        'Weekly report template:',
        '1. Weekly goals',
        '2. Key progress',
        '3. Risks and blockers',
        '4. Next-week plan',
        '',
        'Send me your specifics and I will produce a complete version.',
      ].join('\n');
    }

    return [
      'Writing framework:',
      '1. Who is the target reader?',
      '2. What is the core point?',
      '3. What action should the reader take?',
      '',
      'Provide these three inputs and I can draft a publish-ready version.',
    ].join('\n');
  }

  if (behaviorId === 'agent_english') {
    if (/[\u4e00-\u9fa5]/.test(cleanPrompt)) {
      return [
        'Great. I can help you translate and polish it.',
        `Original idea: ${cleanPrompt}`,
        'A natural English version could be: "Could you help me improve this sentence?"',
        'Reply with one sentence and I will refine it.',
      ].join('\n');
    }

    return [
      "Great question. Let's keep practicing in English.",
      `You said: "${cleanPrompt}"`,
      'Could you add one more detail so I can improve your sentence?',
    ].join('\n');
  }

  const contextHint =
    lastUserMessage && lastUserMessage !== cleanPrompt ? `\n\nI also noticed you mentioned: ${lastUserMessage}` : '';
  return `I understand your request: ${cleanPrompt}\n\nIf you want, I can continue with an executable next-step checklist.${contextHint}`;
};

class ChatConversationServiceImpl implements IChatConversationService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly goalBySession = new Map<string, ConversationGoal>();
  private readonly sdkService: IChatSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createChatSdkService(deps);
  }

  buildPrompt(text: string, replyTo?: ChatConversationReplyTo, images?: ChatConversationImage[]): string {
    let prompt = text;
    if (replyTo) {
      prompt = `[In reply to "${replyTo.content}"] ${text}`;
    }
    if (images && images.length > 0 && !prompt.trim()) {
      prompt = 'Describe this image.';
    }
    return prompt;
  }

  clearSessionState(sessionId: string): void {
    this.goalBySession.delete(sessionId);
  }

  async *streamReply(input: ChatConversationStreamInput): AsyncGenerator<string> {
    const previousGoal = this.goalBySession.get(input.sessionId) || EMPTY_GOAL;
    const currentGoal = buildGoalFromPrompt(
      input.prompt,
      input.agent,
      input.history,
      previousGoal,
      this.deps.clock.now(),
    );
    this.goalBySession.set(input.sessionId, currentGoal);

    const sdkReply = await this.sdkService.requestReply({
      localSessionId: input.sessionId,
      prompt: input.prompt,
      agent: input.agent,
      images: input.images,
    });

    const response =
      sdkReply?.content ||
      buildResponse(input.history, input.prompt, input.agent, input.images, currentGoal, {
        now: () => this.deps.clock.now(),
        createId: (prefix: string) => this.deps.idGenerator.next(prefix),
      });

    for (let i = 0; i < response.length; i += STREAM_CHUNK_SIZE) {
      yield response.slice(i, i + STREAM_CHUNK_SIZE);
      await delay(STREAM_DELAY_MS);
    }

    if (isContinuation(input.prompt)) {
      this.goalBySession.set(input.sessionId, {
        ...currentGoal,
        step: currentGoal.step + 1,
        updatedAt: this.deps.clock.now(),
      });
    }
  }
}

export function createChatConversationService(_deps?: ServiceFactoryDeps): IChatConversationService {
  return new ChatConversationServiceImpl(_deps);
}

export const chatConversationService: IChatConversationService = createChatConversationService();
