<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
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
    <p
      v-if="incidents.length === 0"
      class="fwum-muted"
    >{{ translate('FeinwerkUptimeMonitor_UiNoOutages') }}</p>
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
            <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiDuration') }}</th>
            <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiWhat') }}</th>
            <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiCause') }}</th>
            <th
              v-if="hasExternal"
              scope="col"
            >{{ translate('FeinwerkUptimeMonitor_UiSource') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="incident in incidents"
            :key="incident.idIncident"
          >
            <td class="label fwum-outages__start">{{ when(incident.start) }}</td>
            <td>
              <span
                v-if="incident.open"
                class="fwum-ongoing"
              >{{ translate('FeinwerkUptimeMonitor_UiOngoing') }}, </span>
              {{ length(incident.durationSeconds) }}
            </td>
            <td>{{ what(incident) }}</td>
            <td>{{ cause(incident) }}</td>
            <td v-if="hasExternal">{{ source(incident.source) }}</td>
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
import { Incident } from './types';
import {
  causeText, dateTime, duration,
} from './format';

export default defineComponent({
  props: {
    incidents: { type: Array as PropType<Incident[]>, required: true },
    labels: { type: Object as PropType<Record<string, string>>, required: true },
    language: { type: String, default: '' },
    /** the website's timezone (Peter's 6a) */
    timezone: { type: String, default: '' },
    /** the outages of the period that were loaded (the list shows the first ones) */
    total: { type: Number, default: 0 },
    /** the API cut a list at its limit: the period has at least `total` outages */
    totalIsMinimum: { type: Boolean, default: false },
    /** "Show more" can show or load more */
    canShowMore: { type: Boolean, default: false },
    loadingMore: { type: Boolean, default: false },
  },
  emits: ['more'],
  computed: {
    /** "20 of 57" above a cut list (the UI review's later item 10) */
    countText(): string {
      if (this.incidents.length === 0
        || (this.incidents.length >= this.total && !this.totalIsMinimum)) {
        return '';
      }
      return translate(this.totalIsMinimum
        ? 'FeinwerkUptimeMonitor_UiOutagesOfAtLeast'
        : 'FeinwerkUptimeMonitor_UiOutagesOf', String(this.incidents.length), String(this.total));
    },
    /** the column helps only once results come from outside (the free plugin checks from Matomo) */
    hasExternal(): boolean {
      return this.incidents.some((i) => i.source === 'external');
    },
  },
  methods: {
    translate,
    when(iso: string): string {
      return dateTime(iso, this.language, this.timezone);
    },
    length(seconds: number): string {
      return duration(seconds, this.language);
    },
    what(incident: Incident): string {
      if (incident.type === 'gap') {
        return translate('FeinwerkUptimeMonitor_UiGap');
      }
      return this.labels[incident.targetKey || ''] || incident.targetKey || '';
    },
    cause(incident: Incident): string {
      return incident.type === 'gap' ? '' : causeText(incident.cause, incident.detail);
    },
    source(source: string): string {
      return translate(source === 'external'
        ? 'FeinwerkUptimeMonitor_UiFromOutside'
        : 'FeinwerkUptimeMonitor_UiFromServer');
    },
  },
});
</script>
