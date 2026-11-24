<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  The hour strip (Peter's D2): one cell per hour of a day, or per day of a longer period, from
  API getTimeline, with a fixed axis for the whole period (D1). Green up, amber partly up, red
  down, grey not measured; cells after now are empty outlines behind a thin "now" mark. One tab
  stop per strip: the arrow keys, Home and End move between the cells up to now, and the focused
  or hovered cell shows its tooltip (time in the website's timezone, uptime, measured share).
  Screen readers read each cell's text from the list, "not yet" for the cells after now. The
  small strip of the widgets has a small axis too (L11).
-->
<template>
  <div
    class="fwum-strip"
    :class="{ 'fwum-strip--small': small }"
  >
    <ol
      ref="list"
      class="fwum-strip__cells"
      :class="{ 'is-dense': cells.length > 62 }"
      :aria-label="listLabel"
      @keydown="onKey"
      @mouseleave="hover = -1"
    >
      <li
        v-for="(cell, i) in cells"
        :key="cell.time"
        class="fwum-strip__cell"
        :class="[`is-${cell.state}`, { 'is-next': i === lastPast + 1 && lastPast >= 0 }]"
        :tabindex="cell.state === 'future' ? undefined : (i === tabIndexCell ? 0 : -1)"
        @mouseenter="show(i, $event)"
        @focus="onFocus(i, $event)"
        @blur="focused = -1"
      ><span class="fwum-sr">{{ texts[i] }}</span></li>
    </ol>
    <div
      v-if="active >= 0 && !hidden"
      class="fwum-strip__tip"
      :style="tipStyle"
      aria-hidden="true"
    >{{ texts[active] }}</div>
    <div
      v-if="cells.length > 1"
      class="fwum-strip__axis"
      aria-hidden="true"
    >
      <span>{{ times[0] }}</span>
      <span>{{ times[times.length - 1] }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { translate } from 'CoreHome';
import { TimelineCell } from './types';
import {
  dayOf, hourOf, percent, sharePercent,
} from './format';
import { elapsedSeconds } from './timeline';

export default defineComponent({
  props: {
    cells: { type: Array as PropType<TimelineCell[]>, required: true },
    grain: { type: String, default: 'hour' },
    /** with grain day: 'utc' when the server returned UTC days (its answer, not a guess) */
    days: { type: String, default: '' },
    /** what the strip shows, e.g. "Matomo" or "This website" */
    name: { type: String, required: true },
    language: { type: String, default: '' },
    /** the website's timezone (Peter's 6a) */
    timezone: { type: String, default: '' },
    /** the checked addresses a cell sums up: the denominator of the measured share */
    targets: { type: Number, default: 1 },
    small: { type: Boolean, default: false },
    /** the screen's clock (ms), so that the running cell's length follows it; 0: Date.now() */
    now: { type: Number, default: 0 },
  },
  data() {
    return {
      hover: -1,
      focused: -1,
      /** the cell that takes the tab stop: the newest one until the user moves */
      current: -1,
      /** Escape hides the tooltip until the next move */
      hidden: false,
      tipStyle: {} as Record<string, string>,
    };
  },
  computed: {
    active(): number {
      return this.hover >= 0 ? this.hover : this.focused;
    },
    /** the newest cell up to now; the cells after it are future (-1: the whole period is) */
    lastPast(): number {
      for (let i = this.cells.length - 1; i >= 0; i -= 1) {
        if (this.cells[i].state !== 'future') {
          return i;
        }
      }
      return -1;
    },
    /** the cell that takes the tab stop: the newest one up to now until the user moves */
    tabIndexCell(): number {
      return this.current >= 0 && this.current <= this.lastPast ? this.current : this.lastPast;
    },
    /**
     * The server says whether a day is a day in the website's timezone or a UTC day (long periods,
     * and short ones whose hourly values are gone): UTC days get UTC dates as labels.
     */
    zone(): string {
      return this.grain === 'day' && this.days === 'utc' ? 'UTC' : this.timezone;
    },
    times(): string[] {
      const withDay = this.grain === 'hour' && this.cells.length > 25;
      return this.cells.map((cell) => {
        if (this.grain !== 'hour') {
          return dayOf(cell.time, this.language, this.zone);
        }
        const hour = hourOf(cell.time, this.language, this.zone);
        return withDay ? `${dayOf(cell.time, this.language, this.zone)}, ${hour}` : hour;
      });
    },
    texts(): string[] {
      // the cell's length: up to the next cell, the running one up to now
      const lengths = elapsedSeconds(this.cells, this.grain, this.now || Date.now());
      return this.cells.map((cell, i) => {
        if (cell.state === 'future') {
          return translate('FeinwerkUptimeMonitor_UiStripCellFuture', this.times[i]);
        }
        if (cell.state === 'none' || cell.measuredSeconds <= 0) {
          return translate('FeinwerkUptimeMonitor_UiStripCellNone', this.times[i]);
        }
        const seconds = Math.max(1, lengths[i]) * Math.max(1, this.targets);
        const share = Math.min(100, (100 * cell.measuredSeconds) / seconds);
        const uptime = (100 * cell.upSeconds) / cell.measuredSeconds;
        return translate('FeinwerkUptimeMonitor_UiStripCell', this.times[i],
          percent(uptime, this.language, 2), sharePercent(share, this.language));
      });
    },
    listLabel(): string {
      return translate(this.grain === 'hour'
        ? 'FeinwerkUptimeMonitor_UiStripHours'
        : 'FeinwerkUptimeMonitor_UiStripDays', this.name);
    },
  },
  methods: {
    show(i: number, event: Event): void {
      // a cell after now has no data to show
      this.hover = this.cells[i] && this.cells[i].state === 'future' ? -1 : i;
      this.hidden = false;
      this.place(event.currentTarget as HTMLElement);
    },
    onFocus(i: number, event: Event): void {
      this.focused = i;
      this.current = i;
      this.hidden = false;
      this.place(event.currentTarget as HTMLElement);
    },
    /**
     * The tooltip starts at the cell and grows towards the middle of the strip, so it never
     * leaves the strip (no sideways scroll on phones).
     */
    place(cell: HTMLElement | null): void {
      const box = this.$el as HTMLElement;
      if (!cell || !box) {
        return;
      }
      const width = box.clientWidth;
      const left = cell.offsetLeft;
      const right = width - (cell.offsetLeft + cell.offsetWidth);
      this.tipStyle = left + cell.offsetWidth / 2 <= width / 2
        ? { left: `${Math.max(0, left)}px`, maxWidth: `${Math.max(120, width - left)}px` }
        : { right: `${Math.max(0, right)}px`, maxWidth: `${Math.max(120, width - right)}px` };
    },
    onKey(event: KeyboardEvent): void {
      // the cells after now take no focus: the keys move up to the newest cell
      const last = this.lastPast;
      if (last < 0) {
        return;
      }
      const from = this.focused >= 0 ? this.focused : this.tabIndexCell;
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        next = Math.min(last, from + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        next = Math.max(0, from - 1);
      } else if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = last;
      } else if (event.key === 'Escape') {
        this.hidden = true;
        return;
      }
      if (next < 0) {
        return;
      }
      event.preventDefault();
      const list = this.$refs.list as HTMLElement | undefined;
      const cell = list ? list.children[next] as HTMLElement | undefined : undefined;
      if (cell) {
        cell.focus();
      }
    },
  },
});
</script>
