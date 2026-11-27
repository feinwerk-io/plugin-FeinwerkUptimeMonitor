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
  "from the Matomo server", follow-up W2, unless the outside said it cannot check them either,
  5.2.0 review B3), and a
  status names the side of a one-sided failure (Peter's 3a, 2026-11-26: only from the Matomo
  server while the outside reaches it is amber). P4 (UI review 5.2.0): the row for the checks from
  outside comes right under the cron row and says when it sends alerts itself; Sentinel's row
  follows when Sentinel sends alerts, never "No alerts" while that plugin sends them. 5.3.1: when
  the server's PHP disables functions the checks need, one line above the table names them with
  a hint for the server administrator; the fold then has no "Why?" and no "Allow private
  addresses", which are not the reason. The same while Matomo's internet features are off (Peter's
  2a, with the opt-in), and a hint when Matomo's own addresses answer only after the redirect to
  https (audit D2). Robustness part 2: a neutral row when the checks go out one after the other
  through curl_exec or through PHP's streams (no curl). UI review of 5.4.0 (Peter, "go" to P1 to
  P4): those server rows are one list with the dividers of "Checks and alerts", and each line for
  config/config.ini.php is a chip with Copy, as the cron line (P2); the line alone, never a
  section header, which would replace the section already in the file; the tracker address field
  is named and linked as the settings page names it (L6); while Matomo's internet features are off
  the cron row is neutral and says the checks send nothing (L8), and the target panel says so too
  (L9). Quick UI review before 5.4.0, L3: each chip's Copy is named with its line and says
  "Copied" in a polite region (CopyChip.vue).
