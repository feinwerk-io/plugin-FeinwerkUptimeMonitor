<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  The compact address list of the dashboard widgets and of the uptime page when it is narrow
  (P1): the address first; response, uptime and certificate follow as one unit that moves to
  the next line as a whole (B2), each value with its name for screen readers and the
  certificate with its name ("Certificate 41 days"). Without the certificate when the group
  names it once. A past day (D1): the dot follows that day's uptime, no response time. While
  results checked from outside come in (outside), the rules of the page's table (P2, sides.ts): one
  line of values when both sides say the same; where they disagree, one line per side, the side
  that sets the dot first, each named, and the certificate on a line of its own. An address down
  only from the Matomo server while the outside reaches it is amber (3a). Follow-ups (Peter,
  2026-11-26, "alle wie empfohlen"): in the widgets a side that cannot check the address adds no
  line (D3: the other side's values, the outside's named); screen readers hear the outside's value
  of an agreeing line (W5). Review fixes before 5.3.0: a side line holds its values as one unit
  that moves under the side's name as a whole (UI review B1); an outside without a current result
  adds no words, in the widgets no line (L8 NIT 3); a container too large to read names no side
  (L2); the widgets on a past day list the lower uptime first (L4, byUptime).
-->
<template>
  <ul
    class="fwum-targets"
    role="list"
  >
    <li
      v-for="row in rows"
      :key="row.key"
      :class="`is-${past ? row.dayOutcome : row.tone}`"
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
      <span
        v-if="!sidesOf(row)"
        class="fwum-targets__values"
      >
        <span
          v-if="!past"
          class="fwum-targets__text"
        ><span class="fwum-sr">{{
          translate('FeinwerkUptimeMonitor_UiResponse') }}: </span>{{
          keepHyphens(textOf(row)) }}<span
          v-if="asideOf(row)"
          class="fwum-sr"
        >, {{ asideOf(row) }}</span></span>
        <span
          v-if="uptimeOf(row)"
          class="fwum-targets__uptime"
        ><span class="fwum-sr">{{
          translate('FeinwerkUptimeMonitor_UiUptime') }}: </span>{{ uptimeOf(row) }}</span>
        <!-- D3: the widget's one line from outside says so -->
        <span
          v-if="onlyFromOutside(row)"
          class="fwum-targets__from"
        >{{ onlyFromOutside(row) }}</span>
        <span
          v-if="showCert && row.cert"
          class="fwum-targets__cert"
          :class="`is-${row.certLevel}`"
        >{{ translate('FeinwerkUptimeMonitor_UiCertificateValue', row.cert) }}</span>
      </span>
      <template v-else>
        <span
          v-for="side in sidesOf(row)"
          :key="side.key"
          class="fwum-targets__values fwum-targets__values--side"
        >
          <span class="fwum-targets__pair">
            <span
              v-if="!past && hasWords(side)"
              class="fwum-targets__text"
              :class="`is-${toneOf(side, row)}`"
              :title="side.title || undefined"
            ><span class="fwum-sr">{{
              translate('FeinwerkUptimeMonitor_UiResponse') }}: </span>{{
              keepHyphens(side.text) }}</span>
            <span
              v-if="side.uptime || past"
              class="fwum-targets__uptime"
            ><span class="fwum-sr">{{
              translate('FeinwerkUptimeMonitor_UiUptime') }}: </span>{{ side.uptime
              || translate('FeinwerkUptimeMonitor_UiNotMeasured') }}</span>
          </span>
          <span
            v-if="!side.tooLarge"
            class="fwum-targets__from"
          >{{ fromOf(side) }}</span>
        </span>
        <span
          v-if="showCert && row.cert"
          class="fwum-targets__values fwum-targets__values--side"
        ><span
          class="fwum-targets__cert"
          :class="`is-${row.certLevel}`"
        >{{ translate('FeinwerkUptimeMonitor_UiCertificateValue', row.cert) }}</span></span>
      </template>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { translate } from 'CoreHome';
