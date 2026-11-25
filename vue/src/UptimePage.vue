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
      'fwum-page--in-widget': config.inWidget, 'is-narrow': narrow,
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
            <p
              v-for="(line, i) in answer"
              :key="line.key"
              class="fwum-answer__line"
              :class="`is-${line.outcome}`"
            >
              <span
                class="fwum-dot"
                aria-hidden="true"
              />
              <strong class="fwum-state">{{ line.text }}</strong>
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
            <dd
              v-if="figure.value"
              :class="figure.level ? `is-${figure.level}` : undefined"
            >{{ figure.value }}</dd>
            <dd
              v-if="figure.sub"
              class="fwum-figures__sub"
            >{{ figure.sub }}</dd>
            <dd
              v-if="figure.key === 'tracker' && sparkValues.length > 1"
              class="fwum-figures__spark"
            >
              <Sparkline
                :values="sparkValues"
                :label="sparkLabel"
                :width="isPage ? 160 : 120"
                :height="28"
              />
            </dd>
          </div>
        </dl>
        <p
          v-if="config.queuedTracking && trackerTime"
          class="fwum-note"
        >{{ translate('FeinwerkUptimeMonitor_UiQueuedTracking') }}</p>

        <div
          v-if="strips.length"
          class="fwum-strips"
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
            >
              <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}
                {{ strip.name }}:</span>
              <strong>{{ strip.uptime.value }}</strong>
              <span class="fwum-strips__measured">{{ strip.uptime.sub }}</span>
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
          v-if="isPage"
          class="fwum-table-wrap"
        >
          <table class="dataTable fwum-table">
            <thead>
              <tr>
                <th
                  scope="col"
                  class="label"
                >{{ translate('FeinwerkUptimeMonitor_UiAddress') }}</th>
                <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiResponse') }}</th>
                <th scope="col">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}</th>
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
                :class="`is-${row.outcome}`"
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
                <td class="column fwum-targets__text">{{ keepHyphens(row.text) }}</td>
                <td class="column">{{ row.uptime }}</td>
                <td
                  v-if="hasCerts"
                  class="column fwum-targets__cert"
                  :class="`is-${row.certLevel}`"
                >{{ row.cert }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <template v-else-if="widgetGroup">
          <p
            v-if="!widgetGroup.rows.length"
            class="fwum-muted"
          >{{ widgetGroup.note }}</p>
          <ul
            v-else
            class="fwum-targets"
          >
            <li
              v-for="row in widgetRows"
              :key="row.key"
              :class="`is-${row.outcome}`"
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
              <span class="fwum-targets__text">{{ keepHyphens(row.text) }}</span>
              <span class="fwum-targets__uptime">{{ row.uptime }}</span>
              <span
                class="fwum-targets__cert"
                :class="`is-${row.certLevel}`"
              >{{ row.cert }}</span>
            </li>
          </ul>
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
              v-if="config.isSuperUser && !config.embedded && !config.allowPrivate"
              :href="settingsUrl"
            >{{ translate('FeinwerkUptimeMonitor_UiAllowPrivate') }}</a>
          </p>
          <!-- next to the link "Allow private addresses" the settings sentence would repeat it -->
          <p
            v-show="whyOpen"
            :id="`${uid}-why`"
            class="fwum-note fwum-nc__why"
          >{{ translate('FeinwerkUptimeMonitor_UiNotCheckableHelp') }}<template
            v-if="!(config.isSuperUser && !config.embedded) && !config.allowPrivate"
          > {{ translate('FeinwerkUptimeMonitor_UiNotCheckableSettings') }}</template></p>
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
          v-if="isPage"
          :incidents="shownIncidents"
          :labels="labels"
          :language="config.language"
          :timezone="config.timezone || ''"
          :total="incidents.length"
          :total-is-minimum="incidentsMore"
          :can-show-more="canShowMore"
          :loading-more="loadingMore"
          @more="showMoreOutages"
        />
        <!-- the kit's card on dashboards (Peter's 7b): after the widget's whole content, the
             outages too; the server sends it for widgets only; the page has the tip line -->
        <PromoCard
          :card="config.promoCard || null"
          :dismiss-label="translate('FeinwerkUptimeMonitor_PromoDismiss')"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { MatomoUrl, translate } from 'CoreHome';
