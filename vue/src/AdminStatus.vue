<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  One website's status on the admin overview (the table cell and the phone row): the state with
  its dot (format.ts statusOf, the uptime page's rule) and, in Matomo's row, whose Tag Manager
  container is down, each website a link to its uptime page, up to three like the fold line.
-->
<template>
  <span class="fwum-cell-label">
    <span
      class="fwum-dot"
      aria-hidden="true"
    />
    <span>{{ status.text }}</span>
  </span>
  <span
    v-if="row.containersDown && row.containersDown.length > 3"
    class="fwum-admin__containers"
  >{{ translate(`FeinwerkUptimeMonitor_UiAdminContainersDownMany${status.side || ''}`,
    String(row.containersDown.length)) }}</span>
  <span
    v-else-if="row.containersDown && row.containersDown.length"
    class="fwum-admin__containers"
  >{{ containerLine.before }}<template
    v-for="(part, i) in containerLine.parts"
    :key="i"
  ><a
    v-if="part.index >= 0"
    :href="pageUrl(row.containersDown[part.index].idSite)"
  >{{ part.text }}</a><template v-else>{{ part.text }}</template></template>{{
    containerLine.after }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { translate } from 'CoreHome';
import { SiteOverview } from './types';
import { listParts } from './format';
import { uptimePageToday } from './links';

interface ContainerLine {
  before: string;
  after: string;
  /** the website names (index into containersDown) and the words between them (index -1) */
  parts: Array<{ index: number; text: string }>;
}

export default defineComponent({
  props: {
    row: { type: Object as PropType<SiteOverview>, required: true },
    /**
     * the row's status; side FromServer or FromOutside when it names the side of a one-sided
     * failure
     */
    status: {
      type: Object as PropType<{ outcome: string; text: string; side?: string }>,
      required: true,
    },
    language: { type: String, default: '' },
  },
  computed: {
    /**
     * "Tag Manager container of A not reachable", "Tag Manager containers of A, B and C not
     * reachable" around its links (fr "du site A", "des sites A et B")
     */
    containerLine(): ContainerLine {
      const mark = '\u0001';
      const names = (this.row.containersDown || []).map((s) => s.name);
      // the status above names the side of a one-sided failure: the containers fail on that side
      // (UI review F1)
      const side = this.status.side || '';
      const [before, after = ''] = translate(names.length > 1
        ? `FeinwerkUptimeMonitor_UiAdminContainersDownSeveral${side}`
        : `FeinwerkUptimeMonitor_UiAdminContainersDown${side}`, mark).split(mark);
      return { before, after, parts: listParts(names, this.language) };
    },
  },
  methods: {
    translate,
    pageUrl: uptimePageToday,
  },
});
</script>
