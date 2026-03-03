
import React from 'react';

// Re-export specific business logic interfaces
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string | React.ReactNode; 
  description: string;
  systemInstruction: string;
  initialMessage: string;
  tags?: string[];
}

// Import from packages
import { Message as ServiceMessage, ChatSession as ServiceSession } from '@sdkwork/react-mobile-chat';

export type Message = ServiceMessage;
export type ChatSession = ServiceSession;
