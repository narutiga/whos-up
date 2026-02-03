import type { VoteCounts } from '../types/index.js';
import { EMOJIS, MESSAGES } from '../utils/constants.js';

export function formatSoonMessage(game: string | undefined, votes: VoteCounts): string {
  const header = game ? `${EMOJIS.GAME} ${game} — anyone up?` : `${EMOJIS.GAME} anyone up?`;

  return [
    header,
    '',
    `${EMOJIS.GREEN} I can join (${votes.green})`,
    `${EMOJIS.YELLOW} Maybe (${votes.yellow})`,
    `${EMOJIS.ORANGE} Can't (${votes.orange})`,
    '',
    `${EMOJIS.TIMER} Closes in 30 min`,
  ].join('\n');
}

export function formatLaterMessage(
  game: string | undefined,
  time: string,
  votes: VoteCounts,
  authorId: string
): string {
  const gameText = game ? `${EMOJIS.GAME} ${game}` : EMOJIS.GAME;

  return [
    `${gameText} @ ${time} — anyone around?`,
    `Asked by <@${authorId}>`,
    '',
    `${EMOJIS.GREEN} I can join (${votes.green})`,
    `${EMOJIS.YELLOW} Maybe (${votes.yellow})`,
    `${EMOJIS.ORANGE} Can't (${votes.orange})`,
    '',
    `${EMOJIS.TIMER} Closes in 24h`,
  ].join('\n');
}

export function formatClosedMessage(): string {
  return MESSAGES.CLOSED;
}

export function formatLaterClosedMessage(
  game: string | undefined,
  time: string,
  votes: VoteCounts,
  authorId: string
): string {
  const gameText = game ? `${EMOJIS.GAME} ${game}` : EMOJIS.GAME;

  return [
    gameText,
    `🕒 ${time} (your local time)`,
    `Asked by <@${authorId}>`,
    '',
    `${EMOJIS.GREEN} I can join (${votes.green})`,
    `${EMOJIS.YELLOW} Maybe (${votes.yellow})`,
    `${EMOJIS.ORANGE} Can't (${votes.orange})`,
    '',
    MESSAGES.CLOSED,
  ].join('\n');
}
