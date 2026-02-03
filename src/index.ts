import { Client, REST, Routes, Events } from 'discord.js';
import { config, clientOptions } from './config/index.js';
import { getCommandsData } from './commands/index.js';
import * as ready from './events/ready.js';
import * as interactionCreate from './events/interactionCreate.js';
import * as messageReactionAdd from './events/messageReactionAdd.js';
import * as messageReactionRemove from './events/messageReactionRemove.js';
import { initDatabase } from './services/database.js';
import { restorePolls } from './services/pollManager.js';

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

  // Restore active polls from database
  await restorePolls(readyClient);
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

// Initialize database and login
initDatabase();
client.login(config.token);