-->
<template>
  <div
    class="fwum-admin"
    :lang="config.language || undefined"
  >
    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_MenuTitle')">
      <p>{{ translate(outside ? 'FeinwerkUptimeMonitor_UiAdminIntroOutside'
        : 'FeinwerkUptimeMonitor_UiAdminIntro') }}</p>
      <!-- P2 (UI review of 5.4.0): the server's rows in one list, as "Checks and alerts" below -->
      <ul
        v-if="phpDisabled.length || config.internetOff || config.httpsRedirect || transportText"
        class="fwum-checks fwum-admin__server"
      >
        <!-- 5.3.1: the server's PHP disables functions the checks need: the reason, once -->
        <li
          v-if="phpDisabled.length"
          class="fwum-admin__php is-warn"
        >
          <span
            class="icon-warning"
            aria-hidden="true"
          />
          <div>
            <p>{{ translate('FeinwerkUptimeMonitor_UiAdminPhpDisabled',
                            phpDisabled.join(', ')) }}</p>
            <!-- UI review of 5.4.0, L7: a missing curl extension, not disable_functions -->
            <p class="fwum-muted">{{ translate(config.curlMissing
              ? 'FeinwerkUptimeMonitor_UiAdminCurlMissingHint'
              : 'FeinwerkUptimeMonitor_UiAdminPhpDisabledHint') }}</p>
          </div>
        </li>
        <!-- Peter's 2a: Matomo's internet features are off: no check is sent; the opt-in -->
        <li
          v-if="config.internetOff"
          class="fwum-admin__internet is-warn"
        >
          <span
            class="icon-warning"
            aria-hidden="true"
          />
          <div>
            <p>{{ translate('FeinwerkUptimeMonitor_UiInternetOff') }}</p>
            <p class="fwum-muted">{{
              translate('FeinwerkUptimeMonitor_UiAdminInternetOffHint') }}</p>
            <CopyChip
              class="fwum-chip"
              :line="internetLine"
            />
          </div>
        </li>
        <!-- robustness part 2: the checks work, through curl_exec or PHP's streams: an info row -->
        <li
          v-if="transportText"
          class="fwum-admin__transport is-info"
        >
          <span
            class="icon-info"
            aria-hidden="true"
          />
          <div>
            <p>{{ transportText }}</p>
          </div>
        </li>
        <!-- audit D2: Matomo's address stored as http behind a proxy that handles https; UI review
             of 5.4.0, B4: it works, so an info row, as Matomo's System Check -->
        <li
          v-if="config.httpsRedirect"
          class="fwum-admin__https is-info"
        >
          <span
            class="icon-info"
            aria-hidden="true"
          />
          <div>
            <p>{{ translate('FeinwerkUptimeMonitor_UiAdminHttpsRedirect') }}</p>
            <p class="fwum-muted">{{
              translate('FeinwerkUptimeMonitor_UiAdminHttpsRedirectHint') }}</p>
            <CopyChip
              class="fwum-chip"
              :line="httpsLine"
            />
            <p class="fwum-muted">{{ trackerFacts.before }}<a :href="settingsUrl">{{
              trackerFacts.link }}</a>{{ trackerFacts.after }}</p>
          </div>
        </li>
      </ul>
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
              <td
                class="fwum-admin__when"
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
            <!-- with PHP functions disabled the reason is the line above the table, not a firewall
                 or a private address -->
            <template v-if="foldWhy">
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
            </template>
          </p>
          <p
            v-if="foldWhy"
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
        <!-- UI review of 5.4.0, L8: no green tick while the checks send nothing -->
        <li
          class="fwum-checks__cron"
          :class="cronClass"
        >
          <span
            :class="cronIcon"
            aria-hidden="true"
          />
          <div>
            <p v-if="cronOk">{{ cronText }}</p>
            <template v-else>
              <p>{{ translate('FeinwerkUptimeMonitor_UiCronHelp') }}</p>
              <CopyChip
                class="fwum-cron"
                :line="config.cronLine || ''"
              />
            </template>
            <p
              v-if="config.internetOff"
              class="fwum-muted"
            >{{ translate('FeinwerkUptimeMonitor_UiCronInternetOff') }}</p>
          </div>
        </li>
        <!-- results checked from outside: only while a plugin that adds them is there; P4: right
             under the cron row -->
        <li
          v-if="config.external"
          class="fwum-checks__outside"
          :class="config.external.active ? 'is-ok' : 'is-warn'"
        >
          <span
            :class="config.external.active ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div>
            <p>
              {{ outsideRowText }}
              <a
                v-if="config.external.settingsUrl"
                :href="config.external.settingsUrl"
              >{{ translate('FeinwerkUptimeMonitor_UiOutsideSettings') }}</a>
            </p>
          </div>
        </li>
        <!-- the plugin that checks from outside sends alerts itself: Sentinel's row only when
             Sentinel sends alerts too, never "No alerts" -->
        <li
          v-if="!outsideAlerts || config.sentinel === 'active'"
          class="fwum-checks__alerts"
          :class="alertsOk ? 'is-ok' : 'is-warn'"
        >
          <span
            :class="alertsOk ? 'icon-ok' : 'icon-warning'"
            aria-hidden="true"
          />
          <div v-if="alertsOk">
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
      </ul>
      <p>
        <a :href="settingsUrl">{{ translate('FeinwerkUptimeMonitor_UiSettings') }}</a>
      </p>
    </ContentBlock>

    <TargetPanel
      v-if="panelSite !== null"
      :id-site="panelSite"
      :site-name="panelName"
      :notice="config.internetOff ? translate('FeinwerkUptimeMonitor_UiInternetOff') : ''"
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
  ago, dateTime, duration, keepUnits, listOf, sidedStatusOf, zoneOf,
} from './format';
import { observeNarrow } from './narrow';
import { uptimePageToday } from './links';
import { INTERNET_LINE } from './configLines';
import TargetPanel from './TargetPanel.vue';
import AdminStatus from './AdminStatus.vue';
import CopyChip from './CopyChip.vue';