import { api, Period } from './api';
import {
  Certificate, Incident, ScreenConfig, SeriesPoint, Status, TargetStatus, Timeline, UptimeRow,
} from './types';
import {
  ago, causeText, clockOrDate, dateTime, errorText, listOf, milliseconds, percent, sharePercent,
  statusOf,
  targetLabel,
} from './format';
import { stripTotals } from './timeline';
import Sparkline from './Sparkline.vue';
import OutageList from './OutageList.vue';
import TargetPanel from './TargetPanel.vue';
import FeedbackBar from './FeedbackBar.vue';
import PromoLine from './PromoLine.vue';
import PromoCard from './PromoCard.vue';
import HourStrip from './HourStrip.vue';

interface Row {
  key: string;
  label: string;
  outcome: string;
  text: string;
  title: string;
  uptime: string;
  cert: string;
  certLevel: string;
  /** days until the certificate expires (null: no certificate) */
  certDays: number | null;
  checkedAt: string;
}

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
}

interface AnswerLine {
  key: string;
  outcome: string;
  text: string;
  detail: string;
}

interface Figure {
  key: string;
  label: string;
  value: string;
  sub: string;
  level: string;
}

interface Strip {
  key: string;
  name: string;
  timeline: Timeline;
  targets: number;
  /** the group's uptime at the end of its strip (page only, D3) */
  uptime: { value: string; sub: string } | null;
}

const MATOMO_KINDS = ['ui', 'tracker', 'js'];
/** below this width (px) the page and widgets take the phone layout (.fwum-narrow) */
const NARROW_PX = 600;
/**
 * A Tag Manager container is a file on the Matomo server: listed and counted with Matomo, not
 * with the website (Peter, 2026-11-25, "a)"). Its alarm stays the website's (Sentinel U02).
 */
const CONTAINER = 'container';
const ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];
/** the answer line names the worst group first */
const SEVERITY = ['down', 'partial', 'stale', 'not_checkable', 'none', 'off', 'up'];
const OUTAGES_FIRST = 20;
const OUTAGES_STEP = 50;
const INCIDENT_LIMIT = 100;
const INCIDENT_LIMIT_MAX = 1000;

