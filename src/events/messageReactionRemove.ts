import type { MessageReaction, User, Client, PartialMessageReaction, PartialUser } from 'discord.js';
import { getPollByMessageId, removePollVote } from '../services/pollManager.js';
import { emojiToVoteType, countVotes } from '../services/voteService.js';
import { formatSoonMessage, formatLaterMessage } from '../services/messageFormatter.js';

export const name = 'messageReactionRemove';

export async function execute(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  _client: Client
): Promise<void> {
  if (user.bot) return;

  // Fetch partial reaction/message if needed
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.warn('Failed to fetch partial reaction:', error);
      return;
    }
  }

  const poll = getPollByMessageId(reaction.message.id);
  if (!poll || poll.closed) return;

  const emoji = reaction.emoji.name;
  if (!emoji) return;

  const voteType = emojiToVoteType(emoji);
  if (!voteType) return;

  // Check if user still has the reaction (they might have switched votes)
  const hasReaction = reaction.users.cache.has(user.id);
  if (hasReaction) return;

  // Check if user has any other vote reaction
  const hasOtherVote = poll.votes.get(user.id) !== voteType;
  if (hasOtherVote) return;

  // Remove vote from poll
  removePollVote(poll.id, user.id);

  // Update message with new counts
  const votes = countVotes(poll);
  const content = poll.type === 'soon'
    ? formatSoonMessage(poll.game, votes)
    : formatLaterMessage(poll.game, poll.time!, votes, poll.authorId);

  try {
    await reaction.message.edit({ content });
  } catch {
    // Message may have been deleted
  }
}