import { AddressRow } from './types';
import { breakParts, keepHyphens } from './format';
import {
  aside, keepServer, Side, sideTone, speaks, split, uptimeLines, widgetSide,
} from './sides';

export default defineComponent({
  props: {
    rows: { type: Array as PropType<AddressRow[]>, required: true },
    /** false: the group heading (or the widget's figure) names the one certificate of all rows */
    showCert: { type: Boolean, default: true },
    /** a past day or period is shown (D1) */
    past: { type: Boolean, default: false },
    /** results checked from outside come in: each address with both sides */
    outside: { type: Boolean, default: false },
    /** a dashboard widget: a side that cannot check an address adds no line (follow-up D3) */
    widget: { type: Boolean, default: false },
    /** the lower uptime first where the sides differ: a widget on a past day or period (L4) */
    byUptime: { type: Boolean, default: false },
  },
  methods: {
    translate,
    breakParts,
    keepHyphens,
    /**
     * the row's side from outside as this list shows it: none in a widget while the outside has no
     * current answer about the address (L8 review of 5.3.0, NIT 3: a green widget keeps one line)
     */
    outsideOf(row: AddressRow): Side | null {
      if (!this.outside || !row.outside) {
        return null;
      }
      return this.widget && !speaks(row.outside) ? null : row.outside;
    },
    /** P2: null when one line says it all, else both sides in order (sides.ts split) */
    sidesOf(row: AddressRow): Side[] | null {
      const outside = this.outsideOf(row);
      if (!outside || this.onlyOf(row)) {
        return null;
      }
      return split(row.server, outside, this.past, this.past || this.byUptime);
    },
    /**
     * NIT 3: a side line's words: the server's always; the outside's only while it has a current
     * answer (else its uptime alone, as the table shows it)
     */
    hasWords(side: Side): boolean {
      return side.key === 'server' || speaks(side);
    },
    /**
     * D3: in a widget, the one side that can check the address while the other cannot (sides.ts
     * widgetSide); null on the page and where both or neither can
     */
    onlyOf(row: AddressRow): Side | null {
      return this.widget && this.outside ? widgetSide(row.server, row.outside) : null;
    },
    /** D3: "from outside" when the one line is the outside's ('' otherwise) */
    onlyFromOutside(row: AddressRow): string {
      const only = this.onlyOf(row);
      return only && only.key === 'outside' ? this.fromOf(only) : '';
    },
    /** the one line's response: that side's words (D3), else the row's */
    textOf(row: AddressRow): string {
      const only = this.onlyOf(row);
      return only ? only.text : row.text;
    },
    /**
     * the one line's uptime: with results from outside the Uptime cell's one value (it names the
     * outside); D3 the one side's, its name follows once
     */
    uptimeOf(row: AddressRow): string {
      const only = this.onlyOf(row);
      if (only) {
        return only.uptime;
      }
      const outside = this.outsideOf(row);
      if (!outside || (!row.uptime && !outside.uptime)) {
        return row.uptime;
      }
      return uptimeLines(row.server, outside, this.past)[0].text;
    },
    /** W5: the outside's value of an agreeing line, for screen readers (sides.ts aside) */
    asideOf(row: AddressRow): string {
      const outside = this.outsideOf(row);
      return outside && !this.onlyOf(row) ? aside(row.server, outside) : '';
    },
    /**
     * one side's colour: its outcome; the server's failure while the outside reaches it amber (3a)
     */
    toneOf(side: Side, row: AddressRow): string {
      return sideTone(side, side.key === 'server' ? row.outside : row.server);
    },
    /**
     * "from the Matomo server" (the name whole, W8), "from outside"; a container too large to read
     * names no side (W4, L2: the template leaves the name out)
     */
    fromOf(side: Side): string {
      return keepServer(translate(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiFromServer'
        : 'FeinwerkUptimeMonitor_UiFromOutside'));
    },
  },
});
</script>
