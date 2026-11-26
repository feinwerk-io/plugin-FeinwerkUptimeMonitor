<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  The compact address list of the dashboard widgets and of the uptime page when it is narrow
  (P1): the address first; response, uptime and certificate follow as one unit that moves to
  the next line as a whole (B2), each value with its name for screen readers and the
  certificate with its name ("Certificate 41 days"). Without the certificate when the group
  names it once. A past day (D1): the dot follows that day's uptime, no response time.
-->
<template>
  <ul
    class="fwum-targets"
    role="list"
  >
    <li
      v-for="row in rows"
      :key="row.key"
      :class="`is-${past ? row.dayOutcome : row.outcome}`"
      :title="row.title"
    >
      <span class="fwum-cell-label">
        <span
          class="fwum-dot"
          aria-hidden="true"
        />
        <span class="fwum-targets__label"><template
          v-for="(part, p) in breakParts(row.label)"
          :key="p"
        >{{ part }}<wbr></template></span>
      </span>
      <span class="fwum-targets__values">
        <span
          v-if="!past"
          class="fwum-targets__text"
        ><span class="fwum-sr">{{
          translate('FeinwerkUptimeMonitor_UiResponse') }}: </span>{{
          keepHyphens(row.text) }}</span>
        <span
          v-if="row.uptime"
          class="fwum-targets__uptime"
        ><span class="fwum-sr">{{
          translate('FeinwerkUptimeMonitor_UiUptime') }}: </span>{{ row.uptime }}</span>
        <span
          v-if="showCert && row.cert"
          class="fwum-targets__cert"
          :class="`is-${row.certLevel}`"
        >{{ translate('FeinwerkUptimeMonitor_UiCertificateValue', row.cert) }}</span>
      </span>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { translate } from 'CoreHome';
import { AddressRow } from './types';
import { breakParts, keepHyphens } from './format';

export default defineComponent({
  props: {
    rows: { type: Array as PropType<AddressRow[]>, required: true },
    /** false: the group heading (or the widget's figure) names the one certificate of all rows */
    showCert: { type: Boolean, default: true },
    /** a past day or period is shown (D1) */
    past: { type: Boolean, default: false },
  },
  methods: {
    translate,
    breakParts,
    keepHyphens,
  },
});
</script>
