<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Administration > Diagnostic > Uptime Monitor (super users), spec 10: every website in one
  list, Matomo's own targets, the cron line for checks every minute, the alert status. The last
  check reads "3 minutes ago" (it follows the clock), its hover the time in the row's own
  timezone with the zone named, since the rows' timezones differ (L3). Websites that cannot be
  checked from this server fold into one line below the table (Peter's 3a, D4), like the uptime
  page's line for addresses; "Show" brings their rows back, pencil included. Narrower than a
  phone (B5) the table becomes stacked rows: name and pencil, the status, then certificate and
  last check, muted and named. While another plugin adds results checked from outside, the status
  rows name it (delivering, with the time of its latest results, or not active) with the link to
  its settings; without such a plugin nothing about it shows. While it delivers, the table
  combines both sides (API getSitesOverview), so only websites no side can check are folded (named
  "from this server" unless the outside said it cannot check them either, 5.2.0 review B3), and
  when it sends alerts itself the alert row names it instead of "No alerts".
-->
<template>
  <div
    class="fwum-admin"
    :lang="config.language || undefined"
  >
    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_MenuTitle')">
      <p>{{ translate(outside ? 'FeinwerkUptimeMonitor_UiAdminIntroOutside'
        : 'FeinwerkUptimeMonitor_UiAdminIntro') }}</p>
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
        <ul
          v-if="narrow"
          :id="`${uid}-table`"
          class="fwum-admin__list"
          role="list"
        >
          <li
            v-for="row in visibleRows"
            :key="row.idSite"
          >
            <span class="fwum-admin__name">
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
            </span>
            <span
              class="fwum-admin__status"
              :class="`is-${status(row).outcome}`"
            >
              <AdminStatus
                :row="row"
                :status="status(row)"
                :language="config.language"
              />
            </span>
            <span
              v-if="row.certificateDaysLeft !== null || row.lastCheckedAt"
              class="fwum-admin__meta fwum-muted"
            >
              <span
                v-if="row.certificateDaysLeft !== null"
                class="fwum-admin__cert"
                :class="certClass(row)"
              >{{ translate('FeinwerkUptimeMonitor_UiCertificateValue',
                            certText(row.certificateDaysLeft)) }}</span>
              <span
                v-if="row.lastCheckedAt"
                :title="when(row.lastCheckedAt, row.timezone)"
              >{{ translate('FeinwerkUptimeMonitor_UiChecked', since(row.lastCheckedAt)) }}</span>
            </span>
          </li>
        </ul>
        <table
          v-else
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
              <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiLastCheck') }}</th>
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
                <AdminStatus
                  :row="row"
                  :status="status(row)"
                  :language="config.language"
                />
              </td>
              <!-- the warning and critical colours of the uptime page and the widgets -->
              <td
                v-if="hasCerts"
                class="fwum-admin__cert"
                :class="certClass(row)"
              >{{ certText(row.certificateDaysLeft) }}</td>
              <td :title="row.lastCheckedAt ? when(row.lastCheckedAt, row.timezone) : ''">
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
          >{{ foldedWhy }}</p>
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
        <li :class="alertsOk ? 'is-ok' : 'is-warn'">
          <span
            :class="alertsOk ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div v-if="alertsOk">
            <!-- the plugin that checks from outside sends alerts itself: never "No alerts" then -->
            <p v-if="outsideAlerts">{{ outsideAlertsText }}</p>
            <template v-if="config.sentinel === 'active'">
              <p>{{ translate('FeinwerkUptimeMonitor_UiSentinelActive') }}</p>
              <!-- P3 (Peter, 2026-11-25): the link on the words that name Sentinel's settings -->
              <p class="fwum-muted">{{ sentinelFacts.before }}<a
                v-if="config.sentinelSettings && sentinelFacts.link"
                :href="config.sentinelSettings"
              >{{ sentinelFacts.link }}</a><template
                v-else
              >{{ sentinelFacts.link }}</template>{{ sentinelFacts.after }}</p>
            </template>
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
        <!-- results checked from outside: only while a plugin that adds them is there -->
        <li
          v-if="config.external"
          :class="config.external.active ? 'is-ok' : 'is-warn'"
        >
          <span
            :class="config.external.active ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div>
            <p>
              {{ outsideText }}
              <a
                v-if="config.external.settingsUrl"
                :href="config.external.settingsUrl"
              >{{ translate('FeinwerkUptimeMonitor_UiOutsideSettings') }}</a>
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
  ago, dateTime, duration, keepUnits, listOf, statusOf, zoneOf,
} from './format';
import { observeNarrow } from './narrow';
import { uptimePageToday } from './links';
import TargetPanel from './TargetPanel.vue';
import AdminStatus from './AdminStatus.vue';

