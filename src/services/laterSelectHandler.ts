import type { StringSelectMenuInteraction, Client } from 'discord.js';
import { buildTimeSelect, buildTimezoneSelect } from '../commands/later.js';
import { createPoll, setCloseTimer, closePoll, getPollByMessageId } from './pollManager.js';
import { formatLaterMessage, formatClosedMessage } from './messageFormatter.js';
import { TIMEZONES, VOTE_EMOJIS, TIMEOUTS } from '../utils/constants.js';
import { getTimezoneOffset } from '../utils/timezone.js';

export async function handleLaterDateSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const [, minPlayersStr, encodedGame] = interaction.customId.split(':');
  const game = decodeURIComponent(encodedGame);
  const date = interaction.values[0]; // YYYY-MM-DD
  const minPlayers = parseInt(minPlayersStr, 10);

  const row = buildTimeSelect(date, minPlayers, game);

  await interaction.update({
    content: `📅 ${date} — What time?`,
    components: [row],
  });
}

export async function handleLaterTimeSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const [, date, minPlayersStr, encodedGame] = interaction.customId.split(':');
  const game = decodeURIComponent(encodedGame);
  const hour = parseInt(interaction.values[0], 10);
  const minPlayers = parseInt(minPlayersStr, 10);

  const row = buildTimezoneSelect(date, hour, minPlayers, game);

  await interaction.update({
    content: `📅 ${date} 🕐 ${hour.toString().padStart(2, '0')}:00 — Select your timezone:`,
    components: [row],
  });
}

export async function handleLaterTimezoneSelect(
  interaction: StringSelectMenuInteraction,
  _client: Client
): Promise<void> {
  const [, date, hourStr, minPlayersStr, encodedGame] = interaction.customId.split(':');
  const game = decodeURIComponent(encodedGame);
  const hour = parseInt(hourStr, 10);
  const minPlayers = parseInt(minPlayersStr, 10);
  const timezone = interaction.values[0];

  const tz = TIMEZONES.find((t) => t.value === timezone);
  if (!tz) return;

  // Parse the selected date
  const [year, month, day] = date.split('-').map(Number);

  // Calculate dynamic timezone offset for DST support
  // Note: DST boundary edge cases may cause ±1h drift.
  // This bot shows "around" times, not exact scheduling.
  const targetDateForOffset = new Date(Date.UTC(year, month - 1, day, hour));
  const offset = getTimezoneOffset(tz.value, targetDateForOffset);

  // Calculate UTC hour
  const utcHour = hour - offset;

  // Create date in UTC
  let targetDate = new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0));

  // Handle timezone offset that pushes to previous/next day
  if (utcHour < 0) {
    targetDate = new Date(Date.UTC(year, month - 1, day - 1, utcHour + 24, 0, 0));
  } else if (utcHour >= 24) {
    targetDate = new Date(Date.UTC(year, month - 1, day + 1, utcHour - 24, 0, 0));
  }

  const unixTimestamp = Math.floor(targetDate.getTime() / 1000);
  const discordTimestamp = `<t:${unixTimestamp}:f>`; // Full date and time format

  const initialVotes = { green: 0, yellow: 0, orange: 0 };
  const content = formatLaterMessage(game || undefined, discordTimestamp, initialVotes, interaction.user.id);

  // Update the ephemeral message and send a new public message
  await interaction.update({
    content: '✅ Creating poll...',
    components: [],
  });

  const channel = interaction.channel;
  if (!channel || !('send' in channel)) return;

  const message = await channel.send({ content });

  for (const emoji of VOTE_EMOJIS) {
    await message.react(emoji);
  }

  createPoll({
    messageId: message.id,
    channelId: message.channelId,
    authorId: interaction.user.id,
    type: 'later',
    minPlayers,
    game: game || undefined,
    time: discordTimestamp,
  });

  setCloseTimer(message.id, async () => {
    const poll = getPollByMessageId(message.id);
    if (!poll) return;

    closePoll(message.id);

    try {
      await message.edit({ content: formatClosedMessage() });
      await message.reactions.removeAll();
    } catch {
      // Message may have been deleted
    }
  }, TIMEOUTS.LATER);
}
