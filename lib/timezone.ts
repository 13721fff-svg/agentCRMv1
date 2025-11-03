export function formatDateWithTimezone(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (timezone) {
    try {
      return d.toLocaleString('uk-UA', { timeZone: timezone });
    } catch (e) {
      return d.toLocaleString('uk-UA');
    }
  }

  return d.toLocaleString('uk-UA');
}

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Kyiv';
}

export function getTimezoneOffset(timezone: string = getUserTimezone()): string {
  try {
    const now = new Date();
    const tzString = now.toLocaleString('en-US', { timeZone: timezone });
    const localString = now.toLocaleString('en-US');
    const diff = (Date.parse(localString) - Date.parse(tzString)) / 36000;
    const offset = -Math.round(diff);
    const hours = Math.floor(Math.abs(offset) / 100);
    const minutes = Math.abs(offset) % 100;
    return `GMT${offset >= 0 ? '+' : '-'}${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (e) {
    return 'GMT+2';
  }
}

export const COMMON_TIMEZONES = [
  { value: 'Europe/Kyiv', label: 'Київ (GMT+2)', offset: '+02:00' },
  { value: 'Europe/London', label: 'Лондон (GMT+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Париж (GMT+1)', offset: '+01:00' },
  { value: 'America/New_York', label: 'Нью-Йорк (GMT-5)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Чикаго (GMT-6)', offset: '-06:00' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес (GMT-8)', offset: '-08:00' },
  { value: 'Asia/Dubai', label: 'Дубай (GMT+4)', offset: '+04:00' },
  { value: 'Asia/Tokyo', label: 'Токіо (GMT+9)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Сідней (GMT+10)', offset: '+10:00' },
];

export function convertToUserTimezone(date: Date | string, fromTimezone?: string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!fromTimezone) {
    return d;
  }

  try {
    const str = d.toLocaleString('en-US', { timeZone: fromTimezone });
    return new Date(str);
  } catch (e) {
    return d;
  }
}
