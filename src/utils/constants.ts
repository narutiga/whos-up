export const EMOJIS = {
  GAME: '🎮',
  TIMER: '⏳',
  GREEN: '🟢',
  YELLOW: '🟡',
  ORANGE: '🟠',
} as const;

export const VOTE_EMOJIS = [EMOJIS.GREEN, EMOJIS.YELLOW, EMOJIS.ORANGE] as const;

export const TIMEOUTS = {
  SOON: 30 * 60 * 1000,       // 30 minutes
  LATER: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const DEFAULTS = {
  MIN_PLAYERS: 3,
} as const;

export const MESSAGES = {
  CLOSED: 'Poll closed.',
  ERROR: 'Something went wrong. Please try again.',
} as const;
