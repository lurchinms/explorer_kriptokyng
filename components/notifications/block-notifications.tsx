"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useWebSocket } from "@/contexts/websocket-context";
import { useSound } from "@/contexts/sound-context";
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
}

export function BlockNotifications() {
  const websocketContext = useWebSocket();
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

  useEffect(() => {
    // Check if WebSocket context is available
    if (!websocketContext || !websocketContext.subscribe) {
      console.warn("WebSocket context not available for block notifications");
      return;
    }

    const { subscribe } = websocketContext;

    const unsubscribe = subscribe((message) => {
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

        // Show toast notification
        toast(
          <div className="flex items-center gap-3">
            <CoinIcon
              symbol={blockData.symbol}
              name={blockData.name}
              size={32}
              className="min-w-[32px]"
            />
            <div className="flex flex-col">
              <div className="font-semibold">
                {blockData.name} ({blockData.symbol})
              </div>
              <div className="text-sm text-muted-foreground">
                Block #{blockData.blockHeight.toLocaleString()}
              </div>
            </div>
          </div>,
          {
            duration: 10000, // 10 seconds
            position: "top-right",
            className: "border-l-4 border-l-green-500",
            onDismiss: () => {
              toastCountRef.current = Math.max(0, toastCountRef.current - 1);
            },
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
        const borderColor = isConfirmed
          ? "border-l-green-500"
          : isOrphaned
          ? "border-l-red-500"
          : "border-l-yellow-500";

        // Show toast notification
        toast(
          <div className="flex items-center gap-3">
            <CoinIcon
              symbol={blockData.symbol}
              name={blockData.name}
              size={32}
              className="min-w-[32px]"
            />
            <div className="flex flex-col">
              <div className="font-semibold">
                {statusEmoji} {blockData.name} ({blockData.symbol}) -{" "}
                {blockData.status}
              </div>
              <div className="text-sm text-muted-foreground">
                Block #{blockData.blockHeight.toLocaleString()} •{" "}
                {blockData.reward} {blockData.symbol}
              </div>
            </div>
          </div>,
          {
            duration: 10000, // 10 seconds
            position: "top-right",
            className: `border-l-4 ${borderColor}`,
            onDismiss: () => {
              toastCountRef.current = Math.max(0, toastCountRef.current - 1);
            },
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
          `${statusEmoji} Block ${blockData.status.toLowerCase()} notification: ${
            blockData.name
          } block #${blockData.blockHeight}`
        );
      }
    });

    return unsubscribe;
  }, [websocketContext]);

  return null; // This component doesn't render anything visible
}
