import type { Interaction, Client } from 'discord.js';
import { commands } from '../commands/index.js';
import { MESSAGES } from '../utils/constants.js';
import { handleLaterDateSelect, handleLaterTimeSelect, handleLaterTimezoneSelect } from '../services/laterSelectHandler.js';

export const name = 'interactionCreate';

export async function execute(interaction: Interaction, client: Client): Promise<void> {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
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
    return;
  }

  // Handle select menus
  if (interaction.isStringSelectMenu()) {
    try {
      if (interaction.customId.startsWith('later_date:')) {
        await handleLaterDateSelect(interaction);
      } else if (interaction.customId.startsWith('later_time:')) {
        await handleLaterTimeSelect(interaction);
      } else if (interaction.customId.startsWith('later_tz:')) {
        await handleLaterTimezoneSelect(interaction, client);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: MESSAGES.ERROR, ephemeral: true });
    }
  }
}
