import WebSocket from "ws";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
function loadConfig() {
  try {
    // Read the Discord config file
    const configPath = path.join(__dirname, "../config/Discord.ts");
    const configContent = fs.readFileSync(configPath, "utf8");

    // Extract the config object (simple parsing for TS exports)
    const enabledMatch = configContent.match(/enabled:\s*(true|false)/);
    const blockFoundWebhookMatch = configContent.match(
      /blockFound:\s*["']([^"']*)["']/
    );
    const blockConfirmedWebhookMatch = configContent.match(
      /blockConfirmed:\s*["']([^"']*)["']/
    );
    const paymentsWebhookMatch = configContent.match(
      /payments:\s*["']([^"']*)["']/
    );
    const blockFoundMatch = configContent.match(/blockFound:\s*(true|false)/);
    const blockUnlockedMatch = configContent.match(
      /blockUnlocked:\s*(true|false)/
    );

    // Read the Site config for WebSocket URL and site URL
    const siteConfigPath = path.join(__dirname, "../config/Site.ts");
    const siteConfigContent = fs.readFileSync(siteConfigPath, "utf8");
    const websocketUrlMatch = siteConfigContent.match(
      /notificationsUrl:\s*["']([^"']*)["']/
    );
    const reconnectIntervalMatch = siteConfigContent.match(
      /reconnectInterval:\s*(\d+)/
    );
    const maxReconnectAttemptsMatch = siteConfigContent.match(
      /maxReconnectAttempts:\s*(\d+)/
    );
    const siteUrlMatch = siteConfigContent.match(/url:\s*["']([^"']*)["']/);

    return {
      discordEnabled: enabledMatch ? enabledMatch[1] === "true" : false,
      webhookUrls: {
        blockFound: blockFoundWebhookMatch ? blockFoundWebhookMatch[1] : "",
        blockConfirmed: blockConfirmedWebhookMatch
          ? blockConfirmedWebhookMatch[1]
          : "",
        payments: paymentsWebhookMatch ? paymentsWebhookMatch[1] : "",
      },
      siteUrl: siteUrlMatch ? siteUrlMatch[1] : "https://kriptokyng.com",
      websocketUrl: websocketUrlMatch
        ? websocketUrlMatch[1]
        : "wss://api.kriptokyng.com/notifications",
      retryInterval: reconnectIntervalMatch
        ? parseInt(reconnectIntervalMatch[1])
        : 5000,
      maxRetries: maxReconnectAttemptsMatch
        ? parseInt(maxReconnectAttemptsMatch[1])
        : 5,
      notificationTypes: {
        blockFound: blockFoundMatch ? blockFoundMatch[1] === "true" : true,
        blockUnlocked: blockUnlockedMatch
          ? blockUnlockedMatch[1] === "true"
          : true,
      },
      heartbeatInterval: 30000, // 30 seconds
    };
  } catch (error) {
    console.error("Failed to load configuration:", error.message);
    console.log("Using fallback configuration...");
    return {
      discordEnabled: false,
      webhookUrls: {
        blockFound: "",
        blockConfirmed: "",
        payments: "",
      },
      siteUrl: "https://kriptokyng.com",
      websocketUrl: "wss://api.kriptokyng.com/notifications",
      retryInterval: 5000,
      maxRetries: 5,
      notificationTypes: {
        blockFound: true,
        blockUnlocked: true,
      },
      heartbeatInterval: 30000,
    };
  }
}

const config = loadConfig();

// State tracking
let ws = null;
let retryCount = 0;
let isConnected = false;
let heartbeatTimer = null;
let recentNotifications = new Map(); // Track recent notifications to prevent duplicates
let notificationCounters = new Map(); // Track count of each notification type

// Supported notification types for Discord
const SUPPORTED_NOTIFICATIONS = ["blockfound", "blockunlocked"];

/**
 * Logs messages with timestamp
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (level === "error") {
    console.error(logMessage, data || "");
  } else {
    console.log(logMessage, data || "");
  }
}

/**
 * Fetches pool information to get the correct payout scheme
 */
