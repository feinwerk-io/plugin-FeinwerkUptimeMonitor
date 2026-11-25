/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { translate } from 'CoreHome';

/** Numbers, durations and times in the page language (admin pages leave piwik.language unset). */
export function locale(language: string): string | undefined {
  return language !== '' ? language : undefined;
}

type ListFormatter = new (lang: string | undefined, options: { style: string; type: string }) => {
  format(items: string[]): string;
  formatToParts?(items: string[]): Array<{ type: string; value: string }>;
};

/** "A, B and C" in the page language (Intl.ListFormat), else joined with commas */
export function listOf(items: string[], language: string): string {
  const { ListFormat } = Intl as unknown as { ListFormat?: ListFormatter };
  try {
    if (ListFormat) {
      return new ListFormat(locale(language), { style: 'long', type: 'conjunction' }).format(items);
    }
  } catch (e) {
    // an unknown language: the commas below
  }
  return items.join(', ');
}

/**
 * The pieces of "A, B and C" in the page language: each element with its index in items (to
 * make it a link), the words between with index -1; else commas
 */
export function listParts(
  items: string[],
  language: string,
): Array<{ index: number; text: string }> {
  const { ListFormat } = Intl as unknown as { ListFormat?: ListFormatter };
  try {
    const formatter = ListFormat
      ? new ListFormat(locale(language), { style: 'long', type: 'conjunction' }) : null;
    if (formatter && typeof formatter.formatToParts === 'function') {
      let next = 0;
      return formatter.formatToParts(items).map((part) => {
        if (part.type !== 'element') {
          return { index: -1, text: part.value };
        }
        next += 1;
        return { index: next - 1, text: part.value };
      });
    }
  } catch (e) {
    // an unknown language: the commas below
  }
  const out: Array<{ index: number; text: string }> = [];
  items.forEach((item, index) => {
    if (index > 0) {
      out.push({ index: -1, text: ', ' });
    }
    out.push({ index, text: item });
  });
  return out;
}

export function percent(value: number | null, language: string, digits = 2): string {
  if (value === null) {
    return '';
  }
  const shown = value >= 99.995 && value < 100 ? 99.99 : value;
  return new Intl.NumberFormat(locale(language), {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: shown === 100 || shown === 0 ? 0 : digits,
  }).format(shown / 100);
}

/**
 * A measured share in whole percent; a little that would round to 0 reads "< 1 %", so that a
 * measured period never looks unmeasured.
 */
export function sharePercent(value: number, language: string): string {
  return value > 0 && value < 0.5 ? `< ${percent(1, language, 0)}` : percent(value, language, 0);
}

