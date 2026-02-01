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
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'KST (UTC+9)', value: 'Asia/Seoul' },
  { label: 'CST (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'CET (UTC+1/+2)', value: 'Europe/Paris' },
  { label: 'GMT (UTC+0/+1)', value: 'Europe/London' },
  { label: 'ET (UTC-5/-4)', value: 'America/New_York' },
  { label: 'CT (UTC-6/-5)', value: 'America/Chicago' },
  { label: 'MT (UTC-7/-6)', value: 'America/Denver' },
  { label: 'PT (UTC-8/-7)', value: 'America/Los_Angeles' },
] as const;

export const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i.toString(),
}));
