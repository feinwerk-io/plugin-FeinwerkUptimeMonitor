<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Visitors > Uptime (variant "page") and the dashboard widgets "Uptime: Matomo" (variant
  "matomo") and "Uptime: Website" (variant "site"). The page (Peter's 1a, 2a: P1 and D2): one
  answer line for Matomo and the website with its freshness, a row of key figures, the hour
  strips, one table with the groups Matomo and This website, the outages. The widgets (5a, P4):
  no inner title, the state first, compact figures, a small strip, and when something is down
  only the failing rows with a link to the page. All data through the plugin's API. While another
  plugin adds results checked from outside (config.external active), a group with any such result
  shows them with the server's (5.2.0 review B1: a group without any says so once, a screen without
  any is as without that plugin). Peter, 2026-11-26, "1a, 2a, 3a": the page has a thin lane from
  outside under the strip of each group the outside measured and one time axis (P1); the table
  answers once and names the side only where the sides disagree, the narrow list and the widgets
  too (P2, sides.ts); an address down only from the Matomo server while the outside reaches it is
  amber, "not reachable from the Matomo server" (3a; it still counts as down). The widgets have one
  strip and the lower uptime of both sides (B4); a dot and the answer combine both. A registered
  source that is not active gives admins one muted line with the link to its settings. Follow-ups
  (Peter, 2026-11-26, "alle wie empfohlen"): the outage list answers once (D1, outages.ts); on
  phones both names and uptimes above a strip and its lane (D2); in the widgets a side that cannot
  check an address adds no line (D3); "the Matomo server" in the answer, the note and the cells
  while results from outside show (W2).
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
            <!-- B4: the widgets' uptime is the lower side's; from outside, it says so -->
            <dd
              v-if="figure.side"
              class="fwum-figures__sub fwum-figures__side"
            >{{ figure.side }}</dd>
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
          <template
            v-for="block in stripBlocks"
            :key="block.key"
          >
            <!-- D2 (Peter, 2026-11-26, "alle wie empfohlen"): on a narrow page a group's strip
                 and its lane from outside as a pair: both names and uptimes first, then the
                 strip with the lane right under it; the last lane carries the time axis -->
            <div
              v-if="narrow && block.strips.length > 1"
              class="fwum-strips__pair"
              :class="{ 'fwum-strips__pair--next': block.strips[0].next }"
            >
              <div
                v-for="strip in block.strips"
                :key="strip.key"
                class="fwum-strips__head"
                :class="{ 'fwum-strips__head--lane': strip.lane }"
              >
                <div
                  class="fwum-strips__name"
                  aria-hidden="true"
                >
                  <template v-if="strip.first">{{ strip.name }}</template>
                  <span
                    v-if="strip.vantage"
                    class="fwum-strips__vantage"
                  >{{ strip.vantage }}</span>
                </div>
                <div
                  v-if="strip.uptime"
                  class="fwum-strips__uptime"
                  :class="{
                    'fwum-strips__uptime--lane': strip.lane,
                    'fwum-strips__uptime--muted': strip.uptime.muted,
                  }"
                  :title="strip.uptime.sub"
                >
                  <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}
                    {{ strip.label }}:</span>
                  <!-- QB1 (quick UI review before 5.3.0): the muted figure is no strong, which
                       Morpheus makes bold with !important -->
                  <span
                    v-if="strip.uptime.muted"
                    class="fwum-strips__figure"
                  >{{ strip.uptime.value }}</span>
                  <strong
                    v-else
                    class="fwum-strips__figure"
                  >{{ strip.uptime.value }}</strong>
                  <span
                    :class="measuredVisible(strip.uptime.measured)
                      ? 'fwum-strips__measured' : 'fwum-sr'"
                  >{{ strip.uptime.sub }}</span>
                </div>
              </div>
              <HourStrip
                v-for="strip in block.strips"
                :key="`${strip.key}-cells`"
                v-bind="stripProps(strip)"
              />
            </div>
            <!-- P1: a group's lane from outside right under its strip; the next group set apart -->
            <template v-else>
              <div
                v-for="strip in block.strips"
                :key="strip.key"
                class="fwum-strips__row"
                :class="{
                  'fwum-strips__row--page': isPage, 'fwum-strips__row--lane': strip.lane,
                  'fwum-strips__row--next': strip.next,
                }"
              >
                <div
                  v-if="isPage"
                  class="fwum-strips__name"
                  aria-hidden="true"
                >
                  <template v-if="strip.first">{{ strip.name }}</template>
                  <span
                    v-if="strip.vantage"
                    class="fwum-strips__vantage"
                  >{{ strip.vantage }}</span>
                </div>
                <HourStrip v-bind="stripProps(strip)" />
                <!-- D3 (Peter, 2026-11-25, "alles in 5.1.3 umsetzen"): uptime ends the strip -->
                <div
                  v-if="strip.uptime"
                  class="fwum-strips__uptime"
                  :class="{
                    'fwum-strips__uptime--lane': strip.lane,
                    'fwum-strips__uptime--muted': strip.uptime.muted,
                  }"
                  :title="strip.uptime.sub"
                >
                  <span class="fwum-sr">{{ translate('FeinwerkUptimeMonitor_UiUptime') }}
                    {{ strip.label }}:</span>
                  <span
                    v-if="strip.uptime.muted"
                    class="fwum-strips__figure"
                  >{{ strip.uptime.value }}</span>
                  <strong
                    v-else
                    class="fwum-strips__figure"
                  >{{ strip.uptime.value }}</strong>
                  <!-- P2: one number; the measured share only where it matters -->
                  <span
                    :class="measuredVisible(strip.uptime.measured)
                      ? 'fwum-strips__measured' : 'fwum-sr'"
                  >{{ strip.uptime.sub }}</span>
                </div>
              </div>
            </template>
          </template>
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
              <!-- B1: the screen shows results from outside, this group has none (a div: a card's
                   paragraphs get Matomo's margins) -->
              <div
                v-if="showOutside && !group.outside && group.rows.length"
                class="fwum-muted fwum-group-note"
              >{{ translate('FeinwerkUptimeMonitor_UiNotCheckedFromOutside') }}</div>
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
                :outside="group.outside"
              />
            </template>
          </div>
          <table
            v-else
            class="dataTable fwum-table"
            :class="{ 'fwum-table--outside': showOutside }"
          >
            <!-- P2 (Peter's 2a): the same columns with results from outside; a cell names the side
                 only where the sides disagree -->
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
                <!-- B1: the screen shows results from outside, this group has none: said once -->
                <th
                  :colspan="columnCount"
                  scope="rowgroup"
                >
                  {{ group.name }}
                  <span
                    v-if="showOutside && !group.outside && group.rows.length"
                    class="fwum-group-row__note"
                  >{{ translate('FeinwerkUptimeMonitor_UiNotCheckedFromOutside') }}</span></th>
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
              <template
                v-for="row in group.rows"
                :key="row.key"
              >
                <tr
                  :class="[`is-${past ? row.dayOutcome : row.tone}`,
                           { 'fwum-row--split': !!splitOf(row) }]"
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
                  <template v-if="!showOutside">
                    <td
                      v-if="!past"
                      class="column fwum-targets__text"
                    >{{ keepHyphens(row.text) }}</td>
                    <td
                      v-if="hasUptime"
                      class="column"
                    >{{ row.uptime }}</td>
                  </template>
                  <!-- D2 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): a row the
                       sides disagree on keeps its values for its sub-rows below -->
                  <template v-else-if="splitOf(row)">
                    <td
                      v-if="!past"
                      class="column fwum-targets__text"
                    />
                    <td
                      v-if="hasUptime"
                      class="column"
                    />
                  </template>
                  <!-- P2: one line per value where the sides agree; the tooltip names both sides
                       and why the outside cannot check it (B5) -->
                  <template v-else>
                    <td
                      v-if="!past"
                      class="column fwum-targets__text"
                      :title="responseTitle(row)"
                    ><span
                      v-for="(line, l) in responseLinesOf(row)"
                      :key="l"
                      class="fwum-line"
                      :class="[line.tone ? `is-${line.tone}` : '',
                               { 'fwum-line--other': line.other }]"
                    >{{ keepHyphens(line.text) }}</span><span
                      v-if="asideOf(row)"
                      class="fwum-sr"
                    >, {{ asideOf(row) }}</span></td>
                    <td
                      v-if="hasUptime"
                      class="column"
                    ><span
                      v-for="(line, l) in uptimeLinesOf(row)"
                      :key="l"
                      class="fwum-line"
                      :class="{ 'fwum-line--other': line.other }"
                    >{{ line.text }}</span></td>
                  </template>
                  <td
                    v-if="hasCerts"
                    class="column fwum-targets__cert"
                    :class="`is-${row.certLevel}`"
                  >{{ row.cert }}</td>
                </tr>
                <!-- D2: one indented sub-row per side, the side that sets the dot first (on a
                     past day the lower uptime): its name, its plain values; a container too large
                     for any server names no side -->
                <tr
                  v-for="(side, n) in splitOf(row) || []"
                  :key="`${row.key}-${side.key}`"
                  class="fwum-subrow"
                  :class="{ 'fwum-subrow--last': n === (splitOf(row) || []).length - 1 }"
                >
                  <!-- QL4 (quick UI review before 5.3.0): the address first, for screen readers -->
                  <td class="label fwum-subrow__side"><span class="fwum-sr">{{
                    row.label }}{{ side.tooLarge ? '' : ', ' }}</span>{{
                    side.tooLarge ? '' : sideName(side) }}</td>
                  <td
                    v-if="!past"
                    class="column fwum-targets__text"
                    :title="responseTitle(row)"
                  ><span
                    v-if="hasWords(side)"
                    class="fwum-line"
                    :class="failureTone(side, row)"
                  >{{ keepHyphens(side.text) }}</span></td>
                  <td
                    v-if="hasUptime"
                    class="column"
                  >{{ subUptime(side) }}</td>
                  <td
                    v-if="hasCerts"
                    class="column"
                  />
                </tr>
              </template>
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
            :outside="widgetGroup.outside"
            :by-uptime="!todaySelected"
            widget
          />
        </template>

        <!-- a registered source of results from outside that delivers none (not set up yet, or
             stopped): admins only (ScreenProps), on the page, never in an embed -->
        <p
          v-if="outsidePaused"
          class="fwum-note fwum-outside-note"
        >
          {{ translate('FeinwerkUptimeMonitor_UiOutsidePaused') }}
          <a
            v-if="config.external && config.external.settingsUrl"
            :href="config.external.settingsUrl"
          >{{ translate('FeinwerkUptimeMonitor_UiOutsideSettings') }}</a>
        </p>

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
          :outside="showOutside"
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
import { api, Period, RECENT_LIMIT } from './api';
import {
  AddressRow, Certificate, Incident, ScreenConfig, SeriesPoint, State as TargetState, Status,
  TargetStatus, Timeline, UptimeRow,
} from './types';
import {
  ago, breakParts, calendarDay, causeText, clockOrDate, dateTime, dayKey, duration, errorText,
  hostOf, keepBrackets, keepHyphens, keepUnits, listOf, milliseconds, percent, sharePercent,
  shiftDay, sidedStatusOf, targetLabel,
} from './format';
import { combineTimelines, stripTotals } from './timeline';
import {
  aloneDown, aside, combined, keepServer, Line, responseLines, serverOnlyDown, Side, sideTone,
  SIDES_MARGIN_SECONDS, speaks, split, toneOf, uncounted, uptimeLines,
} from './sides';
import { observeNarrow } from './narrow';
import { ownsDashboardCard, watchDashboardCard } from './cardPlace';
import {
  groupOf, KIND_ORDER, onlyFromOutside, OutageRow, outageRows, outagesInPeriod, outageTotals,
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
  /** 5.2.0 review B1: its addresses show results from outside (it has some) */
  outside: boolean;
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
  /** 5.2.0 review B4: "from outside" when the uptime is that side's (the lower one) */
  side: string;
}

