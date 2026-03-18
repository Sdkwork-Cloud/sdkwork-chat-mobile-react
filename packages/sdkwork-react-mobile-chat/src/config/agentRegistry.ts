export const DEFAULT_AGENT_ID = 'omni_core';

export interface Agent {
  id: string;
  behaviorId?: string;
  sdkModelId?: string;
  name: string;
  avatar: string;
  description: string;
  initialMessage: string;
  systemInstruction: string;
  tags: string[];
}

export const AGENT_REGISTRY: Record<string, Agent> = {
  [DEFAULT_AGENT_ID]: {
    id: DEFAULT_AGENT_ID,
    name: 'OpenChat Assistant',
    avatar: '🤖',
    description: 'Official OpenChat assistant',
    initialMessage: 'Hello, I am the OpenChat assistant. How can I help today?',
    systemInstruction:
      'You are a helpful, clever, and professional AI assistant in OpenChat. Keep answers concise, structured, and mobile-friendly.',
    tags: ['all', 'prod'],
  },
  agent_marketing: {
    id: 'agent_marketing',
    name: 'Chief Marketing Officer',
    avatar: '📣',
    description: 'Campaign ideas, launch copy, and growth strategy',
    initialMessage:
      'Tell me about your product or campaign goal and I will help shape a practical marketing plan.',
    systemInstruction:
      'You are a professional CMO assistant. Use AIDA structure and provide practical, ready-to-use marketing copy.',
    tags: ['prod', 'all'],
  },
  agent_shopper: {
    id: 'agent_shopper',
    name: 'Shopping Guide',
    avatar: '🛍️',
    description: 'Product picks, comparisons, and buying advice',
    initialMessage:
      'Share your budget and scenario, and I will recommend the most suitable options.',
    systemInstruction:
      'You are an AI shopping assistant. Return clear, structured comparisons and practical buying advice.',
    tags: ['all', 'fun', 'prod'],
  },
  agent_writer: {
    id: 'agent_writer',
    name: 'AI Writer',
    avatar: '✍️',
    description: 'Reports, emails, articles, and editing support',
    initialMessage:
      'Tell me what you need to write, who it is for, and what tone you want. I will draft it with you.',
    systemInstruction:
      'You are an expert writer and editor. Produce polished, concise content and ask clarifying questions when needed.',
    tags: ['all', 'prod', 'study'],
  },
  agent_coder: {
    id: 'agent_coder',
    name: 'Coding Expert',
    avatar: '👨‍💻',
    description: 'React, TypeScript, Python, and Node.js',
    initialMessage:
      'Paste the bug, the requirement, or the code snippet, and I will help you work through it.',
    systemInstruction:
      'You are a senior engineer. Provide correct code, explain tradeoffs, and prioritize production quality.',
    tags: ['all', 'prod'],
  },
  agent_english: {
    id: 'agent_english',
    name: 'English Coach',
    avatar: '🇬🇧',
    description: 'Speaking practice and gentle corrections',
    initialMessage: "Hi! I'm your speaking coach. What topic do you want to practice today?",
    systemInstruction:
      'You are a friendly English coach. Keep conversation natural and correct mistakes gently.',
    tags: ['all', 'study'],
  },
  agent_image: {
    id: 'agent_image',
    name: 'Prompt Artist',
    avatar: '🎨',
    description: 'Image prompts and style direction',
    initialMessage:
      'Describe the visual you want to create and I will turn it into a high-quality image prompt.',
    systemInstruction:
      'You are an expert prompt engineer for image generation. Provide cinematic, detailed prompts.',
    tags: ['all', 'img', 'fun'],
  },
  custom_1: {
    id: 'custom_1',
    name: 'My Personal Assistant',
    avatar: '🤖',
    description: 'Planning, scheduling, and execution support',
    initialMessage: 'What would you like to organize or tackle first today?',
    systemInstruction: 'You are a personal assistant focused on planning and execution.',
    tags: ['mine'],
  },
  custom_2: {
    id: 'custom_2',
    name: 'English Buddy',
    avatar: '🗣️',
    description: 'Conversational English practice',
    initialMessage: "Hello! Let's practice speaking. What did you do this week?",
    systemInstruction: 'You are an IELTS speaking partner. Ask questions and guide practice.',
    tags: ['mine'],
  },
  custom_3: {
    id: 'custom_3',
    name: 'Python Script Assistant',
    avatar: '🐍',
    description: 'Automation scripts and developer utilities',
    initialMessage:
      'Describe the automation you need and I will sketch a runnable Python script for it.',
    systemInstruction: 'You are a Python automation expert. Provide runnable, concise scripts.',
    tags: ['mine'],
  },
};

export const getAgent = (id: string): Agent => AGENT_REGISTRY[id] || AGENT_REGISTRY[DEFAULT_AGENT_ID];

export const resolveAgentProfile = (id: string, override?: Partial<Agent> | null): Agent => {
  const requestedId = (id || override?.id || DEFAULT_AGENT_ID).trim() || DEFAULT_AGENT_ID;
  const behaviorId = (override?.behaviorId || requestedId).trim() || DEFAULT_AGENT_ID;
  const base = getAgent(behaviorId);
  const definedOverride = Object.fromEntries(
    Object.entries(override || {}).filter(([, value]) => value !== undefined),
  ) as Partial<Agent>;

  return {
    ...base,
    ...definedOverride,
    id: requestedId,
    behaviorId,
    sdkModelId: override?.sdkModelId?.trim() || base.sdkModelId,
    tags: override?.tags?.length ? [...override.tags] : [...base.tags],
  };
};

export const resolveSessionAgent = (session?: { agentId?: string; agentProfile?: Partial<Agent> | null } | null): Agent => {
  if (!session?.agentId && !session?.agentProfile?.id) {
    return resolveAgentProfile(DEFAULT_AGENT_ID);
  }
  return resolveAgentProfile(session.agentId || session.agentProfile?.id || DEFAULT_AGENT_ID, session.agentProfile);
};