export default defineComponent({
  components: {
    Sparkline, OutageList, TargetPanel, FeedbackBar, PromoLine, PromoCard, HourStrip,
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
      const params = {
        idSite: String(this.config.idSite),
        period: this.period.period,
        date: this.period.date,
      };
      return `?${MatomoUrl.stringify({ module: 'CoreHome', action: 'index', ...params })}#?${
        MatomoUrl.stringify({
          ...params, category: 'General_Visitors', subcategory: 'FeinwerkUptimeMonitor_Uptime',
        })}`;
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
          const state = down.length === 1
            ? translate('FeinwerkUptimeMonitor_UiAddressDown', down[0].label) : g.state.text;
          return {
            key: g.key,
            outcome: g.state.outcome,
            text: this.isPage
              ? translate('FeinwerkUptimeMonitor_UiAnswerGroup', g.name, state)
              : g.state.text,
            detail: this.downDetail(g),
          };
        });
    },
    /** the answer line that carries the freshness: the first one of a group with results */
    freshnessLine(): number {
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
        });
      } else if (this.showMatomo && this.sparkValues.length > 1) {
        // no tracking traffic in the last hour: the endpoint's response times per hour
        out.push({
          key: 'tracker', label: this.sparkLabel, value: '', sub: '', level: '',
        });
      }
      const withCert = this.groups.flatMap((g) => g.rows).filter((r) => r.certDays !== null);
      if (withCert.length) {
        const soonest = withCert.reduce((a, b) => ((b.certDays ?? 0) < (a.certDays ?? 0) ? b : a));
        out.push({
          key: 'cert',
          label: translate('FeinwerkUptimeMonitor_UiCertificate'),
          value: soonest.cert,
          sub: this.isPage ? (this.labels[soonest.key] || soonest.label) : soonest.label,
          level: soonest.certLevel,
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
    columnCount(): number {
      return this.hasCerts ? 4 : 3;
    },
    /** the widget's one group */
    widgetGroup(): Group | null {
      return this.groups.length ? this.groups[0] : null;
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
    notCheckableCount(): number {
      const rows = this.isPage ? this.groups.flatMap((g) => g.rows) : this.widgetRows;
      return rows.filter((r) => r.outcome === 'not_checkable').length;
    },
    notCheckableText(): string {
      return this.notCheckableCount === 1
        ? translate('FeinwerkUptimeMonitor_UiNotCheckableOne')
        : translate('FeinwerkUptimeMonitor_UiNotCheckableMany', String(this.notCheckableCount));
    },
    shownIncidents(): Incident[] {
      // with a cut request, only the first `limit` of the merged list are surely the newest
      const cap = this.incidentsMore ? Math.min(this.outagesShown, this.incidentLimit)
        : this.outagesShown;
      return this.incidents.slice(0, cap);
    },
    canShowMore(): boolean {
      // more of the loaded list, or a larger request; at the API's limit a cut list ends here
      const moreLoaded = this.shownIncidents.length < this.incidents.length
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
    if (typeof ResizeObserver !== 'undefined' && this.$el instanceof HTMLElement) {
      this.resize = new ResizeObserver((entries) => {
        // a dashboard reload replaces the widget's HTML without unmounting the app: let go then
        if (!(this.$el as HTMLElement).isConnected) {
          if (this.resize) {
            this.resize.disconnect();
          }
          return;
        }
        const width = entries[0] ? entries[0].contentRect.width : 0;
        if (width > 0) {
          this.narrow = width < NARROW_PX;
        }
      });
      this.resize.observe(this.$el);
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
  },
  methods: {
    translate,
    /**
     * An address in pieces that may wrap after ".", "/", "?", "&", "=", "-" or "_" (a <wbr> after
     * each): on a phone "www.outdoor-shop-demo.example" wraps between its parts, not inside a word
     */
    breakParts(text: string): string[] {
      const parts = text.replace(/([./?&=_-])/g, '$1\u0001').split('\u0001').filter((p) => p !== '');
      // "www." never stands alone on a line
      if (parts.length > 1 && parts[0].toLowerCase() === 'www.') {
        parts.splice(0, 2, parts[0] + parts[1]);
      }
      return parts;
    },
    /** "HTTP-Status 403" stays whole on a phone: non-breaking hyphens in a short state text */
    keepHyphens(text: string): string {
      return text.replace(/-/g, '\u2011');
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
        text = translate('FeinwerkUptimeMonitor_UiNotCheckable');
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
        certDays: target.certificate ? target.certificate.daysLeft : null,
        checkedAt: state && !state.stale ? state.checkedAt : '',
      };
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
    downDetail(group: Group): string {
      if (group.state.outcome !== 'down' && group.state.outcome !== 'partial') {
        return '';
      }
      const down = group.rows.filter((r) => r.outcome === 'down');
      const keys = down.map((r) => r.key);
      const starts = this.openIncidents
        .filter((i) => i.open && i.type === 'outage' && keys.includes(i.targetKey || ''))
        .map((i) => i.start)
        .sort();
      const parts: string[] = [];
      if (starts.length) {
        parts.push(translate('FeinwerkUptimeMonitor_UiSince', clockOrDate(starts[0],
          this.config.language, this.config.timezone || '', this.tick)));
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
      { value: string; sub: string; level: string } | null {
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
      return cert.daysLeft === 1
        ? translate('FeinwerkUptimeMonitor_UiCertificateDay')
        : translate('FeinwerkUptimeMonitor_UiCertificateDays', String(cert.daysLeft));
    },
  },
});
</script>