/** an uptime figure: its text and the number behind it */
interface Uptime {
  value: string;
  sub: string;
  level: string;
  measured: number;
  uptime: number;
}

interface Strip {
  key: string;
  name: string;
  /** the strip's name for screen readers and its tooltip: the group, and where it was checked */
  label: string;
  /** with results from outside: "from the Matomo server" or "from outside"; else '' */
  vantage: string;
  /** the group's first strip: the name column names the group */
  first: boolean;
  timeline: Timeline;
  targets: number;
  /**
   * the group's uptime at the end of its strip (page only, D3); muted: the higher of a group's two
   * uptimes (Peter's answer to the UI review of 5.3.0, D1: the lower one is bold)
   */
  uptime: (Uptime & { muted?: boolean }) | null;
  /** P1: the thin lane from outside under its group's strip */
  lane: boolean;
  /** P1: it carries the time axis (with results from outside only the last one does) */
  axis: boolean;
  /** P1: the first strip of a group after the first one (set apart from the lane above) */
  next: boolean;
}

/** one side of an address: as checked from the Matomo server or from outside */
interface Vantage {
  outcome: string;
  text: string;
  uptime: string;
  /** a past day's dot: up, partial or none */
  dayOutcome: string;
  /** '' when not current */
  checkedAt: string;
  tooLarge: boolean;
  /** B5: why the outside cannot check it (its cell's tooltip); '' otherwise */
  title: string;
}

