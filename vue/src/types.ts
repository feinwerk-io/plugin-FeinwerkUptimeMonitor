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
  /** the Matomo server never checks this address (e.g. a private one while not allowed) */
  serverRefuses?: boolean;
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
  /** the first measured hour of the strip's addresses at any time (null: never); D3 */
  firstMeasured?: string | null;
}

/** An address as checked from outside (another plugin's results, source external). */
export interface OutsideCell {
  outcome: string;
  text: string;
  uptime: string;
  /** why the outside cannot check it (the cell's tooltip; 5.2.0 review B5); '' otherwise */
  title?: string;
}

/** One address as the uptime page and the widgets list it (current state, period uptime). */
export interface AddressRow {
  key: string;
  label: string;
  outcome: string;
  text: string;
  title: string;
  uptime: string;
  cert: string;
  certLevel: string;
  /** days until the certificate expires (null: no certificate) */
  certDays: number | null;
  checkedAt: string;
  /** the address's host ('' when the API sends no address, e.g. Matomo's own to non-super users) */
  host: string;
  /** a past day or period (D1): the dot follows its uptime, up, partial or none; '' for today */
  dayOutcome: string;
  /** not checkable because the file is larger than the 4 MB the check reads (note too_large) */
  tooLarge: boolean;
  /** checked from the Matomo server alone (with results from outside, outcome combines both) */
  serverOutcome?: string;
  /** what failed, for the answer line; with results from outside, where (when one side fails) */
  cause?: string;
  /** checked from outside: only while a source of such results is active (ScreenConfig.external) */
  outside?: OutsideCell | null;
}

/** The plugin that adds results checked from outside (ScreenProps::external). */
export interface ExternalSource {
  /** delivering: licensed and it reached its service within two hours */
  active: boolean;
  name: string;
  reachedAt: string | null;
  /** its settings page, relative to Matomo; admins only */
  settingsUrl: string | null;
  /** the active source sends alerts for outages itself (the admin page's alert row names it) */
  alerts?: boolean;
  /** when its latest results arrived (null: none yet); reachedAt also moves with a push */
  resultsAt?: string | null;
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
  /** the part inside the requested period: its start (the later of start and the period's) */
  startInPeriod: string;
  /** and its length, up to the period's end or now (0: the outage only touches the period) */
  durationInPeriodSeconds: number;
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
  /** the level of that soonest certificate, as the uptime page colours it */
  certificateLevel?: 'ok' | 'warning' | 'critical' | 'expired' | null;
  /** Matomo's row: the websites whose Tag Manager container is not reachable */
  containersDown?: Array<{ idSite: number; name: string }>;
  /** how many of notCheckable cannot be checked from outside either (5.2.0 review B3) */
  notCheckableOutside?: number;
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
  /** admin page: Sentinel's settings for the whole instance (its tab from 5.4.0 on) */
  sentinelSettings?: string | null;
  /** the super-user setting "Allow private addresses" is on */
  allowPrivate?: boolean;
  /** the uptime page shown as a widget (on a dashboard or embedded): it brings its own padding */
  inWidget?: boolean;
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
  /**
   * results checked from outside: null without such a plugin (the screens as before); a source
   * that is not active reaches admins only
   */
  external?: ExternalSource | null;
  cronLine?: string;
}
