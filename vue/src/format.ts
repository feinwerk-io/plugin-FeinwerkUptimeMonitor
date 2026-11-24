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

export function milliseconds(value: number | null, language: string): string {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)} ms`;
}

export function dateTime(iso: string, language: string): string {
  return new Intl.DateTimeFormat(locale(language), {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(iso));
}

/** "3 minutes ago" in the page language. */
export function ago(iso: string, language: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
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
      text: translate('FeinwerkUptimeMonitor_UiPartlyDown', String(c.down), String(c.total)),
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
