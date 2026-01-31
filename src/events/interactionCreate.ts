import type { Interaction, Client } from 'discord.js';
import { commands } from '../commands/index.js';
import { MESSAGES } from '../utils/constants.js';

export const name = 'interactionCreate';

export async function execute(interaction: Interaction, client: Client): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);

    const reply = { content: MESSAGES.ERROR, ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
