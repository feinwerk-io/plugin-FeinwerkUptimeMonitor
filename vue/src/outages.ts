/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import type { Incident } from './types';

/**
 * An incident with a part inside the period: seconds inside it, or (quick UI review before 5.4.0,
 * Q1) an ended outage of no length: one failed check, after which the server's checks stopped
 * sending (it ends at its last failed check), which the API returns only for the periods that
 * contain its start. One that only touches the period (it ends at the period's start) is left out.
 */
function inPeriod(i: Incident): boolean {
  return i.durationInPeriodSeconds > 0
    || (i.type === 'outage' && i.end !== null && i.durationSeconds === 0);
}

/**
 * The outages of a period as the day's answer counts them (5.1.5 review, F1): only their parts
 * inside the period (API startInPeriod, durationInPeriodSeconds), and outages of several
 * addresses that overlap or touch as one outage with the length of their union. Gaps and parts
 * of no length (an outage that only touches the period) do not count; an outage of no length
 * inside it does (inPeriod).
 */
export function outageTotals(incidents: Incident[]): { count: number; seconds: number } {
  const parts = incidents
    .filter((i) => i.type === 'outage' && inPeriod(i))
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

/** the parts of the outages inside the period as merged intervals (seconds), sorted */
function union(incidents: Incident[]): number[][] {
  const parts = incidents
    .filter((i) => i.type === 'outage' && inPeriod(i))
    .map((i) => {
      const start = new Date(i.startInPeriod).getTime() / 1000;
      return [start, start + i.durationInPeriodSeconds];
    })
    .sort((a, b) => a[0] - b[0]);
  const out: number[][] = [];
  parts.forEach(([from, to]) => {
    const last = out[out.length - 1];
    if (last && from <= last[1]) {
      last[1] = Math.max(last[1], to);
    } else {
      out.push([from, to]);
    }
  });
  return out;
}

/** the parts of the intervals a that none of b covers (both merged and sorted, as union()) */
function subtract(a: number[][], b: number[][]): number[][] {
  const out: number[][] = [];
  a.forEach(([from, to]) => {
    let start = from;
    b.forEach(([x, y]) => {
      if (y <= start || x >= to) {
        return;
      }
      if (x > start) {
        out.push([start, x]);
      }
      start = Math.max(start, y);
    });
    if (start < to) {
      out.push([start, to]);
    }
  });
  return out;
}

/**
 * P3 (UI review 5.2.0): of the period's outage time, the seconds only the outside saw, inside the
 * period. Per address (L8 review of 5.3.0, NIT 4): its outages from outside minus the Matomo
 * server's outages of the same address, then the union of those parts over the addresses, so the
 * server's outage of one address never hides what only the outside saw of another.
 */
export function onlyFromOutside(incidents: Incident[]): number {
  const keys = incidents.filter((i) => i.source === 'external').map((i) => i.targetKey || '')
    .filter((key, n, all) => all.indexOf(key) === n);
  const parts: number[][] = [];
  keys.forEach((key) => {
    const own = incidents.filter((i) => (i.targetKey || '') === key);
    const outside = union(own.filter((i) => i.source === 'external'));
    const server = union(own.filter((i) => i.source !== 'external'));
    parts.push(...subtract(outside, server));
  });
  parts.sort((a, b) => a[0] - b[0]);
  let seconds = 0;
  let end = -Infinity;
  parts.forEach(([from, to]) => {
    seconds += Math.max(0, to - Math.max(from, end));
    end = Math.max(end, to);
  });
  return Math.round(seconds);
}

/** The outages with a part inside the period (those that only touch it are left out: inPeriod). */
export function outagesInPeriod(incidents: Incident[]): Incident[] {
  return incidents.filter((i) => i.type === 'outage' && inPeriod(i));
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
  /** where it was seen: local (the Matomo server), external (outside) or both (follow-up D1) */
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
 * The outage list's rows (final review D1): outages of addresses of the same group that overlap or
 * touch become one row; gaps stay rows of their own. On a past day or a longer period only outages
 * with a part inside it count (one that only touches it is left out); today every loaded outage
 * shows. Newest first.
 *
 * Follow-up D1 (Peter, 2026-11-26, "alle wie empfohlen"): the list answers once, as the day's
 * answer counts the outages: the side does not split a row. A row seen from both sides says so
 * (source both), also when the outside saw fewer of its addresses (it checks fewer, or one of them
 * went down only for the server): like its addresses, causes and length, the side is the row's,
 * not each address's. Without results from outside every outage is the server's, as before.
 */
export function outageRows(incidents: Incident[], past: boolean): OutageRow[] {
  const ms = (iso: string) => new Date(iso).getTime();
  const items = incidents
    .filter((i) => !past || inPeriod(i))
    .map((i) => ({ i, from: ms(i.start), to: ms(i.start) + i.durationSeconds * 1000 }))
    .sort((a, b) => a.from - b.from || a.i.idIncident - b.i.idIncident);
  const open: Record<string, { members: typeof items; to: number }> = {};
  const clusters: Array<typeof items> = [];
  items.forEach((item) => {
    const group = groupOf(item.i);
    const current = group === '' ? undefined : open[group];
    if (current && item.from <= current.to) {
      current.members.push(item);
      current.to = Math.max(current.to, item.to);
      return;
    }
    const cluster = { members: [item], to: item.to };
    clusters.push(cluster.members);
    if (group !== '') {
      open[group] = cluster;
    }
  });
  return clusters.map((members) => {
    const first = members[0].i;
    const end = Math.max(...members.map((m) => m.to));
    const parts = members.filter((m) => inPeriod(m.i));
    const partStart = parts.length ? Math.min(...parts.map((m) => ms(m.i.startInPeriod))) : 0;
    const partEnd = parts.length ? Math.max(...parts.map((m) => ms(m.i.startInPeriod)
      + m.i.durationInPeriodSeconds * 1000)) : 0;
    const sources = members.map((m) => m.i.source).filter((v, n, all) => all.indexOf(v) === n);
    return {
      key: members.map((m) => m.i.idIncident).join('-'),
      type: first.type,
      group: groupOf(first),
      source: sources.length > 1 ? 'both' : first.source,
      incidents: members.map((m) => m.i),
      start: first.start,
      open: members.some((m) => m.i.open),
      durationSeconds: Math.round((end - members[0].from) / 1000),
      durationInPeriodSeconds: Math.round((partEnd - partStart) / 1000),
    };
  }).sort((a, b) => ms(b.start) - ms(a.start));
}