async function getPoolPayoutScheme(poolId) {
  try {
    const response = await fetch(`${config.siteUrl}/api/pools`);
    if (!response.ok) {
      console.warn(`Failed to fetch pools data: ${response.status}`);
      return "PPLNS"; // Default fallback
    }

    const data = await response.json();
    const pools = data.pools || data; // Handle different response formats

    const pool = pools.find((p) => p.id === poolId);
    if (pool && pool.paymentProcessing && pool.paymentProcessing.payoutScheme) {
      return pool.paymentProcessing.payoutScheme;
    }

    // Fallback: try to guess from pool ID if API data is not available
    return poolId.toLowerCase().includes("_solo") ? "SOLO" : "PPLNS";
  } catch (error) {
    console.warn(`Error fetching pool data for ${poolId}:`, error.message);
    // Fallback: try to guess from pool ID
    return poolId.toLowerCase().includes("_solo") ? "SOLO" : "PPLNS";
  }
}

/**
 * Sends a notification directly to Discord webhook
 */
async function sendToDiscord(notification) {
  if (!config.discordEnabled) {
    return false;
  }

  // Determine which webhook URL to use based on notification type
  let webhookUrl = "";
  if (notification.type === "blockfound") {
    webhookUrl = config.webhookUrls.blockFound;
  } else if (notification.type === "blockunlocked") {
    webhookUrl = config.webhookUrls.blockConfirmed;
  } else if (notification.type === "payment") {
    webhookUrl = config.webhookUrls.payments;
  }

  if (!webhookUrl) {
    log(
      "warn",
      `Discord webhook URL not configured for notification type: ${notification.type}`
    );
    return false;
  }

  // Check if this notification type is enabled
  if (
    notification.type === "blockfound" &&
    !config.notificationTypes.blockFound
  ) {
    return false;
  }

  if (
    notification.type === "blockunlocked" &&
    !config.notificationTypes.blockUnlocked
  ) {
    return false;
  }

  try {
    // Get the correct payout scheme from API
    const payoutScheme = await getPoolPayoutScheme(notification.poolId);

    // Create Discord embed based on notification type
    let embed;
    let content;

    if (notification.type === "blockfound") {
      embed = {
        description: `🎉 **New ${
          notification.name
        } Block Discovered!**\nBlock #${notification.blockHeight.toLocaleString()} has been found by the ${notification.poolId.toUpperCase()} pool`,
        color: 0x00d26a, // Discord green
        fields: [
          {
            name: "🏆 Achievement",
            value: "**Block Found**",
            inline: true,
          },
          {
            name: "💎 Cryptocurrency",
            value: `**${notification.name}** (${notification.symbol})`,
            inline: false,
          },
          {
            name: "📊 Block Height",
            value: `**#${notification.blockHeight.toLocaleString()}**`,
            inline: false,
          },
          {
            name: "🏊‍♂️ Mining Pool",
            value: `[**${notification.poolId.toUpperCase()}** - ${payoutScheme}](${
              config.siteUrl
            }/pools/${notification.poolId})`,
            inline: false,
          },
          {
            name: "⛏️ Block Finder",
            value: `[\`${notification.miner.slice(
              0,
              12
            )}...${notification.miner.slice(-8)}\`](${config.siteUrl}/miners/${
              notification.poolId
            }/${notification.miner})`,
            inline: false,
          },
          {
            name: "🌐 Pool Dashboard",
            value: `[View Pool Details](${config.siteUrl}/pools/${notification.poolId})`,
            inline: false,
          },
        ],
        thumbnail: {
          url: `${
            config.siteUrl
          }/api/coin?symbol=${notification.symbol.toLowerCase()}`,
        },
        footer: {
          text: "kriptokyng.com • Block Discovery",
          icon_url: `${config.siteUrl}/logo.png`,
        },
        timestamp: new Date().toISOString(),
      };
    } else if (notification.type === "blockunlocked") {
      const isConfirmed = notification.status === "Confirmed";
      const isOrphaned = notification.status === "Orphaned";
      const statusEmoji = isConfirmed ? "✅" : isOrphaned ? "💔" : "⏳";
      const color = isConfirmed ? 0x00d26a : isOrphaned ? 0xed4245 : 0xfee75c; // Discord colors

      embed = {
        description: `${statusEmoji} **Block #${notification.blockHeight.toLocaleString()} ${
          notification.status
        }**\n${
          notification.name
        } block status has been updated in the ${notification.poolId.toUpperCase()} pool`,
        color: color,
        fields: [
          {
            name: "📋 Block Status",
            value: `**${notification.status}** ${statusEmoji}`,
            inline: false,
          },
          {
            name: "💎 Cryptocurrency",
            value: `**${notification.name}** (${notification.symbol})`,
            inline: false,
          },
          {
            name: "📊 Block Height",
            value: `**#${notification.blockHeight.toLocaleString()}**`,
            inline: false,
          },
          {
            name: "🏊‍♂️ Mining Pool",
            value: `[**${notification.poolId.toUpperCase()}** - ${payoutScheme}](${
              config.siteUrl
            }/pools/${notification.poolId})`,
            inline: false,
          },
          {
            name: "💰 Block Reward",
            value: `**${notification.reward}** ${notification.symbol}`,
            inline: false,
          },
          {
            name: "⚡ Mining Effort",
            value: `**${(notification.effort * 100).toFixed(1)}%**`,
            inline: false,
          },
          {
            name: "⛏️ Block Finder",
            value: `[\`${notification.miner.slice(
              0,
              12
            )}...${notification.miner.slice(-8)}\`](${config.siteUrl}/miners/${
              notification.poolId
            }/${notification.miner})`,
            inline: false,
          },
          {
            name: "🌐 Pool Dashboard",
            value: `[View Pool Details](${config.siteUrl}/pools/${notification.poolId})`,
            inline: false,
          },
        ],
        thumbnail: {
          url: `${
            config.siteUrl
          }/api/coin?symbol=${notification.symbol.toLowerCase()}`,
        },
        footer: {
          text: `kriptokyng.com • Block ${notification.status}`,
          icon_url: `${config.siteUrl}/logo.png`,
        },
        timestamp: new Date().toISOString(),
      };
    } else if (notification.type === "payment") {
      embed = {
        description: `💰 **Payment Successfully Processed**\n${
          notification.amount
        } ${notification.symbol} distributed to ${
          notification.recipientsCount
        } miners in the ${notification.poolId.toUpperCase()} pool`,
        color: 0x57f287, // Discord success green
        fields: [
          {
            name: "🏆 Event",
            value: "Payment Processed",
            inline: true,
          },
          {
            name: "💎 Cryptocurrency",
            value: `**${notification.name}** (${notification.symbol})`,
            inline: false,
          },
          {
            name: "🏊‍♂️ Mining Pool",
            value: `[**${notification.poolId.toUpperCase()}** - ${payoutScheme}](${
              config.siteUrl
            }/pools/${notification.poolId})`,
            inline: false,
          },
          {
            name: "💰 Total Amount",
            value: `**${notification.amount}** ${notification.symbol}`,
            inline: false,
          },
          {
            name: "👥 Recipients",
            value: `**${notification.recipientsCount}** miners`,
            inline: false,
          },
          {
            name: "📊 Average Payment",
            value: `**${(
              parseFloat(notification.amount) / notification.recipientsCount
            ).toFixed(6)}** ${notification.symbol}`,
            inline: false,
          },
          {
            name: "🌐 Pool Dashboard",
            value: `[View Pool Details](${config.siteUrl}/pools/${notification.poolId})`,
            inline: false,
          },
        ],
        thumbnail: {
          url: `${
            config.siteUrl
          }/api/coin?symbol=${notification.symbol.toLowerCase()}`,
        },
        footer: {
          text: "kriptokyng.com • Payment System",
          icon_url: `${config.siteUrl}/logo.png`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Send directly to Discord webhook
    const payload = {
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      log(
        "error",
        `Discord webhook failed: ${response.status} ${response.statusText}`
      );
      return false;
    }

    log(
      "info",
      `Discord notification sent successfully: ${notification.type}`,
      {
        pool: notification.poolId,
        symbol: notification.symbol,
        height: notification.blockHeight,
      }
    );

    return true;
  } catch (error) {
    log("error", "Failed to send Discord notification:", error.message);
    return false;
  }
}

/**
 * Handles incoming WebSocket messages
 */
function handleMessage(data) {
  try {
    // Parse the message
    let notification;
    if (typeof data === "string") {
      notification = JSON.parse(data);
    } else {
      notification = data;
    }

    // Handle different notification types
    switch (notification.type) {
      case "greeting":
        log("info", `WebSocket greeting: ${notification.message}`);
        break;

      case "blockfound":
        // Create a unique identifier for this notification
        const blockFoundId = `${notification.poolId}-${notification.blockHeight}-${notification.miner}`;
        
        // Check if we've recently sent this notification (within last 30 seconds)
        const blockFoundTimestamp = recentNotifications.get(blockFoundId);
        const currentTime = Date.now();
        
        if (!blockFoundTimestamp || currentTime - blockFoundTimestamp > 30000) {
          // Update the timestamp for this notification
          recentNotifications.set(blockFoundId, currentTime);
          
          // Update counter
          const counter = notificationCounters.get(blockFoundId) || 0;
          notificationCounters.set(blockFoundId, counter + 1);
          
          // Clean up old entries (older than 60 seconds)
          for (const [id, timestamp] of recentNotifications.entries()) {
            if (currentTime - timestamp > 60000) {
              recentNotifications.delete(id);
              notificationCounters.delete(id);
            }
          }
          
          log(
            "info",
            `🎉 Block found! ${notification.name} (${notification.symbol}) - Block #${notification.blockHeight}`,
            {
              pool: notification.poolId,
              miner: notification.miner,
              source: notification.source,
              notificationId: blockFoundId,
              sendCount: notificationCounters.get(blockFoundId)
            }
          );
          sendToDiscord(notification);
        } else {
          // Get current counter
          const counter = notificationCounters.get(blockFoundId) || 0;
          
          log(
            "info",
            `Duplicate block found notification SUPPRESSED: ${blockFoundId} (would be #${counter + 1})`
          );
        }
        break;

      case "blockunlocked":
        // Create a unique identifier for this notification
        const blockUnlockedId = `${notification.poolId}-${notification.blockHeight}-${notification.status}`;
        
        // Check if we've recently sent this notification (within last 30 seconds)
        const blockUnlockedTimestamp = recentNotifications.get(blockUnlockedId);
        const currentTime2 = Date.now();
        
        if (!blockUnlockedTimestamp || currentTime2 - blockUnlockedTimestamp > 30000) {
          // Update the timestamp for this notification
          recentNotifications.set(blockUnlockedId, currentTime2);
          
          // Update counter
          const counter = notificationCounters.get(blockUnlockedId) || 0;
          notificationCounters.set(blockUnlockedId, counter + 1);
          
          // Clean up old entries (older than 60 seconds)
          for (const [id, timestamp] of recentNotifications.entries()) {
            if (currentTime2 - timestamp > 60000) {
              recentNotifications.delete(id);
              notificationCounters.delete(id);
            }
          }
          
          log(
            "info",
            `${
              notification.status === "Confirmed"
                ? "✅"
                : notification.status === "Orphaned"
                ? "💔"
                : "⏳"
            } Block ${notification.status}: ${notification.name} (${
              notification.symbol
            }) - Block #${notification.blockHeight}`,
            {
              pool: notification.poolId,
              reward: notification.reward,
              effort: notification.effort,
              status: notification.status,
              notificationId: blockUnlockedId,
              sendCount: notificationCounters.get(blockUnlockedId)
            }
          );
          sendToDiscord(notification);
        } else {
          // Get current counter
          const counter = notificationCounters.get(blockUnlockedId) || 0;
          
          log(
            "info",
            `Duplicate block unlocked notification SUPPRESSED: ${blockUnlockedId} (would be #${counter + 1})`
          );
        }
        break;

      case "payment":
        if (notification.error) {
          log(
            "warn",
            `Payment failed for pool ${notification.poolId}: ${notification.error}`
          );
        } else {
          log(
            "info",
            `💰 Payment processed: ${notification.amount} ${notification.symbol} to ${notification.recipientsCount} miners`
          );
          sendToDiscord(notification);
        }
        break;

      case "blockunlockprogress":
        log(
          "info",
          `Block unlock progress: ${notification.symbol} Block #${
            notification.blockHeight
          } - ${Math.round(notification.progress * 100)}%`
        );
        break;

      // Silently ignore noisy notifications
      case "hashrateupdated":
      case "newchainheight":
        // These are too frequent and not important for Discord notifications
        break;

      default:
        log("debug", `Unknown notification type: ${notification.type}`);
    }
  } catch (error) {
    log("error", "Failed to parse WebSocket message:", error.message);
  }
}

/**
 * Formats hashrate for human readability
 */
function formatHashrate(hashrate) {
  const units = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s"];
  let value = hashrate;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Starts the heartbeat timer
 */
function startHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Send a ping to keep the connection alive
      ws.ping();
    }
  }, config.heartbeatInterval);
}

