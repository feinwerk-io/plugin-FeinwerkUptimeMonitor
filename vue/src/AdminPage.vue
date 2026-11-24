<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Administration > Diagnostic > Uptime Monitor (super users), spec 10: every website in one
  list, Matomo's own targets, the cron line for checks every minute, the alert status.
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
        <table class="entityTable dataTable fwum-admin__table">
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
              v-for="row in sorted"
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
                  v-if="row.lastCheckedAt"
                  class="fwum-muted fwum-narrow-only"
                  :title="when(row.lastCheckedAt)"
                >{{ since(row.lastCheckedAt) }}</span>
              </td>
              <td v-if="hasCerts">{{ certText(row.certificateDaysLeft) }}</td>
              <td
                class="fwum-wide-only"
                :title="row.lastCheckedAt ? when(row.lastCheckedAt) : ''"
              >
                {{ row.lastCheckedAt ? since(row.lastCheckedAt) : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        v-else-if="!loading"
        class="fwum-muted"
      >{{ translate('FeinwerkUptimeMonitor_UiFirstCheck') }}</p>
    </ContentBlock>

    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_UiCron')">
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
    </ContentBlock>

    <ContentBlock :content-title="translate('FeinwerkUptimeMonitor_UiAlerts')">
      <p v-if="config.sentinel === 'active'">
        {{ translate('FeinwerkUptimeMonitor_UiSentinelActive') }}
      </p>
      <p v-else>{{ translate('FeinwerkUptimeMonitor_UiSentinelAbsent') }}</p>
      <p
        v-if="config.sentinel === 'active'"
        class="fwum-muted"
      >{{ translate('FeinwerkUptimeMonitor_UiSentinelFacts') }}</p>
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
import { ago, dateTime, statusOf } from './format';
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
      return [...this.rows].sort((a, b) => rank(a) - rank(b) || a.idSite - b.idSite);
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
  },
  methods: {
    translate,
    load(): void {
      this.loading = true;
      api.overview().then((rows) => {
        this.rows = rows;
        this.failed = false;
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    when(iso: string): string {
      return dateTime(iso, this.config.language, this.config.timezone || '');
    },
    since(iso: string): string {
      return ago(iso, this.config.language);
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
