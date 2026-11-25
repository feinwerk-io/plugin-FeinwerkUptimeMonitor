<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Administration > Diagnostic > Uptime Monitor (super users), spec 10: every website in one
  list, Matomo's own targets, the cron line for checks every minute, the alert status. The last
  check reads "3 minutes ago" (it follows the clock), its hover the time in the row's own
  timezone with the zone named, since the rows' timezones differ (L3). Websites that cannot be
  checked from this server fold into one line below the table (Peter's 3a, D4), like the uptime
  page's line for addresses; "Show" brings their rows back, pencil included.
-->
<template>
  <div
    class="fwum-admin"
    :lang="config.language || undefined"
  >
    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_MenuTitle')">
      <p>{{ translate('FeinwerkUptimeMonitor_UiAdminIntro') }}</p>
      <div
        v-if="loading && !rows.length"
        class="fwum-loading"
        aria-busy="true"
      >
        <span class="loadingPiwik"><img
          src="plugins/Morpheus/images/loading-blue.gif"
          alt=""
        ></span>
      </div>
      <div
        v-else-if="failed"
        class="fwum-error"
        role="alert"
      >
        <p>{{ translate('FeinwerkUptimeMonitor_UiLoadFailed') }}</p>
        <button
          type="button"
          class="btn-flat"
          @click="load"
        >{{ translate('FeinwerkUptimeMonitor_UiRetry') }}</button>
      </div>
      <div
        v-else-if="rows.length"
        class="fwum-table-wrap"
      >
        <table
          :id="`${uid}-table`"
          class="entityTable dataTable fwum-admin__table"
        >
          <thead>
            <tr>
              <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiSiteName') }}</th>
              <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiStatus') }}</th>
              <th
                v-if="hasCerts"
                scope="col"
              >{{ translate('FeinwerkUptimeMonitor_UiCertificate') }}</th>
              <th
                scope="col"
                class="fwum-wide-only"
              >{{ translate('FeinwerkUptimeMonitor_UiLastCheck') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="row.idSite"
            >
              <td class="fwum-admin__name">
                <a
                  v-if="row.idSite > 0"
                  :href="pageUrl(row.idSite)"
                >{{ row.name }}</a>
                <span v-else>{{ row.name }}</span>
                <button
                  type="button"
                  class="btn-flat fwum-icon-only"
                  :title="translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name)"
                  :aria-label="translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name)"
                  @click="openPanel(row)"
                ><span
                  class="icon-edit"
                  aria-hidden="true"
                /></button>
              </td>
              <td
                class="fwum-admin__status"
                :class="`is-${status(row).outcome}`"
              >
                <span class="fwum-cell-label">
                  <span
                    class="fwum-dot"
                    aria-hidden="true"
                  />
                  <span>{{ status(row).text }}</span>
                </span>
                <span
                  v-if="row.containersDown && row.containersDown.length > 3"
                  class="fwum-admin__containers"
                >{{ translate('FeinwerkUptimeMonitor_UiAdminContainersDownMany',
                  String(row.containersDown.length)) }}</span>
                <span
                  v-else-if="row.containersDown && row.containersDown.length"
                  class="fwum-admin__containers"
                >{{ containerLine(row).before }}<template
                  v-for="(part, i) in containerLine(row).parts"
                  :key="i"
                ><a
                  v-if="part.index >= 0"
                  :href="pageUrl(row.containersDown[part.index].idSite)"
                >{{ part.text }}</a><template v-else>{{ part.text }}</template></template>{{
                  containerLine(row).after }}</span>
                <span
                  v-if="row.lastCheckedAt"
                  class="fwum-muted fwum-narrow-only"
                  :title="when(row.lastCheckedAt, row.timezone)"
                >{{ since(row.lastCheckedAt) }}</span>
              </td>
              <td v-if="hasCerts">{{ certText(row.certificateDaysLeft) }}</td>
              <td
                class="fwum-wide-only"
                :title="row.lastCheckedAt ? when(row.lastCheckedAt, row.timezone) : ''"
              >
                {{ row.lastCheckedAt ? since(row.lastCheckedAt) : '' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="foldedRows.length"
          class="fwum-nc"
        >
          <p class="fwum-note">
            {{ foldedText }}
            <button
              type="button"
              class="fwum-link-button"
              :aria-expanded="showFolded ? 'true' : 'false'"
              :aria-controls="`${uid}-table`"
              @click="showFolded = !showFolded"
            >{{ translate(showFolded ? 'FeinwerkUptimeMonitor_UiHide'
              : 'FeinwerkUptimeMonitor_UiShow') }}</button>
            <button
              type="button"
              class="fwum-link-button"
              :aria-expanded="whyOpen ? 'true' : 'false'"
              :aria-controls="`${uid}-why`"
              @click="whyOpen = !whyOpen"
            >{{ translate('FeinwerkUptimeMonitor_UiWhy') }}</button>
            <a
              v-if="!config.allowPrivate"
              :href="settingsUrl"
            >{{ translate('FeinwerkUptimeMonitor_UiAllowPrivate') }}</a>
          </p>
          <p
            v-show="whyOpen"
            :id="`${uid}-why`"
            class="fwum-note fwum-nc__why"
          >{{ translate('FeinwerkUptimeMonitor_UiAdminNotCheckableHelp') }}</p>
        </div>
      </div>
      <p
        v-else-if="!loading"
        class="fwum-muted"
      >{{ translate('FeinwerkUptimeMonitor_UiFirstCheck') }}</p>
    </ContentBlock>

    <!-- Peter's 3a (P2): status rows like Diagnostic > System Check -->
    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_UiChecksAndAlerts')">
      <ul class="fwum-checks">
        <li :class="cronOk ? 'is-ok' : 'is-warn'">
          <span
            :class="cronOk ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div>
            <p v-if="cronOk">{{ cronText }}</p>
            <template v-else>
              <p>{{ translate('FeinwerkUptimeMonitor_UiCronHelp') }}</p>
              <div class="fwum-cron">
                <code>{{ config.cronLine }}</code>
                <button
                  type="button"
                  class="btn-flat"
                  @click="copy"
                >{{ translate(copied ? 'FeinwerkUptimeMonitor_UiCopied'
                  : 'FeinwerkUptimeMonitor_UiCopy') }}</button>
              </div>
            </template>
          </div>
        </li>
        <li :class="config.sentinel === 'active' ? 'is-ok' : 'is-warn'">
          <span
            :class="config.sentinel === 'active' ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div v-if="config.sentinel === 'active'">
            <p>{{ translate('FeinwerkUptimeMonitor_UiSentinelActive') }}</p>
            <p class="fwum-muted">
              {{ translate('FeinwerkUptimeMonitor_UiSentinelFacts') }}
              <a
                v-if="config.sentinelSettings"
                :href="config.sentinelSettings"
              >{{ translate('FeinwerkUptimeMonitor_UiSentinelSettingsLink') }}</a>
            </p>
          </div>
          <div v-else-if="config.sentinel === 'old'">
            <p>
              {{ translate('FeinwerkUptimeMonitor_UiSentinelOld', config.sentinelVersion || '') }}
              <a :href="pluginsUrl">{{
                translate('FeinwerkUptimeMonitor_UiSentinelPluginsLink') }}</a>
            </p>
          </div>
          <div v-else>
            <!-- the link to Feinwerk Sentinel is no promotion (Peter, 2026-11-24, 3a) -->
            <p>
              {{ translate(sentinelKey) }}
              <a
                :href="sentinelUrl"
                target="_blank"
                rel="noopener"
              >{{ translate('FeinwerkUptimeMonitor_UiSentinelLink') }}</a>
            </p>
          </div>
        </li>
      </ul>
      <p>
        <a :href="settingsUrl">{{ translate('FeinwerkUptimeMonitor_UiSettings') }}</a>
      </p>
    </ContentBlock>

    <TargetPanel
      v-if="panelSite !== null"
      :id-site="panelSite"
      :site-name="panelName"
      @close="onPanelClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ContentBlock, MatomoUrl, translate } from 'CoreHome';
import { api } from './api';
import { ScreenConfig, SiteOverview } from './types';
import {
  ago, dateTime, duration, listOf, listParts, statusOf, zoneOf,
} from './format';
import TargetPanel from './TargetPanel.vue';

export default defineComponent({
  components: { ContentBlock, TargetPanel },
  props: {
    config: { type: Object as PropType<ScreenConfig>, required: true },
  },
  data() {
    return {
      rows: [] as SiteOverview[],
      loading: true,
      failed: false,
      copied: false,
      panelSite: null as number | null,
      panelName: '',
      /** the folded websites shown in the table again, and the reason open */
      showFolded: false,
      whyOpen: false,
      uid: `fwum-admin-${Math.random().toString(36).slice(2, 8)}`,
      /** the screen's clock: "3 minutes ago" follows it every minute */
      tick: Date.now(),
      timer: 0,
    };
  },
  computed: {
    /** Problems first: websites with outages, then those that cannot be checked, then the rest. */
    sorted(): SiteOverview[] {
      const rank = (row: SiteOverview) => {
        const { outcome } = this.status(row);
        if (outcome === 'down' || outcome === 'partial') {
          return 0;
        }
        return ['stale', 'not_checkable', 'off'].includes(outcome) ? 1 : 2;
      };
      // Matomo first (it carries every website), then problems first
      return [...this.rows].sort((a, b) => Number(b.idSite === 0) - Number(a.idSite === 0)
        || rank(a) - rank(b) || a.idSite - b.idSite);
    },
    /** websites (never Matomo) this server cannot check: one line below the table (D4) */
    foldedRows(): SiteOverview[] {
      return this.sorted.filter((row) => row.idSite > 0 && this.status(row).outcome === 'not_checkable');
    },
    /** shown again, the folded rows come last, right above their line */
    visibleRows(): SiteOverview[] {
      const folded = this.foldedRows.map((row) => row.idSite);
      const rest = this.sorted.filter((row) => !folded.includes(row.idSite));
      return this.showFolded ? [...rest, ...this.foldedRows] : rest;
    },
    /** up to three websites by name (the answer without a click), more as a count */
    foldedText(): string {
      const count = this.foldedRows.length;
      if (count <= 3) {
        const names = listOf(this.foldedRows.map((row) => row.name), this.config.language);
        return count === 1
          ? translate('FeinwerkUptimeMonitor_UiAdminNotCheckableNamedOne', names)
          : translate('FeinwerkUptimeMonitor_UiAdminNotCheckableNamedMany', names);
      }
      return translate('FeinwerkUptimeMonitor_UiAdminNotCheckableMany', String(count));
    },
    /** a system cron runs the checks (IntervalTracker on the server) */
    cronOk(): boolean {
      return !!this.config.cron?.active;
    },
    cronText(): string {
      const seconds = this.config.cron?.intervalSeconds || 60;
      return seconds <= 90
        ? translate('FeinwerkUptimeMonitor_UiCronActiveMinute')
        : translate('FeinwerkUptimeMonitor_UiCronActive', duration(seconds, this.config.language));
    },
    /** installed but deactivated, or not there at all */
    sentinelKey(): string {
      return this.config.sentinel === 'inactive' ? 'FeinwerkUptimeMonitor_UiSentinelInactive'
        : 'FeinwerkUptimeMonitor_UiSentinelMissing';
    },
    /** Administration > Plugins, where an old Sentinel gets its update */
    pluginsUrl(): string {
      return `?${MatomoUrl.stringify({ module: 'CorePluginsAdmin', action: 'plugins' })}`;
    },
    /** Feinwerk Sentinel's store page in the page language (German or English) */
    sentinelUrl(): string {
      const lang = (this.config.language || '').startsWith('de') ? 'de' : 'en';
      return `https://plugins.feinwerk.io/${lang}/plugins/FeinwerkSentinel?mtm_campaign=plugin-link&mtm_source=FeinwerkUptimeMonitor`;
    },
    /** the certificate column only where some website has one (no column of empty cells) */
    hasCerts(): boolean {
      return this.rows.some((r) => r.certificateDaysLeft !== null);
    },
    settingsUrl(): string {
      return `?${MatomoUrl.stringify({
        module: 'CoreAdminHome', action: 'generalSettings',
      })}#/FeinwerkUptimeMonitor`;
    },
  },
  mounted() {
    this.load();
    this.timer = window.setInterval(() => {
      this.tick = Date.now();
    }, 60000);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
  methods: {
    translate,
    load(): void {
      this.loading = true;
      api.overview().then((rows) => {
        this.rows = rows;
        this.failed = false;
        this.tick = Date.now();
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    /** in the row's timezone (Matomo itself: UTC), named; a fixed offset names itself */
    when(iso: string, timezone: string): string {
      const text = dateTime(iso, this.config.language, timezone || '');
      return zoneOf(timezone || '').name ? `${text} (${timezone})` : text;
    },
    since(iso: string): string {
      return ago(iso, this.config.language, this.tick);
    },
    /**
     * Matomo's row: whose Tag Manager container is down (containers count with Matomo), each
     * website a link to its uptime page, up to three like the fold line
     */
    containerLine(row: SiteOverview): {
      before: string; after: string; parts: Array<{ index: number; text: string }>;
    } {
      const mark = '\u0001';
      const [before, after = ''] = translate('FeinwerkUptimeMonitor_UiAdminContainersDown', mark)
        .split(mark);
      const names = (row.containersDown || []).map((s) => s.name);
      return { before, after, parts: listParts(names, this.config.language) };
    },
    openPanel(row: SiteOverview): void {
      this.panelName = row.name;
      this.panelSite = row.idSite;
    },
    /** the same rule as the cards of the uptime page (format.ts statusOf) */
    status(row: SiteOverview): { outcome: string; text: string } {
      return statusOf({
        total: row.targets,
        off: row.off,
        up: row.up,
        down: row.down,
        stale: row.stale,
        notCheckable: row.notCheckable,
      });
    },
    certText(days: number | null): string {
      if (days === null) {
        // no https address, or its certificate not read yet
        return '';
      }
      if (days < 0) {
        return translate('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return days === 1
        ? translate('FeinwerkUptimeMonitor_UiCertificateDay')
        : translate('FeinwerkUptimeMonitor_UiCertificateDays', String(days));
    },
    pageUrl(idSite: number): string {
      const query = MatomoUrl.stringify({
        module: 'CoreHome', action: 'index', idSite, period: 'day', date: 'today',
      });
      const hash = MatomoUrl.stringify({
        idSite,
        period: 'day',
        date: 'today',
        category: 'General_Visitors',
        subcategory: 'FeinwerkUptimeMonitor_Uptime',
      });
      return `?${query}#?${hash}`;
    },
    /** The clipboard API needs HTTPS; many intranet Matomos run on HTTP: then the classic way. */
    copy(): void {
      const text = this.config.cronLine || '';
      const done = () => {
        this.copied = true;
      };
      const fallback = () => {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          if (document.execCommand('copy')) {
            done();
          }
        } finally {
          document.body.removeChild(area);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    },
    onPanelClose(changed: boolean): void {
      this.panelSite = null;
      if (changed) {
        this.load();
      }
    },
  },
});
</script>
