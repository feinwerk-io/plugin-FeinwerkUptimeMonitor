<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  The outages of the period, newest first: a table, and on a narrow page (phones, a narrow
  dashboard column) a list like the addresses' (B1): start and duration on the first line,
  what on the second, the cause on the third, each value with its name for screen readers.
  Final review D1: outages of one group at the same time are one row naming its addresses; on a
  past day or a longer period a row's duration is its part inside it ("30 min of 1 h"). With
  results from outside (follow-up D1, Peter, 2026-11-26): one row also when both sides saw it
  (outages.ts outageRows). D3 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): the
  table has no column for the side either; like the narrow list it follows the cause in muted words
  ("no connection, from the Matomo server", "..., from the Matomo server and from outside").
-->
<template>
  <div class="fwum-outages">
    <div class="fwum-outages__head">
      <div
        class="fwum-outages__title"
        role="heading"
        aria-level="3"
      >{{ translate('FeinwerkUptimeMonitor_UiOutages') }}</div>
      <span
        v-if="countText"
        class="fwum-muted"
      >{{ countText }}</span>
    </div>
    <!-- D4: a period without any measurement is no period without outages -->
    <p
      v-if="outages.length === 0"
      class="fwum-muted"
    >{{ translate(notMeasured ? 'FeinwerkUptimeMonitor_UiOutagesNotMeasured'
      : 'FeinwerkUptimeMonitor_UiNoOutages') }}</p>
    <ul
      v-else-if="narrow"
      class="fwum-targets fwum-outages__list"
      role="list"
    >
      <li
        v-for="row in outages"
        :key="row.key"
      >
        <span class="fwum-outages__first">
          <span class="fwum-outages__when"><span class="fwum-sr">{{
            translate('FeinwerkUptimeMonitor_UiStart') }}: </span>{{ when(row.start) }}</span>
          <span class="fwum-outages__length">
            <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiDuration') }}: </span>
            <span
              v-if="row.open"
              class="fwum-ongoing"
            >{{ translate('FeinwerkUptimeMonitor_UiOngoing') }}, </span>
            <span>{{ length(row) }}</span>
          </span>
        </span>
        <span class="fwum-outages__what"><span class="fwum-sr">{{
          translate('FeinwerkUptimeMonitor_UiWhat') }}: </span>{{ what(row) }}</span>
        <span
          v-if="cause(row) || hasExternal"
          class="fwum-outages__cause"
        >
          <span v-if="cause(row)"><span class="fwum-sr">{{
            translate('FeinwerkUptimeMonitor_UiCause') }}: </span>{{ cause(row) }}</span>
          <!-- review of the 5.2.0 fixes, NIT 3: no column heading here, so the side in words -->
          <span
            v-if="hasExternal"
            class="fwum-muted"
          ><span class="fwum-sr">, </span>{{ sidePhrase(row.source) }}</span>
        </span>
      </li>
    </ul>
    <div
      v-else
      class="fwum-table-wrap"
    >
      <table class="dataTable fwum-table fwum-outages__table">
        <thead>
          <tr>
            <th
              scope="col"
              class="label"
            >{{ translate('FeinwerkUptimeMonitor_UiStart') }}</th>
            <th
              scope="col"
              class="fwum-outages__wide"
            >{{ translate('FeinwerkUptimeMonitor_UiDuration') }}</th>
            <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiWhat') }}</th>
            <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiCause') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in outages"
            :key="row.key"
          >
            <td class="label fwum-outages__start">
              {{ when(row.start) }}
              <!-- phones (L1): the duration under the start, so What and Cause keep their room -->
              <span class="fwum-outages__narrow">
                <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiDuration') }}: </span>
                <span
                  v-if="row.open"
                  class="fwum-ongoing"
                >{{ translate('FeinwerkUptimeMonitor_UiOngoing') }}, </span>
                <span>{{ length(row) }}</span>
              </span>
            </td>
            <td class="fwum-outages__wide">
              <span
                v-if="row.open"
                class="fwum-ongoing"
              >{{ translate('FeinwerkUptimeMonitor_UiOngoing') }}, </span>
              <span>{{ length(row) }}</span>
            </td>
            <td>{{ what(row) }}</td>
            <td class="fwum-outages__cause">
              <span v-if="cause(row)">{{ cause(row) }}</span>
              <span
                v-if="hasExternal"
                class="fwum-muted fwum-outages__side"
              ><span class="fwum-sr">, </span>{{ sidePhrase(row.source) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      v-if="canShowMore"
      type="button"
      class="btn-flat fwum-more"
      :disabled="loadingMore"
      @click="$emit('more')"
    >{{ translate(loadingMore ? 'FeinwerkUptimeMonitor_UiLoading'
      : 'FeinwerkUptimeMonitor_UiShowMore') }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { translate } from 'CoreHome';
import {
  causeText, dateTime, duration, listOf,
} from './format';
import { KIND_ORDER, OutageRow } from './outages';
import { keepServer } from './sides';

/** a row's side in words after its cause, by its source (follow-up D1: both) */
const SIDE_PHRASES: Record<string, string> = {
  local: 'FeinwerkUptimeMonitor_UiFromServer',
  external: 'FeinwerkUptimeMonitor_UiFromOutside',
  both: 'FeinwerkUptimeMonitor_UiFromBoth',
};

export default defineComponent({
  props: {
    /** the rows shown (outages.ts outageRows), newest first */
    outages: { type: Array as PropType<OutageRow[]>, required: true },
    /** each address's name without its group ("Interface", "www.example.com") */
    names: { type: Object as PropType<Record<string, string>>, required: true },
    /** a past day or a longer period: durations are the part inside it */
    past: { type: Boolean, default: false },
    language: { type: String, default: '' },
    /** the website's timezone (Peter's 6a) */
    timezone: { type: String, default: '' },
    /** the rows of the period that were loaded (the list shows the first ones) */
    total: { type: Number, default: 0 },
    /** the API cut a list at its limit: the period has at least `total` outages */
    totalIsMinimum: { type: Boolean, default: false },
    /** "Show more" can show or load more */
    canShowMore: { type: Boolean, default: false },
    loadingMore: { type: Boolean, default: false },
    /** the page is narrow (UptimePage's own width): the outages as a list */
    narrow: { type: Boolean, default: false },
    /** nothing was measured in the period: no outages say nothing */
    notMeasured: { type: Boolean, default: false },
    /** the screen shows results from outside: every row names its side or both (5.2.0 review L2) */
    outside: { type: Boolean, default: false },
  },
  emits: ['more'],
  computed: {
    /** "20 of 57" above a cut list (the UI review's later item 10) */
    countText(): string {
      if (this.outages.length === 0
        || (this.outages.length >= this.total && !this.totalIsMinimum)) {
        return '';
      }
      return translate(this.totalIsMinimum
        ? 'FeinwerkUptimeMonitor_UiOutagesOfAtLeast'
        : 'FeinwerkUptimeMonitor_UiOutagesOf', String(this.outages.length), String(this.total));
    },
    /** the side helps only once results come from outside (the free plugin checks from Matomo) */
    hasExternal(): boolean {
      return this.outside || this.outages.some((row) => row.source === 'external'
        || row.source === 'both');
    },
  },
  methods: {
    translate,
    when(iso: string): string {
      return dateTime(iso, this.language, this.timezone);
    },
    /** the whole length; on a past day or longer period the part inside it, "30 min of 1 h" */
    length(row: OutageRow): string {
      const whole = duration(row.durationSeconds, this.language);
      if (!this.past) {
        return whole;
      }
      const part = duration(row.durationInPeriodSeconds, this.language);
      return part === whole ? part
        : translate('FeinwerkUptimeMonitor_UiPartOfWhole', part, whole);
    },
    /** "Matomo: Interface, Tracker endpoint and JavaScript tracker": the group named once */
    what(row: OutageRow): string {
      if (row.type === 'gap') {
        return translate('FeinwerkUptimeMonitor_UiGap');
      }
      const targets = row.incidents
        .map((i) => ({ key: i.targetKey || '', kind: i.kind || '' }))
        .filter((t, n, all) => all.findIndex((o) => o.key === t.key) === n)
        .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
          || a.key.localeCompare(b.key));
      const names = listOf(targets.map((t) => this.names[t.key] || t.key), this.language);
      return row.group === 'matomo'
        ? translate('FeinwerkUptimeMonitor_UiMatomoTarget', names) : names;
    },
    /** the causes of the merged outages, each once */
    cause(row: OutageRow): string {
      if (row.type === 'gap') {
        return '';
      }
      const causes = row.incidents.map((i) => causeText(i.cause, i.detail))
        .filter((c, n, all) => c !== '' && all.indexOf(c) === n);
      return listOf(causes, this.language);
    },
    /**
     * the side after the cause, in the narrow list and the table (D3): "from outside", "from the
     * Matomo server", both (follow-up D1); the server's name whole (W8)
     */
    sidePhrase(source: string): string {
      return keepServer(translate(SIDE_PHRASES[source] || SIDE_PHRASES.local));
    },
  },
});
</script>
