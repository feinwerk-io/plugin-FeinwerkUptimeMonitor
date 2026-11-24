<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Visitors > Uptime (variant "page") and the dashboard widgets "Uptime: Matomo" (variant
  "matomo") and "Uptime: Website" (variant "site"), spec 10: Matomo's card first, then the
  website, then the outages. Each card answers first: its state, how fresh the result is and
  what failed. All data through the plugin's API.
-->
<template>
  <div
    class="fwum-page"
    :class="`fwum-page--${config.variant}`"
    :lang="config.language || undefined"
  >
    <div
      v-if="loading && !loaded"
      class="fwum-loading"
      aria-busy="true"
    >
      <span class="loadingPiwik"><img src="plugins/Morpheus/images/loading-blue.gif" alt=""></span>
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
    <template v-else>
      <div
        v-if="nothingChecked"
        class="fwum-empty"
      >
        <p>{{ translate('FeinwerkUptimeMonitor_UiFirstCheck') }}</p>
        <button
          v-if="canCheck"
          type="button"
          class="btn"
          :disabled="checking"
          @click="checkNow"
        >{{ translate(checking ? 'FeinwerkUptimeMonitor_UiChecking'
          : 'FeinwerkUptimeMonitor_UiCheckNow') }}</button>
      </div>
      <p
        v-if="checkNote && !siteCardShown"
        class="fwum-note"
        role="status"
      >{{ checkNote }}</p>

      <section
        v-if="showMatomo && !matomoRows.length && matomoAllOff"
        class="fwum-card"
        :aria-labelledby="`${uid}-matomo-off`"
      >
        <div class="fwum-card__head">
          <div
            :id="`${uid}-matomo-off`"
            class="fwum-card__title"
            role="heading"
            aria-level="3"
          >{{ translate('FeinwerkUptimeMonitor_UiMatomo') }}</div>
        </div>
        <p class="fwum-muted">{{ translate('FeinwerkUptimeMonitor_UiAllOffMatomo') }}</p>
      </section>
      <section
        v-if="showMatomo && matomoRows.length"
        class="fwum-card"
        :aria-labelledby="`${uid}-matomo`"
      >
        <div class="fwum-card__head">
          <div
            :id="`${uid}-matomo`"
            class="fwum-card__title"
            role="heading"
            aria-level="3"
          >{{ translate('FeinwerkUptimeMonitor_UiMatomo') }}</div>
          <span
            class="fwum-state"
            :class="`is-${matomoState.outcome}`"
          >{{ matomoState.text }}</span>
          <span
            v-if="checkedText(matomoRows)"
            class="fwum-muted"
          >{{ checkedText(matomoRows) }}</span>
        </div>
        <dl class="fwum-figures">
          <div v-if="matomoUptime">
            <dt>{{ translate('FeinwerkUptimeMonitor_UiUptime') }}</dt>
            <dd>{{ matomoUptime.value }}</dd>
            <dd class="fwum-figures__sub">{{ matomoUptime.coverage }}</dd>
          </div>
          <div v-if="trackerTime">
            <dt>{{ trackerTime.label }}</dt>
            <dd>{{ trackerTime.value }}</dd>
            <dd class="fwum-figures__sub">{{ trackerTime.sub }}</dd>
          </div>
          <div v-if="matomoCert">
            <dt>{{ translate('FeinwerkUptimeMonitor_UiCertificate') }}</dt>
            <dd :class="`is-${matomoCert.level}`">{{ matomoCert.text }}</dd>
          </div>
        </dl>
        <ul class="fwum-targets">
          <li
            v-for="row in matomoRows"
            :key="row.key"
            :class="`is-${row.outcome}`"
            :title="row.title"
          >
            <span
              class="fwum-dot"
              aria-hidden="true"
            />
            <span class="fwum-targets__label">{{ row.label }}</span>
            <span class="fwum-targets__text">{{ row.text }}</span>
            <span class="fwum-targets__uptime">{{ row.uptime }}</span>
            <span
              class="fwum-targets__cert"
              :class="`is-${row.certLevel}`"
            >{{ row.cert }}</span>
          </li>
        </ul>
        <p
          v-if="matomoRows.some((r) => r.outcome === 'not_checkable')"
          class="fwum-note"
        >
          {{ translate('FeinwerkUptimeMonitor_UiNotCheckableHelp') }}
          <a
            v-if="config.isSuperUser && !config.embedded"
            :href="settingsUrl"
          >{{ translate('FeinwerkUptimeMonitor_UiSettings') }}</a>
        </p>
        <div
          v-if="sparkValues.length > 1"
          class="fwum-spark"
        >
          <Sparkline
            :values="sparkValues"
            :label="sparkLabel"
          />
          <span class="fwum-muted">{{ sparkLabel }}</span>
        </div>
        <p
          v-if="config.queuedTracking && trackerTime && trackerTime.processing"
          class="fwum-note"
        >{{ translate('FeinwerkUptimeMonitor_UiQueuedTracking') }}</p>
      </section>

      <section
        v-if="siteCardShown"
        class="fwum-card"
        :aria-labelledby="`${uid}-site`"
      >
        <div class="fwum-card__head">
          <div
            :id="`${uid}-site`"
            class="fwum-card__title"
            role="heading"
            aria-level="3"
          >{{ translate('FeinwerkUptimeMonitor_UiThisWebsite') }}</div>
          <span
            v-if="siteRows.length"
            class="fwum-state"
            :class="`is-${siteState.outcome}`"
          >{{ siteState.text }}</span>
          <span
            v-if="checkedText(siteRows)"
            class="fwum-muted"
          >{{ checkedText(siteRows) }}</span>
          <span
            v-if="config.variant === 'page' && config.isAdmin"
            class="fwum-card__actions"
          >
            <button
              v-if="siteRows.length || !siteTargetCount"
              type="button"
              class="btn-flat fwum-icon-button"
              :disabled="checking"
              @click="checkNow"
            ><span
              class="icon-reload"
              aria-hidden="true"
            /> {{ translate(checking ? 'FeinwerkUptimeMonitor_UiChecking'
              : 'FeinwerkUptimeMonitor_UiCheckNow') }}</button>
            <button
              type="button"
              class="btn-flat fwum-icon-button"
              @click="panelOpen = true"
            ><span
              class="icon-edit"
              aria-hidden="true"
            /> {{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</button>
          </span>
        </div>
        <p
          v-if="checkNote"
          class="fwum-note"
          role="status"
        >{{ checkNote }}</p>
        <p
          v-if="!siteRows.length"
          class="fwum-muted"
        >{{ translate(siteTargetCount ? 'FeinwerkUptimeMonitor_UiAllOffSite'
          : 'FeinwerkUptimeMonitor_UiFirstCheck') }}</p>
        <div
          v-else
          class="fwum-table-wrap"
        >
          <table class="fwum-grid">
            <thead>
              <tr>
                <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiAddress') }}</th>
                <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiResponse') }}</th>
                <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}</th>
                <th
                  v-if="siteHasCerts"
                  scope="col"
                >{{ translate('FeinwerkUptimeMonitor_UiCertificate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in siteRows"
                :key="row.key"
                :class="`is-${row.outcome}`"
              >
                <td :title="row.title">
                  <span class="fwum-cell-label">
                    <span
                      class="fwum-dot"
                      aria-hidden="true"
                    />
                    <span class="fwum-targets__label">{{ row.label }}</span>
                  </span>
                </td>
                <td class="fwum-targets__text">{{ row.text }}</td>
                <td class="fwum-num">{{ row.uptime }}</td>
                <td
                  v-if="siteHasCerts"
                  class="fwum-targets__cert"
                  :class="`is-${row.certLevel}`"
                >{{ row.cert }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-if="siteRows.some((r) => r.outcome === 'not_checkable')"
          class="fwum-note"
        >
          {{ translate('FeinwerkUptimeMonitor_UiNotCheckableHelp') }}
          <a
            v-if="config.isSuperUser && !config.embedded"
            :href="settingsUrl"
          >{{ translate('FeinwerkUptimeMonitor_UiSettings') }}</a>
        </p>
      </section>

      <OutageList
        v-if="config.variant === 'page'"
        :incidents="incidents"
        :labels="labels"
        :language="config.language"
        :timezone="config.timezone || ''"
        :truncated="incidentsCut"
      />

      <FeedbackBar
        v-if="config.feedback"
        :id-site="config.idSite"
        topic="page"
        :question="translate('FeinwerkUptimeMonitor_FeedbackQuestion_page')"
        :feedback="config.feedback"
      />
      <PromoLine
        :promo="config.promo"
        :dismiss-label="translate('FeinwerkUptimeMonitor_PromoDismiss')"
      />
      <TargetPanel
        v-if="panelOpen"
        :id-site="config.idSite"
        :site-name="config.siteName || ''"
        @close="onPanelClose"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MatomoUrl, translate } from 'CoreHome';
import { api, Period } from './api';
import {
  Certificate, Incident, ScreenConfig, SeriesPoint, Status, TargetStatus, UptimeRow,
} from './types';
import {
  ago, causeText, dateTime, errorText, milliseconds, percent, statusOf, targetLabel,
} from './format';
import Sparkline from './Sparkline.vue';
import OutageList from './OutageList.vue';
import TargetPanel from './TargetPanel.vue';
import FeedbackBar from './FeedbackBar.vue';
import PromoLine from './PromoLine.vue';

interface Row {
  key: string;
  label: string;
  outcome: string;
  text: string;
  title: string;
  uptime: string;
  cert: string;
  certLevel: string;
  checkedAt: string;
}

const MATOMO_KINDS = ['ui', 'tracker', 'js'];
const ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];

export default defineComponent({
  components: {
    Sparkline, OutageList, TargetPanel, FeedbackBar, PromoLine,
  },
  props: {
    config: { type: Object as PropType<ScreenConfig>, required: true },
  },
  data() {
    return {
      loading: true,
      loaded: false,
      failed: false,
      checking: false,
      checkNote: '',
      panelOpen: false,
      matomo: null as Status | null,
      site: null as Status | null,
      matomoUptimeRows: [] as UptimeRow[],
      siteUptimeRows: [] as UptimeRow[],
      incidents: [] as Incident[],
      /** more outages than the 20 shown */
      incidentsCut: false,
      series: [] as SeriesPoint[],
      seriesIsProcessing: true,
      uid: `fwum-${Math.random().toString(36).slice(2, 8)}`,
    };
  },
  computed: {
    period(): Period {
      const parsed = MatomoUrl.parsed.value as Record<string, unknown>;
      return {
        period: String(parsed.period || 'day'),
        date: String(parsed.date || 'today'),
      };
    },
    showMatomo(): boolean {
      return this.config.variant !== 'site' && !this.config.isAnonymous;
    },
    showSite(): boolean {
      return this.config.variant !== 'matomo';
    },
    canCheck(): boolean {
      // the Matomo widget checks Matomo's own addresses: super users only
      const allowed = this.config.variant === 'matomo' ? this.config.isSuperUser : this.config.isAdmin;
      return allowed && !this.config.embedded;
    },
    matomoRows(): Row[] {
      return (this.matomo?.targets || [])
        .filter((t) => t.enabled && MATOMO_KINDS.includes(t.kind))
        .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
        .map((t) => this.row(t, this.matomoUptimeRows));
    },
    siteRows(): Row[] {
      return (this.site?.targets || []).filter((t) => t.enabled)
        .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)
          || a.targetKey.localeCompare(b.targetKey))
        .map((t) => this.row(t, this.siteUptimeRows));
    },
    settingsUrl(): string {
      return `?${MatomoUrl.stringify({
        module: 'CoreAdminHome', action: 'generalSettings',
      })}#/FeinwerkUptimeMonitor`;
    },
    /** the website card: always next to Matomo's, unless the first check has not run at all */
    siteCardShown(): boolean {
      return this.showSite && !!this.site && (this.siteRows.length > 0 || !this.nothingChecked);
    },
    /** the website's targets, switched on or off (none before a new website's first check run) */
    siteTargetCount(): number {
      return (this.site?.targets || []).length;
    },
    /** Matomo's own addresses exist but every one is switched off */
    matomoAllOff(): boolean {
      const own = (this.matomo?.targets || []).filter((t) => MATOMO_KINDS.includes(t.kind));
      return own.length > 0 && own.every((t) => !t.enabled);
    },
    siteHasCerts(): boolean {
      return this.siteRows.some((r) => r.cert !== '');
    },
    matomoState(): { outcome: string; text: string } {
      return this.summary(this.matomoRows);
    },
    siteState(): { outcome: string; text: string } {
      return this.summary(this.siteRows);
    },
    nothingChecked(): boolean {
      const all = [...(this.matomo?.targets || []), ...(this.site?.targets || [])];
      return all.every((t) => !t.states.local && !t.states.external);
    },
    labels(): Record<string, string> {
      const out: Record<string, string> = {};
      (this.matomo?.targets || []).forEach((t) => {
        out[t.targetKey] = translate('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t));
      });
      (this.site?.targets || []).forEach((t) => {
        out[t.targetKey] = targetLabel(t);
      });
      return out;
    },
    matomoUptime(): { value: string; coverage: string } | null {
      const rows = this.matomoUptimeRows.filter((r) => r.source === 'local'
        && MATOMO_KINDS.includes(r.kind) && r.uptimePercent !== null);
      if (!rows.length) {
        return null;
      }
      const worst = rows.reduce((a, b) => ((b.uptimePercent ?? 100) < (a.uptimePercent ?? 100)
        ? b : a));
      return {
        value: percent(worst.uptimePercent, this.config.language, 2),
        coverage: translate('FeinwerkUptimeMonitor_UiMeasured',
          percent(worst.coveragePercent, this.config.language, 0)),
      };
    },
    trackerTime(): { label: string; value: string; sub: string; processing: boolean } | null {
      const processing = this.matomo?.processing;
      if (processing && processing.samples > 0 && processing.p50Ms !== null) {
        return {
          label: translate('FeinwerkUptimeMonitor_UiTrackerProcessing'),
          value: milliseconds(processing.p50Ms, this.config.language),
          sub: translate('FeinwerkUptimeMonitor_UiMedianLastHour'),
          processing: true,
        };
      }
      // without tracking traffic in the last hour there is no processing time; the endpoint's
      // time is in the list below
      return null;
    },
    matomoCert(): { text: string; level: string } | null {
      const certs = (this.matomo?.targets || [])
        .map((t) => t.certificate)
        .filter((c): c is Certificate => c !== null);
      if (!certs.length) {
        return null;
      }
      const soonest = certs.reduce((a, b) => (b.daysLeft < a.daysLeft ? b : a));
      return { text: this.certText(soonest), level: soonest.level };
    },
    sparkValues(): (number | null)[] {
      return this.series.map((p) => p.p50Ms);
    },
    sparkLabel(): string {
      return translate(this.seriesIsProcessing
        ? 'FeinwerkUptimeMonitor_UiResponseTime'
        : 'FeinwerkUptimeMonitor_UiEndpointTime');
    },
  },
  watch: {
    period() {
      this.load();
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    translate,
    load(): Promise<void> {
      this.loading = true;
      this.failed = false;
      const { idSite } = this.config;
      const { period } = this;
      const requests: Promise<unknown>[] = [];
      if (this.showMatomo) {
        requests.push(api.status(0).then((s) => { this.matomo = s; }));
        requests.push(api.uptime(0, period, idSite).then((r) => { this.matomoUptimeRows = r; }));
        requests.push(this.loadSeries(period));
      }
      if (this.showSite) {
        requests.push(api.status(idSite).then((s) => { this.site = s; }));
        requests.push(api.uptime(idSite, period).then((r) => { this.siteUptimeRows = r; }));
      }
      if (this.config.variant === 'page') {
        const matomoIncidents = this.showMatomo
          ? api.incidents(0, period, idSite)
          : Promise.resolve([] as Incident[]);
        requests.push(Promise.all([api.incidents(idSite, period), matomoIncidents])
          .then(([own, matomo]) => {
            const all = [...own, ...matomo].sort((a, b) => b.start.localeCompare(a.start));
            this.incidentsCut = all.length > 20;
            this.incidents = all.slice(0, 20);
          }));
      }
      return Promise.all(requests).then(() => {
        this.loaded = true;
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    loadSeries(period: Period): Promise<void> {
      const zone = this.config.idSite;
      return api.responseTimes(0, period, 'processing', zone).catch(() => [] as SeriesPoint[])
        .then((points) => {
          if (points.some((p) => p.p50Ms !== null)) {
            this.series = points;
            this.seriesIsProcessing = true;
            return undefined;
          }
          return api.responseTimes(0, period, 'tracker', zone).catch(() => [] as SeriesPoint[])
            .then((tracker) => {
              this.series = tracker.filter((p) => p.source === 'local');
              this.seriesIsProcessing = false;
            });
        });
    },
    checkNow(): void {
      this.checking = true;
      this.checkNote = '';
      const idSite = this.showSite ? this.config.idSite : 0;
      api.checkNow(idSite).then((answer) => {
        if (answer.locked) {
          this.checkNote = translate('FeinwerkUptimeMonitor_UiCheckBusy');
          return undefined;
        }
        return this.load();
      }).catch((e: unknown) => {
        // e.g. "once a minute": said here, next to the button
        this.checkNote = errorText(e);
      }).finally(() => {
        this.checking = false;
      });
    },
    onPanelClose(changed: boolean): void {
      this.panelOpen = false;
      if (changed) {
        this.load();
      }
    },
    row(target: TargetStatus, uptimeRows: UptimeRow[]): Row {
      const state = target.states.local;
      let outcome = state ? state.outcome : 'none';
      let text = '';
      let title = target.url || targetLabel(target);
      if (!state) {
        text = translate('FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = translate('FeinwerkUptimeMonitor_UiNoRecentCheck',
          dateTime(state.checkedAt, this.config.language, this.config.timezone || ''));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, this.config.language);
      } else if (state.outcome === 'not_checkable') {
        text = translate('FeinwerkUptimeMonitor_UiNotCheckable');
        title = translate('FeinwerkUptimeMonitor_UiTitleWithHelp', title,
          translate('FeinwerkUptimeMonitor_UiNotCheckableHelp'));
      } else {
        text = causeText(state.error, state.httpStatus !== null ? `HTTP ${state.httpStatus}` : null);
      }
      const uptime = uptimeRows.find((r) => r.targetKey === target.targetKey && r.source === 'local');
      return {
        key: target.targetKey,
        label: targetLabel(target),
        outcome,
        text,
        title,
        uptime: uptime && uptime.uptimePercent !== null
          ? percent(uptime.uptimePercent, this.config.language, 2) : '',
        cert: target.certificate ? this.certText(target.certificate) : '',
        certLevel: target.certificate ? target.certificate.level : '',
        checkedAt: state && !state.stale ? state.checkedAt : '',
      };
    },
    /**
     * The card's answer: not reachable only when nothing answered; a partial failure is counted.
     */
    summary(rows: Row[]): { outcome: string; text: string } {
      const count = (outcome: string) => rows.filter((r) => r.outcome === outcome).length;
      return statusOf({
        total: rows.length,
        off: 0,
        up: count('up'),
        down: count('down'),
        stale: count('stale'),
        notCheckable: count('not_checkable'),
      });
    },
    checkedText(rows: Row[]): string {
      const newest = rows.map((r) => r.checkedAt).filter((t) => t !== '').sort().pop();
      return newest ? translate('FeinwerkUptimeMonitor_UiChecked', ago(newest, this.config.language)) : '';
    },
    certText(cert: Certificate): string {
      if (cert.level === 'expired') {
        return translate('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return cert.daysLeft === 1
        ? translate('FeinwerkUptimeMonitor_UiCertificateDay')
        : translate('FeinwerkUptimeMonitor_UiCertificateDays', String(cert.daysLeft));
    },
  },
});
</script>
