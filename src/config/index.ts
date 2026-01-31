import { GatewayIntentBits, Partials } from 'discord.js';

if (!process.env.DISCORD_TOKEN) {
  throw new Error('DISCORD_TOKEN is required');
}

if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error('DISCORD_CLIENT_ID is required');
}

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
};

export const clientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
};