export default defineComponent({
  components: {
    ContentBlock, TargetPanel, AdminStatus, CopyChip,
  },
  props: {
    config: { type: Object as PropType<ScreenConfig>, required: true },
  },
  data() {
    return {
      rows: [] as SiteOverview[],
      loading: true,
      failed: false,
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
     * server" unless no side can check them (B3); while results from outside come in "from the
     * Matomo server", as the status rows say (follow-up W2)
     */
    foldedText(): string {
      const count = this.foldedRows.length;
      const side = this.outside ? 'FromServer' : '';
      const keys = this.foldedEither
        ? ['UiAdminCannotCheckNamedOne', 'UiAdminCannotCheckNamedMany', 'UiAdminCannotCheckMany']
        : ['UiAdminNotCheckableNamedOne', 'UiAdminNotCheckableNamedMany', 'UiAdminNotCheckableMany']
          .map((key) => `${key}${side}`);
      if (count <= 3) {
        const names = listOf(this.foldedRows.map((row) => row.name), this.config.language);
        return translate(`FeinwerkUptimeMonitor_${keys[count === 1 ? 0 : 1]}`, names);
      }
      return translate(`FeinwerkUptimeMonitor_${keys[2]}`, String(count));
    },
    /**
     * how the checks are sent when it is not curl_multi side by side: one after the other through
     * curl_exec, or through PHP's own streams; nothing while Matomo's internet features are off
     * (nothing is sent) or while the php row names missing functions (no way works, or the
     * streams cannot send https): "they work as usual" would not be true there
     */
    transportText(): string {
      const keys: Record<string, string> = {
        curl_exec: 'FeinwerkUptimeMonitor_UiAdminTransportCurlExec',
        streams: 'FeinwerkUptimeMonitor_UiAdminTransportStreams',
      };
      const key = keys[this.config.transport || ''];
      return key && !this.config.internetOff && !this.phpDisabled.length ? translate(key) : '';
    },
    /** the PHP functions the latest check run did not find (the server's php.ini disables them) */
    phpDisabled(): string[] {
      return this.config.disabledPhpFunctions || [];
    },
    /**
     * the fold's "Why?" and "Allow private addresses": not while the line above the table names
     * the reason (PHP functions disabled, Matomo's internet features off)
     */
    foldWhy(): boolean {
      return !this.phpDisabled.length && !this.config.internetOff;
    },
    /** another plugin delivers results checked from outside: the overview combines both sides */
    outside(): boolean {
      return !!this.config.external && this.config.external.active;
    },
    /** P4: one row: checked from outside, when the latest results arrived, and its alerts */
    outsideRowText(): string {
      return this.outsideAlerts ? `${this.outsideText} ${this.outsideAlertsText}` : this.outsideText;
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
    /** L8: the cron runs, but while Matomo's internet features are off the checks send nothing */
    cronClass(): string {
      if (!this.cronOk) {
        return 'is-warn';
      }
      return this.config.internetOff ? 'is-info' : 'is-ok';
    },
    cronIcon(): string {
      if (!this.cronOk) {
        return 'icon-warning';
      }
      return this.config.internetOff ? 'icon-info' : 'icon-ok';
    },
    /** P2: the opt-in's line for [FeinwerkUptimeMonitor] (configLines.ts) */
    internetLine(): string {
      return INTERNET_LINE;
    },
    /** P2: the line for [General] (never its header: the section holds Matomo's salt) */
    httpsLine(): string {
      return 'assume_secure_protocol = 1';
    },
    /** L6: UiAdminHttpsTrackerAddress around the field's name (%1$s ... %2$s), linked */
    trackerFacts(): { before: string; link: string; after: string } {
      const [before, rest = ''] = translate('FeinwerkUptimeMonitor_UiAdminHttpsTrackerAddress',
        '\u0001', '\u0002').split('\u0001');
      const [link, after = ''] = rest.split('\u0002');
      return { before, link, after };
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
     * the same rule as the cards of the uptime page (format.ts sidedStatusOf): a one-sided failure
     * names its side (3a: only from the Matomo server, amber); not checkable from either side (the
     * outside says so too): both named, as the page's answer line does (B3)
     */
    status(row: SiteOverview): { outcome: string; text: string; side?: string } {
      const state = sidedStatusOf({
        total: row.targets,
        off: row.off,
        up: row.up,
        down: row.down,
        stale: row.stale,
        notCheckable: row.notCheckable,
      }, this.outside ? row.downFromServerOnly || 0 : 0,
      this.outside ? row.downFromOutsideOnly || 0 : 0, this.outside);
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
    onPanelClose(changed: boolean): void {
      this.panelSite = null;
      if (changed) {
        this.load();
      }
    },
  },
});
</script>
