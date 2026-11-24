/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { AjaxHelper } from 'CoreHome';
import {
  Incident, SeriesPoint, SiteOverview, Status, Suggestion, TargetRow, UptimeRow,
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
  incidents(idSite: number, period: Period, timezoneOf = 0): Promise<Incident[]> {
    return get('getIncidents', {
      idSite, ...period, limit: 50, timezoneOf,
    });
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
