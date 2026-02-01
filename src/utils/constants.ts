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

export const TIMEZONES = [
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo', offset: 9 },
  { label: 'KST (UTC+9)', value: 'Asia/Seoul', offset: 9 },
  { label: 'CST (UTC+8)', value: 'Asia/Shanghai', offset: 8 },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata', offset: 5.5 },
  { label: 'CET (UTC+1)', value: 'Europe/Paris', offset: 1 },
  { label: 'GMT (UTC+0)', value: 'Europe/London', offset: 0 },
  { label: 'EST (UTC-5)', value: 'America/New_York', offset: -5 },
  { label: 'CST (UTC-6)', value: 'America/Chicago', offset: -6 },
  { label: 'MST (UTC-7)', value: 'America/Denver', offset: -7 },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles', offset: -8 },
] as const;

export const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i.toString(),
}));
