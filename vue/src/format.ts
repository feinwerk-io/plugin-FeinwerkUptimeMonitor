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

/**
 * A number stays with its unit (final review D4): a no-break space after a digit ("30 min",
 * "1 h 30 min" breaks only between the units, "4 MB")
 */
export function keepUnits(text: string): string {
  return text.replace(/(\d) (?=\S)/g, '$1\u00a0');
}

/**
 * A bracket stays whole: its spaces no-break ("(over 4 MB)", "(1 of 2)"; UI review of 5.3.0, L3
 * and follow-up W7)
 */
export function keepBrackets(text: string): string {
  return text.replace(/\([^)]*\)/g, (part) => part.replace(/ /g, '\u00a0'));
}

export function milliseconds(value: number | null, language: string): string {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)}\u00a0ms`;
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

/**
 * The zone's short name at a time ("GMT+2", "EDT", "MESZ" in the page language): tells the hour
 * that repeats on a fall-back day apart (review of the 5.4.0 fixes, NIT 3). A fixed offset, which
 * repeats no hour, by its label ("UTC+2"); '' when the browser names none.
 */
export function zoneNameOf(iso: string, language: string, timezone = ''): string {
  const zone = zoneOf(timezone);
  if (zone.offsetMinutes !== undefined) {
    return zone.label || '';
  }
  const parts = new Intl.DateTimeFormat(locale(language), {
    hour: 'numeric', timeZoneName: 'short', ...(zone.name ? { timeZone: zone.name } : {}),
  }).formatToParts(new Date(iso));
  const name = parts.find((part) => part.type === 'timeZoneName');
  return name ? name.value : '';
}

/** The day of a time ("Mar 14") in the website's timezone, for the strip of longer periods. */
export function dayOf(iso: string, language: string, timezone = ''): string {
  return formatIn(iso, language, timezone, { month: 'short', day: 'numeric' });
}

/** the day of a moment in a timezone as YYYY-MM-DD */
export function dayKey(iso: string, timezone = ''): string {
  return formatIn(iso, 'en-CA', timezone, { year: 'numeric', month: '2-digit', day: '2-digit' });
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

/** the calendar day "YYYY-MM-DD" moved by whole days (no clock change can shift it) */
export function shiftDay(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * A calendar day "YYYY-MM-DD" as "Nov 24" in the page language, with the year when it is not
 * thisYear; read as UTC, so a timezone west of UTC never shows the day before.
 */
export function calendarDay(day: string, language: string, thisYear: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  if (String(y) !== thisYear) {
    options.year = 'numeric';
  }
  return new Intl.DateTimeFormat(locale(language), options).format(new Date(Date.UTC(y, m - 1, d)));
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

/**
 * "12 min", "1 h 30 min", "3 days" (final review D4: hours and minutes, no "1.5 h"), rounded to
 * whole minutes first, so that 59 min 50 s reads "1 h", never "60 min" or "1 h 60 min"
 */
export function duration(seconds: number, language = ''): string {
  const number = (n: number) => new Intl.NumberFormat(locale(language)).format(n);
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return keepUnits(translate('FeinwerkUptimeMonitor_UiMinutes', number(minutes)));
  }
  if (seconds < 172800) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return keepUnits(rest === 0
      ? translate('FeinwerkUptimeMonitor_UiHours', number(hours))
      : translate('FeinwerkUptimeMonitor_UiHoursMinutes', number(hours), number(rest)));
  }
  return keepUnits(translate('FeinwerkUptimeMonitor_UiDays', number(Math.round(seconds / 86400))));
}

/**
 * An address in pieces that may wrap after ".", "/", "?", "&", "=", "-" or "_" (a <wbr> after
 * each): on a phone "www.outdoor-shop-demo.example" wraps between its parts, not inside a word
 */
export function breakParts(text: string): string[] {
  const parts = text.replace(/([./?&=_-])/g, '$1\u0001').split('\u0001').filter((p) => p !== '');
  // "www." never stands alone on a line
  if (parts.length > 1 && parts[0].toLowerCase() === 'www.') {
    parts.splice(0, 2, parts[0] + parts[1]);
  }
  return parts;
}

/** "HTTP-Status 403" stays whole on a phone: non-breaking hyphens in a short state text */
export function keepHyphens(text: string): string {
  return text.replace(/-/g, '\u2011');
}

/**
 * The host (with a port other than the scheme's) and the path of an address as entered: an
 * international name in its own letters, as people type it (UI review of 5.4.0, B3), not in the
 * ASCII form the browser's URL gives; lower case, without user info, query and fragment.
 */
function addressParts(url: string): { host: string; path: string } | null {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)/i.exec(url.trim());
  if (!match) {
    return null;
  }
  const scheme = match[1].toLowerCase();
  let host = match[2].slice(match[2].lastIndexOf('@') + 1).toLowerCase();
  const port = /:(\d+)$/.exec(host);
  if (port && ((scheme === 'https' && port[1] === '443') || (scheme === 'http' && port[1] === '80'))) {
    host = host.slice(0, -port[0].length);
  }
  return { host, path: match[3] };
}

export function hostOf(url: string | null): string {
  if (!url) {
    return '';
  }
  const parts = addressParts(url);
  return parts ? parts.host : url;
}

/** Host and path, so that two addresses on one host stay apart. */
export function hostAndPath(url: string | null): string {
  if (!url) {
    return '';
  }
  const parts = addressParts(url);
  if (!parts) {
    return url;
  }
  return parts.path === '' || parts.path === '/' ? parts.host : `${parts.host}${parts.path}`;
}

/**
 * An address's tooltip: the address as entered, and for an international name its ASCII form
 * (punycode), which the checks request and server logs show.
 */
export function addressTitle(url: string | null, fallback: string): string {
  if (!url) {
    return fallback;
  }
  let ascii = '';
  try {
    ascii = new URL(url).host;
  } catch (e) {
    return url;
  }
  return ascii !== '' && ascii !== hostOf(url) ? `${url} (${ascii})` : url;
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
  if (cause !== 'http_status' || !detail) {
    return text;
  }
  // "HTTP status 403" in one piece (no-break spaces and hyphens): it never wraps inside
  return `${text} ${detail.replace('HTTP ', '')}`.replace(/ /g, '\u00a0').replace(/-/g, '\u2011');
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

/**
 * statusOf naming the side of a one-sided failure (Peter, 2026-11-26, 3a): when every address
 * counted down fails only from the Matomo server while the outside reaches it, amber and "not
 * reachable from the Matomo server" (visitors still reach it; it stays down); when every one fails
 * only from outside, "... from outside" in statusOf's colour. Else, and without results from
 * outside (both counts 0), statusOf. side: FromServer or FromOutside when it names one (the
 * admin page's container line names the same side). Follow-up W2 (Peter, 2026-11-26): while
 * results from outside show (twoSided), "Not checkable from the Matomo server", the server's name
 * of the cells and status rows, instead of "from this server".
 *
 * @param fromServerOnly how many of the down ones only the Matomo server finds down (the latest
 *        result from outside reaches them, sides.ts aloneDown)
 * @param fromOutsideOnly how many of the down ones only the outside finds down
 * @param twoSided the screen shows results from outside
 */
export function sidedStatusOf(
  c: StatusCounts,
  fromServerOnly = 0,
  fromOutsideOnly = 0,
  twoSided = false,
): { outcome: string; text: string; side?: string } {
  const state = statusOf(c);
  if (twoSided && state.outcome === 'not_checkable') {
    return {
      outcome: state.outcome,
      text: translate('FeinwerkUptimeMonitor_UiNotCheckableFromServer'),
    };
  }
  if (c.down <= 0 || (state.outcome !== 'down' && state.outcome !== 'partial')) {
    return state;
  }
  let side = '';
  if (fromServerOnly >= c.down) {
    side = 'FromServer';
  } else if (fromOutsideOnly >= c.down) {
    side = 'FromOutside';
  } else {
    return state;
  }
  let text = translate(`FeinwerkUptimeMonitor_UiNotReachable${side}`);
  if (c.up > 0) {
    text = c.down === 1
      ? translate(`FeinwerkUptimeMonitor_UiPartlyDownOne${side}`, String(c.total))
      : translate(`FeinwerkUptimeMonitor_UiPartlyDownMany${side}`, String(c.down), String(c.total));
  }
  return { outcome: side === 'FromServer' ? 'partial' : state.outcome, text, side };
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
