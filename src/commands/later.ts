import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Client,
} from 'discord.js';
import { createPoll, setCloseTimer, closePoll, getPollByMessageId } from '../services/pollManager.js';
import { formatLaterMessage, formatClosedMessage } from '../services/messageFormatter.js';
import { DEFAULTS, VOTE_EMOJIS, TIMEOUTS } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('later')
  .setDescription('Check who might be around to play at a specific time')
  .addStringOption((option) =>
    option
      .setName('time')
      .setDescription('When to play (e.g., "8pm", "tonight", "in 2 hours")')
      .setRequired(true)
  )
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

export async function execute(
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> {
  const time = interaction.options.getString('time', true);
  const minPlayers = interaction.options.getInteger('min_players') ?? DEFAULTS.MIN_PLAYERS;
  const game = interaction.options.getString('game') ?? undefined;

  const initialVotes = { green: 0, yellow: 0, orange: 0 };
  const content = formatLaterMessage(game, time, initialVotes);

  const message = await interaction.reply({
    content,
    fetchReply: true,
  });

  for (const emoji of VOTE_EMOJIS) {
    await message.react(emoji);
  }

  createPoll({
    messageId: message.id,
    channelId: message.channelId,
    authorId: interaction.user.id,
    type: 'later',
    minPlayers,
    game,
    time,
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