/** 5.2.0 review B1: what a group has from outside */
interface GroupOutside {
  /** its addresses show the outside's results: one of them has any (also "cannot check it") */
  cells: boolean;
  /** its strip from outside: the outside measured some of the period */
  strip: boolean;
}

/**
 * B11 part 2: the server's side of an address it never checks (getStatus serverRefuses) before its
 * first check: not checkable, without a check time (it never counts as a recent check)
 */
const REFUSED: TargetState = {
  outcome: 'not_checkable',
  error: 'blocked',
  note: null,
  httpStatus: null,
  responseMs: null,
  checkedAt: '',
  stale: false,
};

const MATOMO_KINDS = ['ui', 'tracker', 'js'];
/**
 * B5: why the outside cannot check an address, by its error: the outside's own words where this
 * plugin's would be wrong ("blocked by the settings"), else the cause's
 */
const OUTSIDE_REASONS: Record<string, string> = {
  blocked: 'UiOutsideReasonBlocked',
  http_status: 'UiOutsideReasonProtected',
  content: 'UiOutsideReasonTooLarge',
};
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
      /** the strips from outside (page, while results from outside come in) */
      matomoOutsideTimeline: null as Timeline | null,
      siteOutsideTimeline: null as Timeline | null,
      /**
       * outages still open now, for "since when" in the answer line and 3a (sides.ts aloneDown);
       * while results from outside come in also those ended since yesterday (review of the 5.3.0
       * fixes, SHOULD 1)
       */
      openIncidents: [] as Incident[],
      /**
       * the open outages could not be loaded, or their list was cut at the API's limit: nothing
       * reads as one-sided (L8 review of 5.3.0)
       */
      openFailed: false,
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
    /** another plugin delivers results checked from outside: shown next to the server's */
    outside(): boolean {
      return !!this.config.external && this.config.external.active;
    },
    /** the outages the screen lists: from outside too only while such results come in */
    incidentSource(): 'local' | 'all' {
      return this.outside ? 'all' : 'local';
    },
    /** Matomo's group: its switched-on own addresses (interface first), then the containers */
    matomoTargets(): TargetStatus[] {
      return [
        ...(this.matomo?.targets || []).filter((t) => t.enabled && MATOMO_KINDS.includes(t.kind))
          .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)),
        ...this.containers.filter((t) => t.enabled)
          .sort((a, b) => a.targetKey.localeCompare(b.targetKey)),
      ];
    },
    /** the website's group: its switched-on addresses and tracking proxy */
    siteTargets(): TargetStatus[] {
      return (this.site?.targets || []).filter((t) => t.enabled && t.kind !== CONTAINER)
        .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)
          || a.targetKey.localeCompare(b.targetKey));
    },
    /** B1: what Matomo's group has from outside */
    matomoOutside(): GroupOutside {
      return this.outsideOf(this.matomoTargets, [...this.matomoUptimeRows, ...this.siteUptimeRows],
        this.matomoOutsideTimeline);
    },
    siteOutside(): GroupOutside {
      return this.outsideOf(this.siteTargets, this.siteUptimeRows, this.siteOutsideTimeline);
    },
    /**
     * B1: some group of the screen has results from outside: both sides show; else the screen is
     * as without results from outside
     */
    showOutside(): boolean {
      return (this.showMatomo && this.matomoOutside.cells)
        || (this.showSite && this.siteOutside.cells);
    },
    /** a registered source that delivers none (not set up yet, or stopped): admins, the page */
    outsidePaused(): boolean {
      return this.isPage && !this.config.embedded && !!this.config.external
        && !this.config.external.active;
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
      const sides = this.matomoOutside.cells;
      return this.matomoTargets.map((t) => this.row(t,
        t.kind === CONTAINER ? this.siteUptimeRows : this.matomoUptimeRows, sides));
    },
    siteRows(): Row[] {
      const sides = this.siteOutside.cells;
      return this.siteTargets.map((t) => this.row(t, this.siteUptimeRows, sides));
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
    /** L8 review 5: an address the server never checks is not checkable at once, no first check */
    nothingChecked(): boolean {
      const all = [...(this.matomo?.targets || []), ...(this.site?.targets || [])];
      return all.every((t) => !t.states.local && !t.states.external
        && !(t.enabled && t.serverRefuses));
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
          outside: this.matomoOutside.cells,
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
          outside: this.siteOutside.cells,
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
      const lines = [...groups]
        .sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome))
        .map((g) => {
          const down = g.rows.filter((r) => r.outcome === 'down');
          // F1 (final review): a line that names a down address is red, also when the rest of its
          // group answers; a count ("2 of 4 addresses") and the widgets' count stay amber. 3a: down
          // only from the Matomo server while the outside reaches it: amber, and it says so
          const one = this.isPage && down.length === 1;
          const serverOnly = one && down[0].serverOnlyDown;
          const state = one
            ? translate(serverOnly ? 'FeinwerkUptimeMonitor_UiAddressDownFromServer'
              : 'FeinwerkUptimeMonitor_UiAddressDown', down[0].label) : g.state.text;
          let { outcome } = g.state;
          if (one) {
            outcome = serverOnly ? 'partial' : 'down';
          }
          return {
            key: g.key,
            outcome,
            text: this.isPage
              ? translate('FeinwerkUptimeMonitor_UiAnswerGroup', g.name, state)
              : g.state.text,
            detail: this.downDetail(g.rows),
          };
        });
      // L8 review of 5.3.0, NIT 2: while results from outside show, the worst line first by its own
      // colour (a red line naming an address before an amber 3a line), the groups' order on a tie;
      // without them the order of 5.2.0
      return this.showOutside
        ? lines.sort((a, b) => SEVERITY.indexOf(a.outcome) - SEVERITY.indexOf(b.outcome)) : lines;
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
        // P3: the part of that time only the outside saw (a cut list has no sum)
        const only = this.showOutside && !this.incidentsMore ? onlyFromOutside(outages) : 0;
        if (only > 0) {
          text = `${text} ${translate('FeinwerkUptimeMonitor_UiPastOnlyOutside',
            duration(only, language))}`;
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
        const matomo = g.key === 'matomo';
        const rows = matomo ? [...this.matomoUptimeRows, ...this.siteUptimeRows]
          : this.siteUptimeRows;
        const uptime = this.uptimeOf(g.rows, rows,
          matomo ? this.matomoTimeline : this.siteTimeline);
        // with results from outside: the side that measured more of the period
        const outside = g.outside ? this.uptimeOf(g.rows, rows,
          matomo ? this.matomoOutsideTimeline : this.siteOutsideTimeline, 'external') : null;
        const measured = Math.max(uptime ? uptime.measured : 0, outside ? outside.measured : 0);
        if (measured > 0) {
          out.push(measured);
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
        return translate(down[0].serverOnlyDown ? 'FeinwerkUptimeMonitor_UiAddressDownFromServer'
          : 'FeinwerkUptimeMonitor_UiAddressDown', this.labels[down[0].key] || down[0].label);
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
     * outage is partly reachable, or the one it names is down only from the Matomo server (3a)
     */
    nowOutcome(): string {
      const down = this.groups.flatMap((g) => g.rows).filter((r) => r.outcome === 'down');
      if (this.groups.some((g) => g.state.outcome === 'down')) {
        return 'down';
      }
      if (down.length === 1) {
        return down[0].serverOnlyDown ? 'partial' : 'down';
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
        ? this.lowerUptime(this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows],
          [this.matomoTimeline, this.matomoOutsideTimeline], this.matomoOutside) : null;
      if (matomo) {
        out.push({
          key: 'matomo',
          label: translate(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeMatomo'
            : 'FeinwerkUptimeMonitor_UiUptime'),
          ...matomo,
        });
      }
      const site = this.showSite && !stripped('site')
        ? this.lowerUptime(this.siteRows, this.siteUptimeRows,
          [this.siteTimeline, this.siteOutsideTimeline], this.siteOutside) : null;
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
          side: '',
        });
      } else if (this.showMatomo && this.sparkValues.length > 1) {
        // no tracking traffic in the last hour: the endpoint's response times per hour
        out.push({
          key: 'tracker', label: this.sparkLabel, value: '', sub: '', level: '', measured: null, side: '',
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
          side: '',
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
        timelines: [Timeline | null, Timeline | null],
        rows: Row[],
        uptimeRows: UptimeRow[],
        outside: GroupOutside,
      ) => {
        const [local, external] = timelines;
        if (!this.isPage) {
          // B4: a widget's one strip from both sides while the outside measured the group: a cell
          // is up only when every side found every address up (as getTimeline source=all)
          const both = outside.strip && !!local && !!external;
          const timeline = both && local && external ? combineTimelines(local, external) : local;
          if (timeline && timeline.cells.length) {
            out.push({
              key,
              name,
              label: name,
              vantage: '',
              first: true,
              timeline,
              targets: Math.max(1, this.measurableCount(rows, 'local')
                + (both ? this.measurableCount(rows, 'external') : 0)),
              uptime: null,
              lane: false,
              axis: true,
              next: false,
            });
          }
          return;
        }
        // the page with results from outside (P1): the group's strip, named once, and a thin lane
        // from outside right under it only where the outside measured the group (B1), naming its
        // share (B2); screen readers hear the side of each
        // W7 (UI review): the lane says its share in short words ("from outside (1 of 2)"), its
        // name for screen readers in full
        type StripSide = [string, Timeline | null, 'local' | 'external', string, string, boolean];
        const sides: StripSide[] = [
          [key, local, 'local', this.showOutside ? translate('FeinwerkUptimeMonitor_UiFromServer') : '',
            '', false],
        ];
        if (this.showOutside && outside.strip) {
          sides.push([`${key}-outside`, external, 'external', this.outsideVantage(rows),
            this.outsideVantage(rows, true), true]);
        }
        let first = true;
        const start = out.length;
        sides.forEach(([id, timeline, source, vantage, shown, lane]) => {
          if (timeline && timeline.cells.length) {
            out.push({
              key: id,
              name,
              label: vantage ? `${name}, ${vantage}` : name,
              vantage: lane ? shown : '',
              first,
              timeline,
              targets: this.measurable(rows, source),
              uptime: this.uptimeOf(rows, uptimeRows, timeline, source),
              lane,
              axis: true,
              next: false,
            });
            first = false;
          }
        });
        // D1 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): of a group's two
        // uptimes the lower one is bold, whichever row it is on, as in the widgets and the table;
        // the other muted; the server's bold on a tie
        const [server, lane] = out.slice(start).map((strip) => strip.uptime);
        if (server && lane) {
          const laneLower = lane.value !== server.value && lane.uptime < server.uptime;
          server.muted = laneLower;
          lane.muted = !laneLower;
        }
      };
      if (this.showMatomo) {
        add('matomo', translate('FeinwerkUptimeMonitor_UiMatomo'),
          [this.matomoTimeline, this.matomoOutsideTimeline],
          this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows], this.matomoOutside);
      }
      if (this.showSite) {
        add('site', translate('FeinwerkUptimeMonitor_UiThisWebsite'),
          [this.siteTimeline, this.siteOutsideTimeline], this.siteRows, this.siteUptimeRows,
          this.siteOutside);
      }
      if (this.isPage && this.showOutside) {
        // P1: one time axis under the last strip; each group after the first set apart
        out.forEach((strip, i) => {
          Object.assign(strip, { axis: i === out.length - 1, next: i > 0 && strip.first });
        });
      }
      return out;
    },
    /** D2: the strips by group, a group's strip and its lane from outside together */
    stripBlocks(): Array<{ key: string; strips: Strip[] }> {
      const out: Array<{ key: string; strips: Strip[] }> = [];
      this.strips.forEach((strip) => {
        const last = out[out.length - 1];
        if (last && !strip.first) {
          last.strips.push(strip);
        } else {
          out.push({ key: strip.key, strips: [strip] });
        }
      });
      return out;
    },
    hasCerts(): boolean {
      return this.groups.some((g) => g.rows.some((r) => r.cert !== ''));
    },
    /** D4: a period without any measurement shows no empty Uptime column */
    hasUptime(): boolean {
      return this.groups.some((g) => g.rows.some((r) => r.uptime !== ''
        || (!!r.outside && r.outside.uptime !== '')));
    },
    /** P2: the same columns with and without results from outside */
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
      // the containers as Matomo's group lists them: their state from both sides (row())
      const keys = this.containers.filter((t) => t.enabled).map((t) => t.targetKey);
      const failing = this.matomoRows.filter((r) => keys.includes(r.key) && r.outcome === 'down');
      if (!failing.length) {
        return '';
      }
      const names = listOf(failing.map((r) => r.label), this.config.language);
      // 3a: every one of them only from the Matomo server, while the outside reaches it (one rule
      // with the rows, sides.ts serverOnlyDown)
      const side = this.outside && failing.every((r) => r.serverOnlyDown) ? 'FromServer' : '';
      return translate(`FeinwerkUptimeMonitor_UiContainerDown${failing.length === 1 ? 'One' : 'Many'}${
        side}`, names);
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
    /** B5: of those this server cannot reach, the ones the outside cannot check either */
    notCheckableOutsideToo(): Row[] {
      return this.notCheckableRows.filter((r) => !r.tooLarge && !!r.outside
        && r.outside.outcome === 'not_checkable');
    },
    /** B5, L8 review 7: no side can check any of them (the answer line says so too) */
    notCheckableEither(): boolean {
      const unreached = this.notCheckableRows.filter((r) => !r.tooLarge);
      return unreached.length > 0 && this.notCheckableOutsideToo.length === unreached.length;
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
        // B5: the outside's reasons for those it cannot check either
        if (this.notCheckableOutsideToo.length) {
          parts.push(translate('FeinwerkUptimeMonitor_UiNotCheckableOutsideHelp'));
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
     * this server"; while results from outside show, "from the Matomo server" (follow-up W2)
     */
    notCheckableText(): string {
      const anywhere = !this.notCheckableUnreached;
      // B5: no side can check them: both named, as in the answer line
      const side = this.showOutside ? 'FromServer' : '';
      let keys = [`UiNotCheckableOne${side}`, `UiNotCheckableMany${side}`];
      if (anywhere) {
        keys = ['UiCannotCheckOne', 'UiCannotCheckMany'];
      } else if (this.notCheckableEither) {
        keys = ['UiCannotCheckEitherOne', 'UiCannotCheckEitherMany'];
      }
      return this.notCheckableCount === 1
        ? translate(`FeinwerkUptimeMonitor_${keys[0]}`)
        : translate(`FeinwerkUptimeMonitor_${keys[1]}`, String(this.notCheckableCount));
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
      // L8 review of 5.3.0: without the outages open now nothing reads as one-sided (fail closed)
      let openFailed = false;
      const noneOpen = () => {
        openFailed = true;
        return [] as Incident[];
      };
      // outages from outside only while their source delivers (B10): else the page as before
      const source = this.incidentSource;
      // review of the 5.3.0 fixes, SHOULD 1: with results from outside also the outages ended since
      // yesterday (the one-sided rule); a list cut at the limit is not known either. Without a
      // source the request for the outages open now, as before
      const current = (id: number, timezoneOf: number) => (this.outside
        ? api.recentIncidents(id, timezoneOf).then((list) => {
          if (list.length >= RECENT_LIMIT) {
            openFailed = true;
          }
          return list;
        })
        : api.openIncidents(id, timezoneOf, source)).catch(noneOpen);
      if (this.showMatomo) {
        requests.push(api.status(0).then((s) => { this.matomo = s; }));
        requests.push(api.uptime(0, period, idSite).then((r) => { this.matomoUptimeRows = r; }));
        requests.push(this.loadSeries(period));
        // the strip is an addition: without it the page still answers
        requests.push(api.timeline(idSite, period, 'matomo').catch(() => null)
          .then((t) => { this.matomoTimeline = t; }));
        // B4: the widgets too, for their strip and uptime from both sides
        if (this.outside) {
          requests.push(api.timeline(idSite, period, 'matomo', 'external').catch(() => null)
            .then((t) => { this.matomoOutsideTimeline = t; }));
        }
        open.push(current(0, idSite));
      }
      // the website's targets also for the Matomo widget: its containers belong to Matomo's group
      if (this.showSite) {
        requests.push(api.status(idSite).then((s) => { this.site = s; }));
        requests.push(api.uptime(idSite, period).then((r) => { this.siteUptimeRows = r; }));
        open.push(current(idSite, 0));
      } else if (this.showMatomo && idSite > 0) {
        // the Matomo widget: the website's containers are an addition, a failure leaves the rest
        requests.push(api.status(idSite).then((s) => { this.site = s; }).catch(() => undefined));
        requests.push(api.uptime(idSite, period).then((r) => { this.siteUptimeRows = r; })
          .catch(() => undefined));
        open.push(current(idSite, 0));
      }
      if (this.showSite) {
        requests.push(api.timeline(idSite, period, 'website').catch(() => null)
          .then((t) => { this.siteTimeline = t; }));
        if (this.outside) {
          requests.push(api.timeline(idSite, period, 'website', 'external').catch(() => null)
            .then((t) => { this.siteOutsideTimeline = t; }));
        }
      }
      requests.push(Promise.all(open).then((lists) => {
        this.openIncidents = ([] as Incident[]).concat(...lists);
        this.openFailed = openFailed;
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
      const source = this.incidentSource;
      const matomoIncidents = this.showMatomo
        ? api.incidents(0, period, idSite, limit, source)
        : Promise.resolve([] as Incident[]);
      return Promise.all([api.incidents(idSite, period, 0, limit, source), matomoIncidents])
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
    /**
     * One address of a group; sides: the group shows results from outside (B1), so the address has
     * its outside side. On a screen with results from outside the server's words are short ("Not
     * checkable") and the cells name the side where needed (P2, sides.ts)
     */
    row(target: TargetStatus, uptimeRows: UptimeRow[], sides = false): Row {
      const of = (source: string) => uptimeRows.find((r) => r.targetKey === target.targetKey
        && r.source === source);
      // an address this server never checks: not checkable before its first check too (no time)
      const local = target.states.local || (target.serverRefuses ? REFUSED : undefined);
      const twoSided = this.showOutside;
      const server = this.vantage(local, of('local'), twoSided);
      const outside = sides ? this.vantage(target.states.external, of('external'), true, true) : null;
      // an address the outside cannot check (a private address, a port it does not check) adds
      // nothing to the dot, the answer and the freshness; its cell still says so
      const counted = outside && outside.outcome !== 'not_checkable' ? outside : null;
      const outcome = combined(server.outcome, outside ? outside.outcome : null);
      // L8 review of 5.3.0: each side's outage open for the address and since when (sides.ts
      // aloneDown); not known when they could not be loaded
      const outages = (external: boolean) => this.openIncidents
        .filter((i) => i.type === 'outage' && i.targetKey === target.targetKey
          && (i.source === 'external') === external);
      const opened = (external: boolean) => outages(external).filter((i) => i.open)
        .map((i) => i.start)
        .sort();
      // review of the 5.3.0 fixes: the end of each side's latest ended outage (SHOULD 1) and the
      // server's margin (SHOULD 2)
      const ended = (external: boolean) => outages(external)
        .map((i) => (i.open ? '' : i.end || ''))
        .sort()
        .pop() || '';
      const margin = this.config.external && typeof this.config.external.sidesMargin === 'number'
        ? this.config.external.sidesMargin : SIDES_MARGIN_SECONDS;
      const known = !this.openFailed;
      const serverOpen = opened(false);
      const serverSide: Side = {
        key: 'server',
        outcome: server.outcome,
        text: server.text,
        uptime: server.uptime,
        percent: of('local')?.uptimePercent ?? null,
        tooLarge: server.tooLarge,
        checkedAt: server.checkedAt,
        downSince: serverOpen.length ? serverOpen[0] : '',
        outageOpen: known ? serverOpen.length > 0 : undefined,
        outageEnd: ended(false),
        margin,
      };
      const outsideOpen = opened(true);
      const outsideSide: Side | null = outside ? {
        key: 'outside',
        outcome: outside.outcome,
        text: outside.text,
        uptime: outside.uptime,
        percent: of('external')?.uptimePercent ?? null,
        title: outside.title,
        checkedAt: outside.checkedAt,
        downSince: outsideOpen.length ? outsideOpen[0] : '',
        outageOpen: known ? outsideOpen.length > 0 : undefined,
        outageEnd: ended(true),
        margin,
      } : null;
      // L8 review 8: a past day's dot follows that day's results from outside whenever there are
      // any, also when the outside cannot check the address now
      const day = outside && outside.dayOutcome !== 'none' ? outside : null;
      let { dayOutcome } = server;
      if (day && (server.dayOutcome === 'partial' || day.dayOutcome === 'partial')) {
        dayOutcome = 'partial';
      } else if (day && day.dayOutcome === 'up') {
        dayOutcome = 'up';
      }
      return {
        key: target.targetKey,
        label: targetLabel(target),
        outcome,
        // 3a: down only from the Matomo server while the outside reaches it: amber, still down
        tone: toneOf(serverSide, outsideSide),
        serverOnlyDown: serverOnlyDown(serverSide, outsideSide),
        // one line's words; with results from outside the first line of the cell (P2)
        text: twoSided ? responseLines(serverSide, outsideSide)[0].text : server.text,
        title: target.url || targetLabel(target),
        uptime: server.uptime,
        cert: target.certificate ? this.certText(target.certificate) : '',
        certLevel: target.certificate ? target.certificate.level : '',
        certDays: target.certificate ? target.certificate.daysLeft : null,
        // the newer of the two sides' current results
        checkedAt: [server.checkedAt, counted ? counted.checkedAt : ''].sort().pop() || '',
        host: hostOf(target.url),
        // D1: a past day's dot follows that day's uptime: all of it, part of it, nothing measured
        dayOutcome,
        tooLarge: server.tooLarge,
        serverOutcome: server.outcome,
        cause: this.causeOf(serverSide, counted ? outsideSide : null),
        server: serverSide,
        outside: outsideSide,
      };
    },
    /**
     * One side of an address: its current state in a few words and its uptime in the period.
     * short: both sides show (their headings say from where); fromOutside: the outside's side
     */
    vantage(
      state: TargetState | undefined,
      uptime: UptimeRow | undefined,
      short = false,
      fromOutside = false,
    ): Vantage {
      const { language, timezone } = this.config;
      let outcome = state ? state.outcome : 'none';
      let text = '';
      let title = '';
      if (!state) {
        // B2: no result from outside may never come (a limit, an address it skips): not "yet"
        text = translate(fromOutside ? 'FeinwerkUptimeMonitor_UiNotChecked'
          : 'FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = translate('FeinwerkUptimeMonitor_UiNoRecentCheck',
          dateTime(state.checkedAt, language, timezone || ''));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, language);
      } else if (state.outcome === 'not_checkable') {
        // D2 (final review): a container larger than 4 MB says so in a few words
        // both sides shown: their headings say from where, the cell says it in two words
        let words = translate(short ? 'FeinwerkUptimeMonitor_UiNotCheckableShort'
          : 'FeinwerkUptimeMonitor_UiNotCheckable');
        if (state.note === 'too_large') {
          // UI review of 5.3.0, L3: "(over 4 MB)" stays whole
          words = keepBrackets(keepUnits(translate('FeinwerkUptimeMonitor_UiTooLargeToCheck')));
        }
        text = words;
        if (fromOutside) {
          title = this.outsideReason(state);
        }
      } else {
        text = causeText(state.error, state.httpStatus !== null ? `HTTP ${state.httpStatus}` : null);
      }
      const measured = !!uptime && uptime.uptimePercent !== null && uptime.coveragePercent > 0;
      let dayOutcome = 'none';
      if (measured) {
        dayOutcome = (uptime?.uptimePercent ?? 0) >= 100 ? 'up' : 'partial';
      }
      return {
        outcome,
        text,
        uptime: uptime && uptime.uptimePercent !== null
          ? percent(uptime.uptimePercent, language, 2) : '',
        dayOutcome,
        checkedAt: state && !state.stale ? state.checkedAt : '',
        tooLarge: !!state && !state.stale && state.outcome === 'not_checkable'
          && state.note === 'too_large',
        title,
      };
    },
    /** B5: "Not checkable from outside: a private or reserved address, or a port ..." */
    outsideReason(state: TargetState): string {
      const key = state.error ? OUTSIDE_REASONS[state.error] : undefined;
      const reason = key ? translate(`FeinwerkUptimeMonitor_${key}`) : causeText(state.error, null);
      return reason
        ? translate('FeinwerkUptimeMonitor_UiNotCheckableFromOutsideWhy', reason)
        : translate('FeinwerkUptimeMonitor_UiNotCheckableFromOutside');
    },
    /**
     * B1: what a group has from outside (only while a source of such results is active): a strip
     * when the outside measured some of the period; its cells when it has any result for one of
     * its addresses (also that it cannot check it), an uptime in the period or a strip
     */
    outsideOf(targets: TargetStatus[], uptimeRows: UptimeRow[], timeline: Timeline | null):
      GroupOutside {
      if (!this.outside) {
        return { cells: false, strip: false };
      }
      const strip = !!timeline && timeline.cells.some((c) => c.state !== 'future'
        && c.measuredSeconds > 0);
      const keys = targets.map((t) => t.targetKey);
      const cells = strip || targets.some((t) => !!t.states.external)
        || uptimeRows.some((r) => r.source === 'external' && keys.includes(r.targetKey)
          && r.uptimePercent !== null && r.coveragePercent > 0);
      return { cells, strip };
    },
    /**
     * B2: "from outside", or "from outside, 1 of 4 addresses" when it covers less than the server;
     * short: the lane's label, "from outside (1 of 4)", its brackets kept together (W7)
     */
    outsideVantage(rows: Row[], short = false): string {
      const outside = this.measurableCount(rows, 'external');
      if (rows.length > 1 && outside < this.measurableCount(rows, 'local')) {
        if (short) {
          return keepBrackets(translate('FeinwerkUptimeMonitor_UiFromOutsideShare', String(outside),
            String(rows.length)));
        }
        return translate('FeinwerkUptimeMonitor_UiFromOutsidePart', String(outside),
          String(rows.length));
      }
      return translate('FeinwerkUptimeMonitor_UiFromOutside');
    },
    /**
     * What failed, for the answer line: the server's words; with results from outside, where it
     * failed when one side alone finds the address down ("HTTP 502, from outside"; L8 review of
     * 5.3.0: by sides.ts aloneDown, so no side is named while the other has not checked it since
     * the failure began or still sees an outage of its own)
     */
    causeOf(server: Side, outside: Side | null): string {
      if (!outside || server.outcome === 'down') {
        return outside && aloneDown(server, outside)
          ? `${server.text}, ${translate('FeinwerkUptimeMonitor_UiFromServer')}` : server.text;
      }
      if (outside.outcome !== 'down') {
        return server.text;
      }
      return aloneDown(outside, server)
        ? `${outside.text}, ${translate('FeinwerkUptimeMonitor_UiFromOutside')}` : outside.text;
    },
    /**
     * D2 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): the sides of a table row
     * they disagree on, in order, for its sub-rows (sides.ts split, the narrow list's rule); null
     * where one line says it all
     */
    splitOf(row: Row): Side[] | null {
      return this.showOutside && row.outside ? split(row.server, row.outside, !!this.past) : null;
    },
    /** D2: a sub-row's name, "Matomo server" or "Outside" (the server's name whole, W8) */
    sideName(side: Side): string {
      return keepServer(translate(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiSourceServer'
        : 'FeinwerkUptimeMonitor_UiSourceOutside'));
    },
    /** D2: a sub-row's uptime; "Not measured" on a past day where nothing was */
    subUptime(side: Side): string {
      return side.uptime || (this.past ? translate('FeinwerkUptimeMonitor_UiNotMeasured') : '');
    },
    /** D2 with NIT 3: the outside's words only while it has a current answer */
    hasWords(side: Side): boolean {
      return side.key === 'server' || speaks(side);
    },
    /**
     * D2: a sub-row's response in red for a failure, amber for 3a; muted for a side's "up" that
     * the one-sided rule does not count (quick UI review before 5.3.0, QL2); '' otherwise
     */
    failureTone(side: Side, row: Row): string {
      const other = side.key === 'server' ? row.outside : row.server;
      const tone = sideTone(side, other);
      if (tone === 'down' || tone === 'partial') {
        return `is-${tone}`;
      }
      return uncounted(side, other) ? 'fwum-line--muted' : '';
    },
    /** P2: the Response cell's lines (sides.ts) */
    responseLinesOf(row: Row): Line[] {
      return responseLines(row.server, row.outside);
    },
    /** W5: an agreeing row's value from outside, for screen readers (sides.ts aside) */
    asideOf(row: Row): string {
      return aside(row.server, row.outside);
    },
    /** one strip's HourStrip (a row, or a pair's strip on a narrow page: D2) */
    stripProps(strip: Strip): Record<string, unknown> {
      return {
        cells: strip.timeline.cells,
        grain: strip.timeline.grain,
        days: strip.timeline.days || '',
        name: strip.label,
        language: this.config.language,
        timezone: this.config.timezone || '',
        targets: strip.targets,
        small: !this.isPage,
        lane: strip.lane,
        axis: strip.axis,
        now: this.tick,
      };
    },
    /** P2: the Uptime cell's lines (sides.ts) */
    uptimeLinesOf(row: Row): Line[] {
      return uptimeLines(row.server, row.outside, !!this.past);
    },
    /**
     * P2: what each side says, as the Response cell's tooltip (the detail one line leaves out); the
     * outside's reason when it cannot check the address (B5)
     */
    responseTitle(row: Row): string | undefined {
      if (!row.outside) {
        return undefined;
      }
      const outside = row.outside.outcome === 'not_checkable' && row.outside.title
        ? row.outside.title
        : translate('FeinwerkUptimeMonitor_UiCheckedFromOutsideValue', row.outside.text);
      return `${translate('FeinwerkUptimeMonitor_UiCheckedFromServerValue', row.server.text)}\n${outside}`;
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
     * (format.ts sidedStatusOf, the same rule as the admin overview).
     */
    groupState(rows: Row[], allOff: boolean): State {
      if (!rows.length) {
        return allOff
          ? { outcome: 'off', text: translate('FeinwerkUptimeMonitor_UiAllOff') }
          : { outcome: 'none', text: translate('FeinwerkUptimeMonitor_UiNotMeasuredYet') };
      }
      const count = (outcome: string) => rows.filter((r) => r.outcome === outcome).length;
      // 3a: every address that is down only from the Matomo server, while the outside reaches it:
      // amber, "not reachable from the Matomo server"; the answer line's cause names the side else
      // W2: while results from outside show, "Not checkable from the Matomo server", as the cells
      const state = sidedStatusOf({
        total: rows.length,
        off: 0,
        up: count('up'),
        down: count('down'),
        stale: count('stale'),
        notCheckable: count('not_checkable'),
      }, rows.filter((r) => r.serverOnlyDown).length, 0, this.showOutside);
      // neither side can check any of them: both named in one sentence (not when the outside has
      // no result yet or an old one)
      if (state.outcome === 'not_checkable' && this.showOutside
        && rows.every((r) => r.outcome !== 'not_checkable'
          || (!!r.outside && r.outside.outcome === 'not_checkable'))) {
        return { outcome: state.outcome, text: translate('FeinwerkUptimeMonitor_UiNotCheckableEither') };
      }
      return state;
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
      // 3a: when every one of them fails only from the Matomo server, the line before names the
      // side
      const cause = down.every((r) => r.serverOnlyDown) ? down[0].server.text
        : (down[0].cause ?? down[0].text);
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
    uptimeOf(
      rows: Row[],
      uptimeRows: UptimeRow[],
      timeline: Timeline | null,
      source: 'local' | 'external' = 'local',
    ): Uptime | null {
      const { language } = this.config;
      if (timeline && timeline.cells.length) {
        const totals = stripTotals(timeline, this.tick, this.measurable(rows, source));
        if (totals.uptime === null) {
          return null;
        }
        return {
          value: percent(totals.uptime, language, 2),
          sub: translate('FeinwerkUptimeMonitor_UiMeasured', sharePercent(totals.measured, language)),
          level: '',
          measured: totals.measured,
          uptime: totals.uptime,
        };
      }
      const keys = rows.map((r) => r.key);
      const own = uptimeRows.filter((r) => r.source === source && keys.includes(r.targetKey));
      const measured = own.filter((r) => r.uptimePercent !== null && r.coveragePercent > 0);
      if (!measured.length) {
        return null;
      }
      const weight = measured.reduce((sum, r) => sum + r.coveragePercent, 0);
      const up = measured.reduce((sum, r) => sum + (r.uptimePercent ?? 0) * r.coveragePercent, 0);
      // measured as the strip counts a cell: when any of the addresses was measured (an
      // address that cannot be checked from this server adds nothing)
      const coverage = Math.max(...own.map((r) => r.coveragePercent));
      const value = Math.round((up / weight) * 1000) / 1000;
      return {
        value: percent(value, language, 2),
        sub: translate('FeinwerkUptimeMonitor_UiMeasured', sharePercent(coverage, language)),
        level: '',
        measured: coverage,
        uptime: value,
      };
    },
    /**
     * B4: a group's uptime figure: the server's, or the outside's when the group has results from
     * outside and that side is lower (or the only one), named "from outside"
     */
    lowerUptime(
      rows: Row[],
      uptimeRows: UptimeRow[],
      timelines: [Timeline | null, Timeline | null],
      outside: GroupOutside,
    ): (Uptime & { side: string }) | null {
      const server = this.uptimeOf(rows, uptimeRows, timelines[0]);
      const other = outside.cells
        ? this.uptimeOf(rows, uptimeRows, outside.strip ? timelines[1] : null, 'external') : null;
      if (other && (!server || other.uptime < server.uptime)) {
        return { ...other, side: translate('FeinwerkUptimeMonitor_UiFromOutside') };
      }
      return server ? { ...server, side: '' } : null;
    },
    /**
     * the addresses a strip cell sums: those this server cannot check measure nothing; from
     * outside, those checked from outside that can be checked
     */
    measurable(rows: Row[], source: 'local' | 'external' = 'local'): number {
      return Math.max(1, this.measurableCount(rows, source));
    },
    /**
     * measurable() without its floor of 1: from outside, the addresses with a result it can check
     * now, and on a past day those with an uptime that day (today an address the outside stopped
     * checking has hours earlier today, but no longer counts: L8 review 1). Today without any such
     * result (the outside stopped checking all of them), those with an uptime today: never "0 of 2
     * addresses" next to a measured lane (review of the 5.2.0 fixes, NIT 2)
     */
    measurableCount(rows: Row[], source: 'local' | 'external'): number {
      if (source === 'external') {
        const current = (r: Row) => !!r.outside && r.outside.outcome !== 'none'
          && r.outside.outcome !== 'not_checkable';
        const measured = (r: Row) => !!r.outside && r.outside.uptime !== '';
        if (this.past) {
          return rows.filter((r) => current(r) || measured(r)).length;
        }
        const now = rows.filter(current).length;
        return now > 0 ? now : rows.filter(measured).length;
      }
      return rows.filter((r) => (r.serverOutcome || r.outcome) !== 'not_checkable').length;
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
      // in the order of the outage list's row (OutageList what()): by kind, then key
      outages.filter((i, n, all) => all.findIndex((o) => o.targetKey === i.targetKey) === n)
        .sort((a, b) => KIND_ORDER.indexOf(a.kind || '') - KIND_ORDER.indexOf(b.kind || '')
          || (a.targetKey || '').localeCompare(b.targetKey || ''))
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
      // French puts a (no-break) space before the semicolon
      return parts.join(language.startsWith('fr') ? '\u00a0; ' : '; ');
    },
  },
});
</script>
