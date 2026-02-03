import { Client, REST, Routes, Events, TextChannel } from 'discord.js';
import { config, clientOptions } from './config/index.js';
import { getCommandsData } from './commands/index.js';
import * as ready from './events/ready.js';
import * as interactionCreate from './events/interactionCreate.js';
import * as messageReactionAdd from './events/messageReactionAdd.js';
import * as messageReactionRemove from './events/messageReactionRemove.js';
import { getAllActivePolls, closePoll } from './services/pollManager.js';
import { formatClosedMessage, formatLaterClosedMessage } from './services/messageFormatter.js';
import { countVotes } from './services/voteService.js';

const client = new Client(clientOptions);

async function registerCommands(guildId: string): Promise<void> {
  if (!config.clientId) {
    return;
  }

  const rest = new REST().setToken(config.token);

  try {
    console.log(`Registering commands for guild ${guildId}...`);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, guildId),
      { body: getCommandsData() }
    );
    console.log(`Commands registered for guild ${guildId}`);
  } catch (error) {
    console.error(`Failed to register commands for guild ${guildId}:`, error);
  }
}

// Register events
client.once(Events.ClientReady, async (readyClient) => {
  ready.execute(readyClient);

  if (!config.clientId) {
    console.warn('DISCORD_CLIENT_ID is not set. Skipping command registration.');
    return;
  }

  for (const guild of readyClient.guilds.cache.values()) {
    await registerCommands(guild.id);
  }
});

client.on(Events.GuildCreate, async (guild) => {
  console.log(`Joined guild: ${guild.name} (${guild.id})`);
  if (client.isReady() && config.clientId) {
    await registerCommands(guild.id);
  }
});

client.on(interactionCreate.name, (interaction) => {
  interactionCreate.execute(interaction, client);
});

client.on(messageReactionAdd.name, (reaction, user) => {
  messageReactionAdd.execute(reaction, user, client);
});

client.on(messageReactionRemove.name, (reaction, user) => {
  messageReactionRemove.execute(reaction, user, client);
});

// Graceful shutdown - close all active polls before exit
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing all active polls...');

  const activePolls = getAllActivePolls();
  for (const poll of activePolls) {
    const closedPoll = closePoll(poll.id);
    if (!closedPoll) continue;

    try {
      const channel = await client.channels.fetch(poll.channelId);
      if (!channel || !('messages' in channel)) continue;

      const message = await (channel as TextChannel).messages.fetch(poll.id);
      if (!message) continue;

      const votes = countVotes(closedPoll);

      if (poll.type === 'later' && poll.time) {
        const content = formatLaterClosedMessage(poll.game, poll.time, votes, poll.authorId);
        await message.edit({ content });
      } else {
        await message.edit({ content: formatClosedMessage() });
      }

      await message.reactions.removeAll();
      console.log(`Closed poll ${poll.id}`);
    } catch {
      console.log(`Could not close poll ${poll.id} (message may be deleted)`);
    }
  }

  console.log('All polls closed, shutting down.');
  process.exit(0);
});

// Login
client.login(config.token);
