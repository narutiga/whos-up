import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Client,
} from 'discord.js';
import { createPoll, setCloseTimer, closePoll, getPollByMessageId } from '../services/pollManager.js';
import { formatSoonMessage, formatClosedMessage } from '../services/messageFormatter.js';
import { countVotes } from '../services/voteService.js';
import { DEFAULTS, VOTE_EMOJIS, TIMEOUTS } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('soon')
  .setDescription('Check who might be around to play now')
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
  const minPlayers = interaction.options.getInteger('min_players') ?? DEFAULTS.MIN_PLAYERS;
  const game = interaction.options.getString('game') ?? undefined;

  const initialVotes = { green: 0, yellow: 0, orange: 0 };
  const content = formatSoonMessage(game, initialVotes);

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
    type: 'soon',
    minPlayers,
    game,
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
  }, TIMEOUTS.SOON);
}
