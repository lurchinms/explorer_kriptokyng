'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  connectionStatus: string;
  error: string | null;
  testConnection: () => Promise<boolean>;
  subscribe: (types: string[] | undefined, callback: (message: WebSocketMessage) => void) => void;
  unsubscribe: (callback: (message: WebSocketMessage) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(message: WebSocketMessage) => void>>>(new Map());

  const subscribe = (types: string[] | undefined, callback: (message: WebSocketMessage) => void) => {
    if (types) {
      types.forEach(type => {
        if (!subscribers.has(type)) {
          subscribers.set(type, new Set());
        }
        subscribers.get(type)?.add(callback);
      });
    }
  };

  const unsubscribe = (callback: (message: WebSocketMessage) => void) => {
    subscribers.forEach(subs => subs.delete(callback));
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      // Mock test connection - in real implementation this would test actual WebSocket
      setError(null);
      setConnectionStatus('Testing...');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, always return true for mock
      setIsConnected(true);
      setConnectionStatus('Connected');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      setConnectionStatus('Failed');
      setIsConnected(false);
      return false;
    }
  };

  // Mock WebSocket connection for now
  useEffect(() => {
    setIsConnected(true);
    setConnectionStatus('Connected');
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, connectionStatus, error, testConnection, subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketSubscription(types: string[] | undefined, callback: (message: WebSocketMessage) => void) {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    console.warn('WebSocket context not found, using mock implementation');
    return;
  }

  useEffect(() => {
    context.subscribe(types, callback);
    return () => context.unsubscribe(callback);
  }, [types, callback, context]);
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    console.warn('WebSocket context not found, using mock implementation');
    return { 
      isConnected: false, 
      lastMessage: null, 
      connectionStatus: 'Disconnected',
      error: null,
      testConnection: async () => false
    };
  }

  return { 
    isConnected: context.isConnected, 
    lastMessage: context.lastMessage,
    connectionStatus: context.connectionStatus,
    error: context.error,
    testConnection: context.testConnection
  };
}
