import type { MessageReaction, User, Client, PartialMessageReaction, PartialUser } from 'discord.js';
import { getPollByMessageId, updatePollVote, markThresholdNotified } from '../services/pollManager.js';
import { emojiToVoteType, countVotes, checkThreshold } from '../services/voteService.js';
import { formatSoonMessage, formatLaterMessage } from '../services/messageFormatter.js';
import { sendThresholdNotification } from '../services/notificationService.js';
import { VOTE_EMOJIS } from '../utils/constants.js';

export const name = 'messageReactionAdd';

export async function execute(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  client: Client
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
  if (!voteType) {
    // Remove non-vote reactions
    try {
      await reaction.users.remove(user.id);
    } catch {
      // May lack permissions
    }
    return;
  }

  // Remove user's other vote reactions (exclusivity)
  for (const voteEmoji of VOTE_EMOJIS) {
    if (voteEmoji === emoji) continue;

    const otherReaction = reaction.message.reactions.cache.get(voteEmoji);
    if (otherReaction) {
      try {
        await otherReaction.users.remove(user.id);
      } catch {
        // May lack permissions
      }
    }
  }

  // Update poll vote
  updatePollVote(poll.id, user.id, voteType);

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

  // Check threshold and notify
  if (checkThreshold(poll)) {
    markThresholdNotified(poll.id);
    await sendThresholdNotification(client, poll.authorId, votes.green);
  }
}