export default defineComponent({
  components: { ContentBlock, TargetPanel, AdminStatus },
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
      /** narrower than a phone (B5): stacked rows instead of the table */
      narrow: false,
      resize: null as ResizeObserver | null,
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
    /** B3: the outside said it cannot check any of the folded websites either */
    foldedEither(): boolean {
      return this.outside && this.foldedRows.length > 0
        && this.foldedRows.every((row) => this.eitherSide(row));
    },
    /**
     * up to three websites by name (the answer without a click), more as a count; "from this
     * server" unless no side can check them (B3)
     */
    foldedText(): string {
      const count = this.foldedRows.length;
      const keys = this.foldedEither
        ? ['UiAdminCannotCheckNamedOne', 'UiAdminCannotCheckNamedMany', 'UiAdminCannotCheckMany']
        : ['UiAdminNotCheckableNamedOne', 'UiAdminNotCheckableNamedMany', 'UiAdminNotCheckableMany'];
      if (count <= 3) {
        const names = listOf(this.foldedRows.map((row) => row.name), this.config.language);
        return translate(`FeinwerkUptimeMonitor_${keys[count === 1 ? 0 : 1]}`, names);
      }
      return translate(`FeinwerkUptimeMonitor_${keys[2]}`, String(count));
    },
    /** another plugin delivers results checked from outside: the overview combines both sides */
    outside(): boolean {
      return !!this.config.external && this.config.external.active;
    },
    /** that plugin sends alerts for outages itself */
    outsideAlerts(): boolean {
      return this.outside && !!this.config.external?.alerts;
    },
    /** someone sends alerts: Feinwerk Sentinel, or the plugin that checks from outside */
    alertsOk(): boolean {
      return this.config.sentinel === 'active' || this.outsideAlerts;
    },
    /** "<its own name> sends alerts for outages" */
    outsideAlertsText(): string {
      return translate('FeinwerkUptimeMonitor_UiOutsideAlerts', this.config.external?.name || '');
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
    /** UiSentinelFacts around its link words (%1$s ... %2$s) */
    sentinelFacts(): { before: string; link: string; after: string } {
      const [before, rest = ''] = translate('FeinwerkUptimeMonitor_UiSentinelFacts', '\u0001', '\u0002')
        .split('\u0001');
      const [link, after = ''] = rest.split('\u0002');
      return { before, link, after };
    },
    /** "Why?" of the folded websites: the server's reasons, and the outside's when it cannot too */
    foldedWhy(): string {
      const help = translate('FeinwerkUptimeMonitor_UiAdminNotCheckableHelp');
      return this.foldedEither
        ? `${help} ${translate('FeinwerkUptimeMonitor_UiNotCheckableOutsideHelp')}` : help;
    },
    /**
     * checked from outside too, with the time of the latest results (L8 review 6: resultsAt, not
     * reachedAt, which a push of settings moves too); or not active
     */
    outsideText(): string {
      const source = this.config.external;
      if (!source || !source.active || !source.reachedAt) {
        return translate('FeinwerkUptimeMonitor_UiOutsidePaused');
      }
      if (!source.resultsAt) {
        return translate('FeinwerkUptimeMonitor_UiOutsideActiveNoResults');
      }
      return translate('FeinwerkUptimeMonitor_UiOutsideActive',
        ago(source.resultsAt, this.config.language, this.tick));
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
    if (this.$el instanceof HTMLElement) {
      this.resize = observeNarrow(this.$el, (narrow) => {
        this.narrow = narrow;
      });
    }
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
    if (this.resize) {
      this.resize.disconnect();
    }
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
    openPanel(row: SiteOverview): void {
      this.panelName = row.name;
      this.panelSite = row.idSite;
    },
    /**
     * the same rule as the cards of the uptime page (format.ts statusOf); not checkable from either
     * side (the outside says so too): both named, as the page's answer line does (B3)
     */
    status(row: SiteOverview): { outcome: string; text: string } {
      const state = statusOf({
        total: row.targets,
        off: row.off,
        up: row.up,
        down: row.down,
        stale: row.stale,
        notCheckable: row.notCheckable,
      });
      return state.outcome === 'not_checkable' && this.outside && this.eitherSide(row)
        ? { outcome: state.outcome, text: translate('FeinwerkUptimeMonitor_UiNotCheckableEither') }
        : state;
    },
    /** B3: the outside cannot check any of the row's addresses that this server cannot check */
    eitherSide(row: SiteOverview): boolean {
      return row.notCheckable > 0 && (row.notCheckableOutside || 0) >= row.notCheckable;
    },
    certText(days: number | null): string {
      if (days === null) {
        // no https address, or its certificate not read yet
        return '';
      }
      if (days < 0) {
        return translate('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return keepUnits(days === 1
        ? translate('FeinwerkUptimeMonitor_UiCertificateDay')
        : translate('FeinwerkUptimeMonitor_UiCertificateDays', String(days)));
    },
    /** the soonest certificate's level (API certificateLevel) as a class: is-warning ... */
    certClass(row: SiteOverview): string {
      return row.certificateLevel ? `is-${row.certificateLevel}` : '';
    },
    pageUrl: uptimePageToday,
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
