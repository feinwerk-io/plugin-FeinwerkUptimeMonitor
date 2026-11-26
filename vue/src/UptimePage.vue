<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Visitors > Uptime (variant "page") and the dashboard widgets "Uptime: Matomo" (variant
  "matomo") and "Uptime: Website" (variant "site"). The page (Peter's 1a, 2a: P1 and D2): one
  answer line for Matomo and the website with its freshness, a row of key figures, the hour
  strips, one table with the groups Matomo and This website, the outages. The widgets (5a, P4):
  no inner title, the state first, compact figures, a small strip, and when something is down
  only the failing rows with a link to the page. All data through the plugin's API.
-->
<template>
  <div
    class="fwum-page"
    :class="[`fwum-page--${config.variant}`, {
      'fwum-page--in-widget': config.inWidget, 'is-narrow': narrow, 'is-past': !!past,
    }]"
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
        <div class="fwum-actions">
          <button
            v-if="canCheck"
            type="button"
            class="btn"
            :disabled="checking"
            @click="checkNow"
          >{{ translate(checking ? 'FeinwerkUptimeMonitor_UiChecking'
            : 'FeinwerkUptimeMonitor_UiCheckNow') }}</button>
          <button
            v-if="isPage && config.isAdmin"
            type="button"
            class="btn-flat fwum-icon-button"
            @click="panelOpen = true"
          ><span
            class="icon-edit"
            aria-hidden="true"
          /> {{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</button>
        </div>
        <p
          v-if="checkNote"
          class="fwum-note"
          role="status"
        >{{ checkNote }}</p>
      </div>
      <template v-else>
        <div class="fwum-answer">
          <div class="fwum-answer__text">
            <!-- B3, D2: a past day states that day first, then the current state in one muted line;
                 when something is down now, the full "Now" line leads (lines) -->
            <p
              v-for="(line, i) in lines"
              :key="line.key"
              :class="[line.now ? 'fwum-answer__now' : 'fwum-answer__line', `is-${line.outcome}`]"
            >
              <!-- the colour on a span: Matomo 6 colours text in #content .card-content p -->
              <span
                v-if="line.now"
                class="fwum-muted"
              >{{ line.text }}</span>
              <template v-else>
                <span
                  class="fwum-dot"
                  aria-hidden="true"
                />
                <!-- D3 (final review): the first measured day is a link to it -->
                <strong class="fwum-state">{{ line.text }}<template v-if="line.link"><a
                  v-if="line.link.href"
                  :href="line.link.href"
                >{{ line.link.text }}</a><template
                  v-else
                >{{ line.link.text }}</template>{{ line.link.after }}</template></strong>
              </template>
              <span
                v-if="line.detail"
                class="fwum-answer__detail"
              >{{ line.detail }}</span>
              <!-- freshness and quiet icons (Peter, 2026-11-25: no labels) wrap as one unit -->
              <span
                v-if="i === freshnessLine && (freshness || showTools)"
                class="fwum-fresh"
              >
                <span
                  v-if="freshness || checking"
                  class="fwum-muted"
                >{{ checking ? checkLabel : freshness }}</span>
                <span
                  v-if="showTools"
                  class="fwum-tools"
                >
                  <button
                    v-if="canCheck && (siteRows.length || !siteTargetCount
                      || containers.some((t) => t.enabled))"
                    type="button"
                    class="fwum-tool"
                    :class="{ 'is-busy': checking }"
                    :aria-disabled="checking ? 'true' : undefined"
                    :title="checkLabel"
                    :aria-label="translate('FeinwerkUptimeMonitor_UiCheckNow')"
                    @click="checkNow"
                  ><span
                    class="icon-reload"
                    aria-hidden="true"
                  /></button>
                  <button
                    type="button"
                    class="fwum-tool"
                    :title="translate('FeinwerkUptimeMonitor_UiEditTargets')"
                    :aria-label="translate('FeinwerkUptimeMonitor_UiEditTargets')"
                    @click="panelOpen = true"
                  ><span
                    class="icon-edit"
                    aria-hidden="true"
                  /></button>
                </span>
              </span>
              <span
                v-if="line.after"
                class="fwum-muted"
              >{{ line.after }}</span>
            </p>
            <span
              class="fwum-sr"
              role="status"
            >{{ announce }}</span>
          </div>
        </div>
        <p
          v-if="checkNote"
          class="fwum-note"
          role="status"
        >{{ checkNote }}</p>

        <dl
          v-if="figures.length"
          class="fwum-figures"
        >
          <div
            v-for="figure in figures"
            :key="figure.key"
          >
            <dt>{{ figure.label }}</dt>
            <!-- B4: an uptime's measured share only where it matters, always as its tooltip -->
            <dd
              v-if="figure.value"
              :class="figure.level ? `is-${figure.level}` : undefined"
              :title="figure.measured !== null ? figure.sub : undefined"
            >{{ figure.value }}</dd>
            <dd
              v-if="figure.sub"
              :class="figure.measured !== null && !measuredVisible(figure.measured)
                ? 'fwum-sr' : 'fwum-figures__sub'"
            >{{ figure.sub }}</dd>
            <dd
              v-if="figure.key === 'tracker' && sparkValues.length > 1"
              class="fwum-figures__spark"
            >
              <!-- the small widgets: a low line, no empty band under it -->
              <Sparkline
                :values="sparkValues"
                :label="sparkLabel"
                :width="isPage ? 160 : 120"
                :height="isPage ? 28 : 14"
              />
            </dd>
          </div>
        </dl>
        <p
          v-if="config.queuedTracking && trackerTime"
          class="fwum-note"
        >{{ translate('FeinwerkUptimeMonitor_UiQueuedTracking') }}</p>

        <!-- D3 (final review): a period without any measurement is its answer line alone -->
        <div
          v-if="strips.length && !unmeasured"
          class="fwum-strips"
          :class="{ 'fwum-strips--page': isPage }"
        >
          <div
            v-for="strip in strips"
            :key="strip.key"
            class="fwum-strips__row"
            :class="{ 'fwum-strips__row--page': isPage }"
          >
            <div
              v-if="isPage"
              class="fwum-strips__name"
              aria-hidden="true"
            >{{ strip.name }}</div>
            <HourStrip
              :cells="strip.timeline.cells"
              :grain="strip.timeline.grain"
              :days="strip.timeline.days || ''"
              :name="strip.name"
              :language="config.language"
              :timezone="config.timezone || ''"
              :targets="strip.targets"
              :small="!isPage"
              :now="tick"
            />
            <!-- D3 (Peter, 2026-11-25, "alles in 5.1.3 umsetzen"): uptime ends the strip -->
            <div
              v-if="strip.uptime"
              class="fwum-strips__uptime"
              :title="strip.uptime.sub"
            >
              <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}
                {{ strip.name }}:</span>
              <strong>{{ strip.uptime.value }}</strong>
              <!-- P2: one number; the measured share only where it matters -->
              <span
                :class="measuredVisible(strip.uptime.measured)
                  ? 'fwum-strips__measured' : 'fwum-sr'"
              >{{ strip.uptime.sub }}</span>
            </div>
          </div>
          <ul
            v-if="isPage"
            class="fwum-legend"
          >
            <li class="is-up">{{ translate('FeinwerkUptimeMonitor_UiReachable') }}</li>
            <li class="is-partial">{{ translate('FeinwerkUptimeMonitor_UiPartlyReachable') }}</li>
            <li class="is-down">{{ translate('FeinwerkUptimeMonitor_UiNotReachable') }}</li>
            <li class="is-none">{{ translate('FeinwerkUptimeMonitor_UiNotMeasured') }}</li>
          </ul>
        </div>

        <div
          v-if="isPage && !unmeasured"
          class="fwum-table-wrap"
        >
          <!-- P1 (Peter, 2026-11-25): narrow, the addresses as the widgets' list -->
          <div
            v-if="narrow"
            class="fwum-narrow-list"
          >
            <template
              v-for="group in groups"
              :key="group.key"
            >
              <!-- B2, L2: the heading names the one certificate of all its addresses -->
              <div class="fwum-group-head">
                <div
                  class="fwum-group-head__name"
                  role="heading"
                  aria-level="3"
                >{{ group.name }}</div>
                <span
                  v-if="group.cert"
                  class="fwum-group-head__cert"
                  :class="`is-${group.cert.level}`"
                >{{ translate('FeinwerkUptimeMonitor_UiCertificateValue', group.cert.text) }}</span>
              </div>
              <p
                v-if="!group.rows.length"
                class="fwum-muted"
              >
                {{ group.note }}
                <button
                  v-if="group.key === 'site' && config.isAdmin"
                  type="button"
                  class="btn-flat fwum-icon-button"
                  @click="panelOpen = true"
                ><span
                  class="icon-edit"
                  aria-hidden="true"
                /> {{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</button>
                <a
                  v-if="group.key === 'matomo' && config.isSuperUser && !config.embedded"
                  class="fwum-inline-link"
                  :href="adminUrl"
                >{{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</a>
              </p>
              <TargetList
                v-else
                :rows="group.rows"
                :show-cert="!group.cert"
                :past="!!past"
              />
            </template>
          </div>
          <table
            v-else
            class="dataTable fwum-table"
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  class="label"
                >{{ translate('FeinwerkUptimeMonitor_UiAddress') }}</th>
                <!-- D1: a past day has no Response column (the latest answer is not that day's);
                     D4: no Uptime column when nothing was measured -->
                <th
                  v-if="!past"
                  scope="col"
                >{{ translate('FeinwerkUptimeMonitor_UiResponse') }}</th>
                <th
                  v-if="hasUptime"
                  scope="col"
                >{{ translate('FeinwerkUptimeMonitor_UiUptime') }}</th>
                <th
                  v-if="hasCerts"
                  scope="col"
                >{{ translate('FeinwerkUptimeMonitor_UiCertificate') }}</th>
              </tr>
            </thead>
            <tbody
              v-for="group in groups"
              :key="group.key"
            >
              <tr class="fwum-group-row">
                <th
                  :colspan="columnCount"
                  scope="rowgroup"
                >{{ group.name }}</th>
              </tr>
              <tr
                v-if="!group.rows.length"
                class="fwum-group-empty"
              >
                <td
                  :colspan="columnCount"
                  class="label"
                >
                  <span class="fwum-muted">{{ group.note }}</span>
                  <button
                    v-if="group.key === 'site' && config.isAdmin"
                    type="button"
                    class="btn-flat fwum-icon-button"
                    @click="panelOpen = true"
                  ><span
                    class="icon-edit"
                    aria-hidden="true"
                  /> {{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</button>
                  <a
                    v-if="group.key === 'matomo' && config.isSuperUser && !config.embedded"
                    class="fwum-inline-link"
                    :href="adminUrl"
                  >{{ translate('FeinwerkUptimeMonitor_UiEditTargets') }}</a>
                </td>
              </tr>
              <tr
                v-for="row in group.rows"
                :key="row.key"
                :class="`is-${past ? row.dayOutcome : row.outcome}`"
              >
                <td
                  class="label"
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
                </td>
                <td
                  v-if="!past"
                  class="column fwum-targets__text"
                >{{ keepHyphens(row.text) }}</td>
                <td
                  v-if="hasUptime"
                  class="column"
                >{{ row.uptime }}</td>
                <td
                  v-if="hasCerts"
                  class="column fwum-targets__cert"
                  :class="`is-${row.certLevel}`"
                >{{ row.cert }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <template v-else-if="!isPage && widgetGroup">
          <p
            v-if="!widgetGroup.rows.length"
            class="fwum-muted"
          >{{ widgetGroup.note }}</p>
          <!-- the widget's figure names a certificate that all addresses share -->
          <TargetList
            v-else
            :rows="widgetRows"
            :show-cert="!widgetGroup.cert"
          />
        </template>

        <div
          v-if="notCheckableCount"
          class="fwum-nc"
        >
          <p class="fwum-note">
            {{ notCheckableText }}
            <button
              type="button"
              class="fwum-link-button"
              :aria-expanded="whyOpen ? 'true' : 'false'"
              :aria-controls="`${uid}-why`"
              @click="whyOpen = !whyOpen"
            >{{ translate('FeinwerkUptimeMonitor_UiWhy') }}</button>
            <a
              v-if="notCheckableUnreached && config.isSuperUser && !config.embedded
                && !config.allowPrivate"
              :href="settingsUrl"
            >{{ translate('FeinwerkUptimeMonitor_UiAllowPrivate') }}</a>
          </p>
          <!-- next to the link "Allow private addresses" the settings sentence would repeat it; a
               container larger than 4 MB has its own reason, without firewall or settings -->
          <p
            v-show="whyOpen"
            :id="`${uid}-why`"
            class="fwum-note fwum-nc__why"
          >{{ whyText }}</p>
        </div>

        <!-- the website widget: its container counts with Matomo, but the alarm (U02) goes to the
             website, so its admins see why (Peter, 2026-11-25, "go" to option a) -->
        <p
          v-if="containerNote"
          class="fwum-note fwum-container-note"
        >
          {{ containerNote }}
          <a
            v-if="!config.embedded && !widgetDown"
            :href="uptimePageUrl"
          >{{ translate('FeinwerkUptimeMonitor_UiOpenPage') }}</a>
        </p>
        <p
          v-if="!isPage && widgetDown && !config.embedded"
          class="fwum-open-page"
        >
          <a :href="uptimePageUrl">{{ translate('FeinwerkUptimeMonitor_UiOpenPage') }}</a>
        </p>
        <OutageList
          v-if="isPage && !(unmeasured && !outageList.length)"
          :outages="shownOutages"
          :names="names"
          :past="!!past"
          :language="config.language"
          :timezone="config.timezone || ''"
          :total="outageList.length"
          :total-is-minimum="incidentsMore"
          :can-show-more="canShowMore"
          :loading-more="loadingMore"
          :narrow="narrow"
          :not-measured="!measuredShares.length"
          @more="showMoreOutages"
        />
      </template>

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
    <!-- the kit's card on dashboards (Peter's 7b): after the widget's whole content, the outages
         too, also while it loads, after a failed load and before the first check; the server sends
         it for widgets only; the page has the tip line. One place on a dashboard (L5): only the
         widget that cardPlace.ts names, decided again when a widget is minimised or restored -->
    <PromoCard
      v-if="cardHere && config.promoCard"
      :card="config.promoCard"
      :dismiss-label="translate('FeinwerkUptimeMonitor_PromoDismiss')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MatomoUrl, translate } from 'CoreHome';
import { api, Period } from './api';
import {
  AddressRow, Certificate, Incident, ScreenConfig, SeriesPoint, Status, TargetStatus, Timeline,
  UptimeRow,
} from './types';
import {
  ago, breakParts, calendarDay, causeText, clockOrDate, dateTime, dayKey, duration, errorText,
  hostOf, keepHyphens, keepUnits, listOf, milliseconds, percent, sharePercent, shiftDay, statusOf,
  targetLabel,
} from './format';
import { stripTotals } from './timeline';
import { observeNarrow } from './narrow';
import { ownsDashboardCard, watchDashboardCard } from './cardPlace';
import {
  groupOf, KIND_ORDER, OutageRow, outageRows, outagesInPeriod, outageTotals,
} from './outages';
import Sparkline from './Sparkline.vue';
import OutageList from './OutageList.vue';
import TargetPanel from './TargetPanel.vue';
import FeedbackBar from './FeedbackBar.vue';
import PromoLine from './PromoLine.vue';
import PromoCard from './PromoCard.vue';
import HourStrip from './HourStrip.vue';
import TargetList from './TargetList.vue';

type Row = AddressRow;

interface State {
  outcome: string;
  text: string;
}

interface Group {
  key: 'matomo' | 'site';
  name: string;
  rows: Row[];
  /** what a group without switched-on addresses says instead of its rows */
  note: string;
  state: State;
  /** B2: the certificate all its addresses share, named once in the heading; else null */
  cert: { text: string; level: string } | null;
}

interface AnswerLine {
  key: string;
  /** up, down, partial ...; warn: a past day's finished outages (D2: not red) */
  outcome: string;
  text: string;
  detail: string;
  /** B3: the muted line with the current state under a past day's answer (all fine now) */
  now?: boolean;
  /** the text after the freshness ("checked 4 minutes ago" and the icons, kept as one unit) */
  after?: string;
  /** D3: a link after the text (no href: the words alone, in an embed), then more text */
  link?: { text: string; href: string; after: string };
}

interface Figure {
  key: string;
  label: string;
  value: string;
  sub: string;
  level: string;
  /** an uptime figure's measured share (percent; B4); null for the other figures */
  measured: number | null;
}

interface Strip {
  key: string;
  name: string;
  timeline: Timeline;
  targets: number;
  /** the group's uptime at the end of its strip (page only, D3) */
  uptime: { value: string; sub: string; measured: number } | null;
}

const MATOMO_KINDS = ['ui', 'tracker', 'js'];
/**
 * P2 (Peter, 2026-11-25), B4: the measured share shows at the strip end and in the widgets'
 * uptime figure only below this (percent, compared rounded as shown)
 */
const MEASURED_SHOWN = 95;
/**
 * A Tag Manager container is a file on the Matomo server: listed and counted with Matomo, not
 * with the website (Peter, 2026-11-25, "a)"). Its alarm stays the website's (Sentinel U02).
 */
const CONTAINER = 'container';
const ORDER = KIND_ORDER;
/** the answer line names the worst group first */
const SEVERITY = ['down', 'partial', 'stale', 'not_checkable', 'none', 'off', 'up'];
const OUTAGES_FIRST = 20;
const OUTAGES_STEP = 50;
const INCIDENT_LIMIT = 100;
const INCIDENT_LIMIT_MAX = 1000;

export default defineComponent({
  components: {
    Sparkline, OutageList, TargetPanel, FeedbackBar, PromoLine, PromoCard, HourStrip, TargetList,
  },
  props: {
    config: { type: Object as PropType<ScreenConfig>, required: true },
  },
  data() {
    return {
      loading: true,
      loaded: false,
      failed: false,
      /** narrower than a phone: a narrow dashboard column too (is-narrow, the phone rules) */
      narrow: false,
      /** what screen readers hear about a check: that it runs, then the new freshness */
      announce: '',
      resize: null as ResizeObserver | null,
      checking: false,
      checkNote: '',
      panelOpen: false,
      whyOpen: false,
      matomo: null as Status | null,
      site: null as Status | null,
      matomoUptimeRows: [] as UptimeRow[],
      siteUptimeRows: [] as UptimeRow[],
      matomoTimeline: null as Timeline | null,
      siteTimeline: null as Timeline | null,
      /** outages still open now, for "since when" in the answer line */
      openIncidents: [] as Incident[],
      /** the period's outages as loaded, newest first (the list shows the first ones) */
      incidents: [] as Incident[],
      /** the API limit per request; "Show more" raises it */
      incidentLimit: INCIDENT_LIMIT,
      /** a request was cut at its limit: the period has more outages */
      incidentsMore: false,
      outagesShown: OUTAGES_FIRST,
      loadingMore: false,
      series: [] as SeriesPoint[],
      seriesIsProcessing: true,
      /** the screen's clock: relative times ("checked 3 minutes ago") follow it every minute */
      tick: Date.now(),
      timer: 0,
      uid: `fwum-${Math.random().toString(36).slice(2, 8)}`,
      /** this widget shows the dashboard's one card (L5, cardPlace.ts) */
      cardHere: false,
      /** lets go of the dashboard watch that decides cardHere again (minimise, restore) */
      cardWatch: null as (() => void) | null,
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
    isPage(): boolean {
      return this.config.variant === 'page';
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
    /** the website's Tag Manager containers: shown in the Matomo group */
    containers(): TargetStatus[] {
      return (this.site?.targets || []).filter((t) => t.kind === CONTAINER);
    },
    matomoRows(): Row[] {
      const own = (this.matomo?.targets || [])
        .filter((t) => t.enabled && MATOMO_KINDS.includes(t.kind))
        .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
        .map((t) => this.row(t, this.matomoUptimeRows));
      const containers = this.containers.filter((t) => t.enabled)
        .sort((a, b) => a.targetKey.localeCompare(b.targetKey))
        .map((t) => this.row(t, this.siteUptimeRows));
      return [...own, ...containers];
    },
    siteRows(): Row[] {
      return (this.site?.targets || []).filter((t) => t.enabled && t.kind !== CONTAINER)
        .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)
          || a.targetKey.localeCompare(b.targetKey))
        .map((t) => this.row(t, this.siteUptimeRows));
    },
    settingsUrl(): string {
      return `?${MatomoUrl.stringify({
        module: 'CoreAdminHome', action: 'generalSettings',
      })}#/FeinwerkUptimeMonitor`;
    },
    /** Administration > Diagnostic > Uptime Monitor, where super users edit Matomo's addresses */
    adminUrl(): string {
      return `?${MatomoUrl.stringify({
        module: 'FeinwerkUptimeMonitor',
        action: 'admin',
        idSite: String(this.config.idSite),
        period: this.period.period,
        date: this.period.date,
      })}`;
    },
    /** Visitors > Uptime of this website, from a dashboard widget */
    uptimePageUrl(): string {
      return this.pageUrl(this.period.period, this.period.date);
    },
    /** the website's own targets, on or off (none before a new website's first check run) */
    siteTargetCount(): number {
      return (this.site?.targets || []).filter((t) => t.kind !== CONTAINER).length;
    },
    /** Matomo's addresses (with the website's containers) exist but every one is switched off */
    matomoAllOff(): boolean {
      const own = [
        ...(this.matomo?.targets || []).filter((t) => MATOMO_KINDS.includes(t.kind)),
        ...this.containers,
      ];
      return own.length > 0 && own.every((t) => !t.enabled);
    },
    nothingChecked(): boolean {
      const all = [...(this.matomo?.targets || []), ...(this.site?.targets || [])];
      return all.every((t) => !t.states.local && !t.states.external);
    },
    /** the groups this screen shows: Matomo (not for anonymous viewers), then the website */
    groups(): Group[] {
      const out: Group[] = [];
      if (this.showMatomo) {
        out.push({
          key: 'matomo',
          name: translate('FeinwerkUptimeMonitor_UiMatomo'),
          rows: this.matomoRows,
          note: translate(this.matomoAllOff ? 'FeinwerkUptimeMonitor_UiAllOffMatomo'
            : 'FeinwerkUptimeMonitor_UiFirstCheck'),
          state: this.groupState(this.matomoRows, this.matomoAllOff),
          cert: this.sharedCert(this.matomoRows),
        });
      }
      if (this.showSite) {
        out.push({
          key: 'site',
          name: translate('FeinwerkUptimeMonitor_UiThisWebsite'),
          rows: this.siteRows,
          note: translate(this.siteTargetCount ? 'FeinwerkUptimeMonitor_UiAllOffSite'
            : 'FeinwerkUptimeMonitor_UiFirstCheck'),
          state: this.groupState(this.siteRows, this.siteTargetCount > 0),
          cert: this.sharedCert(this.siteRows),
        });
      }
      return out;
    },
    /**
     * One answer for the screen: "Everything reachable" when every group answers; else each
     * group's state, the worst first, with since when and why for an outage. On the page a group
     * with exactly one address down names it (D2): "This website: example.com/shop not
     * reachable since 18:06 (HTTP status 404)".
     */
    answer(): AnswerLine[] {
      const { groups } = this;
      if (!groups.length) {
        return [];
      }
      if (groups.every((g) => g.state.outcome === 'up')) {
        return [{
          key: 'all',
          outcome: 'up',
          text: translate(this.isPage ? 'FeinwerkUptimeMonitor_UiAllReachable'
            : 'FeinwerkUptimeMonitor_UiReachable'),
          detail: '',
        }];
      }
      return [...groups]
        .sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome))
        .map((g) => {
          const down = g.rows.filter((r) => r.outcome === 'down');
          // F1 (final review): a line that names a down address is red, also when the rest of its
          // group answers; a count ("2 of 4 addresses") and the widgets' count stay amber
          const named = this.isPage && down.length === 1;
          const state = named
            ? translate('FeinwerkUptimeMonitor_UiAddressDown', down[0].label) : g.state.text;
          return {
            key: g.key,
            outcome: named ? 'down' : g.state.outcome,
            text: this.isPage
              ? translate('FeinwerkUptimeMonitor_UiAnswerGroup', g.name, state)
              : g.state.text,
            detail: this.downDetail(g.rows),
          };
        });
    },
    /**
     * B3 (Peter): on a past day or a longer period the answer states that period first, "Nov 24:
     * no outage" (with the measured share below 95 %) or its outages; the current state follows
     * in one muted line (lines). Null today and in the widgets (they show the current state).
     */
    past(): AnswerLine | null {
      if (!this.isPage || this.todaySelected) {
        return null;
      }
      const { language } = this.config;
      const label = this.periodLabel;
      // F1: only the parts inside the period, overlapping outages of several addresses as one
      const outages = outagesInPeriod(this.incidents);
      if (outages.length) {
        const { count, seconds } = outageTotals(outages);
        let text = translate('FeinwerkUptimeMonitor_UiPastOutageOne', label,
          duration(seconds, language));
        if (this.incidentsMore) {
          // a cut list: the count is a minimum and the sum is unknown
          text = translate('FeinwerkUptimeMonitor_UiPastOutagesAtLeast', label, String(count));
        } else if (count > 1) {
          text = translate('FeinwerkUptimeMonitor_UiPastOutagesMany', label,
            String(count), duration(seconds, language));
        }
        // which addresses, up to three by name (as the admin fold), with the cause when only one
        const keys = outages.map((i) => i.targetKey || '')
          .filter((key, n, all) => all.indexOf(key) === n);
        const causes = outages.map((i) => causeText(i.cause, i.detail))
          .filter((cause, n, all) => all.indexOf(cause) === n);
        const names = keys.length <= 3 ? this.namedOutages(outages) : '';
        return {
          key: 'past',
          // D2: a finished outage is no alarm: the warning colour; a running one leads in red
          // (lines)
          outcome: 'warn',
          text,
          detail: names && causes.length === 1 && causes[0] ? `${names} (${causes[0]})` : names,
        };
      }
      const shares = this.measuredShares;
      if (!shares.length) {
        // nothing measured is no "no outage"; D3: before the first measurement, the day it starts
        const first = this.firstMeasured;
        if (first !== '' && this.periodEnd > 0 && new Date(first).getTime() >= this.periodEnd) {
          const day = dayKey(first, this.config.timezone || '');
          const today = dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
          const mark = '\u0001';
          const [before, after = ''] = translate('FeinwerkUptimeMonitor_UiPastNotMeasuredStart',
            label, mark).split(mark);
          return {
            key: 'past',
            outcome: 'none',
            text: before,
            detail: '',
            link: {
              text: calendarDay(day, language, today.slice(0, 4)),
              href: this.config.embedded ? '' : this.pageUrl('day', day),
              after,
            },
          };
        }
        return {
          key: 'past',
          outcome: 'none',
          text: translate('FeinwerkUptimeMonitor_UiPastNotMeasured', label),
          detail: '',
        };
      }
      const lowest = Math.min(...shares);
      return {
        key: 'past',
        outcome: 'up',
        text: translate('FeinwerkUptimeMonitor_UiPastNoOutage', label),
        detail: this.measuredVisible(lowest)
          ? translate('FeinwerkUptimeMonitor_UiMeasured', sharePercent(lowest, language)) : '',
      };
    },
    /** D3: the viewed period has no measurement at all (its answer line stands alone) */
    unmeasured(): boolean {
      return !!this.past && this.past.outcome === 'none';
    },
    /** D3: the first measured moment of the screen's groups (API getTimeline firstMeasured) */
    firstMeasured(): string {
      const timelines = [
        this.showMatomo ? this.matomoTimeline : null,
        this.showSite ? this.siteTimeline : null,
      ];
      const firsts = timelines.map((t) => (t && t.firstMeasured) || '').filter((t) => t !== '');
      return firsts.length ? firsts.sort()[0] : '';
    },
    /** the end of the viewed period (ms): after the strips' last cell; 0 without a strip */
    periodEnd(): number {
      const ends = [this.matomoTimeline, this.siteTimeline]
        .filter((t): t is Timeline => !!t && t.cells.length > 0)
        .map((t) => new Date(t.cells[t.cells.length - 1].time).getTime()
          + (t.grain === 'hour' ? 3600000 : 86400000));
      return ends.length ? Math.max(...ends) : 0;
    },
    /** "Nov 24" for a single day (yesterday too), "In this period" for longer ones */
    periodLabel(): string {
      const { period, date } = this.period;
      const today = dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
      const day = date === 'yesterday' ? shiftDay(today, -1) : date;
      if (period !== 'day' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return translate('FeinwerkUptimeMonitor_UiInThisPeriod');
      }
      return calendarDay(day, this.config.language, today.slice(0, 4));
    },
    /** each group's measured share of the period (percent), for the groups that measured any */
    measuredShares(): number[] {
      const out: number[] = [];
      this.groups.forEach((g) => {
        const uptime = g.key === 'matomo'
          ? this.uptimeOf(g.rows, [...this.matomoUptimeRows, ...this.siteUptimeRows],
            this.matomoTimeline)
          : this.uptimeOf(g.rows, this.siteUptimeRows, this.siteTimeline);
        if (uptime && uptime.measured > 0) {
          out.push(uptime.measured);
        }
      });
      return out;
    },
    /** something is not reachable now: on a past day the full "Now" line leads (D2) */
    downNow(): boolean {
      return this.groups.some((g) => g.state.outcome === 'down' || g.state.outcome === 'partial');
    },
    /**
     * The current state of every address of the screen in a few words, for the "Now:" line; one
     * address down is named (D1): "Matomo: Interface not reachable"
     */
    nowState(): string {
      const { groups } = this;
      if (groups.length && groups.every((g) => g.state.outcome === 'up')) {
        return translate('FeinwerkUptimeMonitor_UiAllReachable');
      }
      const rows = groups.flatMap((g) => g.rows);
      const down = rows.filter((r) => r.outcome === 'down');
      if (down.length === 1) {
        return translate('FeinwerkUptimeMonitor_UiAddressDown',
          this.labels[down[0].key] || down[0].label);
      }
      if (!rows.length) {
        const worst = [...groups]
          .sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome));
        return worst.length ? worst[0].state.text : '';
      }
      return this.groupState(rows, false).text;
    },
    /**
     * F1: the Now line's colour by today's rule: red when it names the one down address or a group
     * does not answer at all ("This website: Not reachable" today); amber when every group with an
     * outage is partly reachable
     */
    nowOutcome(): string {
      const rows = this.groups.flatMap((g) => g.rows);
      if (rows.filter((r) => r.outcome === 'down').length === 1
        || this.groups.some((g) => g.state.outcome === 'down')) {
        return 'down';
      }
      return 'partial';
    },
    /**
     * The answer as shown: today's lines; on a past day, when something is down now, the full
     * "Now" line first (its dot, since when and why, as today's answer line), then that day's
     * answer; else the day first and the current state in one muted "Now:" line (D2). Not
     * checkable, no recent check or not measured are no outage: the day first.
     */
    lines(): AnswerLine[] {
      if (!this.past) {
        return this.answer;
      }
      if (this.downNow) {
        const rows = this.groups.flatMap((g) => g.rows);
        // F1 (final review): one rule with today's lines: red when it names the down address or
        // nothing answers, amber for a count of partly reachable addresses
        return [{
          key: 'now',
          outcome: this.nowOutcome,
          text: translate('FeinwerkUptimeMonitor_UiNow', this.nowState),
          detail: this.downDetail(rows),
        }, this.past];
      }
      const mark = '\u0001';
      const fresh = this.checking || this.freshness !== '';
      const text = fresh
        ? translate('FeinwerkUptimeMonitor_UiNowChecked', this.nowState, mark)
        : translate('FeinwerkUptimeMonitor_UiNow', this.nowState);
      const [before, after = ''] = text.split(mark);
      return [this.past, {
        key: 'now', outcome: 'now', text: before, detail: '', now: true, after,
      }];
    },
    /** the answer line that carries the freshness: the first one of a group with results */
    freshnessLine(): number {
      if (this.past) {
        // the "Now" line: first when something is down, else under the day's answer
        return this.downNow ? 0 : 1;
      }
      const checked = (key: string) => this.groups.some((g) => g.key === key
        && g.rows.some((r) => r.checkedAt !== ''));
      const index = this.answer.findIndex((line) => line.key === 'all' || checked(line.key));
      return Math.max(0, index);
    },
    /** "checked 3 minutes ago": the newest current result of the screen */
    freshness(): string {
      const newest = this.groups.flatMap((g) => g.rows)
        .map((r) => r.checkedAt)
        .filter((t) => t !== '')
        .sort()
        .pop();
      return newest
        ? translate('FeinwerkUptimeMonitor_UiChecked', ago(newest, this.config.language, this.tick))
        : '';
    },
    /** each address's name without its group ("Interface", "www.example.com") */
    names(): Record<string, string> {
      const out: Record<string, string> = {};
      [...(this.matomo?.targets || []), ...(this.site?.targets || [])].forEach((t) => {
        out[t.targetKey] = targetLabel(t);
      });
      return out;
    },
    labels(): Record<string, string> {
      const out: Record<string, string> = {};
      (this.matomo?.targets || []).forEach((t) => {
        out[t.targetKey] = translate('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t));
      });
      (this.site?.targets || []).forEach((t) => {
        // a container is listed with Matomo: named so in the outage list too
        out[t.targetKey] = t.kind === CONTAINER
          ? translate('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t)) : targetLabel(t);
      });
      return out;
    },
    /** uptime Matomo, uptime website, the tracker's processing time, the soonest certificate */
    figures(): Figure[] {
      const out: Figure[] = [];
      // the page shows the uptime of each group at the end of its strip (D3); without a strip here
      const stripped = (key: string) => this.isPage && this.strips.some((s) => s.key === key);
      const matomo = this.showMatomo && !stripped('matomo')
        ? this.uptimeOf(this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows],
          this.matomoTimeline) : null;
      if (matomo) {
        out.push({
          key: 'matomo',
          label: translate(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeMatomo'
            : 'FeinwerkUptimeMonitor_UiUptime'),
          ...matomo,
        });
      }
      const site = this.showSite && !stripped('site')
        ? this.uptimeOf(this.siteRows, this.siteUptimeRows, this.siteTimeline) : null;
      if (site) {
        out.push({
          key: 'site',
          label: translate(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeWebsite'
            : 'FeinwerkUptimeMonitor_UiUptime'),
          ...site,
        });
      }
      if (this.trackerTime) {
        out.push({
          key: 'tracker',
          label: translate('FeinwerkUptimeMonitor_UiTrackerProcessing'),
          value: this.trackerTime,
          sub: translate('FeinwerkUptimeMonitor_UiMedianLastHour'),
          level: '',
          measured: null,
        });
      } else if (this.showMatomo && this.sparkValues.length > 1) {
        // no tracking traffic in the last hour: the endpoint's response times per hour
        out.push({
          key: 'tracker', label: this.sparkLabel, value: '', sub: '', level: '', measured: null,
        });
      }
      const withCert = this.groups.flatMap((g) => g.rows).filter((r) => r.certDays !== null);
      if (withCert.length) {
        const soonest = withCert.reduce((a, b) => ((b.certDays ?? 0) < (a.certDays ?? 0) ? b : a));
        out.push({
          key: 'cert',
          label: translate('FeinwerkUptimeMonitor_UiCertificate'),
          value: soonest.cert,
          sub: this.certFigureSub(withCert, soonest),
          level: soonest.certLevel,
          measured: null,
        });
      }
      return out;
    },
    /** the median processing time of real tracking requests in the last hour */
    trackerTime(): string {
      const processing = this.matomo?.processing;
      if (processing && processing.samples > 0 && processing.p50Ms !== null) {
        return milliseconds(processing.p50Ms, this.config.language);
      }
      return '';
    },
    sparkValues(): (number | null)[] {
      return this.series.map((p) => p.p50Ms);
    },
    sparkLabel(): string {
      return translate(this.seriesIsProcessing
        ? 'FeinwerkUptimeMonitor_UiResponseTime'
        : 'FeinwerkUptimeMonitor_UiEndpointTime');
    },
    strips(): Strip[] {
      const out: Strip[] = [];
      const add = (
        key: string,
        name: string,
        timeline: Timeline | null,
        rows: Row[],
        uptimeRows: UptimeRow[],
      ) => {
        if (timeline && timeline.cells.length) {
          out.push({
            key,
            name,
            timeline,
            targets: this.measurable(rows),
            uptime: this.isPage ? this.uptimeOf(rows, uptimeRows, timeline) : null,
          });
        }
      };
      if (this.showMatomo) {
        add('matomo', translate('FeinwerkUptimeMonitor_UiMatomo'), this.matomoTimeline,
          this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows]);
      }
      if (this.showSite) {
        add('site', translate('FeinwerkUptimeMonitor_UiThisWebsite'), this.siteTimeline,
          this.siteRows, this.siteUptimeRows);
      }
      return out;
    },
    hasCerts(): boolean {
      return this.groups.some((g) => g.rows.some((r) => r.cert !== ''));
    },
    /** D4: a period without any measurement shows no empty Uptime column */
    hasUptime(): boolean {
      return this.groups.some((g) => g.rows.some((r) => r.uptime !== ''));
    },
    columnCount(): number {
      return 1 + (this.past ? 0 : 1) + (this.hasUptime ? 1 : 0) + (this.hasCerts ? 1 : 0);
    },
    /** the widget's one group */
    widgetGroup(): Group | null {
      return this.groups.length ? this.groups[0] : null;
    },
    /** the selected period is the single day of today, in the website's timezone */
    todaySelected(): boolean {
      const { period, date } = this.period;
      if (period !== 'day') {
        return false;
      }
      return date === 'today'
        || date === dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
    },
    /** the quiet icons: admins of the website, not in an embed */
    showTools(): boolean {
      return this.isPage && this.config.isAdmin && !this.config.embedded;
    },
    checkLabel(): string {
      return translate(this.checking ? 'FeinwerkUptimeMonitor_UiChecking'
        : 'FeinwerkUptimeMonitor_UiCheckNow');
    },
    /** the website widget: which of the website's containers are down (they count with Matomo) */
    containerNote(): string {
      // anonymous viewers never see a container: it belongs to Matomo's group
      if (this.config.variant !== 'site' || this.config.isAnonymous) {
        return '';
      }
      const down = this.containers
        .filter((t) => t.enabled && t.states.local && t.states.local.outcome === 'down'
          && !t.states.local.stale)
        .map((t) => targetLabel(t));
      if (!down.length) {
        return '';
      }
      const names = listOf(down, this.config.language);
      return down.length === 1
        ? translate('FeinwerkUptimeMonitor_UiContainerDownOne', names)
        : translate('FeinwerkUptimeMonitor_UiContainerDownMany', names);
    },
    widgetDown(): boolean {
      return !!this.widgetGroup && this.widgetGroup.rows.some((r) => r.outcome === 'down');
    },
    /** a widget with an outage lists only the failing addresses */
    widgetRows(): Row[] {
      if (!this.widgetGroup) {
        return [];
      }
      return this.widgetDown
        ? this.widgetGroup.rows.filter((r) => r.outcome === 'down')
        : this.widgetGroup.rows;
    },
    notCheckableRows(): Row[] {
      const rows = this.isPage ? this.groups.flatMap((g) => g.rows) : this.widgetRows;
      return rows.filter((r) => r.outcome === 'not_checkable');
    },
    notCheckableCount(): number {
      return this.notCheckableRows.length;
    },
    /** addresses this server cannot reach (firewall, private address, password): general reason */
    notCheckableUnreached(): boolean {
      return this.notCheckableRows.some((r) => !r.tooLarge);
    },
    /** Tag Manager containers larger than the 4 MB the check reads: their own reason */
    notCheckableTooLarge(): boolean {
      return this.notCheckableRows.some((r) => r.tooLarge);
    },
    /** "Why?": the reasons of the addresses that cannot be checked, each once */
    whyText(): string {
      const parts: string[] = [];
      if (this.notCheckableUnreached) {
        parts.push(translate('FeinwerkUptimeMonitor_UiNotCheckableHelp'));
        // next to the link "Allow private addresses" this sentence would repeat it
        if (!(this.config.isSuperUser && !this.config.embedded) && !this.config.allowPrivate) {
          parts.push(translate('FeinwerkUptimeMonitor_UiNotCheckableSettings'));
        }
      }
      if (this.notCheckableTooLarge) {
        parts.push(translate('FeinwerkUptimeMonitor_UiNotCheckableTooLarge'));
      }
      // "4 MB" stays together (D4)
      return keepUnits(parts.join(' '));
    },
    /**
     * D2 (final review): only too large containers, which no server could check: without "from
     * this server"
     */
    notCheckableText(): string {
      const anywhere = !this.notCheckableUnreached;
      if (this.notCheckableCount === 1) {
        return translate(anywhere ? 'FeinwerkUptimeMonitor_UiCannotCheckOne'
          : 'FeinwerkUptimeMonitor_UiNotCheckableOne');
      }
      return translate(anywhere ? 'FeinwerkUptimeMonitor_UiCannotCheckMany'
        : 'FeinwerkUptimeMonitor_UiNotCheckableMany', String(this.notCheckableCount));
    },
    /** D1: the outage list's rows, overlapping outages of one group as one */
    outageList(): OutageRow[] {
      return outageRows(this.incidents, !!this.past);
    },
    shownOutages(): OutageRow[] {
      // with a cut request, only the first `limit` of the merged list are surely the newest
      const cap = this.incidentsMore ? Math.min(this.outagesShown, this.incidentLimit)
        : this.outagesShown;
      return this.outageList.slice(0, cap);
    },
    canShowMore(): boolean {
      // more of the loaded list, or a larger request; at the API's limit a cut list ends here
      const moreLoaded = this.shownOutages.length < this.outageList.length
        && !(this.incidentsMore && this.outagesShown >= this.incidentLimit
          && this.incidentLimit >= INCIDENT_LIMIT_MAX);
      return moreLoaded || (this.incidentsMore && this.incidentLimit < INCIDENT_LIMIT_MAX);
    },
  },
  watch: {
    period() {
      this.outagesShown = OUTAGES_FIRST;
      this.incidentLimit = INCIDENT_LIMIT;
      this.load();
    },
  },
  mounted() {
    this.load();
    // the page and the widgets follow their own width, not the screen's: Matomo's default dashboard
    // has three columns, about 370 px each (Peter, 2026-11-25: the big widget looked broken there)
    if (this.$el instanceof HTMLElement) {
      this.resize = observeNarrow(this.$el, (narrow) => {
        this.narrow = narrow;
      });
      this.cardHere = ownsDashboardCard(this.$el);
      // a widget minimised or restored, added or removed: every widget decides again, so the
      // card moves to the new owner and there is never a second one
      this.cardWatch = watchDashboardCard(this.$el, (owns) => {
        this.cardHere = owns;
      });
    }
    this.timer = window.setInterval(() => {
      // Matomo 5's dashboard reload replaces a widget's HTML without unmounting the app
      if (!(this.$el as HTMLElement | undefined)?.isConnected) {
        window.clearInterval(this.timer);
        return;
      }
      this.tick = Date.now();
    }, 60000);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
    if (this.resize) {
      this.resize.disconnect();
    }
    if (this.cardWatch) {
      this.cardWatch();
    }
  },
  methods: {
    translate,
    breakParts,
    keepHyphens,
    /** B4: a measured share is shown below MEASURED_SHOWN %, compared as it reads (rounded) */
    measuredVisible(measured: number): boolean {
      return Math.round(measured) < MEASURED_SHOWN;
    },
    /** the certificate all rows share (same days and level), else null (B2) */
    sharedCert(rows: Row[]): { text: string; level: string } | null {
      const first = rows[0];
      if (!first || first.certDays === null) {
        return null;
      }
      const same = rows.every((r) => r.certDays === first.certDays
        && r.certLevel === first.certLevel);
      return same ? { text: first.cert, level: first.certLevel } : null;
    },
    load(): Promise<void> {
      if (this.loaded && !(this.$el as HTMLElement | undefined)?.isConnected) {
        // a detached copy after a dashboard reload: the new one loads for itself
        return Promise.resolve();
      }
      this.loading = true;
      this.failed = false;
      const { idSite } = this.config;
      const { period } = this;
      const requests: Promise<unknown>[] = [];
      const open: Promise<Incident[]>[] = [];
      if (this.showMatomo) {
        requests.push(api.status(0).then((s) => { this.matomo = s; }));
        requests.push(api.uptime(0, period, idSite).then((r) => { this.matomoUptimeRows = r; }));
        requests.push(this.loadSeries(period));
        // the strip is an addition: without it the page still answers
        requests.push(api.timeline(idSite, period, 'matomo').catch(() => null)
          .then((t) => { this.matomoTimeline = t; }));
        open.push(api.openIncidents(0, idSite).catch(() => [] as Incident[]));
      }
      // the website's targets also for the Matomo widget: its containers belong to Matomo's group
      if (this.showSite) {
        requests.push(api.status(idSite).then((s) => { this.site = s; }));
        requests.push(api.uptime(idSite, period).then((r) => { this.siteUptimeRows = r; }));
        open.push(api.openIncidents(idSite).catch(() => [] as Incident[]));
      } else if (this.showMatomo && idSite > 0) {
        // the Matomo widget: the website's containers are an addition, a failure leaves the rest
        requests.push(api.status(idSite).then((s) => { this.site = s; }).catch(() => undefined));
        requests.push(api.uptime(idSite, period).then((r) => { this.siteUptimeRows = r; })
          .catch(() => undefined));
        open.push(api.openIncidents(idSite).catch(() => [] as Incident[]));
      }
      if (this.showSite) {
        requests.push(api.timeline(idSite, period, 'website').catch(() => null)
          .then((t) => { this.siteTimeline = t; }));
      }
      requests.push(Promise.all(open).then((lists) => {
        this.openIncidents = ([] as Incident[]).concat(...lists);
      }));
      if (this.isPage) {
        requests.push(this.loadIncidents());
      }
      return Promise.all(requests).then(() => {
        this.loaded = true;
        // the running strip cell and the measured share count up to the time of these data
        this.tick = Date.now();
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    loadIncidents(): Promise<void> {
      const { idSite } = this.config;
      const { period } = this;
      const limit = this.incidentLimit;
      const matomoIncidents = this.showMatomo
        ? api.incidents(0, period, idSite, limit)
        : Promise.resolve([] as Incident[]);
      return Promise.all([api.incidents(idSite, period, 0, limit), matomoIncidents])
        .then(([own, matomo]) => {
          this.incidentsMore = own.length >= limit || matomo.length >= limit;
          // a container is listed in Matomo's group: not shown to viewers without it (anonymous)
          const site = this.showMatomo ? own : own.filter((i) => i.kind !== CONTAINER);
          this.incidents = [...site, ...matomo].sort((a, b) => b.start.localeCompare(a.start));
        });
    },
    /** "Show more": the next outages, loading up to the API's limit when a list was cut */
    showMoreOutages(): void {
      const next = this.outagesShown + OUTAGES_STEP;
      if (this.incidentsMore && next > this.incidentLimit
        && this.incidentLimit < INCIDENT_LIMIT_MAX) {
        this.loadingMore = true;
        this.incidentLimit = INCIDENT_LIMIT_MAX;
        this.loadIncidents().then(() => {
          this.outagesShown = next;
        }).catch(() => {
          this.incidentLimit = INCIDENT_LIMIT;
        }).finally(() => {
          this.loadingMore = false;
        });
        return;
      }
      this.outagesShown = next;
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
      // aria-disabled keeps the focus on the button: the click is ignored here instead
      if (this.checking) {
        return;
      }
      this.checking = true;
      this.announce = this.checkLabel;
      this.checkNote = '';
      const idSite = this.showSite ? this.config.idSite : 0;
      // the Matomo widget lists the website's containers too: they are checked with the website
      const containersToo = idSite === 0 && this.config.idSite > 0
        && this.containers.some((t) => t.enabled);
      api.checkNow(idSite)
        .then((answer) => {
          if (answer.locked) {
            this.checkNote = translate('FeinwerkUptimeMonitor_UiCheckBusy');
            return undefined;
          }
          return containersToo ? api.checkNow(this.config.idSite) : answer;
        })
        .then((answer) => {
          if (!answer) {
            return undefined;
          }
          if (answer.locked) {
            this.checkNote = translate('FeinwerkUptimeMonitor_UiCheckBusy');
          }
          return this.load().then(() => {
            // "checked just now": the check is done
            this.announce = this.freshness;
          });
        })
        .catch((e: unknown) => {
          // e.g. "once a minute": said here, next to the button
          this.checkNote = errorText(e);
        })
        .finally(() => {
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
      const title = target.url || targetLabel(target);
      if (!state) {
        text = translate('FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = translate('FeinwerkUptimeMonitor_UiNoRecentCheck',
          dateTime(state.checkedAt, this.config.language, this.config.timezone || ''));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, this.config.language);
      } else if (state.outcome === 'not_checkable') {
        // D2 (final review): a container larger than 4 MB says so in a few words
        text = state.note === 'too_large'
          ? keepUnits(translate('FeinwerkUptimeMonitor_UiTooLargeToCheck'))
          : translate('FeinwerkUptimeMonitor_UiNotCheckable');
      } else {
        text = causeText(state.error, state.httpStatus !== null ? `HTTP ${state.httpStatus}` : null);
      }
      const uptime = uptimeRows.find((r) => r.targetKey === target.targetKey && r.source === 'local');
      const measured = !!uptime && uptime.uptimePercent !== null && uptime.coveragePercent > 0;
      let dayOutcome = 'none';
      if (measured) {
        dayOutcome = (uptime?.uptimePercent ?? 0) >= 100 ? 'up' : 'partial';
      }
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
        certDays: target.certificate ? target.certificate.daysLeft : null,
        checkedAt: state && !state.stale ? state.checkedAt : '',
        host: hostOf(target.url),
        // D1: a past day's dot follows that day's uptime: all of it, part of it, nothing measured
        dayOutcome,
        tooLarge: !!state && !state.stale && state.outcome === 'not_checkable'
          && state.note === 'too_large',
      };
    },
    /**
     * D3: the certificate figure under its days: the host when the figure stands for all the
     * addresses (one shared certificate; nothing for Matomo's addresses without their URLs),
     * else the address whose certificate expires first
     */
    certFigureSub(withCert: Row[], soonest: Row): string {
      const shared = withCert.every((r) => r.certDays === soonest.certDays
        && r.certLevel === soonest.certLevel);
      if (shared) {
        const hosts = withCert.map((r) => r.host)
          .filter((host, n, all) => host !== '' && all.indexOf(host) === n);
        return hosts.length === 1 ? hosts[0] : '';
      }
      return this.isPage ? (this.labels[soonest.key] || soonest.label) : soonest.label;
    },
    /**
     * A group's answer: not reachable only when nothing answered; a partial failure is counted
     * (format.ts statusOf, the same rule as the admin overview).
     */
    groupState(rows: Row[], allOff: boolean): State {
      if (!rows.length) {
        return allOff
          ? { outcome: 'off', text: translate('FeinwerkUptimeMonitor_UiAllOff') }
          : { outcome: 'none', text: translate('FeinwerkUptimeMonitor_UiNotMeasuredYet') };
      }
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
    /** "since 10:42 (no connection)": the oldest open outage of the failing addresses */
    downDetail(rows: Row[]): string {
      const down = rows.filter((r) => r.outcome === 'down');
      if (!down.length) {
        return '';
      }
      const keys = down.map((r) => r.key);
      const starts = this.openIncidents
        .filter((i) => i.open && i.type === 'outage' && keys.includes(i.targetKey || ''))
        .map((i) => i.start)
        .sort();
      const parts: string[] = [];
      if (starts.length) {
        // the clock alone only while today is selected: else "since 22:06" reads as that day
        const since = this.todaySelected
          ? clockOrDate(starts[0], this.config.language, this.config.timezone || '', this.tick)
          : dateTime(starts[0], this.config.language, this.config.timezone || '');
        parts.push(translate('FeinwerkUptimeMonitor_UiSince', since));
      }
      const cause = down.length ? down[0].text : '';
      if (cause) {
        parts.push(`(${cause})`);
      }
      return parts.join(' ');
    },
    /**
     * The group's uptime from its hour strip (F1): reachable seconds / measured seconds of the
     * cells up to now, exact and the same as the strip by construction; measured share = measured
     * seconds / seconds of the period up to now of the addresses this server can check, as the
     * strip's tooltip counts. Without the strip: the addresses' uptimes weighted by how long each
     * was measured, rounded to 3 decimals (float sums never show 99.99 % for 100 %).
     */
    uptimeOf(rows: Row[], uptimeRows: UptimeRow[], timeline: Timeline | null):
      { value: string; sub: string; level: string; measured: number } | null {
      const { language } = this.config;
      if (timeline && timeline.cells.length) {
        const totals = stripTotals(timeline, this.tick, this.measurable(rows));
        if (totals.uptime === null) {
          return null;
        }
        return {
          value: percent(totals.uptime, language, 2),
          sub: translate('FeinwerkUptimeMonitor_UiMeasured', sharePercent(totals.measured, language)),
          level: '',
          measured: totals.measured,
        };
      }
      const keys = rows.map((r) => r.key);
      const own = uptimeRows.filter((r) => r.source === 'local' && keys.includes(r.targetKey));
      const measured = own.filter((r) => r.uptimePercent !== null && r.coveragePercent > 0);
      if (!measured.length) {
        return null;
      }
      const weight = measured.reduce((sum, r) => sum + r.coveragePercent, 0);
      const up = measured.reduce((sum, r) => sum + (r.uptimePercent ?? 0) * r.coveragePercent, 0);
      // measured as the strip counts a cell: when any of the addresses was measured (an
      // address that cannot be checked from this server adds nothing)
      const coverage = Math.max(...own.map((r) => r.coveragePercent));
      return {
        value: percent(Math.round((up / weight) * 1000) / 1000, language, 2),
        sub: translate('FeinwerkUptimeMonitor_UiMeasured', sharePercent(coverage, language)),
        level: '',
        measured: coverage,
      };
    },
    /** the addresses a strip cell sums: those this server cannot check measure nothing */
    measurable(rows: Row[]): number {
      return Math.max(1, rows.filter((r) => r.outcome !== 'not_checkable').length);
    },
    certText(cert: Certificate): string {
      if (cert.level === 'expired') {
        return translate('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return keepUnits(cert.daysLeft === 1
        ? translate('FeinwerkUptimeMonitor_UiCertificateDay')
        : translate('FeinwerkUptimeMonitor_UiCertificateDays', String(cert.daysLeft)));
    },
    /** Visitors > Uptime of this website for a period and date */
    pageUrl(period: string, date: string): string {
      const params = { idSite: String(this.config.idSite), period, date };
      return `?${MatomoUrl.stringify({ module: 'CoreHome', action: 'index', ...params })}#?${
        MatomoUrl.stringify({
          ...params, category: 'General_Visitors', subcategory: 'FeinwerkUptimeMonitor_Uptime',
        })}`;
    },
    /**
     * D4 (final review): the addresses of the day's outages, each group named once, "Matomo:
     * JavaScript tracker, Interface and Tracker endpoint", then the website's
     */
    namedOutages(outages: Incident[]): string {
      const { language } = this.config;
      const matomo: string[] = [];
      const site: string[] = [];
      outages.filter((i, n, all) => all.findIndex((o) => o.targetKey === i.targetKey) === n)
        .forEach((i) => {
          const name = this.names[i.targetKey || ''] || i.targetKey || '';
          (groupOf(i) === 'matomo' ? matomo : site).push(name);
        });
      const parts: string[] = [];
      if (matomo.length) {
        parts.push(translate('FeinwerkUptimeMonitor_UiMatomoTarget', listOf(matomo, language)));
      }
      if (site.length) {
        parts.push(listOf(site, language));
      }
      // French puts a space before the semicolon
      return parts.join(language.startsWith('fr') ? ' ; ' : '; ');
    },
  },
});
</script>
