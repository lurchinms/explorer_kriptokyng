export const discordConfig = {
  enabled: process.env.DISCORD_WEBHOOK_ENABLED === 'true',
  webhookUrls: {
    blockFound: process.env.DISCORD_WEBHOOK_BLOCK_FOUND || '',
    blockConfirmed: process.env.DISCORD_WEBHOOK_BLOCK_CONFIRMED || '',
  },
  notificationTypes: {
    blockFound: process.env.DISCORD_NOTIFY_BLOCK_FOUND === 'true',
    blockUnlocked: process.env.DISCORD_NOTIFY_BLOCK_UNLOCKED === 'true',
  }
};
