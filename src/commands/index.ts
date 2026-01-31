import type { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import * as soon from './soon.js';
import * as later from './later.js';

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<void>;
}

export const commands: Map<string, Command> = new Map();

commands.set(soon.data.name, soon as Command);
commands.set(later.data.name, later as Command);

export function getCommandsData() {
  return Array.from(commands.values()).map((cmd) => cmd.data.toJSON());
}
