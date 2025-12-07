'use client';

import { useEffect, useState } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWebSocket, useWebSocketSubscription } from '@/contexts/websocket-context';

interface NotificationBarProps {
  className?: string;
}

export function NotificationBar({ className }: NotificationBarProps) {
  const { isConnected, lastMessage, connectionStatus } = useWebSocket();
  const [recentNotifications, setRecentNotifications] = useState<string[]>([]);

  // Subscribe to specific notification types
  const blockNotification = useWebSocketSubscription(['blockFound', 'blockUnlocked'], (message) => {
    // Handle block-related notifications
    const notificationText = message.type === 'blockFound' 
      ? `🎉 New block found!` 
      : `✅ Block unlocked!`;
    
    setRecentNotifications(prev => [notificationText, ...prev.slice(0, 4)]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setRecentNotifications(prev => prev.slice(0, -1));
    }, 10000);
  });

  const paymentNotification = useWebSocketSubscription(['payment'], (message) => {
    // Handle payment notifications
    setRecentNotifications(prev => [`💰 Payment processed!`, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setRecentNotifications(prev => prev.slice(0, -1));
    }, 10000);
  });

  return (
    <div className={`flex items-center space-x-4 p-2 border-b bg-background/95 backdrop-blur ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-xs text-muted-foreground">
          {connectionStatus}
        </span>
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <div className="flex space-x-1">
            {recentNotifications.map((notification, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {notification}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Last Message Indicator */}
      {lastMessage && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>Last:</span>
          <Badge variant="outline" className="text-xs">
            {lastMessage.type}
          </Badge>
          <span>{new Date(lastMessage.timestamp).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}

export default NotificationBar;