/**
 * Stops the heartbeat timer
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * Connects to the WebSocket
 */
function connect() {
  if (ws) {
    ws.removeAllListeners();
    ws = null;
  }

  log("info", `Connecting to WebSocket: ${config.websocketUrl}`);

  try {
    ws = new WebSocket(config.websocketUrl);

    ws.on("open", () => {
      log("info", "✅ Connected to Miningcore WebSocket notifications");
      isConnected = true;
      retryCount = 0;
      startHeartbeat();
    });

    ws.on("message", (data) => {
      handleMessage(data.toString());
    });

    ws.on("error", (error) => {
      log("error", "WebSocket error:", error.message);
      isConnected = false;
      stopHeartbeat();
    });

    ws.on("close", (code, reason) => {
      log(
        "warn",
        `WebSocket closed: ${code} ${reason || "No reason provided"}`
      );
      isConnected = false;
      stopHeartbeat();

      // Attempt to reconnect
      if (retryCount < config.maxRetries) {
        retryCount++;
        const delay =
          config.retryInterval * Math.pow(2, Math.min(retryCount - 1, 4)); // Exponential backoff, max 16x
        log(
          "info",
          `Reconnecting in ${delay}ms (attempt ${retryCount}/${config.maxRetries})`
        );

        setTimeout(() => {
          connect();
        }, delay);
      } else {
        log("error", "Max retry attempts reached. Exiting.");
        process.exit(1);
      }
    });

    ws.on("pong", () => {
      // Heartbeat pong received - connection is alive
    });
  } catch (error) {
    log("error", "Failed to create WebSocket connection:", error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
function shutdown() {
  log("info", "Shutting down Discord bridge...");

  stopHeartbeat();

  if (ws) {
    ws.close();
  }

  process.exit(0);
}

// Main execution
function main() {
  log("info", "Starting Discord WebSocket Notification Bridge");

  // Validate configuration
  if (!config.discordEnabled) {
    log("warn", "Discord notifications are disabled in configuration");
  } else {
    const configuredWebhooks = [];
    if (config.webhookUrls.blockFound) configuredWebhooks.push("Block Found");
    if (config.webhookUrls.blockConfirmed)
      configuredWebhooks.push("Block Confirmed");
    if (config.webhookUrls.payments) configuredWebhooks.push("Payments");

    if (configuredWebhooks.length > 0) {
      log(
        "info",
        `Discord notifications enabled for: ${configuredWebhooks.join(", ")}`
      );
    } else {
      log(
        "warn",
        "Discord webhook URLs not configured - notifications will be logged but not sent to Discord"
      );
    }
  }

  log("info", `WebSocket URL: ${config.websocketUrl}`);
  log("info", `Discord notifications enabled: ${config.discordEnabled}`);
  log(
    "info",
    `Webhook channels configured: ${
      Object.keys(config.webhookUrls).filter((key) => config.webhookUrls[key])
        .length
    }/3`
  );

  // Set up graceful shutdown
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("SIGUSR2", shutdown); // nodemon restart

  // Start the connection
  connect();
}

// Run the bridge
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { connect, shutdown, config };
