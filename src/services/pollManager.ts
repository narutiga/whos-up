import type { Poll, PollType } from '../types/index.js';
import { TIMEOUTS } from '../utils/constants.js';

const polls = new Map<string, Poll>();
const timers = new Map<string, NodeJS.Timeout>();

export interface CreatePollOptions {
  messageId: string;
  channelId: string;
  authorId: string;
  type: PollType;
  minPlayers: number;
  game?: string;
  time?: string;
}

export function createPoll(options: CreatePollOptions): Poll {
  const now = new Date();
  const timeout = options.type === 'soon' ? TIMEOUTS.SOON : TIMEOUTS.LATER;

  const poll: Poll = {
    id: options.messageId,
    channelId: options.channelId,
    authorId: options.authorId,
    type: options.type,
    game: options.game,
    time: options.time,
    minPlayers: options.minPlayers,
    votes: new Map(),
    thresholdNotified: false,
    createdAt: now,
    expiresAt: new Date(now.getTime() + timeout),
    closed: false,
  };

  polls.set(poll.id, poll);
  return poll;
}

export function getPollByMessageId(messageId: string): Poll | undefined {
  return polls.get(messageId);
}

export function closePoll(messageId: string): Poll | undefined {
  const poll = polls.get(messageId);
  if (!poll) return undefined;

  poll.closed = true;

  const timer = timers.get(messageId);
  if (timer) {
    clearTimeout(timer);
    timers.delete(messageId);
  }

  polls.delete(messageId);
  return poll;
}

export function setCloseTimer(messageId: string, callback: () => void, timeout: number): void {
  const timer = setTimeout(() => {
    callback();
    timers.delete(messageId);
  }, timeout);
  timers.set(messageId, timer);
}

export function updatePollVote(messageId: string, userId: string, vote: Poll['votes'] extends Map<string, infer V> ? V : never): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.votes.set(userId, vote);
  }
}

export function removePollVote(messageId: string, userId: string): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.votes.delete(userId);
  }
}

export function markThresholdNotified(messageId: string): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.thresholdNotified = true;
  }
}

export function getAllActivePolls(): Poll[] {
  return Array.from(polls.values());
}
