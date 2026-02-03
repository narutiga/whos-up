import type { Client, TextChannel } from 'discord.js';
import type { Poll, PollType, VoteType } from '../types/index.js';
import { TIMEOUTS } from '../utils/constants.js';
import {
  savePoll as dbSavePoll,
  updatePollClosed as dbUpdatePollClosed,
  updateThresholdNotified as dbUpdateThresholdNotified,
  saveVote as dbSaveVote,
  deleteVote as dbDeleteVote,
  getActivePolls as dbGetActivePolls,
} from './database.js';
import { formatClosedMessage, formatLaterClosedMessage } from './messageFormatter.js';
import { countVotes } from './voteService.js';

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
  dbSavePoll(poll);
  return poll;
}

export function getPollByMessageId(messageId: string): Poll | undefined {
  return polls.get(messageId);
}

export function closePoll(messageId: string): Poll | undefined {
  const poll = polls.get(messageId);
  if (!poll) return undefined;
  if (poll.closed) return undefined; // Guard against double close

  poll.closed = true;
  dbUpdatePollClosed(poll.id);

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

export function updatePollVote(messageId: string, userId: string, vote: VoteType): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.votes.set(userId, vote);
    dbSaveVote(messageId, userId, vote);
  }
}

export function removePollVote(messageId: string, userId: string): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.votes.delete(userId);
    dbDeleteVote(messageId, userId);
  }
}

export function markThresholdNotified(messageId: string): void {
  const poll = polls.get(messageId);
  if (poll) {
    poll.thresholdNotified = true;
    dbUpdateThresholdNotified(messageId);
  }
}

// Note: Polls that expire while the bot is offline will be closed on startup.
export async function restorePolls(client: Client): Promise<void> {
  const activePolls = dbGetActivePolls();
  const now = Date.now();

  console.log(`Restoring ${activePolls.length} active poll(s)...`);

  for (const pollData of activePolls) {
    // Skip invalid data (null/inconsistency tolerance)
    if (!pollData.expiresAt || !pollData.channelId) continue;
    if (pollData.closed) continue; // Safety check for DB inconsistency

    // Restore to in-memory cache
    polls.set(pollData.id, pollData);

    // Calculate remaining time
    const remaining = pollData.expiresAt.getTime() - now;

    if (remaining <= 0) {
      // Already expired while offline - close immediately
      await closeExpiredPoll(client, pollData);
    } else {
      // Set timer for remaining time
      setCloseTimer(
        pollData.id,
        () => closeExpiredPoll(client, pollData),
        remaining
      );
      console.log(`Restored timer for poll ${pollData.id} (${Math.round(remaining / 1000)}s remaining)`);
    }
  }
}

async function closeExpiredPoll(client: Client, poll: Poll): Promise<void> {
  const closedPoll = closePoll(poll.id);
  if (!closedPoll) return;

  try {
    const channel = await client.channels.fetch(poll.channelId);
    if (!channel || !('messages' in channel)) return;

    const message = await (channel as TextChannel).messages.fetch(poll.id);
    if (!message) return;

    const votes = countVotes(closedPoll);

    if (poll.type === 'later' && poll.time) {
      const content = formatLaterClosedMessage(poll.game, poll.time, votes, poll.authorId);
      await message.edit({ content });
    } else {
      await message.edit({ content: formatClosedMessage() });
    }

    await message.reactions.removeAll();
    console.log(`Closed expired poll ${poll.id}`);
  } catch {
    // Message may have been deleted
    console.log(`Could not close poll ${poll.id} (message may be deleted)`);
  }
}
