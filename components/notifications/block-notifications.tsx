"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useWebSocket, useWebSocketSubscription } from "@/contexts/websocket-context";
import { useSound } from "../../contexts/sound-context";
import { CoinIcon } from "@/components/ui/coin-icon";

interface BlockUnlockedNotification {
  type: "blockunlocked";
  poolId: string;
  blockHeight: number;
  symbol: string;
  name: string;
  status: string;
  blockType: string;
  blockHash: string;
  reward: number;
  effort: number;
  miner: string;
  explorerLink: string;
  minerExplorerLink: string;
}

interface BlockFoundNotification {
  type: "blockfound";
  poolId: string;
  blockHeight: number;
  symbol: string;
  name: string;
  miner: string;
  minerExplorerLink: string;
  source: string;
  reward?: number;
}

export function BlockNotifications() {
  const { isConnected } = useWebSocket();
  const { playNotificationSound } = useSound();
  const toastCountRef = useRef(0);
  const maxToasts = 10;

  // Function to send notifications to Discord webhook
  const sendToDiscord = async (
    notification: BlockFoundNotification | BlockUnlockedNotification
  ) => {
    // DISABLED: Frontend Discord notifications to prevent duplicates
    // Discord notifications are handled by the backend discord-bridge script
    /*
    try {
      const response = await fetch("/api/discord/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        console.warn(
          "Discord webhook failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.warn("Failed to send Discord notification:", error);
    }
    */
  };

  // Use the proper WebSocket subscription hook
  useWebSocketSubscription(['blockfound', 'blockunlocked'], (message: any) => {
    // Parse the message data - it could be nested in the data property
    let notification: any;
    try {
      // If message.data is a string, parse it
      if (typeof message.data === "string") {
        notification = JSON.parse(message.data);
      } else {
        // If message.data is already an object, use it directly
        notification = message.data;
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      return;
    }

    // Handle block found notifications
    if (notification?.type === "blockfound") {
      const blockData = notification as BlockFoundNotification;

      // Play notification sound
      playNotificationSound();

      // Send to Discord webhook (async, don't wait)
      sendToDiscord(blockData).catch((error) => {
        console.warn("Failed to send Discord notification:", error);
      });

      // Limit the number of toasts shown
      if (toastCountRef.current >= maxToasts) {
        toast.dismiss(); // Dismiss oldest toast
        toastCountRef.current = maxToasts - 1;
      }

      toast(
        <div className="flex items-center gap-3">
          <CoinIcon symbol={blockData.symbol} name={blockData.name} size={24} />
          <div>
            <div className="font-semibold">
              🎉 Block Found! {blockData.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Block #{blockData.blockHeight} • Reward: {blockData.reward} {blockData.symbol}
            </div>
            <div className="text-xs text-muted-foreground">
              Miner: {blockData.miner}
            </div>
          </div>
        </div>,
        {
          duration: 8000,
          action: {
            label: "×",
            onClick: () => {
              // Toast will auto-dismiss when action is clicked
            },
          },
          style: {
            "--toast-action-background": "transparent",
            "--toast-action-color": "var(--muted-foreground)",
          } as React.CSSProperties,
        }
      );

      toastCountRef.current++;
      console.log(
        `🎉 Block found notification: ${blockData.name} block #${blockData.blockHeight}`
      );
    }

    // Handle block unlocked notifications
    if (notification?.type === "blockunlocked") {
      const blockData = notification as BlockUnlockedNotification;

      // Play notification sound
      playNotificationSound();

      // Send to Discord webhook (async, don't wait)
      sendToDiscord(blockData).catch((error: any) => {
        console.warn("Failed to send Discord notification:", error);
      });

      // Limit the number of toasts shown
      if (toastCountRef.current >= maxToasts) {
        toast.dismiss(); // Dismiss oldest toast
        toastCountRef.current = maxToasts - 1;
      }

      // Determine status emoji and color
      const isConfirmed = blockData.status === "Confirmed";
      const isOrphaned = blockData.status === "Orphaned";
      const statusEmoji = isConfirmed ? "✅" : isOrphaned ? "💔" : "⏳";

      toast(
        <div className="flex items-center gap-3">
          <CoinIcon symbol={blockData.symbol} name={blockData.name} size={24} />
          <div>
            <div className="font-semibold">
              {statusEmoji} Block {blockData.status}! {blockData.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Block #{blockData.blockHeight} • Reward: {blockData.reward} {blockData.symbol}
            </div>
            <div className="text-xs text-muted-foreground">
              Miner: {blockData.miner}
            </div>
          </div>
        </div>,
        {
          duration: 8000,
          action: {
            label: "×",
            onClick: () => {
              // Toast will auto-dismiss when action is clicked
            },
          },
          style: {
            "--toast-action-background": "transparent",
            "--toast-action-color": "var(--muted-foreground)",
          } as React.CSSProperties,
        }
      );

      toastCountRef.current++;
      console.log(
        `${statusEmoji} Block ${blockData.status.toLowerCase()} notification: ${blockData.name} block #${blockData.blockHeight}`
      );
    }
  });

  return null; // This component doesn't render anything visible
}
