export const DEFAULT_AGENT_ID = 'omni_core';

export interface Agent {
  id: string;
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
    name: 'OpenChat 智能助手',
    avatar: '🤖',
    description: 'OpenChat 官方助手',
    initialMessage: '你好，我是 OpenChat 智能助手。有什么可以帮你？',
    systemInstruction:
      "You are a helpful, clever, and professional AI assistant in OpenChat. Keep answers concise, structured, and mobile-friendly.",
    tags: ['all', 'prod'],
  },
  agent_marketing: {
    id: 'agent_marketing',
    name: '首席营销官',
    avatar: '💹',
    description: '营销文案、活动策划、增长建议',
    initialMessage: '你好，我是你的营销助手。告诉我你的产品或活动目标，我来帮你制定方案。',
    systemInstruction:
      'You are a professional CMO assistant. Use AIDA structure and provide practical, ready-to-use marketing copy.',
    tags: ['prod', 'all'],
  },
  agent_shopper: {
    id: 'agent_shopper',
    name: '好物推荐官',
    avatar: '🛍️',
    description: '选品建议、比价、购买决策',
    initialMessage: '你好，我可以根据预算和场景给你推荐商品。你想买什么？',
    systemInstruction:
      'You are an AI shopping assistant. Return clear, structured comparisons and practical buying advice.',
    tags: ['all', 'fun', 'prod'],
  },
  agent_writer: {
    id: 'agent_writer',
    name: 'AI 写作助手',
    avatar: '✍️',
    description: '周报、邮件、文章与润色',
    initialMessage: '你好，我是你的写作助手。告诉我写作目标和受众，我来起草。',
    systemInstruction:
      'You are an expert writer and editor. Produce polished, concise content and ask clarifying questions when needed.',
    tags: ['all', 'prod', 'study'],
  },
  agent_coder: {
    id: 'agent_coder',
    name: '代码专家',
    avatar: '👨‍💻',
    description: 'React、TypeScript、Python、Node.js',
    initialMessage: '你好，我是代码助手。把报错或需求贴给我，我来帮你解决。',
    systemInstruction:
      'You are a senior engineer. Provide correct code, explain tradeoffs, and prioritize production quality.',
    tags: ['all', 'prod'],
  },
  agent_english: {
    id: 'agent_english',
    name: '英语口语教练',
    avatar: '🇺🇸',
    description: '口语练习与纠错',
    initialMessage: "Hi! I'm your speaking coach. What topic do you want to practice today?",
    systemInstruction:
      'You are a friendly English coach. Keep conversation natural and correct mistakes gently.',
    tags: ['all', 'study'],
  },
  agent_image: {
    id: 'agent_image',
    name: 'Prompt 画师',
    avatar: '🎨',
    description: '图像提示词与风格建议',
    initialMessage: '请描述你想生成的画面，我会给出高质量提示词。',
    systemInstruction:
      'You are an expert prompt engineer for image generation. Provide cinematic, detailed prompts.',
    tags: ['all', 'img', 'fun'],
  },
  custom_1: {
    id: 'custom_1',
    name: '我的私人助理',
    avatar: '🤖',
    description: '日程管理与任务规划',
    initialMessage: '你好，我是你的私人助理。今天想先处理哪件事？',
    systemInstruction: 'You are a personal assistant focused on planning and execution.',
    tags: ['mine'],
  },
  custom_2: {
    id: 'custom_2',
    name: '英语搭子',
    avatar: '🗣️',
    description: '英语对话陪练',
    initialMessage: "Hello! Let's practice speaking. What did you do this week?",
    systemInstruction: 'You are an IELTS speaking partner. Ask questions and guide practice.',
    tags: ['mine'],
  },
  custom_3: {
    id: 'custom_3',
    name: 'Python 脚本助手',
    avatar: '🐍',
    description: '自动化脚本与工具开发',
    initialMessage: '告诉我你的自动化需求，我会给出可运行脚本。',
    systemInstruction: 'You are a Python automation expert. Provide runnable, concise scripts.',
    tags: ['mine'],
  },
};

export const getAgent = (id: string): Agent => AGENT_REGISTRY[id] || AGENT_REGISTRY[DEFAULT_AGENT_ID];
