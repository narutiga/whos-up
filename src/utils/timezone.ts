export function getTimezoneOffset(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(date);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');

  if (!tzPart) return 0;

  // Parse "GMT+9" or "GMT-5" format
  const match = tzPart.value.match(/GMT([+-]?\d+(?::\d+)?)/);
  if (!match) return 0;

  const [hours, minutes = '0'] = match[1].split(':');
  return parseInt(hours) + parseInt(minutes) / 60;
}