export function milliseconds(value: number | null, language: string): string {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)} ms`;
}

/**
 * A timezone for Intl: IANA names as they are; Matomo's fixed offsets ("UTC+2", "UTC-5.5") as
 * minutes, which Intl cannot read; anything unknown as the browser's zone.
 */
export function zoneOf(timezone = ''): { name?: string; offsetMinutes?: number; label?: string } {
  const fixed = /^UTC([+-])(\d+(?:\.\d+)?)$/.exec(timezone);
  if (fixed) {
    const minutes = Math.round(parseFloat(fixed[2]) * 60) * (fixed[1] === '-' ? -1 : 1);
    return { offsetMinutes: minutes, label: timezone };
  }
  if (timezone === '') {
    return {};
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(0);
    return { name: timezone };
  } catch (e) {
    return {};
  }
}

/** A time in the page language and the website's timezone (a fixed offset: shifted UTC). */
function formatIn(
  iso: string,
  language: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions,
  withLabel = false,
): string {
  const zone = zoneOf(timezone);
  if (zone.offsetMinutes !== undefined) {
    const shifted = new Date(new Date(iso).getTime() + zone.offsetMinutes * 60000);
    const text = new Intl.DateTimeFormat(locale(language), { ...options, timeZone: 'UTC' })
      .format(shifted);
    return withLabel ? `${text} ${zone.label}` : text;
  }
  const zoned = zone.name ? { ...options, timeZone: zone.name } : options;
  return new Intl.DateTimeFormat(locale(language), zoned).format(new Date(iso));
}

/** Date and time in the website's timezone (Peter's 6a, like Matomo's reports). */
export function dateTime(iso: string, language: string, timezone = ''): string {
  return formatIn(iso, language, timezone, { dateStyle: 'medium', timeStyle: 'short' }, true);
}

/**
 * The time of day ("14:00", "2:00 PM") in the website's timezone, for the hour strip and the
 * answer line: the same short form as the times of the outage table.
 */
export function hourOf(iso: string, language: string, timezone = ''): string {
  return formatIn(iso, language, timezone, { timeStyle: 'short' });
}

/** The day of a time ("Mar 14") in the website's timezone, for the strip of longer periods. */
export function dayOf(iso: string, language: string, timezone = ''): string {
  return formatIn(iso, language, timezone, { month: 'short', day: 'numeric' });
}

/**
 * A time of today ("10:42") or else date and time, in the website's timezone: the start of an
 * outage in the answer line.
 */
export function clockOrDate(iso: string, language: string, timezone = '', now = Date.now()): string {
  const day = (time: string) => formatIn(time, 'en', timezone, {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return day(iso) === day(new Date(now).toISOString())
    ? hourOf(iso, language, timezone)
    : dateTime(iso, language, timezone);
}

/** "3 minutes ago" in the page language; now: the screen's clock, so that it re-renders. */
export function ago(iso: string, language: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale(language), { numeric: 'auto' });
  if (Math.abs(seconds) < 3600) {
    return format.format(Math.round(seconds / 60), 'minute');
  }
  if (Math.abs(seconds) < 172800) {
    return format.format(Math.round(seconds / 3600), 'hour');
  }
  return format.format(Math.round(seconds / 86400), 'day');
}

export function duration(seconds: number, language = ''): string {
  const number = (n: number) => new Intl.NumberFormat(locale(language), {
    maximumFractionDigits: 1,
  }).format(n);
  if (seconds < 3600) {
    return translate('FeinwerkUptimeMonitor_UiMinutes', number(Math.max(1, Math.round(seconds / 60))));
  }
  if (seconds < 172800) {
    return translate('FeinwerkUptimeMonitor_UiHours', number(Math.round(seconds / 360) / 10));
  }
  return translate('FeinwerkUptimeMonitor_UiDays', number(Math.round(seconds / 86400)));
}

export function hostOf(url: string | null): string {
  if (!url) {
    return '';
  }
  try {
    return new URL(url).host;
  } catch (e) {
    return url;
  }
}

/** Host and path, so that two addresses on one host stay apart. */
export function hostAndPath(url: string | null): string {
  if (!url) {
    return '';
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' ? parsed.host : `${parsed.host}${parsed.pathname}`;
  } catch (e) {
    return url;
  }
}

export function targetLabel(
  target: { kind: string; targetKey: string; url: string | null },
): string {
  if (target.kind === 'web') {
    return hostAndPath(target.url) || translate('FeinwerkUptimeMonitor_UiKind_web');
  }
  if (target.kind === 'container') {
    return translate('FeinwerkUptimeMonitor_UiKind_container', target.targetKey.replace('ctr:', ''));
  }
  return translate(`FeinwerkUptimeMonitor_UiKind_${target.kind}`);
}

export function causeText(cause: string | null, detail: string | null): string {
  if (!cause) {
    return '';
  }
  const text = translate(`FeinwerkUptimeMonitor_Cause_${cause}`);
  return cause === 'http_status' && detail ? `${text} ${detail.replace('HTTP ', '')}` : text;
}

/** What a card or an overview row counts; one rule for the uptime page and the admin overview. */
export interface StatusCounts {
  /** switched-on targets */
  total: number;
  /** switched-off targets */
  off: number;
  up: number;
  down: number;
  stale: number;
  notCheckable: number;
}

/**
 * The answer first: a reachable address wins over ones that cannot be checked from this server;
 * any outage is named, with how many of the addresses it hits.
 */
export function statusOf(c: StatusCounts): { outcome: string; text: string } {
  if (c.total === 0 && c.off > 0) {
    return { outcome: 'off', text: translate('FeinwerkUptimeMonitor_UiAllOff') };
  }
  if (c.down > 0 && c.up > 0) {
    return {
      outcome: 'partial',
      text: c.down === 1
        ? translate('FeinwerkUptimeMonitor_UiPartlyDownOne', String(c.total))
        : translate('FeinwerkUptimeMonitor_UiPartlyDownMany', String(c.down), String(c.total)),
    };
  }
  if (c.down > 0) {
    return { outcome: 'down', text: translate('FeinwerkUptimeMonitor_UiNotReachable') };
  }
  if (c.up > 0) {
    return { outcome: 'up', text: translate('FeinwerkUptimeMonitor_UiReachable') };
  }
  if (c.stale > 0) {
    return { outcome: 'stale', text: translate('FeinwerkUptimeMonitor_UiNoRecentCheckShort') };
  }
  if (c.notCheckable > 0) {
    return { outcome: 'not_checkable', text: translate('FeinwerkUptimeMonitor_UiNotCheckable') };
  }
  return { outcome: 'none', text: translate('FeinwerkUptimeMonitor_UiNotMeasuredYet') };
}

/** AjaxHelper's fixed English texts for a request that failed before the API answered. */
const TRANSPORT_ERRORS = ['Something went wrong', 'Request was possibly aborted'];

/** A failed request: the API's own (translated) message, or ours when the request failed. */
export function errorText(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e || '');
  return message === '' || TRANSPORT_ERRORS.includes(message)
    ? translate('FeinwerkUptimeMonitor_UiRequestFailed')
    : message;
}
