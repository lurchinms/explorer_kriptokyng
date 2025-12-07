import { NextRequest, NextResponse } from 'next/server';
import { discordConfig } from '@/config/Discord';

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

type DiscordNotification = BlockFoundNotification | BlockUnlockedNotification;

/**
 * Fetches pool information to get the correct payout scheme
 */
async function getPoolPayoutScheme(poolId: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://kriptokyng.com'}/api/pools`);
    if (!response.ok) {
      console.warn(`Failed to fetch pools data: ${response.status}`);
      return 'PPLNS'; // Default fallback
    }
    
    const data = await response.json();
    const pools = data.pools || data; // Handle different response formats
    
    const pool = pools.find((p: any) => p.id === poolId);
    if (pool && pool.paymentProcessing && pool.paymentProcessing.payoutScheme) {
      return pool.paymentProcessing.payoutScheme;
    }
    
    // Fallback: try to guess from pool ID if API data is not available
    return poolId.toLowerCase().includes('_solo') ? 'SOLO' : 'PPLNS';
  } catch (error) {
    console.warn(`Error fetching pool data for ${poolId}:`, error);
    // Fallback: try to guess from pool ID
    return poolId.toLowerCase().includes('_solo') ? 'SOLO' : 'PPLNS';
  }
}

/**
 * Sends a notification to Discord webhook
 */
