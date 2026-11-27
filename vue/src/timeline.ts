/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { Timeline, TimelineCell } from './types';

/**
 * The seconds of each strip cell up to now: up to the next cell's start (a day of 23 or 25 hours
 * on a clock change), the last one up to the API's end (review of the 5.4.0 fixes, SHOULD 1: the
 * Sunday that ends a week of a clock change), without it a whole hour or day; the running cell up
 * to now, a future cell none.
 *
 * @param end the end of the last cell (getTimeline end, ISO); '' when not known
 */
export function elapsedSeconds(
  cells: TimelineCell[],
  grain: string,
  now: number,
  end = '',
): number[] {
  const nominal = (grain === 'hour' ? 3600 : 86400) * 1000;
  const starts = cells.map((c) => new Date(c.time).getTime());
  const last = end ? new Date(end).getTime() : NaN;
  return cells.map((cell, i) => {
    if (cell.state === 'future') {
      return 0;
    }
    let stop = starts[i] + nominal;
    if (i + 1 < starts.length) {
      stop = starts[i + 1];
    } else if (Number.isFinite(last) && last > starts[i]) {
      stop = last;
    }
    return Math.max(0, (Math.min(stop, now) - starts[i]) / 1000);
  });
}

/**
 * One strip from two (5.2.0 review B4: the widgets from both sides): each cell sums the measured
 * and reachable seconds of both, as getTimeline with source=all does, and is up only when both
 * found every address up for all their measured time, down when neither did, partial between, none
 * when neither measured it; a future cell stays future. The cells of both have the same times (the
 * same period and group); a cell only one of them has is taken as it is.
 */
export function combineTimelines(a: Timeline, b: Timeline): Timeline {
  const other: Record<string, TimelineCell> = {};
  b.cells.forEach((cell) => {
    other[cell.time] = cell;
  });
  const cells = a.cells.map((cell): TimelineCell => {
    const twin = other[cell.time];
    if (!twin || cell.state === 'future') {
      return cell;
    }
    const measured = cell.measuredSeconds + twin.measuredSeconds;
    const up = cell.upSeconds + twin.upSeconds;
    let state: TimelineCell['state'] = 'partial';
    if (measured <= 0) {
      state = 'none';
    } else if (up >= measured) {
      state = 'up';
    } else if (up <= 0) {
      state = 'down';
    }
    return {
      time: cell.time, measuredSeconds: measured, upSeconds: up, state,
    };
  });
  const firsts = [a.firstMeasured, b.firstMeasured].filter((t): t is string => !!t).sort();
  return {
    grain: a.grain,
    days: a.days,
    cells,
    end: a.end,
    firstMeasured: firsts.length ? firsts[0] : null,
  };
}

/**
 * A group's uptime and measured share from its strip, so that the figures match the strip by
 * construction: uptime = reachable seconds / measured seconds of the cells up to now (null when
 * nothing was measured); measured share = measured seconds / seconds of the period up to now, both
 * over the addresses this server can check, as the strip's tooltip counts a cell (a cell sums the
 * measured seconds of every address of the group; one counts at most its own length).
 *
 * @param targets the addresses that can be measured (not those this server cannot check)
 */
export function stripTotals(
  timeline: Timeline,
  now: number,
  targets = 1,
): { uptime: number | null; measured: number } {
  const lengths = elapsedSeconds(timeline.cells, timeline.grain, now, timeline.end || '');
  const count = Math.max(1, targets);
  let up = 0;
  let measured = 0;
  let covered = 0;
  let elapsed = 0;
  timeline.cells.forEach((cell, i) => {
    if (cell.state === 'future') {
      return;
    }
    up += cell.upSeconds;
    measured += cell.measuredSeconds;
    covered += Math.min(cell.measuredSeconds, lengths[i] * count);
    elapsed += lengths[i] * count;
  });
  return {
    uptime: measured > 0 ? (100 * Math.min(up, measured)) / measured : null,
    measured: elapsed > 0 ? Math.min(100, (100 * covered) / elapsed) : 0,
  };
}
