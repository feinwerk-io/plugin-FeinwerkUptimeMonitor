/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import type { PromoVariables } from './PromoLine.vue';
import type { PromoCardVariables } from './PromoCard.vue';

export type Outcome = 'up' | 'down' | 'not_checkable';

export interface State {
  outcome: Outcome;
  error: string | null;
  note: string | null;
  httpStatus: number | null;
  responseMs: number | null;
  checkedAt: string;
  stale: boolean;
}

export interface Certificate {
  notAfter: string;
  daysLeft: number;
  level: 'ok' | 'warning' | 'critical' | 'expired';
}

export interface TargetStatus {
  targetKey: string;
  kind: string;
  url: string | null;
  urlSource: string;
  enabled: boolean;
  lastCheckedAt: string | null;
  states: { local?: State; external?: State };
  certificate: Certificate | null;
}

export interface Processing {
  samples: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
  from: string;
  to: string;
}

export interface Status {
  targets: TargetStatus[];
  processing: Processing | null;
}

export interface UptimeRow {
  targetKey: string;
  kind: string;
  source: 'local' | 'external';
  uptimePercent: number | null;
  coveragePercent: number;
  outages: number;
  samples: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
}

export interface SeriesPoint {
  time: string;
  source: string;
  samples: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
  uptimePercent: number | null;
}

/** One cell of the hour strip (API getTimeline): an hour, or a day for longer periods. */
export interface TimelineCell {
  /** start of the hour or day, ISO time in UTC */
  time: string;
  /** measured seconds, summed over every check target of the website */
  measuredSeconds: number;
  upSeconds: number;
  /** future: the cell starts after now (the strip has a fixed axis for the whole period) */
  state: 'up' | 'down' | 'partial' | 'none' | 'future';
}

export interface Timeline {
  grain: 'hour' | 'day';
  /** with grain day: days in the website's timezone (local) or UTC days (long periods, old data) */
  days?: 'local' | 'utc' | null;
  cells: TimelineCell[];
}

export interface Incident {
  idIncident: number;
  type: 'outage' | 'gap';
  targetKey: string | null;
  kind: string | null;
  source: string;
  start: string;
  end: string | null;
  durationSeconds: number;
  open: boolean;
  cause: string | null;
  detail: string | null;
  failedChecks: number;
}

export interface TargetRow {
  targetKey: string;
  kind: string;
  url: string | null;
  urlSource: 'default' | 'detected' | 'manual';
  enabled: boolean;
  lastCheckedAt: string | null;
}

export interface Suggestion {
  idSite: number;
  key: string;
  kind: string;
  url: string;
}

export interface SiteOverview {
  idSite: number;
  name: string;
  /** the website's timezone (Matomo's names, also "UTC+2"; UTC for Matomo itself) */
  timezone: string;
  targets: number;
  down: number;
  notCheckable: number;
  stale: number;
  /** switched-on targets that answered at their last check */
  up: number;
  /** switched-off targets */
  off: number;
  lastCheckedAt: string | null;
  certificateDaysLeft: number | null;
}

export interface ScreenConfig {
  idSite: number;
  variant: 'page' | 'matomo' | 'site' | 'admin';
  isSuperUser: boolean;
  isAdmin: boolean;
  language: string;
  queuedTracking: boolean;
  sentinel: 'active' | 'old' | 'inactive' | 'absent';
  /** the installed Sentinel's version (admin page only) */
  sentinelVersion?: string | null;
  embedded: boolean;
  feedback: { enabled: boolean; supportUrl: string; version: string } | null;
  /** the website's name (idSite 0: Matomo) */
  siteName?: string;
  /** the website's timezone (Matomo's names, also "UTC+2"); times on the screens follow it */
  timezone?: string;
  /** admin page: whether a system cron runs the checks */
  cron?: { active: boolean; intervalSeconds: number | null } | null;
  /** anonymous viewers get no data about Matomo itself (API idSite 0) */
  isAnonymous?: boolean;
  /** the kit's tip line (Promo\PromoLine::current()): admins only, never embedded */
  promo?: PromoVariables | null;
  /** the kit's card in dashboard widgets (Promo\PromoCard): admins only, dashboards only */
  promoCard?: PromoCardVariables | null;
  cronLine?: string;
}