async function sendToDiscord(notification: DiscordNotification) {
  if (!discordConfig.enabled) {
    return { success: false, message: 'Discord notifications are disabled' };
  }
  
  // Determine which webhook URL to use based on notification type
  let webhookUrl = '';
  if (notification.type === 'blockfound') {
    webhookUrl = discordConfig.webhookUrls.blockFound;
  } else if (notification.type === 'blockunlocked') {
    webhookUrl = discordConfig.webhookUrls.blockConfirmed;
  }
  
  if (!webhookUrl) {
    return { 
      success: false, 
      message: `Discord webhook URL not configured for notification type: ${notification.type}` 
    };
  }

  // Check if this notification type is enabled
  if (notification.type === 'blockfound' && !discordConfig.notificationTypes.blockFound) {
    return { success: false, message: 'Block found notifications are disabled' };
  }
  
  if (notification.type === 'blockunlocked' && !discordConfig.notificationTypes.blockUnlocked) {
    return { success: false, message: 'Block unlocked notifications are disabled' };
  }

  try {
    // Get the correct payout scheme from API
    const payoutScheme = await getPoolPayoutScheme(notification.poolId);
    const siteUrl = 'https://kriptokyng.com';
    
    // Create Discord embed based on notification type
    let embed;

    if (notification.type === 'blockfound') {
      embed = {
        title: "🎉 NEW BLOCK DISCOVERED! 🎉",
        description: `# 💎 ${notification.name} Block Found!\n\n## 📊 Block #${notification.blockHeight.toLocaleString()}\n\n**🏊‍♂️ Pool:** ${notification.poolId.toUpperCase()} (${payoutScheme})\n**⛏️ Found by:** \`${notification.miner.slice(0, 12)}...${notification.miner.slice(-8)}\`\n\n[🔍 **View Block Finder**](${notification.minerExplorerLink})\n[🌐 **Pool Dashboard**](${siteUrl}/pools/${notification.poolId})`,
        color: 0x00D26A, // Discord green
        fields: [
          {
            name: "🏆 ACHIEVEMENT",
            value: "# **BLOCK FOUND**",
            inline: true
          },
          {
            name: "💎 CRYPTOCURRENCY",
            value: `# **${notification.name}**\n## (${notification.symbol})`,
            inline: true
          },
          {
            name: "📊 BLOCK HEIGHT",
            value: `# **#${notification.blockHeight.toLocaleString()}**`,
            inline: true
          },
          {
            name: "🏊‍♂️ MINING POOL",
            value: `## [**${notification.poolId.toUpperCase()}**](${siteUrl}/pools/${notification.poolId})\n### ${payoutScheme} Payout Scheme`,
            inline: false
          },
          {
            name: "⛏️ BLOCK FINDER",
            value: `## [\`${notification.miner.slice(0, 16)}...${notification.miner.slice(-12)}\`](${notification.minerExplorerLink})\n### Click to view miner details`,
            inline: false
          },
          {
            name: "🌐 POOL LINKS",
            value: `### [📈 Pool Statistics](${siteUrl}/pools/${notification.poolId})\n### [⚡ Live Dashboard](${siteUrl})\n### [📊 Mining Guide](${siteUrl}/docs)`,
            inline: false
          }
        ],
        // image: {
        //   url: `${siteUrl}/api/coin?symbol=${notification.symbol.toLowerCase()}&size=256`
        // },
        thumbnail: {
          url: `${siteUrl}/api/coin?symbol=${notification.symbol.toLowerCase()}&size=128`
        },
        footer: {
          text: "🚀 kriptokyng.com • Block Discovery Network • Live Mining Pool",
          icon_url: `${siteUrl}/logo.png`
        },
        timestamp: new Date().toISOString()
      };
    } else if (notification.type === 'blockunlocked') {
      const isConfirmed = notification.status === "Confirmed";
      const isOrphaned = notification.status === "Orphaned";
      const statusEmoji = isConfirmed ? "✅" : isOrphaned ? "💔" : "⏳";
      const color = isConfirmed ? 0x00D26A : isOrphaned ? 0xED4245 : 0xFEE75C; // Discord colors

      embed = {
        title: `${statusEmoji} BLOCK STATUS UPDATED ${statusEmoji}`,
        description: `# ${statusEmoji} ${notification.name} Block ${notification.status}!\n\n## 📊 Block #${notification.blockHeight.toLocaleString()}\n\n**🏊‍♂️ Pool:** ${notification.poolId.toUpperCase()} (${payoutScheme})\n**💰 Reward:** ${notification.reward} ${notification.symbol}\n**⚡ Effort:** ${(notification.effort * 100).toFixed(1)}%\n**⛏️ Found by:** \`${notification.miner.slice(0, 12)}...${notification.miner.slice(-8)}\`\n\n[🔍 **View Block Finder**](${notification.minerExplorerLink})\n[🌐 **Pool Dashboard**](${siteUrl}/pools/${notification.poolId})`,
        color: color,
        fields: [
          {
            name: "📋 BLOCK STATUS",
            value: `# **${notification.status.toUpperCase()}** ${statusEmoji}`,
            inline: true
          },
          {
            name: "💎 CRYPTOCURRENCY", 
            value: `# **${notification.name}**\n## (${notification.symbol})`,
            inline: true
          },
          {
            name: "📊 BLOCK HEIGHT",
            value: `# **#${notification.blockHeight.toLocaleString()}**`,
            inline: true
          },
          {
            name: "💰 BLOCK REWARD",
            value: `## **${notification.reward}** ${notification.symbol}\n### Total block reward distributed`,
            inline: true
          },
          {
            name: "⚡ MINING EFFORT",
            value: `## **${(notification.effort * 100).toFixed(1)}%**\n### Difficulty completion percentage`,
            inline: true
          },
          {
            name: "🏊‍♂️ MINING POOL",
            value: `## [**${notification.poolId.toUpperCase()}**](${siteUrl}/pools/${notification.poolId})\n### ${payoutScheme} Payout Scheme`,
            inline: true
          },
          {
            name: "⛏️ BLOCK FINDER",
            value: `## [\`${notification.miner.slice(0, 16)}...${notification.miner.slice(-12)}\`](${notification.minerExplorerLink})\n### Click to view miner details`,
            inline: false
          },
          {
            name: "🌐 POOL LINKS & RESOURCES",
            value: `### [📈 Pool Statistics](${siteUrl}/pools/${notification.poolId})\n### [⚡ Live Dashboard](${siteUrl})\n### [💰 Payment History](${siteUrl}/pools/${notification.poolId}/payments)\n### [📊 Block Explorer](${notification.explorerLink || '#'})`,
            inline: false
          }
        ],
        // image: {
        //   url: `${siteUrl}/api/coin?symbol=${notification.symbol.toLowerCase()}&size=256`
        // },
        thumbnail: {
          url: `${siteUrl}/api/coin?symbol=${notification.symbol.toLowerCase()}&size=128`
        },
        footer: {
          text: `🚀 kriptokyng.com • Block ${notification.status} • Live Mining Pool Network`,
          icon_url: `${siteUrl}/logo.png`
        },
        timestamp: new Date().toISOString()
      };
    }

    // Send to Discord webhook
    const payload = {
      embeds: [embed]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Discord webhook failed: ${response.status} ${response.statusText}`,
        details: errorText
      };
    }

    return {
      success: true,
      message: `Discord notification sent successfully: ${notification.type}`,
      details: {
        pool: notification.poolId,
        symbol: notification.symbol,
        height: notification.blockHeight
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to send Discord notification',
      details: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const notification: DiscordNotification = await request.json();
    
    // Validate the notification
    if (!notification.type || !['blockfound', 'blockunlocked'].includes(notification.type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Send to Discord
    const result = await sendToDiscord(notification);
    
    if (result.success) {
      return NextResponse.json({
        message: result.message,
        details: result.details
      });
    } else {
      return NextResponse.json(
        { 
          error: result.message,
          details: result.details
        },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Discord webhook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
