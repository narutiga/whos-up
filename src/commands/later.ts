import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type ChatInputCommandInteraction,
  type Client,
} from 'discord.js';
import { DEFAULTS, TIME_OPTIONS, TIMEZONES } from '../utils/constants.js';

// Discord customId has 100 char limit. Truncate game name to be safe.
function truncateGame(game: string, maxLength = 50): string {
  return game.length > maxLength ? game.slice(0, maxLength) : game;
}

export const data = new SlashCommandBuilder()
  .setName('later')
  .setDescription('Check who might be around to play at a specific time')
  .addIntegerOption((option) =>
    option
      .setName('min_players')
      .setDescription('Minimum players to notify (default: 3)')
      .setMinValue(1)
      .setMaxValue(20)
  )
  .addStringOption((option) =>
    option.setName('game').setDescription('Game to play')
  );

function generateDateOptions() {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const dayName = days[date.getDay()];
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let label: string;
    if (i === 0) {
      label = `Today (${month}/${day} ${dayName})`;
    } else if (i === 1) {
      label = `Tomorrow (${month}/${day} ${dayName})`;
    } else {
      label = `${month}/${day} ${dayName}`;
    }

    options.push({
      label,
      value: date.toISOString().split('T')[0], // YYYY-MM-DD
    });
  }

  return options;
}

export async function execute(
  interaction: ChatInputCommandInteraction,
  _client: Client
): Promise<void> {
  const minPlayers = interaction.options.getInteger('min_players') ?? DEFAULTS.MIN_PLAYERS;
  const game = interaction.options.getString('game') ?? '';

  const dateOptions = generateDateOptions();
  const dateSelect = new StringSelectMenuBuilder()
    .setCustomId(`later_date:${minPlayers}:${truncateGame(game)}`)
    .setPlaceholder('Select a date')
    .addOptions(
      dateOptions.map((d) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(d.label)
          .setValue(d.value)
      )
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(dateSelect);

  await interaction.reply({
    content: '📅 What day?',
    components: [row],
    ephemeral: true,
  });
}

export function buildTimeSelect(date: string, minPlayers: number, game: string) {
  const timeSelect = new StringSelectMenuBuilder()
    .setCustomId(`later_time:${date}:${minPlayers}:${game}`)
    .setPlaceholder('Select a time')
    .addOptions(
      TIME_OPTIONS.map((t) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(t.label)
          .setValue(t.value)
      )
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(timeSelect);
}

export function buildTimezoneSelect(date: string, hour: number, minPlayers: number, game: string) {
  const timezoneSelect = new StringSelectMenuBuilder()
    .setCustomId(`later_tz:${date}:${hour}:${minPlayers}:${game}`)
    .setPlaceholder('Select your timezone')
    .addOptions(
      TIMEZONES.map((tz) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(tz.label)
          .setValue(tz.value)
      )
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(timezoneSelect);
}
