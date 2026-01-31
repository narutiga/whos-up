import type { Poll, VoteCounts, VoteType } from '../types/index.js';
import { EMOJIS } from '../utils/constants.js';

export function emojiToVoteType(emoji: string): VoteType | null {
  switch (emoji) {
    case EMOJIS.GREEN:
      return 'green';
    case EMOJIS.YELLOW:
      return 'yellow';
    case EMOJIS.ORANGE:
      return 'orange';
    default:
      return null;
  }
}

export function countVotes(poll: Poll): VoteCounts {
  const counts: VoteCounts = { green: 0, yellow: 0, orange: 0 };

  for (const vote of poll.votes.values()) {
    counts[vote]++;
  }

  return counts;
}

export function checkThreshold(poll: Poll): boolean {
  if (poll.thresholdNotified) return false;

  const counts = countVotes(poll);
  return counts.green >= poll.minPlayers;
}
