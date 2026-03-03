/**
 * Event Bus - Centralized Event Management
 * Provides type-safe event publishing and subscribing
 */

export type EventHandler<T = any> = (payload: T) => void;
export type Unsubscribe = () => void;

export interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): Unsubscribe;
  once<T>(event: string, handler: EventHandler<T>): void;
  off<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, payload?: T): void;
  clear(event?: string): void;
}

const EVENT_NAME_ALIASES: Record<string, string> = {
  // Auth
  'auth:token:refresh': 'auth:token_refresh',
  // Content
  'content:article:created': 'content:article_created',
  'content:article:updated': 'content:article_updated',
  'content:article:deleted': 'content:article_deleted',
  'content:article:liked': 'content:article_liked',
  // Chat
  'chat:message:received': 'chat:message_received',
  'chat:message:sent': 'chat:message_sent',
  'chat:session:updated': 'chat:session_updated',
  // Communication & tools
  'communication:call:created': 'communication:call_created',
  'communication:call:updated': 'communication:call_updated',
  'tools:scan:completed': 'tools:scan_completed',
  // Agents (legacy camelCase)
  'agent:defaultChanged': 'agent:default_changed',
  'agent:favoriteToggled': 'agent:favorite_toggled',
  'agent:configUpdated': 'agent:config_updated',
  'conversation:created': 'agent:conversation_created',
  'conversation:deleted': 'agent:conversation_deleted',
  'conversation:pinned': 'agent:conversation_pinned',
  'conversation:archived': 'agent:conversation_archived',
  'message:sent': 'agent:message_sent',
  // Contacts (legacy camelCase)
  'contacts:contactAdded': 'contacts:contact_added',
  'contacts:contactUpdated': 'contacts:contact_updated',
  'contacts:contactDeleted': 'contacts:contact_deleted',
  'contacts:friendRequestReceived': 'contacts:friend_request_received',
  'contacts:friendRequestAccepted': 'contacts:friend_request_accepted',
  'contacts:friendRequestRejected': 'contacts:friend_request_rejected',
  // Creation (legacy camelCase)
  'creation:favoriteToggled': 'creation:favorite_toggled',
};

const normalizeEventName = (event: string): string => EVENT_NAME_ALIASES[event] || event;

class EventEmitter implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private onceHandlers: Map<string, Set<EventHandler>> = new Map();

  on<T>(event: string, handler: EventHandler<T>): Unsubscribe {
    const normalizedEvent = normalizeEventName(event);
    if (!this.handlers.has(normalizedEvent)) {
      this.handlers.set(normalizedEvent, new Set());
    }
    this.handlers.get(normalizedEvent)!.add(handler);

    return () => this.off(normalizedEvent, handler);
  }

  once<T>(event: string, handler: EventHandler<T>): void {
    const normalizedEvent = normalizeEventName(event);
    if (!this.onceHandlers.has(normalizedEvent)) {
      this.onceHandlers.set(normalizedEvent, new Set());
    }
    this.onceHandlers.get(normalizedEvent)!.add(handler);
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    const normalizedEvent = normalizeEventName(event);
    this.handlers.get(normalizedEvent)?.delete(handler);
    this.onceHandlers.get(normalizedEvent)?.delete(handler);
  }

  emit<T>(event: string, payload?: T): void {
    const normalizedEvent = normalizeEventName(event);
    // Execute regular handlers
    this.handlers.get(normalizedEvent)?.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${normalizedEvent}":`, error);
      }
    });

    // Execute once handlers
    this.onceHandlers.get(normalizedEvent)?.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in once handler for "${normalizedEvent}":`, error);
      }
    });
    this.onceHandlers.delete(normalizedEvent);
  }

  clear(event?: string): void {
    if (event) {
      const normalizedEvent = normalizeEventName(event);
      this.handlers.delete(normalizedEvent);
      this.onceHandlers.delete(normalizedEvent);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }
}

// Global event bus instance
export const eventBus: EventBus = new EventEmitter();

// Typed event helpers for common events
export const AppEvents = {
  // Auth events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_REFRESH: 'auth:token_refresh',

  // Navigation events
  NAVIGATE: 'navigate',
  NAVIGATE_BACK: 'navigate:back',

  // Chat events
  CHAT_MESSAGE_RECEIVED: 'chat:message_received',
  CHAT_MESSAGE_SENT: 'chat:message_sent',
  CHAT_SESSION_UPDATED: 'chat:session_updated',

  // UI events
  THEME_CHANGED: 'theme:changed',
  LANGUAGE_CHANGED: 'language:changed',
  KEYBOARD_SHOW: 'keyboard:show',
  KEYBOARD_HIDE: 'keyboard:hide',

  // Network events
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',

  // App lifecycle
  APP_FOREGROUND: 'app:foreground',
  APP_BACKGROUND: 'app:background',

  // Content events
  CONTENT_ARTICLE_CREATED: 'content:article_created',
  CONTENT_ARTICLE_UPDATED: 'content:article_updated',
  CONTENT_ARTICLE_DELETED: 'content:article_deleted',
  CONTENT_ARTICLE_LIKED: 'content:article_liked',

  // Video events
  VIDEO_CREATED: 'video:created',
  VIDEO_UPDATED: 'video:updated',
  VIDEO_DELETED: 'video:deleted',
  VIDEO_LIKED: 'video:liked',

  // Communication events
  CALL_RECORD_CREATED: 'communication:call_created',
  CALL_RECORD_UPDATED: 'communication:call_updated',

  // Tools events
  SCAN_COMPLETED: 'tools:scan_completed',
} as const;

// Helper functions for typed events
export function onAppEvent<T>(event: string, handler: EventHandler<T>): Unsubscribe {
  return eventBus.on(event, handler);
}

export function emitAppEvent<T>(event: string, payload?: T): void {
  eventBus.emit(event, payload);
}

// Backward compatibility - EVENTS constant
export const EVENTS = {
  DATA_CHANGE: 'data:change',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  CHAT_MESSAGE_RECEIVED: 'chat:message_received',
  CHAT_MESSAGE_SENT: 'chat:message_sent',
  CHAT_SESSION_UPDATED: 'chat:session_updated',
  THEME_CHANGED: 'theme:changed',
  LANGUAGE_CHANGED: 'language:changed',
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',
  APP_FOREGROUND: 'app:foreground',
  APP_BACKGROUND: 'app:background',
} as const;
