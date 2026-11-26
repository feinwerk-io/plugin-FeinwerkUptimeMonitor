/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { AjaxHelper } from 'CoreHome';
import {
  Incident, SeriesPoint, SiteOverview, Status, Suggestion, TargetRow, Timeline, UptimeRow,
} from './types';

const MODULE = 'FeinwerkUptimeMonitor';

export interface Period {
  period: string;
  date: string;
}

function get<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return AjaxHelper.fetch<T>({ method: `${MODULE}.${method}`, ...params });
}

/** Changes report their error in place (panel, Check now): no second toast by Matomo. */
function post<T>(method: string, params: Record<string, unknown>): Promise<T> {
  return AjaxHelper.fetch<T>(
    { method: `${MODULE}.${method}` },
    { postParams: params, createErrorNotification: false },
  );
}

export const api = {
  status(idSite: number): Promise<Status> {
    return get('getStatus', { idSite });
  },
  /** timezoneOf: for idSite 0 next to a website, the website whose day the period follows */
  uptime(idSite: number, period: Period, timezoneOf = 0): Promise<UptimeRow[]> {
    return get('getUptime', { idSite, ...period, timezoneOf });
  },
  responseTimes(
    idSite: number,
    period: Period,
    targetKey: string,
    timezoneOf = 0,
  ): Promise<SeriesPoint[]> {
    return get('getResponseTimes', {
      idSite, ...period, targetKey, timezoneOf,
    });
  },
  /**
   * limit: 1 to 1000 per request; the page asks for more with "Show more". source: local (checked
   * from the Matomo server) or all (also from outside, while another plugin delivers such results)
   */
  incidents(
    idSite: number,
    period: Period,
    timezoneOf = 0,
    limit = 100,
    source: 'local' | 'all' = 'local',
  ): Promise<Incident[]> {
    return get('getIncidents', {
      idSite, ...period, limit, timezoneOf, source,
    });
  },
  /** the outages still open now ("since when" in the answer line), whatever period is viewed */
  openIncidents(idSite: number, timezoneOf = 0, source: 'local' | 'all' = 'local'):
    Promise<Incident[]> {
    return AjaxHelper.fetch<Incident[]>({
      method: `${MODULE}.getIncidents`,
      idSite,
      period: 'day',
      date: 'today',
      state: 'open',
      limit: 100,
      timezoneOf,
      source,
    }, { createErrorNotification: false });
  },
  /**
   * The hour strip: one cell per hour (a day) or per day, checked from the Matomo server (source
   * local) or from outside (external, while another plugin adds such results). group matomo:
   * Matomo's addresses and the website's containers; website: the website without its
   * containers. A failing strip leaves the page as it is: no toast.
   */
  timeline(
    idSite: number,
    period: Period,
    group: 'matomo' | 'website',
    source: 'local' | 'external' = 'local',
  ): Promise<Timeline> {
    return AjaxHelper.fetch<Timeline>({
      method: `${MODULE}.getTimeline`,
      idSite,
      ...period,
      source,
      group,
    }, { createErrorNotification: false });
  },
  targets(idSite: number): Promise<{ targets: TargetRow[]; suggestions: Suggestion[] }> {
    // the panel shows its own error and a Try again
    return AjaxHelper.fetch({ method: `${MODULE}.getTargets`, idSite }, { createErrorNotification: false });
  },
  overview(): Promise<SiteOverview[]> {
    return get('getSitesOverview', {});
  },
  addTarget(idSite: number, kind: string, url: string): Promise<TargetRow> {
    return post('addTarget', { idSite, kind, url });
  },
  updateTarget(
    idSite: number,
    targetKey: string,
    url: string,
    enabled: string,
  ): Promise<TargetRow> {
    return post('updateTarget', {
      idSite, targetKey, url, enabled,
    });
  },
  deleteTarget(idSite: number, targetKey: string): Promise<unknown> {
    return post('deleteTarget', { idSite, targetKey });
  },
  checkNow(idSite: number): Promise<{ locked: boolean }> {
    return post('checkNow', { idSite });
  },
};
