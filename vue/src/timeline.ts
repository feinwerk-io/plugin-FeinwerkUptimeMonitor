/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { Timeline, TimelineCell } from './types';

/**
 * The seconds of each strip cell up to now: an hour, or a day up to the next cell's start (23 or
 * 25 hours on a clock change), the running cell up to now, a future cell none.
 */
export function elapsedSeconds(cells: TimelineCell[], grain: string, now: number): number[] {
  const nominal = (grain === 'hour' ? 3600 : 86400) * 1000;
  const starts = cells.map((c) => new Date(c.time).getTime());
  return cells.map((cell, i) => {
    if (cell.state === 'future') {
      return 0;
    }
    const end = i + 1 < starts.length ? starts[i + 1] : starts[i] + nominal;
    return Math.max(0, (Math.min(end, now) - starts[i]) / 1000);
  });
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
  const lengths = elapsedSeconds(timeline.cells, timeline.grain, now);
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
