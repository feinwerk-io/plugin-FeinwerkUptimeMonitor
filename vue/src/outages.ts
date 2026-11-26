/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import type { Incident } from './types';

/**
 * The outages of a period as the day's answer counts them (5.1.5 review, F1): only their parts
 * inside the period (API startInPeriod, durationInPeriodSeconds), and outages of several
 * addresses that overlap or touch as one outage with the length of their union. Gaps and parts
 * of no length (an outage that only touches the period) do not count.
 */
export function outageTotals(incidents: Incident[]): { count: number; seconds: number } {
  const parts = incidents
    .filter((i) => i.type === 'outage' && i.durationInPeriodSeconds > 0)
    .map((i) => {
      const start = new Date(i.startInPeriod).getTime() / 1000;
      return [start, start + i.durationInPeriodSeconds];
    })
    .sort((a, b) => a[0] - b[0]);
  let count = 0;
  let seconds = 0;
  let end = -Infinity;
  let start = 0;
  parts.forEach(([from, to]) => {
    if (from > end) {
      if (count > 0) {
        seconds += end - start;
      }
      count += 1;
      start = from;
      end = to;
    } else {
      end = Math.max(end, to);
    }
  });
  if (count > 0) {
    seconds += end - start;
  }
  return { count, seconds: Math.round(seconds) };
}

/** The outages with a part inside the period (those that only touch it are left out). */
export function outagesInPeriod(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => i.type === 'outage' && i.durationInPeriodSeconds > 0);
}

/** the order of the addresses on the screens: Matomo's, then the website's */
export const KIND_ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];

/** Matomo's own addresses and the website's Tag Manager containers (their file is on Matomo) */
const MATOMO_GROUP = ['ui', 'tracker', 'js', 'container'];

/** the group of an outage's address on the screens: matomo or site ('' for a gap) */
export function groupOf(incident: Incident): string {
  if (incident.type === 'gap') {
    return '';
  }
  return MATOMO_GROUP.includes(incident.kind || '') ? 'matomo' : 'site';
}

/** One row of the outage list (final review D1): overlapping outages of one group as one. */
export interface OutageRow {
  key: string;
  type: 'outage' | 'gap';
  /** matomo, site, or '' for a gap */
  group: string;
  source: string;
  /** the merged outages, the oldest first */
  incidents: Incident[];
  /** the earliest start */
  start: string;
  /** one of them is still open */
  open: boolean;
  /** the whole length, from the earliest start to the latest end (now while open) */
  durationSeconds: number;
  /** the part inside the period */
  durationInPeriodSeconds: number;
}

/**
 * The outage list's rows (final review D1): outages of addresses of the same group and source
 * that overlap or touch become one row; gaps stay rows of their own. On a past day or a longer
 * period only outages with a part inside it count (one that only touches it is left out); today
 * every loaded outage shows. Newest first.
 */
export function outageRows(incidents: Incident[], past: boolean): OutageRow[] {
  const ms = (iso: string) => new Date(iso).getTime();
  const items = incidents
    .filter((i) => !past || i.durationInPeriodSeconds > 0)
    .map((i) => ({ i, from: ms(i.start), to: ms(i.start) + i.durationSeconds * 1000 }))
    .sort((a, b) => a.from - b.from || a.i.idIncident - b.i.idIncident);
  const open: Record<string, { members: typeof items; to: number }> = {};
  const clusters: Array<typeof items> = [];
  items.forEach((item) => {
    const group = groupOf(item.i);
    const key = `${group}|${item.i.source}`;
    const current = group === '' ? undefined : open[key];
    if (current && item.from <= current.to) {
      current.members.push(item);
      current.to = Math.max(current.to, item.to);
      return;
    }
    const cluster = { members: [item], to: item.to };
    clusters.push(cluster.members);
    if (group !== '') {
      open[key] = cluster;
    }
  });
  return clusters.map((members) => {
    const first = members[0].i;
    const end = Math.max(...members.map((m) => m.to));
    const parts = members.filter((m) => m.i.durationInPeriodSeconds > 0);
    const partStart = parts.length ? Math.min(...parts.map((m) => ms(m.i.startInPeriod))) : 0;
    const partEnd = parts.length ? Math.max(...parts.map((m) => ms(m.i.startInPeriod)
      + m.i.durationInPeriodSeconds * 1000)) : 0;
    return {
      key: members.map((m) => m.i.idIncident).join('-'),
      type: first.type,
      group: groupOf(first),
      source: first.source,
      incidents: members.map((m) => m.i),
      start: first.start,
      open: members.some((m) => m.i.open),
      durationSeconds: Math.round((end - members[0].from) / 1000),
      durationInPeriodSeconds: Math.round((partEnd - partStart) / 1000),
    };
  }).sort((a, b) => ms(b.start) - ms(a.start));
}
