// Behaviour checks of the uptime page's Vue app as built (vue/dist/FeinwerkUptimeMonitor.umd.js), mounted with Matomo's
// Vue and a stand-in for CoreHome (translate from lang/en.json, the URL, AjaxHelper answering from fixtures): the answer
// for a past day and for now (5.1.5 review D1, D2), outage totals inside a period (F1), a day without measurements (D4),
// the certificate figure (D3), the reasons for what cannot be checked (item 7), the dashboard card's one place and the
// card itself (items 4, 5, 6 of the code review), results checked from outside next to the server's (B10), and the
// admin overview's fold line and alert row with results checked from outside (F2, alert row). The clock is
// pinned to NOW. Run it with tests/js/run-uptimepage-check.sh,
// which puts Vue, the bundle, the English texts and the kit's promocard.js in as VUE, UMD, EN and KIT and starts it
// through the devtools' browser runner (fw_browser_run). Exit 1 on a failure.
const { chromium } = require(process.env.FW_SANDBOX_PLAYWRIGHT);

const ORIGIN = 'http://fwum.test/';
const NOW = '2026-11-26T10:00:00Z';

let failures = 0;
function check(name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
        failures++;
    }
    console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected)));
}

/** Runs in the page before the bundle: CoreHome, the API fixtures, mount() and summary(). */
function pageSetup(en, nowIso) {
    const NOW_MS = Date.parse(nowIso);
    const texts = JSON.parse(en).FeinwerkUptimeMonitor;
    const parsed = { value: { period: 'day', date: 'today' } };

    function translate(key, ...args) {
        const values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const name = key.replace(/^FeinwerkUptimeMonitor_/, '');
        if (!(name in texts)) {
            return key;
        }
        let next = 0;
        return texts[name]
            .replace(/%(\d+)\$s/g, (m, n) => String(values[Number(n) - 1]))
            .replace(/%s/g, () => String(values[next++]));
    }

    const day = (iso) => iso.slice(0, 10);
    /** the period's UTC range as the API's range() makes it for a website in UTC, cut at now */
    function range(period, date) {
        const today = day(nowIso);
        // review of the 5.3.0 fixes, SHOULD 1: period range, date lastN (today and the N - 1 days before it)
        const last = period === 'range' ? /^last(\d+)$/.exec(date) : null;
        if (last) {
            const first = Date.parse(today + 'T00:00:00Z') - (Number(last[1]) - 1) * 86400000;
            return { from: first, to: NOW_MS };
        }
        const resolved = date === 'today' ? today : (date === 'yesterday'
            ? new Date(Date.parse(today + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10) : date);
        const from = Date.parse(resolved + 'T00:00:00Z');
        const length = period === 'week' ? 7 : 1;
        return { from, to: Math.min(from + length * 86400000, NOW_MS) };
    }
    const iso = (ms) => new Date(ms).toISOString().replace('.000Z', 'Z');

    /** getIncidents as the API answers it: overlapping the period, newest first, with the part inside the period */
    function incidents(scenario, params) {
        const { from, to } = range(params.period, params.date);
        const wanted = Number(params.idSite);
        return (scenario.incidents || [])
            .filter((i) => i.idSite === wanted)
            .filter((i) => !params.source || params.source === 'all' || (i.source || 'local') === params.source)
            .filter((i) => Date.parse(i.start) < to && (i.end === null || Date.parse(i.end) >= from))
            .filter((i) => params.state !== 'open' || i.end === null)
            .filter((i) => params.state !== 'closed' || i.end !== null)
            .sort((a, b) => b.start.localeCompare(a.start))
            .slice(0, Number(params.limit) || 100)
            .map((i, n) => {
                const start = Date.parse(i.start);
                const end = i.end === null ? NOW_MS : Date.parse(i.end);
                const begin = Math.max(start, from);
                return {
                    idIncident: n + 1, type: 'outage', targetKey: i.targetKey, kind: i.kind, source: i.source || 'local',
                    start: i.start, end: i.end, durationSeconds: (end - start) / 1000, startInPeriod: iso(begin),
                    durationInPeriodSeconds: Math.max(0, (Math.min(end, to, NOW_MS) - begin) / 1000), open: i.end === null,
                    cause: i.cause || 'timeout', detail: i.detail || null, failedChecks: 2,
                };
            });
    }

    /** a day's hour strip: every address of the group measured (all up) up to now, or nothing measured */
    function timeline(scenario, params) {
        const { from } = range(params.period, params.date);
        // from outside (B10): measured only where the scenario says so, for every group (true) or per group
        // ({matomo: true, website: false}, 5.2.0 review B1)
        const om = scenario.outsideMeasured;
        const outside = params.source === 'external';
        const measured = outside ? (om !== null && typeof om === 'object' ? !!om[params.group] : om === true) : scenario.measured !== false;
        // B4: hours (UTC) in which every address of the group was down from outside
        const downHours = outside ? ((scenario.outsideDown || {})[params.group] || []) : [];
        const status = scenario.status || {};
        const site = status[1] || [];
        const count = Math.max(1, params.group === 'matomo'
            ? (status[0] || []).length + site.filter((t) => t.kind === 'container').length
            : site.filter((t) => t.kind !== 'container').length);
        // review of the 5.4.0 fixes: the cells as the API sends them around a clock change (their starts and the end of
        // the last one), every address measured and up, the last cell without gap seconds
        if (scenario.cellsAt && !outside) {
            const at = scenario.cellsAt;
            const starts = at.starts.map((t) => Date.parse(t));
            const cellsAt = starts.map((t, i) => {
                const last = i === starts.length - 1;
                const length = ((last ? Date.parse(at.end) : starts[i + 1]) - t) / 1000;
                const m = (length - (last ? at.gap || 0 : 0)) * count;
                return { time: iso(t), measuredSeconds: m, upSeconds: m, state: 'up' };
            });
            return { grain: at.grain, days: at.grain === 'day' ? 'local' : null, cells: cellsAt, end: at.end, firstMeasured: '2026-01-01T00:00:00Z' };
        }
        const seconds = measured ? 3600 * count : 0;
        const cells = [];
        for (let h = 0; h < 24; h++) {
            const t = from + h * 3600000;
            const future = t >= NOW_MS;
            const down = downHours.includes(h);
            cells.push({
                time: iso(t), measuredSeconds: future ? 0 : seconds, upSeconds: future || down ? 0 : seconds,
                state: future ? 'future' : (measured ? (down ? 'down' : 'up') : 'none'),
            });
        }
        // the first measured hour of the group, at any time (API getTimeline firstMeasured)
        const first = scenario.firstMeasured !== undefined ? scenario.firstMeasured : (measured ? '2026-11-01T08:00:00Z' : null);
        return { grain: 'hour', days: null, cells, firstMeasured: first };
    }

    function answer(scenario, params) {
        const method = params.method.replace('FeinwerkUptimeMonitor.', '');
        const id = Number(params.idSite);
        if ((scenario.fail || []).includes(method)) {
            return Promise.reject(new Error('Something went wrong'));
        }
        // L8 review of 5.3.0: only the request for the outages open now (since the review of its fixes: open now or
        // ended since yesterday, period range, date last2) fails
        if (scenario.failOpen && method === 'getIncidents' && (params.state === 'open' || params.date === 'last2')) {
            return Promise.reject(new Error('Something went wrong'));
        }
        const copy = (value) => Promise.resolve(JSON.parse(JSON.stringify(value)));
        switch (method) {
            case 'getStatus':
                return copy({ targets: (scenario.status || {})[id] || [], processing: null,
                    disabledPhpFunctions: scenario.disabledPhpFunctions || [], curlExtensionMissing: !!scenario.curlMissing });
            case 'getUptime':
                return copy((scenario.uptime || {})[id] || []);
            case 'getResponseTimes':
                return copy([]);
            case 'getIncidents':
                return copy(incidents(scenario, params));
            case 'getTimeline':
                return copy(timeline(scenario, params));
            case 'getSitesOverview':
                return copy(scenario.overview || []);
            // UI review of 5.4.0, L9: the target panel's list (empty unless the scenario names one)
            case 'getTargets':
                return copy(scenario.targets || { targets: [], suggestions: [] });
            default:
                return Promise.reject(new Error('no fixture for ' + method));
        }
    }

    window.fwumScenarios = {};
    window.CoreHome = {
        translate,
        MatomoUrl: { parsed, stringify: (o) => new URLSearchParams(o).toString() },
        AjaxHelper: {
            fetch(params) {
                // review of the 5.3.0 fixes: the outage requests as made (without a source they stay as they were)
                if (params.method === 'FeinwerkUptimeMonitor.getIncidents') {
                    window.fwumRequests.push({ idSite: params.idSite, period: params.period, date: params.date, state: params.state,
                        limit: params.limit, source: params.source });
                }
                return answer(window.fwumScenarios[params.idSite > 0 ? 'site' : 'matomo'] || window.fwumScenario, params);
            },
        },
        ContentBlock: { props: ['contentTitle'], render() { return window.Vue.h('div', this.$slots.default ? this.$slots.default() : []); } },
    };

    /** Mounts the page or a widget into the element (or a new one of the given width); resolves when it has loaded. */
    window.fwumRequests = [];
    window.fwumMount = function (scenario, element) {
        window.fwumScenario = scenario;
        window.fwumRequests = [];
        parsed.value = { period: scenario.period || 'day', date: scenario.date || 'today' };
        let host = element;
        if (!host) {
            host = document.createElement('div');
            host.style.width = (scenario.width || 1000) + 'px';
            document.body.appendChild(host);
        }
        const config = window.Vue.reactive(Object.assign({
            idSite: 1, variant: 'page', isSuperUser: true, isAdmin: true, language: 'en', queuedTracking: false,
            sentinel: 'absent', allowPrivate: false, embedded: false, feedback: null, siteName: 'Shop', timezone: 'UTC',
            isAnonymous: false, promo: null, promoCard: null,
        }, scenario.config || {}));
        const app = window.Vue.createApp({ render: () => window.Vue.h(window.FeinwerkUptimeMonitor.UptimePage, { config }) });
        app.mount(host);
        const root = host.querySelector('.fwum-page');
        return new Promise((resolve) => {
            const started = Date.now();
            const wait = () => {
                const busy = root.querySelector('.fwum-loading');
                if (!busy || Date.now() - started > 3000) {
                    // two frames: the narrow observer and the card place have answered
                    requestAnimationFrame(() => requestAnimationFrame(() => resolve({ root, config, app, host })));
                } else {
                    setTimeout(wait, 10);
                }
            };
            setTimeout(wait, 0);
        });
    };

    /** Mounts the admin page (Administration > Diagnostic > Uptime Monitor); resolves when its overview has loaded. */
    window.fwumMountAdmin = function (scenario) {
        window.fwumScenario = scenario;
        const host = document.createElement('div');
        host.style.width = (scenario.width || 1000) + 'px';
        document.body.appendChild(host);
        const config = window.Vue.reactive(Object.assign({
            idSite: 0, variant: 'admin', isSuperUser: true, isAdmin: false, language: 'en', sentinel: 'absent',
            sentinelVersion: null, sentinelSettings: 'index.php?module=FeinwerkSentinel&action=index&tab=instance',
            allowPrivate: false, cron: { active: true, intervalSeconds: 60 }, cronLine: '* * * * * php console',
            external: null, timezone: 'UTC', siteName: 'Matomo',
        }, scenario.config || {}));
        window.Vue.createApp({ render: () => window.Vue.h(window.FeinwerkUptimeMonitor.AdminPage, { config }) }).mount(host);
        const root = host.querySelector('.fwum-admin');
        return new Promise((resolve) => {
            const started = Date.now();
            const wait = () => {
                if (!root.querySelector('.fwum-loading') || Date.now() - started > 3000) {
                    requestAnimationFrame(() => requestAnimationFrame(() => resolve(root)));
                } else {
                    setTimeout(wait, 10);
                }
            };
            setTimeout(wait, 0);
        });
    };

    /** the text as read: elements apart by a space (the stylesheet's margins), an address whole (its <wbr>s) */
    function words(node) {
        if (node.nodeType === 3) {
            return node.textContent;
        }
        if (node.nodeType !== 1 || node.tagName === 'WBR') {
            return '';
        }
        if (node.classList.contains('fwum-targets__label')) {
            return node.textContent;
        }
        return Array.from(node.childNodes).map(words).join(' ');
    }
    const clean = (node) => (node ? words(node).replace(/\s+/g, ' ').trim() : null);
    const shown = (node) => {
        const copy = node.cloneNode(true);
        copy.querySelectorAll('.fwum-sr, .fwum-outages__narrow').forEach((e) => e.remove());
        return clean(copy);
    };
    window.fwumAdminSummary = function (root) {
        // the status rows by their role (P4 puts the row from outside right under the cron row)
        const alert = root.querySelector('.fwum-checks > li.fwum-checks__alerts');
        return {
            intro: clean(root.querySelector('.fwum-admin > div > p')),
            fold: clean(root.querySelector('.fwum-nc > p')),
            rows: Array.from(root.querySelectorAll('.fwum-admin__table tbody tr')).map((tr) => [clean(tr.children[0]), clean(tr.children[1])]),
            statusClasses: Array.from(root.querySelectorAll('.fwum-admin__table td.fwum-admin__status')).map((td) => Array.from(td.classList)
                .filter((c) => c.indexOf('is-') === 0).join(' ')),
            order: Array.from(root.querySelectorAll('.fwum-checks > li')).map((li) => (Array.from(li.classList)
                .find((c) => c.indexOf('fwum-checks__') === 0) || '').replace('fwum-checks__', '')),
            alertClass: alert ? Array.from(alert.classList).filter((c) => c.indexOf('is-') === 0).join(' ') : null,
            alertLines: alert ? Array.from(alert.querySelectorAll('p')).map(clean) : [],
            outsideRow: clean(root.querySelector('.fwum-checks > li.fwum-checks__outside')),
            // as the page reads it: the spaces between its sentences and the link are real text
            outsideRowRaw: (() => { const li = root.querySelector('.fwum-checks > li.fwum-checks__outside');
                return li ? li.textContent.replace(/\s+/g, ' ').trim() : null; })(),
            why: (() => { const w = root.querySelector('.fwum-nc__why'); return w ? w.textContent.trim() : null; })(),
            // 5.3.1: the reason when the server's PHP disables functions the checks need, and the fold's buttons and links
            php: Array.from(root.querySelectorAll('.fwum-admin__php p')).map(clean),
            foldControls: Array.from(root.querySelectorAll('.fwum-nc > p button, .fwum-nc > p a')).map(clean),
            // robustness release, part 1: Matomo's internet features off, and Matomo's address stored as http
            internet: Array.from(root.querySelectorAll('.fwum-admin__internet p')).map(clean),
            // robustness release, part 2: how the checks are sent when it is not curl_multi (an info row)
            transport: Array.from(root.querySelectorAll('.fwum-admin__transport p')).map(clean),
            transportClass: (() => { const li = root.querySelector('li.fwum-admin__transport'); return li ? Array.from(li.classList)
                .filter((c) => c.indexOf('is-') === 0).join(' ') + ' ' + li.querySelector('[class^="icon-"]').className : null; })(),
            https: Array.from(root.querySelectorAll('.fwum-admin__https p')).map(clean),
            // UI review of 5.4.0, B4: the https hint in the info style, not the warning one (P2: the class of its row)
            httpsClass: (() => { const li = root.querySelector('li.fwum-admin__https'); return li ? Array.from(li.classList)
                .filter((c) => c.indexOf('is-') === 0).join(' ') : null; })(),
            // P2 (UI review of 5.4.0): the server rows above the table in one list, each config line a chip with Copy
            checksLists: root.querySelectorAll('ul.fwum-checks').length,
            serverOrder: Array.from(root.querySelectorAll('ul.fwum-admin__server > li')).map((li) => (Array.from(li.classList)
                .find((c) => c.indexOf('fwum-admin__') === 0) || '').replace('fwum-admin__', '')),
            chips: Array.from(root.querySelectorAll('ul.fwum-admin__server .fwum-chip')).map((chip) => [
                (Array.from(chip.closest('li').classList).find((c) => c.indexOf('fwum-admin__') === 0) || '').replace('fwum-admin__', ''),
                chip.querySelector('code').textContent, clean(chip.querySelector('button'))]),
            copyButtons: Array.from(root.querySelectorAll('.fwum-chip button, .fwum-cron button')).map(clean),
            copiedText: window.fwumCopiedText === undefined ? null : window.fwumCopiedText,
            // quick UI review before 5.4.0, L3: each Copy's accessible name, the polite region of each chip, and what that
            // region said during a second click
            copyNames: Array.from(root.querySelectorAll('.fwum-chip button, .fwum-cron button')).map((b) => b.getAttribute('aria-label')),
            copyLive: Array.from(root.querySelectorAll('.fwum-chip, .fwum-cron')).map((chip) => {
                const live = chip.querySelector('[aria-live]'); return live ? [live.getAttribute('aria-live'), live.textContent] : null; }),
            liveSeen: window.fwumLiveSeen === undefined ? null : window.fwumLiveSeen,
            // L6: the tracker address field named and linked as on the settings page
            httpsLink: (() => { const a = root.querySelector('li.fwum-admin__https a'); return a ? [clean(a), a.getAttribute('href')] : null; })(),
            // L8: the cron row while nothing is sent
            cronRow: (() => { const li = root.querySelector('.fwum-checks > li.fwum-checks__cron'); return li ? [Array.from(li.classList)
                .filter((c) => c.indexOf('is-') === 0).join(' '), li.querySelector('[class^="icon-"]').className,
            Array.from(li.querySelectorAll('p')).map(clean)] : null; })(),
            // L9: the target panel's notice
            panelNotice: clean(document.querySelector('.fwum-panel__notice')),
        };
    };
    window.fwumSummary = function (root) {
        const table = root.querySelector('table.fwum-table:not(.fwum-outages__table)');
        const why = root.querySelector('.fwum-nc__why');
        return {
            lines: Array.from(root.querySelectorAll('.fwum-answer__text > p')).map((p) => ({
                cls: Array.from(p.classList).filter((c) => c.indexOf('is-') === 0).join(' '),
                muted: p.classList.contains('fwum-answer__now'),
                text: clean(p),
            })),
            heads: table ? Array.from(table.querySelectorAll('thead th')).map(clean) : null,
            colspans: table ? Array.from(table.querySelectorAll('tr.fwum-group-row th')).map((th) => th.getAttribute('colspan')) : null,
            // as seen: the texts for screen readers apart (follow-up W5 gives agreeing rows one, cellAsides)
            rows: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-group-row):not(.fwum-group-empty):not(.fwum-subrow)'))
                .map((tr) => [tr.className.replace(/ ?fwum-row--split/, '')].concat(Array.from(tr.children).map(shown))) : null,
            // Peter's answer to the 5.3.0 UI review, D2: a row the sides disagree on, then one sub-row per side (the side's
            // name, its plain values; the tone of its response)
            subRows: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow')).map((tr) => Array.from(tr.children).map(shown)) : null,
            subTones: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow td.fwum-targets__text')).map((td) => {
                const line = td.querySelector('.fwum-line'); return line ? Array.from(line.classList).filter((c) => c !== 'fwum-line').join(' ') : null; }) : null,
            subTitles: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow td.fwum-targets__text')).map((td) => td.getAttribute('title')) : null,
            subSidesRaw: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow td.fwum-subrow__side')).map((td) => {
                const copy = td.cloneNode(true); copy.querySelectorAll('.fwum-sr').forEach((e) => e.remove()); return copy.textContent; }) : null,
            // quick UI review before 5.3.0, QL4: what screen readers hear before a sub-row's side
            subSidesSr: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow td.fwum-subrow__side')).map((td) => {
                const sr = td.querySelector('.fwum-sr'); return sr ? sr.textContent.replace(/\s+/g, ' ') : null; }) : null,
            subTextsRaw: table ? Array.from(table.querySelectorAll('tbody tr.fwum-subrow td.fwum-targets__text')).map((td) => td.textContent) : null,
            // D1: each strip's uptime at its end and whether it is the muted one
            stripUptimes: Array.from(root.querySelectorAll('.fwum-strips__uptime')).map((e) => [clean(e.querySelector('.fwum-strips__figure')
                || e.querySelector('strong')), e.classList.contains('fwum-strips__uptime--muted')]),
            // quick UI review before 5.3.0, QB1: the figure's element and its weight as the browser computes it
            stripFigures: Array.from(root.querySelectorAll('.fwum-strips__uptime')).map((e) => {
                const figure = e.querySelector('.fwum-strips__figure') || e.querySelector('strong');
                return [clean(figure), figure.tagName, getComputedStyle(figure).fontWeight];
            }),
            incidentRequests: window.fwumRequests.slice(),
            narrow: Array.from(root.querySelectorAll('.fwum-narrow-list li')).map((li) => [li.className, clean(li)]),
            groupCerts: Array.from(root.querySelectorAll('.fwum-group-head__cert')).map(clean),
            outagesNote: clean(root.querySelector('.fwum-outages > p')),
            figures: Array.from(root.querySelectorAll('.fwum-figures > div')).map((d) => Array.from(d.children)
                .filter((c) => !c.classList.contains('fwum-figures__spark')).map(clean)),
            nc: clean(root.querySelector('.fwum-nc > p')),
            // B10: results checked from outside
            strips: Array.from(root.querySelectorAll('.fwum-strips__name')).map(clean),
            outsideNote: clean(root.querySelector('.fwum-outside-note')),
            outsideLink: (() => { const a = root.querySelector('.fwum-outside-note a'); return a ? a.getAttribute('href') : null; })(),
            listShown: Array.from(root.querySelectorAll('ul.fwum-targets:not(.fwum-outages__list) li')).map(shown),
            // polish before 5.4.0: the tooltips of the list's response words (the reason the answer line names)
            listTitles: Array.from(root.querySelectorAll('ul.fwum-targets:not(.fwum-outages__list) li .fwum-targets__text'))
                .map((e) => e.getAttribute('title')),
            sideClasses: Array.from(root.querySelectorAll('.fwum-targets__values--side .fwum-targets__text')).map((e) => e.className),
            cellClasses: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-subrow) td.fwum-targets__text')).map((td) => td.className) : null,
            outageSources: Array.from(root.querySelectorAll('table.fwum-outages__table tbody tr')).map((tr) => shown(tr.lastElementChild)),
            why: why ? why.textContent.trim() : null,
            allowPrivateLink: !!root.querySelector('.fwum-nc a'),
            whyButton: !!root.querySelector('.fwum-nc .fwum-link-button'),
            internet: Array.from(root.querySelectorAll('.fwum-internet-note p')).map(clean),
            // quick UI review before 5.4.0, L2 and L3: the page's config line as a chip (its line, its button, the button's
            // name), the chip's polite region, the copied text
            pageChips: Array.from(root.querySelectorAll('.fwum-chip')).map((chip) => {
                const button = chip.querySelector('button');
                return [chip.querySelector('code') ? chip.querySelector('code').textContent : null, clean(button),
                    button ? button.getAttribute('aria-label') : null];
            }),
            pageLive: Array.from(root.querySelectorAll('.fwum-chip')).map((chip) => {
                const live = chip.querySelector('[aria-live]'); return live ? [live.getAttribute('aria-live'), live.textContent] : null; }),
            copiedText: window.fwumCopiedText === undefined ? null : window.fwumCopiedText,
            // UI review of 5.4.0: B1 the reason when the server's PHP cannot send checks, B2 the check-now icon, B3 the
            // address cells' labels and tooltips
            php: Array.from(root.querySelectorAll('.fwum-php-note p')).map(clean),
            // L9 (UI review of 5.4.0): the target panel's notice while Matomo's internet features are off
            panelNotice: clean(document.querySelector('.fwum-panel__notice')),
            panelOpen: !!document.querySelector('.fwum-panel'),
            checkTool: !!root.querySelector('.fwum-tool[aria-label="Check now"]'),
            labelTitles: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-subrow) td.label'))
                .map((td) => [clean(td.querySelector('.fwum-targets__label')), td.getAttribute('title')]) : null,
            lists: Array.from(root.querySelectorAll('ul.fwum-targets')).map((ul) => ul.getAttribute('role')),
            card: !!root.querySelector('.fwum-promo-card-slot'),
            // the outage rows as read, without the texts for screen readers and the phone-only duration
            outages: Array.from(root.querySelectorAll('table.fwum-outages__table tbody tr')).map((tr) => Array.from(tr.children).map(shown)),
            outageList: Array.from(root.querySelectorAll('.fwum-outages__list li')).map(shown),
            outageListRaw: Array.from(root.querySelectorAll('.fwum-outages__list li')).map((li) => li.textContent.replace(/\s+/g, ' ').trim()),
            outageCount: clean(root.querySelector('.fwum-outages__head .fwum-muted')),
            hasOutages: !!root.querySelector('.fwum-outages'),
            hasStrips: !!root.querySelector('.fwum-strips'),
            hasAddresses: !!table || !!root.querySelector('.fwum-narrow-list'),
            answerLink: (() => { const a = root.querySelector('.fwum-answer a'); return a ? [a.textContent.trim(), a.getAttribute('href')] : null; })(),
            // raw, with its no-break spaces
            rawLines: Array.from(root.querySelectorAll('.fwum-answer__text > p')).map((p) => p.textContent.replace(/\s+(?=\S)/g, (m) => (m.indexOf('\u00a0') >= 0 ? '\u00a0' : ' ')).trim()),
            rowTexts: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-subrow) td.fwum-targets__text')).map((td) => td.textContent) : null,
            // 5.2.0 review: the tooltips of the cells, the strips' cells, the narrow group heads
            cellTitles: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-subrow) td.fwum-targets__text')).map((td) => td.getAttribute('title')) : null,
            stripCells: Array.from(root.querySelectorAll('.fwum-strip')).map((strip) => Array.from(strip.querySelectorAll('.fwum-strip__cell'))
                .map((c) => (Array.from(c.classList).find((k) => k.indexOf('is-') === 0 && k !== 'is-next') || '').slice(3))),
            stripNames: Array.from(root.querySelectorAll('.fwum-strip__cells')).map((list) => list.getAttribute('aria-label')),
            // review of the 5.4.0 fixes: each strip's cell texts (tooltip and screen readers), its axis, the measured share
            // at its end
            stripTexts: Array.from(root.querySelectorAll('.fwum-strip')).map((strip) => Array.from(strip.querySelectorAll('.fwum-strip__cell'))
                .map(clean)),
            stripAxes: Array.from(root.querySelectorAll('.fwum-strip__axis')).map((axis) => Array.from(axis.children).map(clean)),
            stripMeasured: Array.from(root.querySelectorAll('.fwum-strips__uptime')).map((e) => e.getAttribute('title')),
            groupNotes: Array.from(root.querySelectorAll('.fwum-group-note')).map(clean),
            groupHeads: Array.from(root.querySelectorAll('.fwum-group-head')).map(clean),
            empty: clean(root.querySelector('.fwum-empty')),
            // next release: P1 the thin lanes from outside and the time axes; P2 the lines of each value cell (their
            // tone and whether muted, as the other side), the table's group rows; 3a the website widget's container note
            lanes: root.querySelectorAll('.fwum-strip--lane').length,
            axes: root.querySelectorAll('.fwum-strip__axis').length,
            groupRows: table ? Array.from(table.querySelectorAll('tr.fwum-group-row th')).map(clean) : null,
            groupRowsRaw: table ? Array.from(table.querySelectorAll('tr.fwum-group-row th')).map((th) => th.textContent.replace(/\s+/g, ' ').trim()) : null,
            valueLines: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-group-row):not(.fwum-group-empty):not(.fwum-subrow)'))
                .map((tr) => Array.from(tr.querySelectorAll('.fwum-line')).map((l) => Array.from(l.classList)
                    .filter((c) => c !== 'fwum-line').join(' '))) : null,
            listClasses: Array.from(root.querySelectorAll('ul.fwum-targets:not(.fwum-outages__list) li')).map((li) => li.className),
            containerNote: clean(root.querySelector('.fwum-container-note')),
            // follow-ups (Peter, 2026-11-26, "alle wie empfohlen"): W5 what screen readers hear in a Response cell
            // besides its lines; D2 the strips as laid out (a row, or a pair: names and uptimes, then strip and lane);
            // W3 the outage list's "ongoing"; W7, W8 raw texts with their no-break spaces
            cellAsides: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-subrow) td.fwum-targets__text')).map((td) => {
                const sr = td.querySelector('.fwum-sr'); return sr ? clean(sr) : null; }) : null,
            stripLayout: Array.from(root.querySelectorAll('.fwum-strips > :not(.fwum-legend)')).map((el) => (
                el.classList.contains('fwum-strips__pair') ? Array.from(el.children).map((c) => {
                    if (!c.classList.contains('fwum-strip')) {
                        return shown(c);
                    }
                    return (c.classList.contains('fwum-strip--lane') ? 'lane' : 'strip') + (c.querySelector('.fwum-strip__axis') ? '+axis' : '');
                }) : 'row')),
            ongoing: Array.from(root.querySelectorAll('.fwum-outages .fwum-ongoing')).map((e) => e.className),
            lanesRaw: Array.from(root.querySelectorAll('.fwum-strips__vantage')).map((e) => e.textContent.trim()),
            listRaw: Array.from(root.querySelectorAll('ul.fwum-targets:not(.fwum-outages__list) li')).map((li) => li.textContent),
            outageSourcesRaw: Array.from(root.querySelectorAll('table.fwum-outages__table tbody tr')).map((tr) => tr.lastElementChild.textContent.trim()),
            // D3 (Peter's answer to the 5.3.0 UI review): the outage table's headings and its causes as read
            outageHeads: Array.from(root.querySelectorAll('table.fwum-outages__table thead th')).map(clean),
            outageCausesRaw: Array.from(root.querySelectorAll('table.fwum-outages__table tbody tr')).map((tr) => tr.children[3].textContent.replace(/\s+/g, ' ').trim()),
            // UI review of 5.3.0, B1: the parts of each side line of the narrow list (the values one unit beside the name)
            sideUnits: Array.from(root.querySelectorAll('.fwum-targets__values--side')).map((v) => Array.from(v.children)
                .map((c) => c.className.split(' ')[0])),
        };
    };
}

// fixtures: the website 1 (UTC) with www.example.com, Matomo's three addresses; NOW is 2026-11-26 10:00 UTC
const CHECKED = '2026-11-26T09:55:00Z';
function target(key, kind, url, outcome, extra) {
    const more = extra || {};
    const states = more.unchecked ? {} : { local: {
        outcome, error: outcome === 'up' ? null : (more.error || 'timeout'), note: more.note || null,
        httpStatus: more.httpStatus || (outcome === 'up' ? 200 : null), responseMs: outcome === 'up' ? 120 : null,
        checkedAt: more.stale ? '2026-11-25T08:00:00Z' : (more.checkedAt || CHECKED), stale: !!more.stale,
    } };
    // B10: the latest result from outside (another plugin's, source external)
    if (more.outside) {
        states.external = {
            outcome: more.outside, error: more.outside === 'up' ? null : (more.outsideError || 'timeout'), note: null,
            httpStatus: more.outsideStatus || (more.outside === 'up' ? 200 : null), responseMs: more.outside === 'up' ? 118 : null,
            checkedAt: more.outsideCheckedAt || CHECKED, stale: false,
        };
        if (more.outsideError === null) {
            states.external.error = null;
        }
    }
    return {
        targetKey: key, kind, url, urlSource: 'default', enabled: true, lastCheckedAt: more.unchecked ? null : CHECKED, states,
        serverRefuses: !!more.serverRefuses,
        certificate: more.days === undefined ? null : { notAfter: '2027-01-01', daysLeft: more.days, level: more.level || 'ok' },
    };
}
function uptimeRow(key, kind, percent, coverage, source) {
    return {
        targetKey: key, kind, source: source || 'local', uptimePercent: percent, coveragePercent: coverage === undefined ? 100 : coverage,
        outages: 0, samples: 24, p50Ms: 120, p95Ms: 200, maxMs: 300,
    };
}
const MATOMO_URL = 'https://matomo.example.org/';
function matomoTargets(urls) {
    return ['ui', 'tracker', 'js'].map((k) => target(k, k, urls === false ? null : MATOMO_URL + k, 'up', { days: 63 }));
}
const WEB = 'web:www.example.com';
function scenario(extra) {
    return Object.assign({
        period: 'day', date: 'today', width: 1000,
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: {
            0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)),
            1: [uptimeRow(WEB, 'web', 97.917)],
        },
        incidents: [],
    }, extra);
}

const CARD = (id) => ({
    id, days: 90, pauseDays: 30, demo: false, name: 'Conversions for your ad accounts', text: 'Send orders server-side.',
    link: 'Learn more', url: 'https://plugins.feinwerk.io/en/plugins/FeinwerkConversionsApi', external: true, note: '',
    title: 'Feinwerk Conversions API',
});

async function open(browser, kit) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', (e) => { failures++; console.log('FAIL page error: ' + e.message); });
    await page.addInitScript((now) => { const fixed = Date.parse(now); Date.now = () => fixed; }, NOW);
    await page.route(ORIGIN + '**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="en"><body></body></html>' }));
    await page.goto(ORIGIN);
    await page.addScriptTag({ content: VUE });
    await page.addScriptTag({ content: '(' + pageSetup.toString() + ')(' + JSON.stringify(EN) + ', ' + JSON.stringify(NOW) + ');' });
    await page.addScriptTag({ content: UMD });
    if (kit) {
        await page.addScriptTag({ content: KIT });
    }
    return { page, context };
}

/** mounts one scenario on a new page and returns its summary */
async function mounted(browser, data, after) {
    const { page, context } = await open(browser, false);
    try {
        return await page.evaluate(async ({ data, after }) => {
            const { root } = await window.fwumMount(data);
            if (after === 'why') {
                const button = root.querySelector('.fwum-nc .fwum-link-button');
                if (button) {
                    button.click();
                }
                await new Promise((r) => requestAnimationFrame(() => r()));
            }
            // quick UI review before 5.4.0, L2 and L3: the page's chip copies on plain HTTP the textarea way
            if (after === 'copy') {
                document.execCommand = () => {
                    const area = document.querySelector('body > textarea');
                    window.fwumCopiedText = area ? area.value : null;
                    return true;
                };
                const button = root.querySelector('.fwum-internet-note .fwum-chip button');
                if (button) {
                    button.click();
                }
                await new Promise((r) => setTimeout(r, 250));
            }
            // L9: the target panel from the quiet pencil after the freshness
            if (after === 'panel') {
                const button = root.querySelector('.fwum-tool[aria-label="Edit check targets"]');
                if (button) {
                    button.click();
                }
                await new Promise((r) => setTimeout(r, 50));
            }
            return window.fwumSummary(root);
        }, { data, after });
    } finally {
        await context.close();
    }
}

async function answers(browser) {
    // F1: an outage from 23:30 to 00:30 counts 30 minutes on each day; nothing is down now: the day first, then a
    // muted "Now:" line with the freshness
    const midnight = { incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-24T23:30:00Z', end: '2026-11-25T00:30:00Z' }] };
    for (const [date, label] of [['2026-11-24', 'Nov 24'], ['2026-11-25', 'Nov 25']]) {
        const s = await mounted(browser, scenario(Object.assign({ date }, midnight)));
        check('F1 ' + date + ': the day first, 30 min of the outage across midnight, in the warning colour (D2)', s.lines[0],
            { cls: 'is-warn', muted: false, text: label + ': 1 outage, 30 min www.example.com (no answer within 10 seconds)' });
        check('F1 ' + date + ': then the muted current state with its freshness', s.lines[1],
            { cls: 'is-now', muted: true, text: 'Now: Everything reachable, checked 5 minutes ago' });
        check('D1 ' + date + ': no Response column on a past day', s.heads, ['Address', 'Uptime', 'Certificate']);
        check('D1 ' + date + ': colspans follow the columns', s.colspans, ['3', '3']);
        check('D1 ' + date + ': the dots follow the day\'s uptime', s.rows.map((r) => r[0]), ['is-up', 'is-up', 'is-up', 'is-partial']);
        check('D1 ' + date + ': the rows hold address, uptime, certificate', s.rows[3], ['is-partial', 'www.example.com', '97.92%', '41 days']);
        // final review D1: the outage row counts its part inside the day, with the whole length
        check('D1 ' + date + ': the outage row names its part of the whole', s.outages,
            [['Nov 24, 2026, 11:30 PM', '30 min of 1 h', 'www.example.com', 'no answer within 10 seconds']]);
    }

    // F1: three of Matomo's addresses down at the same time are one outage of its real length; another one apart
    const three = [
        { idSite: 0, targetKey: 'ui', kind: 'ui', start: '2026-11-25T10:00:00Z', end: '2026-11-25T11:00:00Z' },
        { idSite: 0, targetKey: 'tracker', kind: 'tracker', start: '2026-11-25T10:00:00Z', end: '2026-11-25T11:00:00Z' },
        { idSite: 0, targetKey: 'js', kind: 'js', start: '2026-11-25T10:05:00Z', end: '2026-11-25T10:55:00Z' },
    ];
    let s = await mounted(browser, scenario({ date: '2026-11-25', incidents: three }));
    check('F1: three addresses down together count once, 1 h; D4: the prefix Matomo once', s.lines[0].text,
        // 5.2.0 review: in the order of the outage list's row
        'Nov 25: 1 outage, 1 h Matomo: Interface, Tracker endpoint, and JavaScript tracker (no answer within 10 seconds)');
    // final review D1: overlapping outages of one group are one row naming them, in the order of the addresses
    check('D1: one row for the three addresses down together', s.outages,
        [['Nov 25, 2026, 10:00 AM', '1 h', 'Matomo: Interface, Tracker endpoint, and JavaScript tracker', 'no answer within 10 seconds']]);
    const fourth = three.concat([{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-25T14:00:00Z', end: '2026-11-25T14:12:00Z' }]);
    s = await mounted(browser, scenario({ date: '2026-11-25', incidents: fourth }));
    check('F1: an outage apart counts as the second one, their union in all; D4: hours and minutes', s.lines[0].text,
        'Nov 25: 2 outages, 1 h 12 min in all');
    check('D4: a no-break space between number and unit, none between the units', s.rawLines[0].indexOf('1\u00a0h 12\u00a0min') > 0, true);
    check('D1: two rows, the newest first', s.outages, [
        ['Nov 25, 2026, 2:00 PM', '12 min', 'www.example.com', 'no answer within 10 seconds'],
        ['Nov 25, 2026, 10:00 AM', '1 h', 'Matomo: Interface, Tracker endpoint, and JavaScript tracker', 'no answer within 10 seconds']]);
    check('D1: no "2 of 4" above merged rows', s.outageCount, null);
    s = await mounted(browser, scenario({ date: '2026-11-25', incidents: fourth, width: 390 }));
    check('D1: the narrow list follows the same rows', s.outageList, [
        'Nov 25, 2026, 2:00 PM 12 min www.example.com no answer within 10 seconds',
        'Nov 25, 2026, 10:00 AM 1 h Matomo: Interface, Tracker endpoint, and JavaScript tracker no answer within 10 seconds']);
    // today: rows without overlap stay as they are (their whole length)
    s = await mounted(browser, scenario({ incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-26T08:00:00Z', end: '2026-11-26T08:20:00Z' },
        { idSite: 0, targetKey: 'ui', kind: 'ui', start: '2026-11-26T06:00:00Z', end: '2026-11-26T06:05:00Z', cause: 'connect' }] }));
    check('D1 today: rows without overlap as they are', s.outages, [
        ['Nov 26, 2026, 8:00 AM', '20 min', 'www.example.com', 'no answer within 10 seconds'],
        ['Nov 26, 2026, 6:00 AM', '5 min', 'Matomo: Interface', 'no connection']]);

    // an outage open since yesterday, today's view: the current answer with the date of its start
    const open = { incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-25T22:00:00Z', end: null }] };
    const downNow = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'down', { days: 41 })] };
    s = await mounted(browser, scenario(Object.assign({ status: downNow }, open)));
    check('today: the outage since yesterday leads with the date of its start', s.lines[0],
        { cls: 'is-down', muted: false, text: 'This website: www.example.com not reachable since Nov 25, 2026, 10:00 PM (no answer within 10 seconds) checked 5 minutes ago' });
    check('today: the Response column stays', s.heads, ['Address', 'Response', 'Uptime', 'Certificate']);
    check('today: the row dot is the current state', s.rows[3][0], 'is-down');
    check('D1 today: an open outage keeps its whole length', s.outages,
        [['Nov 25, 2026, 10:00 PM', 'ongoing, 12 h', 'www.example.com', 'no answer within 10 seconds']]);

    // D2: the same outage on yesterday's view: the full "Now" line leads (red, since, cause), then the day
    s = await mounted(browser, scenario(Object.assign({ date: '2026-11-25', status: downNow }, open)));
    check('D2: something down now: the full Now line first, naming the address (D1)', s.lines[0],
        { cls: 'is-down', muted: false, text: 'Now: www.example.com not reachable since Nov 25, 2026, 10:00 PM (no answer within 10 seconds) checked 5 minutes ago' });
    check('D2: then the day, its part of the outage up to midnight, not red', s.lines[1],
        { cls: 'is-warn', muted: false, text: 'Nov 25: 1 outage, 2 h www.example.com (no answer within 10 seconds)' });
    check('D1: the running outage on a past day: its part of the whole', s.outages,
        [['Nov 25, 2026, 10:00 PM', 'ongoing, 2 h of 12 h', 'www.example.com', 'no answer within 10 seconds']]);
    // one of several addresses down now: the Now line is red too, louder than the day's finished outages
    const containerDown = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }),
        target('ctr:Ab12Cd34', 'container', 'https://matomo.example.org/js/container_Ab12Cd34.js', 'down', { error: 'http_status', httpStatus: 403 })] };
    s = await mounted(browser, scenario({ date: '2026-11-25', status: containerDown, incidents: [
        { idSite: 1, targetKey: 'ctr:Ab12Cd34', kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' }] }));
    check('D2: part of the addresses down now: the Now line red, naming it', s.lines[0],
        { cls: 'is-down', muted: false, text: 'Now: Matomo: Tag Manager container Ab12Cd34 not reachable since Nov 26, 2026, 9:20 AM (HTTP status 403) checked 5 minutes ago' });
    check('D2: then a day without outages', s.lines[1], { cls: 'is-up', muted: false, text: 'Nov 25: no outage' });
    // final review F1: today the same line names the address that is down: red, as on a past day
    const containerOpen = [{ idSite: 1, targetKey: 'ctr:Ab12Cd34', kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' }];
    s = await mounted(browser, scenario({ status: containerDown, incidents: containerOpen }));
    check('F1 today: a line that names a down address is red', s.lines[0],
        { cls: 'is-down', muted: false, text: 'Matomo: Tag Manager container Ab12Cd34 not reachable since 9:20 AM (HTTP status 403) checked 5 minutes ago' });
    check('F1 today: the other group follows', s.lines[1], { cls: 'is-up', muted: false, text: 'This website: Reachable' });
    // two down of a group: the line counts them without naming one, partly reachable stays amber, today and on a past day
    const twoDown = { 0: [target('ui', 'ui', MATOMO_URL + 'ui', 'down', { days: 63 })].concat(matomoTargets().slice(1)), 1: containerDown[1] };
    const twoOpen = containerOpen.concat([{ idSite: 0, targetKey: 'ui', kind: 'ui', start: '2026-11-26T09:30:00Z', end: null }]);
    s = await mounted(browser, scenario({ status: twoDown, incidents: twoOpen }));
    check('F1 today: a count without a name stays amber', s.lines[0],
        { cls: 'is-partial', muted: false, text: 'Matomo: 2 of 4 addresses not reachable since 9:20 AM (no answer within 10 seconds) checked 5 minutes ago' });
    s = await mounted(browser, scenario({ date: '2026-11-25', status: twoDown, incidents: twoOpen }));
    check('F1 past day: the same rule for the Now line', s.lines[0],
        { cls: 'is-partial', muted: false, text: 'Now: 2 of 5 addresses not reachable since Nov 26, 2026, 9:20 AM (no answer within 10 seconds) checked 5 minutes ago' });
    // a whole group down (both addresses of the website) while Matomo answers: red on a past day, as today
    const siteDown = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'down', { days: 41 }),
        target('web:shop.example.org', 'web', 'https://shop.example.org/', 'down', { days: 12 })] };
    s = await mounted(browser, scenario({ status: siteDown }));
    check('F1 today: a group that does not answer at all is red', [s.lines[0].cls, s.lines[0].text.indexOf('This website: Not reachable') === 0],
        ['is-down', true]);
    s = await mounted(browser, scenario({ date: '2026-11-25', status: siteDown }));
    check('F1 past day: the Now line is red too, though it counts', [s.lines[0].cls, s.lines[0].text.indexOf('Now: 2 of 5 addresses not reachable') === 0],
        ['is-down', true]);
    // the widgets show the count, never a name: amber
    s = await mounted(browser, scenario({ width: 300, status: containerDown, incidents: containerOpen, config: { variant: 'matomo' } }));
    check('F1 widget: the count without a name stays amber', s.lines[0].cls, 'is-partial');
    // B11 part 2: an address this server never checks (a private address while they are not allowed) reads not
    // checkable before its first check, not "Not checked yet"; a public one not checked yet stays so
    const refused = { 0: matomoTargets(), 1: [target(WEB, 'web', 'http://192.168.1.10/', 'up', { unchecked: true, serverRefuses: true })] };
    s = await mounted(browser, scenario({ status: refused }));
    check('B11 part 2 refused by this server: the answer', s.lines[0].text.indexOf('This website: Not checkable from this server'), 0);
    check('B11 part 2 refused by this server: its row', [s.rows[3][0], s.rows[3][2]], ['is-not_checkable', 'Not checkable from this server']);
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { unchecked: true })] } }));
    check('B11 part 2 a public address not checked yet: so', s.rows[3][2], 'Not checked yet');

    // stale, not checkable or not measured are no outage: the day first
    const unchecked = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { unchecked: true })] };
    s = await mounted(browser, scenario({ date: '2026-11-25', status: unchecked }));
    check('D2: not measured now is no outage: the day first', [s.lines[0].cls, s.lines[1].muted], ['is-up', true]);

    // final review D3: a day before the first measurement is one line with a link to the first measured day; no
    // strips, no addresses, no empty outage list
    const unmeasured = (extra) => scenario(Object.assign({
        date: '2026-11-20', measured: false,
        uptime: { 0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, null, 0)), 1: [uptimeRow(WEB, 'web', null, 0)] },
    }, extra));
    s = await mounted(browser, unmeasured({ firstMeasured: '2026-11-23T08:00:00Z' }));
    check('D3: one line up to the first measured day', s.lines[0],
        { cls: 'is-none', muted: false, text: 'Nov 20: not measured. Measurements start on Nov 23' });
    const link = s.answerLink || ['', ''];
    check('D3: the first measured day is a link to it', [link[0], /[?&]date=2026-11-23(&|$)/.test(link[1].split('#')[0]),
        /[?&]date=2026-11-23(&|$)/.test(link[1].split('#')[1] || ''), /[?&]period=day(&|$)/.test(link[1])], ['Nov 23', true, true, true]);
    check('D3: the current state follows, muted', s.lines[1].muted, true);
    check('D3: no strips, no addresses, no outage list', [s.hasStrips, s.hasAddresses, s.hasOutages], [false, false, false]);
    s = await mounted(browser, unmeasured({ firstMeasured: '2026-11-01T08:00:00Z' }));
    check('D3: a gap after the first measurement points nowhere', [s.lines[0].text, s.answerLink, s.hasStrips, s.hasAddresses],
        ['Nov 20: not measured', null, false, false]);
    s = await mounted(browser, unmeasured({ fail: ['getTimeline'] }));
    check('D3: without the strip data the plain line', [s.lines[0].text, s.answerLink], ['Nov 20: not measured', null]);
    s = await mounted(browser, scenario({ date: '2026-11-24' }));
    check('a measured day without outages: no outages', s.outagesNote, 'No outages in this period.');

    // the day's name (periodLabel, calendarDay, shiftDay): yesterday, a longer period, another year, and a website
    // whose day is already the next one at NOW (Kiritimati, UTC+14: 2026-11-27 00:00; also as Matomo's "UTC+14")
    const first = async (extra) => (await mounted(browser, scenario(extra))).lines[0].text;
    check('label: yesterday is that day', await first({ date: 'yesterday' }), 'Nov 25: no outage');
    check('label: a week speaks of the period', await first({ period: 'week', date: '2026-11-16' }), 'In this period: no outage');
    check('label: another year names it', await first({ date: '2025-11-26' }), 'Nov 26, 2025: no outage');
    for (const zone of ['Pacific/Kiritimati', 'UTC+14']) {
        const config = { timezone: zone };
        check('label ' + zone + ': yesterday is the website\'s yesterday', await first({ date: 'yesterday', config }), 'Nov 26: no outage');
        check('label ' + zone + ': UTC\'s today is a past day there', await first({ date: '2026-11-26', config }), 'Nov 26: no outage');
        check('label ' + zone + ': the website\'s today is today', await first({ date: '2026-11-27', config }), 'Everything reachable checked 5 minutes ago');
    }

    // narrow (a phone): the list without response times on a past day, differing certificates named visibly
    const two = { 0: matomoTargets(), 1: [
        target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }),
        target('web:shop.example.org', 'web', 'https://shop.example.org/', 'up', { days: 12, level: 'warning' })] };
    s = await mounted(browser, scenario({ date: '2026-11-25', width: 390, status: two,
        uptime: { 0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)), 1: [uptimeRow(WEB, 'web', 97.917), uptimeRow('web:shop.example.org', 'web', 100)] } }));
    check('narrow: one shared certificate in the group heading', s.groupCerts, ['Certificate 63 days']);
    check('narrow, past day: day dots, no response time, differing certificates named (L)', s.narrow.slice(3), [
        ['is-up', 'shop.example.org Uptime: 100% Certificate 12 days'],
        ['is-partial', 'www.example.com Uptime: 97.92% Certificate 41 days']]);
    check('narrow: the lists are lists for screen readers', s.lists, ['list', 'list']);
}

/** B10: results checked from outside (another plugin, ScreenProps external) next to those from the Matomo server */
async function outsideResults(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const PAUSED = { active: false, name: 'Outside checks', reachedAt: null, settingsUrl: 'index.php?module=OutsideChecks&action=index' };
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const uptimeBoth = (webOutside) => ({
        0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)).concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external'))),
        1: [uptimeRow(WEB, 'web', null, 0), uptimeRow(WEB, 'web', webOutside, 100, 'external')],
    });
    // the website cannot be checked from the Matomo server (a typical router), from outside it answers
    const behindRouter = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { days: 41, error: 'blocked', outside: 'up' })] },
        uptime: uptimeBoth(99.5), outsideMeasured: true, config: { external: ACTIVE },
    }, extra));

    let s = await mounted(browser, scenario({ config: { external: null } }));
    check('B10 without a source: the page as before', [s.heads, s.outsideNote, s.strips], [['Address', 'Response', 'Uptime', 'Certificate'], null, ['Matomo', 'This website']]);

    s = await mounted(browser, behindRouter());
    // P2 (Peter's 2a): the table answers once, with the columns of the page without results from outside
    check('P2 active: one header row, as without a source', s.heads, ['Address', 'Response', 'Uptime', 'Certificate']);
    check('P2 active: the group rows span every column', s.colspans, ['4', '4']);
    // D2 (Peter's answer to the UI review of 5.3.0): the row, then a sub-row per side, its name first, plain values
    check('P2, D2 active: the sides disagree: the answering side first, each named once', [s.rows[3], s.subRows],
        [['is-up', 'www.example.com', '', '', '41 days'], [['Outside', '118 ms', '99.5%', ''], ['Matomo server', 'Not checkable', '', '']]]);
    check('P2 active: the sides agree: one value, no side', s.rows[0], ['is-up', 'Interface', '120 ms', '100%', '63 days']);
    check('P2 active: the tooltip names both sides', s.cellTitles[0], 'Checked from the Matomo server: 120\u00a0ms\nChecked from outside: 118\u00a0ms');
    check('B10 active: reachable from outside is an answer', s.lines[0], { cls: 'is-up', muted: false, text: 'Everything reachable checked 5 minutes ago' });
    check('B10 active: no note about what this server cannot check', s.nc, null);
    // P1 (Peter's 1a): each group named once, its thin lane from outside under its strip
    check('P1 active: a lane from outside under each group\'s strip', s.strips, ['Matomo', 'from outside', 'This website', 'from outside']);
    check('B10 active: no line about paused checks', s.outsideNote, null);

    // down from outside only: the answer is red and says where it failed
    const outsideDown = scenario({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'down', outsideError: 'http_status', outsideStatus: 502 })] },
        uptime: uptimeBoth(98), outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:13:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    });
    s = await mounted(browser, outsideDown);
    check('B10 down from outside: the answer names the address and where it failed', s.lines[0],
        { cls: 'is-down', muted: false, text: 'This website: www.example.com not reachable since 9:13 AM (HTTP status 502, from outside) checked 5 minutes ago' });
    check('P2, D2 down from outside: the failing side first, in red', [s.rows[3][2], s.subRows, s.subTones],
        ['', [['Outside', 'HTTP status 502', '98%', ''], ['Matomo server', '120 ms', '', '']], ['is-down', '']]);
    // 5.2.0 review L1: a noun under "Checked from", not "Checked from: from outside"
    check('B10, D3 down from outside: the outage list says where from, after the cause', s.outageSources, ['HTTP status 502 from outside']);
    s = await mounted(browser, Object.assign({}, outsideDown, { width: 390 }));
    check('B10 down from outside, narrow: the failing side first, only its line in red (review F1)', s.sideClasses.slice(-2),
        ['fwum-targets__text is-down', 'fwum-targets__text is-up']);
    // review of the 5.2.0 fixes, NIT 3: the narrow outage list names the side in words, not a bare noun
    check('NIT 3 narrow outage list: "from outside" after the cause', / HTTP status 502 from outside$/.test(s.outageList[0] || ''), true);
    check('NIT 3 ... read as one phrase after the cause', s.outageListRaw[0].endsWith('HTTP status 502, from outside'), true);

    s = await mounted(browser, behindRouter({ width: 390 }));
    check('P2 narrow: the sides disagree: each named, the answering side first', s.listShown.slice(-1),
        ['www.example.com 118 ms 99.5% from outside Not checkable from the Matomo server']);
    s = await mounted(browser, behindRouter({ width: 300, config: { variant: 'site', external: ACTIVE } }));
    // follow-up D3: in the widgets a side that cannot check the address adds no line (the page keeps it, above)
    check('P2, D3 widget: the server cannot check it: the outside\'s line alone, named; the dot from both', [s.listShown, s.lines[0].cls],
        [['www.example.com 118 ms 99.5% from outside'], 'is-up']);

    s = await mounted(browser, behindRouter({ date: '2026-11-25' }));
    check('P2 past day: one Uptime column', s.heads, ['Address', 'Uptime', 'Certificate']);
    check('P2 past day: measured from outside only: that side named', s.rows[3], ['is-partial', 'www.example.com', '99.5% from outside', '41 days']);

    // B11 finding 3: an address the outside cannot check (a private address) adds nothing to its dot, the answer or
    // the freshness: here the server's checks of the website stopped, and that must still show
    const privateOutside = (extra) => scenario(Object.assign({
        status: {
            0: ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'not_checkable', outsideError: 'blocked' })),
            1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, stale: true, outside: 'not_checkable', outsideError: 'blocked' })],
        },
        uptime: uptimeBoth(null), config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, privateOutside());
    check('B11, D2 not checkable from outside: its sub-row says so, under the server\'s answer', [s.rows[0][2], s.subRows.slice(0, 2)],
        ['', [['Matomo server', '120 ms', '100%', ''], ['Outside', 'Not checkable', '100%', '']]]);
    check('B11 not checkable from outside: the server\'s outcome alone colours the dot', [s.rows[0][0], s.rows[3][0]], ['is-up', 'is-stale']);
    check('B11 not checkable from outside: the answer still says the checks stopped', s.lines[0].cls, 'is-stale');
    s = await mounted(browser, privateOutside({ width: 300, config: { variant: 'site', external: ACTIVE } }));
    check('B11 not checkable from outside: the widget\'s dot from the server alone', s.lines[0].cls, 'is-stale');

    // B11 part 2: neither side can check the website: its answer names both (one sentence); when the outside has no
    // result for it (or one that says nothing), only this server
    const nowhere = (more, extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', Object.assign({ days: 41, error: 'dns' }, more))] },
        uptime: uptimeBoth(null), config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, nowhere({ outside: 'not_checkable', outsideError: 'dns' }));
    // 5.2.0 review L4: the server named as in the table headings
    check('B11 part 2 neither side can check: the answer names both', s.lines[0].text.indexOf('This website: Not checkable from the Matomo server or from outside'), 0);
    s = await mounted(browser, nowhere({ outside: 'not_checkable', outsideError: 'dns' }, { width: 300, config: { variant: 'site', external: ACTIVE } }));
    check('B11 part 2 neither side can check: the widget too', s.lines[0].text.indexOf('Not checkable from the Matomo server or from outside'), 0);
    s = await mounted(browser, nowhere({}));
    // follow-up W2: while results from outside show, the server is "the Matomo server" in the answer too
    check('B11 part 2, W2 no result from outside yet: only the Matomo server', [s.lines[0].text.indexOf('This website: Not checkable from the Matomo server'),
        s.lines[0].text.indexOf('or from outside')], [0, -1]);

    s = await mounted(browser, scenario({ config: { external: PAUSED } }));
    check('B10 paused (admins): the page as before plus one line with the link', [s.heads, s.outsideNote, s.outsideLink],
        [['Address', 'Response', 'Uptime', 'Certificate'], 'Checks from outside are not active at the moment. Settings for the checks from outside',
            'index.php?module=OutsideChecks&action=index']);
    s = await mounted(browser, scenario({ config: { external: PAUSED, embedded: true } }));
    check('B10 paused: never in an embed', s.outsideNote, null);

    // outages from outside count only while their source delivers: paused or without a source, the page as before
    const fromOutside = (day) => [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: day + 'T06:12:00Z',
        end: day + 'T06:15:00Z', cause: 'http_status', detail: 'HTTP 502' }];
    s = await mounted(browser, scenario({ config: { external: PAUSED }, incidents: fromOutside('2026-11-26') }));
    check('B10 paused: no outage from outside in the list', s.outages, []);
    s = await mounted(browser, scenario({ date: '2026-11-25', incidents: fromOutside('2026-11-25') }));
    check('B10 without a source: a past day counts no outage from outside', s.lines[0].text, 'Nov 25: no outage');
    s = await mounted(browser, behindRouter({ date: '2026-11-25', incidents: fromOutside('2026-11-25') }));
    check('B10 active: the past day counts it', s.lines[0].text.indexOf('Nov 25: 1 outage, 3 min') === 0, true);
}

/**
 * 5.2.0 review (UI review B1 to B5, L8 review findings 5 to 8, L1 to L3): results from outside only where a group has
 * any, the share of addresses a strip from outside covers, the widgets from both sides, why an address cannot be
 * checked from outside, and the side named where no side can check an address.
 */
async function review520(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const OUTSIDE_HELP = 'The checks from outside cannot reach such addresses either';
    const matomoOutside = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = (outside) => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(outside ? ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')) : []);

    // B1: no result from outside for any group of the screen: exactly the page without the add-on
    let s = await mounted(browser, scenario({ config: { external: ACTIVE } }));
    const plain = await mounted(browser, scenario({ config: { external: null } }));
    check('B1 nothing from outside here: the page as without a source', [s.heads, s.strips, s.rows, s.lines, s.colspans],
        [plain.heads, plain.strips, plain.rows, plain.lines, plain.colspans]);
    check('B1 ... which is the plain page', [s.heads, s.strips], [['Address', 'Response', 'Uptime', 'Certificate'], ['Matomo', 'This website']]);

    // B1: Matomo checked from outside, the website not at all: it keeps its one strip and gets one muted cell
    const half = (extra) => scenario(Object.assign({
        status: { 0: matomoOutside(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(true), 1: [uptimeRow(WEB, 'web', 97.917)] },
        outsideMeasured: { matomo: true, website: false }, config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, half());
    check('B1 a group without results from outside keeps its one strip', s.strips, ['Matomo', 'from outside', 'This website']);
    check('B1, P2 its rows as without a source; its group row says it once', [s.rows[3], s.groupRowsRaw],
        [['is-up', 'www.example.com', '120 ms', '97.92%', '41 days'], ['Matomo', 'This website Not checked from outside']]);
    check('B1 the other group: the sides agree, one value', s.rows[0], ['is-up', 'Interface', '120 ms', '100%', '63 days']);
    s = await mounted(browser, half({ width: 390 }));
    check('B1 narrow: one muted line for the group, its address without sides', [s.groupNotes, s.listShown.slice(-1)],
        [['Not checked from outside'], ['www.example.com 120 ms 97.92%']]);

    // L2: with both sides shown, every outage names its side, also one from the Matomo server alone
    s = await mounted(browser, half({ incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-26T08:00:00Z', end: '2026-11-26T08:10:00Z' }] }));
    check('L2, D3 the side of an outage from the Matomo server, after the cause', s.outageSources, ['no answer within 10 seconds from the Matomo server']);

    // B1, B5: the outside's note that it cannot check a private address shows in its cells, but draws no empty strip;
    // neither side can check it: the note and Why? name both, as the answer line does
    const marker = (more, extra) => scenario(Object.assign({
        status: { 0: matomoOutside(), 1: [target('web:192.168.1.10', 'web', 'http://192.168.1.10/', 'not_checkable',
            Object.assign({ error: 'blocked', outside: 'not_checkable', outsideError: 'blocked' }, more))] },
        uptime: { 0: matomoUptime(true), 1: [] },
        outsideMeasured: { matomo: true, website: false }, config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, marker(), 'why');
    check('B1 not checkable from outside: its cells, no empty strip', [s.strips, s.rows[3]],
        [['Matomo', 'from outside', 'This website'], ['is-not_checkable', '192.168.1.10', 'Not checkable', '', '']]);
    check('B5 the cell\'s tooltip says why from outside', s.cellTitles.slice(-1),
        ['Checked from the Matomo server: Not checkable\nNot checkable from outside: a private or reserved address, or a port that is not checked from outside']);
    check('B5 neither side: the answer names both', s.lines[0].text.indexOf('This website: Not checkable from the Matomo server or from outside'), 0);
    check('B5 neither side: the note names both too', s.nc.indexOf('1 address cannot be checked from the Matomo server or from outside and does not count as an outage. Why?'), 0);
    check('B5 Why? gives both sides\' reasons', [s.why.indexOf('The Matomo server cannot reach this address itself'), s.why.indexOf(OUTSIDE_HELP) > 0], [0, true]);
    for (const [error, title] of [['connect', 'Not checkable from outside: no connection'], ['http_status', 'Not checkable from outside: the address asks for a password or blocks automated requests'],
        ['content', 'Not checkable from outside: the file is too large to check'], [null, 'Not checkable from outside']]) {
        s = await mounted(browser, marker({ outsideError: error }));
        check('B5 the reason from outside, ' + error, (s.cellTitles.slice(-1)[0] || '').split('\n')[1], title);
    }
    // one of two only from this server: the note says "from this server", Why? both reasons
    const two = scenario({
        status: { 0: matomoOutside(), 1: [
            target('web:192.168.1.10', 'web', 'http://192.168.1.10/', 'not_checkable', { error: 'blocked', outside: 'not_checkable', outsideError: 'blocked' }),
            target('web:intranet.example.com', 'web', 'https://intranet.example.com/', 'not_checkable', { error: 'connect' })] },
        uptime: { 0: matomoUptime(true), 1: [] }, outsideMeasured: { matomo: true, website: false }, config: { external: ACTIVE },
    });
    s = await mounted(browser, two, 'why');
    // follow-up W2: the note names the server as the table does while results from outside show
    check('B5, W2 one of two from the server only: the note says from the Matomo server', s.nc.indexOf('2 addresses cannot be checked from the Matomo server and do not count as outages.'), 0);
    check('B5 ... Why? with both reasons', [s.why.indexOf('The Matomo server cannot reach'), s.why.indexOf(OUTSIDE_HELP) > 0], [0, true]);
    // review NIT 5: one name for the server in the table of a screen with results from outside
    check('NIT 5 not checkable from the server, nothing from outside: "the Matomo server"', s.rows[4][2], 'Not checkable from the Matomo server');

    // B2: the strip from outside of Matomo stands for the container alone: it says so
    const CONTAINER = 'ctr:Ab12Cd34';
    const container = scenario({
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }),
            target(CONTAINER, 'container', 'https://matomo.example.org/js/container_Ab12Cd34.js', 'up', { days: 63, outside: 'up' })] },
        uptime: { 0: matomoUptime(false), 1: [uptimeRow(WEB, 'web', 97.917), uptimeRow(CONTAINER, 'container', 100),
            uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: { matomo: true, website: false }, config: { external: ACTIVE },
    });
    s = await mounted(browser, container);
    // follow-up W7: short, so that it fits the name column; the number never breaks inside its brackets
    check('B2, W7 the lane from outside names its share of the addresses', s.strips, ['Matomo', 'from outside (1 of 4)', 'This website']);
    check('W7 ... the brackets stay together', s.lanesRaw, ['from outside (1\u00a0of\u00a04)']);
    check('B2 ... in its accessible name in full words', s.stripNames[1].indexOf('Matomo, from outside, 1 of 4 addresses') >= 0, true);
    check('B2, P2 an address without a result from outside: the server\'s value', s.rows[0], ['is-up', 'Interface', '120 ms', '100%', '63 days']);
    check('B2 ... its tooltip: Not checked, not "Not checked yet"', s.cellTitles[0], 'Checked from the Matomo server: 120\u00a0ms\nChecked from outside: Not checked');
    check('B2 the container: both sides in its tooltip', s.cellTitles[3], 'Checked from the Matomo server: 120\u00a0ms\nChecked from outside: 118\u00a0ms');

    // B2 with L8 finding 1: today an address the outside stopped checking (its state forgotten) no longer counts for the
    // strip from outside, though it has hours from outside earlier today
    const SHOP = 'web:shop.example.com';
    s = await mounted(browser, scenario({
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(SHOP, 'web', 'https://shop.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(false), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(SHOP, 'web', 100), uptimeRow(SHOP, 'web', 100, 40, 'external')] },
        outsideMeasured: { matomo: false, website: true }, config: { external: ACTIVE },
    }));
    check('B2 today: an address no longer checked from outside is not in its share', s.strips, ['Matomo', 'This website', 'from outside (1 of 2)']);

    // B4: the website widget while the address is down from outside: the strip and the uptime from both sides
    const widget = scenario({
        width: 300,
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'down', outsideError: 'http_status', outsideStatus: 502 })] },
        uptime: { 0: matomoUptime(false), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 90, 100, 'external')] },
        outsideMeasured: true, outsideDown: { website: [9] }, config: { variant: 'site', external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:00:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    });
    s = await mounted(browser, widget);
    check('B4 widget: the strip from both sides (down from outside in the last hour)', s.stripCells[0].slice(8, 11), ['up', 'partial', 'future']);
    const uptime = s.figures.find((f) => f[0] === 'Uptime') || [];
    check('B4 widget: the lower uptime, from outside', [uptime[1], uptime.indexOf('from outside') > 1], ['90%', true]);
    check('B4 widget: the answer agrees', s.lines[0].cls, 'is-down');
    s = await mounted(browser, Object.assign({}, widget, { status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(false), 1: [uptimeRow(WEB, 'web', 100)] }, outsideMeasured: false, incidents: [] }));
    const plainWidget = await mounted(browser, Object.assign({}, widget, { status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(false), 1: [uptimeRow(WEB, 'web', 100)] }, outsideMeasured: false, incidents: [], config: { variant: 'site', external: null } }));
    check('B1 widget without results from outside: as without a source', [s.figures, s.stripCells, s.listShown], [plainWidget.figures, plainWidget.stripCells, plainWidget.listShown]);

    // L8 finding 5: the website widget whose one address the server never checks: no "first check" box
    s = await mounted(browser, scenario({ width: 300, status: { 0: matomoTargets(), 1: [target('web:192.168.1.10', 'web', 'http://192.168.1.10/', 'not_checkable',
        { unchecked: true, serverRefuses: true })] }, uptime: { 0: [], 1: [] }, config: { variant: 'site' } }));
    check('L8 5 widget: refused by the server before its first check: not checkable, no first-check box',
        [s.empty, (s.lines[0] || {}).text], [null, 'Not checkable from this server']);

    // L8 finding 8: a past day's dot from that day's results from outside, also when the outside cannot check it now
    s = await mounted(browser, scenario({ date: '2026-11-25',
        status: { 0: matomoOutside(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'not_checkable', outsideError: 'blocked' })] },
        uptime: { 0: matomoUptime(true), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE } }));
    check('L8 8 past day: the dot follows that day from outside', s.rows[3][0], 'is-partial');
}

/**
 * Next release (Peter, 2026-11-26, verbatim "1a, 2a, 3a"): P1 one strip per group with a thin lane from outside and one
 * time axis; P2 the table answers once and names the side only where the sides disagree, the narrow list and the
 * widgets too; 3a an address down only from the Matomo server while the outside reaches it reads amber "Not reachable
 * from the Matomo server", down from outside stays red; P3 the past day's minutes seen only from outside; review of the
 * 5.2.0 fixes NIT 2. Without a source of results from outside nothing changes.
 */
async function nextRelease(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const CONTAINER = 'ctr:Ab12Cd34';
    const CONTAINER_URL = 'https://matomo.example.org/js/container_Ab12Cd34.js';
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = () => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')));
    const both = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }, extra));

    // P1: without a source the page keeps each strip's own axis and no lane
    let s = await mounted(browser, scenario({ config: { external: null } }));
    check('P1 without a source: each strip with its axis, no lane', [s.axes, s.lanes, s.strips], [2, 0, ['Matomo', 'This website']]);
    s = await mounted(browser, both());
    check('P1 each group named once, a thin lane from outside under its strip', s.strips, ['Matomo', 'from outside', 'This website', 'from outside']);
    check('P1 two lanes and one time axis', [s.lanes, s.axes], [2, 1]);
    check('P1 every strip and lane names its side for screen readers', s.stripNames.map((n) => ['from the Matomo server', 'from outside']
        .find((side) => n.indexOf(side) >= 0) || n), ['from the Matomo server', 'from outside', 'from the Matomo server', 'from outside']);
    s = await mounted(browser, both({ width: 390 }));
    check('P1 narrow: the same lanes and one axis', [s.lanes, s.axes], [2, 1]);

    // P2: the sides agree: the page as calm as without results from outside
    s = await mounted(browser, both());
    check('P2 the sides agree everywhere: the plain table', [s.heads, s.rows],
        [['Address', 'Response', 'Uptime', 'Certificate'], [['is-up', 'Interface', '120 ms', '100%', '63 days'], ['is-up', 'Tracker endpoint', '120 ms', '100%', '63 days'],
            ['is-up', 'JavaScript tracker', '120 ms', '100%', '63 days'], ['is-up', 'www.example.com', '120 ms', '100%', '41 days']]]);
    s = await mounted(browser, both({ uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] } }));
    check('P2, D2 only the uptime differs: a sub-row per side, the server first', [s.rows[3][2], s.rows[3][3], s.subRows],
        ['', '', [['Matomo server', '120 ms', '100%', ''], ['Outside', '118 ms', '98.26%', '']]]);
    s = await mounted(browser, both({ width: 390 }));
    check('P2 narrow: the sides agree: one line, no side', s.listShown,
        ['Interface 120 ms 100%', 'Tracker endpoint 120 ms 100%', 'JavaScript tracker 120 ms 100%', 'www.example.com 120 ms 100%']);

    // 3a: the container cannot be read from the Matomo server (HTTP 403), from outside it answers
    const serverOnly = (container, extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'down', Object.assign({ days: 63, error: 'http_status', httpStatus: 403, outside: 'up' }, container))] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 94.65), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: CONTAINER, kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' }],
    }, extra));
    s = await mounted(browser, serverOnly());
    check('3a the answer: amber, not reachable from the Matomo server, the cause without the side', s.lines[0],
        { cls: 'is-partial', muted: false, text: 'Matomo: Tag Manager container Ab12Cd34 not reachable from the Matomo server since 9:20 AM (HTTP status 403) checked 5 minutes ago' });
    check('3a, D2 the row: amber dot, the server\'s failure first in its sub-row, amber', [s.rows[3], s.subRows, s.subTones],
        [['is-partial', 'Tag Manager container Ab12Cd34', '', '', '63 days'],
            [['Matomo server', 'HTTP status 403', '94.65%', ''], ['Outside', '118 ms', '100%', '']], ['is-partial', '']]);
    s = await mounted(browser, serverOnly({}, { width: 390 }));
    check('3a narrow: its sides in order, the server\'s line amber', [s.listClasses[3], s.listShown[3], s.sideClasses],
        ['is-partial', 'Tag Manager container Ab12Cd34 HTTP status 403 94.65% from the Matomo server 118 ms 100% from outside',
            ['fwum-targets__text is-partial', 'fwum-targets__text is-up']]);
    s = await mounted(browser, serverOnly({}, { width: 300, config: { variant: 'matomo', external: ACTIVE } }));
    check('3a Matomo widget: amber, the side named once', [s.lines[0].cls, s.lines[0].text.indexOf(
        '1 of 4 addresses not reachable from the Matomo server since 9:20 AM (HTTP status 403)')], ['is-partial', 0]);
    check('3a Matomo widget: the failing address with its sides', s.listShown,
        ['Tag Manager container Ab12Cd34 HTTP status 403 94.65% from the Matomo server 118 ms 100% from outside']);
    s = await mounted(browser, serverOnly({}, { width: 300, config: { variant: 'site', external: ACTIVE } }));
    check('3a website widget: its container named, from the Matomo server', (s.containerNote || '').indexOf(
        'Tag Manager container Ab12Cd34 not reachable from the Matomo server (counted with Matomo).'), 0);
    s = await mounted(browser, serverOnly({}, { date: '2026-11-25' }));
    check('3a a past day: the Now line amber, the side named', [s.lines[0].cls, s.lines[0].text.indexOf('Now: Matomo: Tag Manager container Ab12Cd34 not reachable from the Matomo server')],
        ['is-partial', 0]);
    // no current result from outside, or the outside finds it down too: red, as before
    s = await mounted(browser, serverOnly({ outside: undefined }));
    check('3a nothing from outside for it: red, the side in the cause', [s.lines[0].cls, s.rows[3][0], s.lines[0].text],
        ['is-down', 'is-down', 'Matomo: Tag Manager container Ab12Cd34 not reachable since 9:20 AM (HTTP status 403, from the Matomo server) checked 5 minutes ago']);
    s = await mounted(browser, serverOnly({ outside: 'down', outsideError: 'http_status', outsideStatus: 403 }));
    check('3a, D2 down from both sides: red, both sub-rows red (their uptimes differ)', [s.lines[0].cls, s.rows[3][0], s.subRows.map((r) => r[1]), s.subTones],
        ['is-down', 'is-down', ['HTTP status 403', 'HTTP status 403'], ['is-down', 'is-down']]);
    s = await mounted(browser, serverOnly({ outside: undefined }, { config: { external: null } }));
    check('3a without a source: red as before', [s.lines[0].cls, s.lines[0].text],
        ['is-down', 'Matomo: Tag Manager container Ab12Cd34 not reachable since 9:20 AM (HTTP status 403) checked 5 minutes ago']);

    // UI review W4: a container too large for any server to read: its words name no side, also next to the outside's
    s = await mounted(browser, both({ status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
        target(CONTAINER, 'container', CONTAINER_URL, 'not_checkable', { days: 63, error: 'content', note: 'too_large', outside: 'up' })] } }));
    check('W4, D2 too large from the server, reachable from outside: the outside first, the size without a side', [s.rows[3][2], s.subRows],
        ['', [['Outside', '118 ms', '', ''], ['', 'Too large to check (over 4 MB)', '', '']]]);

    // UI review W1: on a past day the lower uptime first, the side that turns the dot amber
    s = await mounted(browser, both({ date: '2026-11-25', uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] } }));
    check('W1, D2 past day: the lower uptime first', [s.rows[3][0], s.subRows], ['is-partial', [['Outside', '98.26%', ''], ['Matomo server', '100%', '']]]);
    s = await mounted(browser, both({ date: '2026-11-25', width: 390, uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] } }));
    check('W1 past day, narrow: the lower uptime\'s line first', s.listShown[3], 'www.example.com 98.26% from outside 100% from the Matomo server');

    // P3: a past day names the minutes seen only from outside (the union of its outages minus the server's)
    const pastDay = (incidents, extra) => both(Object.assign({ date: '2026-11-25', incidents }, extra));
    const local = (from, to) => ({ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-25T' + from + ':00Z', end: '2026-11-25T' + to + ':00Z' });
    const outside = (from, to) => Object.assign(local(from, to), { source: 'external', cause: 'http_status', detail: 'HTTP 502' });
    s = await mounted(browser, pastDay([local('08:00', '09:00'), outside('12:00', '12:25')]));
    check('P3 two outages, one seen only from outside', s.lines[0].text.indexOf('Nov 25: 2 outages, 1 h 25 min in all (25 min seen only from outside)'), 0);
    s = await mounted(browser, pastDay([local('08:00', '09:00'), outside('08:30', '09:30')]));
    check('P3 overlapping: only the part the server did not see', s.lines[0].text.indexOf('Nov 25: 1 outage, 1 h 30 min (30 min seen only from outside)'), 0);
    s = await mounted(browser, pastDay([local('08:00', '09:00'), outside('08:10', '08:40')]));
    check('P3 seen from both sides: nothing to add', s.lines[0].text.indexOf('Nov 25: 1 outage, 1 h') === 0 && s.lines[0].text.indexOf('only from outside') < 0, true);

    // review NIT 2: today the outside stopped checking both addresses of the website at noon (its states forgotten): the
    // lane counts those with an uptime from outside today, never "0 of 2 addresses"
    const SHOP = 'web:shop.example.com';
    s = await mounted(browser, scenario({
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }), target(SHOP, 'web', 'https://shop.example.com/', 'up', { days: 41 })] },
        uptime: { 0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 40, 'external'),
            uptimeRow(SHOP, 'web', 100), uptimeRow(SHOP, 'web', 100, 40, 'external')] },
        outsideMeasured: { matomo: false, website: true }, config: { external: ACTIVE },
    }));
    check('NIT 2 no current result from outside: the lane counts the addresses measured today', s.strips, ['Matomo', 'This website', 'from outside']);
}

/**
 * Follow-ups (Peter, 2026-11-26, verbatim "alle wie empfohlen"): D1 the outage list answers once (an outage of a group
 * seen from both sides is one row, "Checked from: Both", as the answer counts it); D2 phones: both names and uptimes
 * above each strip pair, the axis right under the last lane; D3 widgets: a side that cannot check an address adds no
 * line; W2 "the Matomo server" in the answer line, the note and the admin fold while results from outside show; W3
 * "ongoing" of an outage only the Matomo server sees stays red; W5 the outside's value of an agreeing row for screen
 * readers; W8 "Matomo server" never breaks inside. Without a source nothing changes.
 */
async function followUps(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const DAY = '2026-11-25';
    const CONTAINER = 'ctr:Ab12Cd34';
    const CONTAINER_URL = 'https://matomo.example.org/js/container_Ab12Cd34.js';
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = () => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')));
    const both = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }, extra));
    const local = (from, to, extra) => Object.assign({ idSite: 1, targetKey: WEB, kind: 'web', start: DAY + 'T' + from + ':00Z',
        end: DAY + 'T' + to + ':00Z' }, extra);
    const outside = (from, to, extra) => local(from, to, Object.assign({ source: 'external', cause: 'http_status', detail: 'HTTP 502' }, extra));

    // D1: one outage seen from both sides, overlapping in time: one row, Both, its causes each once; the answer agrees
    let s = await mounted(browser, both({ date: DAY, incidents: [local('08:00', '09:00'), outside('08:30', '09:30')] }));
    check('D1 an outage seen from both sides: one row, Both', s.outages,
        [['Nov 25, 2026, 8:00 AM', '1 h 30 min', 'www.example.com', 'no answer within 10 seconds and HTTP status 502 from the Matomo server and from outside']]);
    check('D1 ... one outage in the answer too', s.lines[0].text.indexOf('Nov 25: 1 outage, 1 h 30 min (30 min seen only from outside)'), 0);
    // the outside covers fewer of the group's addresses (B2): the server's three, the interface from outside: one row
    const matomoDown = ['ui', 'tracker', 'js'].map((k) => ({ idSite: 0, targetKey: k, kind: k, start: DAY + 'T10:00:00Z', end: DAY + 'T11:00:00Z' }))
        .concat([{ idSite: 0, targetKey: 'ui', kind: 'ui', source: 'external', start: DAY + 'T10:10:00Z', end: DAY + 'T10:40:00Z', cause: 'connect' }]);
    s = await mounted(browser, both({ date: DAY, incidents: matomoDown }));
    check('D1 fewer addresses from outside at the same time: one row naming all, Both', s.outages,
        [['Nov 25, 2026, 10:00 AM', '1 h', 'Matomo: Interface, Tracker endpoint, and JavaScript tracker', 'no answer within 10 seconds and no connection from the Matomo server and from outside']]);
    check('D1 ... one outage in the answer', s.lines[0].text.indexOf('Nov 25: 1 outage, 1 h Matomo'), 0);
    // apart in time: one row each with its side, the count agrees (P3's fixture)
    s = await mounted(browser, both({ date: DAY, incidents: [local('08:00', '09:00'), outside('12:00', '12:25')] }));
    check('D1 apart: a row each, with its side, the newest first', s.outages, [
        ['Nov 25, 2026, 12:00 PM', '25 min', 'www.example.com', 'HTTP status 502 from outside'],
        ['Nov 25, 2026, 8:00 AM', '1 h', 'www.example.com', 'no answer within 10 seconds from the Matomo server']]);
    check('D1 ... two outages in the answer', s.lines[0].text.indexOf('Nov 25: 2 outages'), 0);
    s = await mounted(browser, both({ date: DAY, width: 390, incidents: [local('08:00', '09:00'), outside('08:30', '09:30')] }));
    check('D1 narrow: both sides in words after the cause', [s.outageList.length,
        s.outageListRaw[0].endsWith('HTTP status 502, from the Matomo server and from outside')], [1, true]);
    // without a source the outside's outages are not loaded: the server's rows as before, no Checked from column
    s = await mounted(browser, scenario({ date: DAY, config: { external: null }, incidents: [local('08:00', '09:00'), outside('08:30', '09:30')] }));
    check('D1 without a source: the rows as before', s.outages, [['Nov 25, 2026, 8:00 AM', '1 h', 'www.example.com', 'no answer within 10 seconds']]);

    // W3 (Peter's 6a): an outage only the Matomo server sees (3a) keeps its side and its red "ongoing"; W8 the name whole
    const serverOnly = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'down', { days: 63, error: 'http_status', httpStatus: 403, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 94.65), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: CONTAINER, kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' }],
    }, extra));
    s = await mounted(browser, serverOnly());
    check('W3 the 3a outage: from the Matomo server, "ongoing" in its own red', [s.outageSources, s.ongoing], [['HTTP status 403 from the Matomo server'], ['fwum-ongoing', 'fwum-ongoing']]);
    check('W8 "Matomo server" stays whole in the sub-rows and the outage list', [s.subSidesRaw[0],
        s.outageSourcesRaw[0].endsWith('from the Matomo server')], ['Matomo server', true]);
    s = await mounted(browser, serverOnly({ width: 390 }));
    check('W8 ... and in the narrow list', s.listRaw[3].indexOf('from the Matomo server') > 0, true);

    // D2 phones: both names and uptimes above each strip pair, then the strip and its lane, one axis under the last lane
    s = await mounted(browser, both({ width: 390 }));
    check('D2 narrow: names and uptimes first, then the strip and its lane; the axis under the last lane', s.stripLayout,
        [['Matomo 100%', 'from outside 100%', 'strip', 'lane'], ['This website 100%', 'from outside 100%', 'strip', 'lane+axis']]);
    check('D2 ... the names as before', [s.strips, s.lanes, s.axes], [['Matomo', 'from outside', 'This website', 'from outside'], 2, 1]);
    s = await mounted(browser, both());
    check('D2 wide: the rows of P1', s.stripLayout, ['row', 'row', 'row', 'row']);
    s = await mounted(browser, both({ width: 390, status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 97.917)] }, outsideMeasured: { matomo: true, website: false } }));
    check('D2 narrow: a group without results from outside keeps its row, with the axis', [s.stripLayout, s.axes],
        [[['Matomo 100%', 'from outside 100%', 'strip', 'lane'], 'row'], 1]);
    s = await mounted(browser, scenario({ width: 390, config: { external: null } }));
    check('D2 narrow without a source: each strip its row and axis, as before', [s.stripLayout, s.axes, s.strips], [['row', 'row'], 2, ['Matomo', 'This website']]);

    // D3 widgets: a side that cannot check the address adds no line (a green widget stays one line per address)
    const privateOutside = (extra) => scenario(Object.assign({
        status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'not_checkable', outsideError: 'blocked' })] },
        uptime: { 0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)), 1: [uptimeRow(WEB, 'web', 100)] },
        config: { variant: 'site', external: ACTIVE }, width: 300,
    }, extra));
    s = await mounted(browser, privateOutside());
    const plainSite = await mounted(browser, privateOutside({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        config: { variant: 'site', external: null } }));
    check('D3 widget: the outside cannot check it: the server\'s line as without a source', [s.listShown, s.listClasses], [plainSite.listShown, plainSite.listClasses]);
    check('D3 ... which is one line', s.listShown, ['www.example.com 120 ms 100%']);
    s = await mounted(browser, privateOutside({ width: 390, config: { variant: 'page', external: ACTIVE } }));
    check('D3 the page keeps both sides', s.listShown.slice(-1), ['www.example.com 120 ms 100% from the Matomo server Not checkable from outside']);
    const tooLarge = (extra) => both(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'not_checkable', { days: 63, error: 'content', note: 'too_large', outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', null, 0), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        width: 300, config: { variant: 'matomo', external: ACTIVE },
    }, extra));
    s = await mounted(browser, tooLarge());
    check('D3 Matomo widget: too large for the server, reachable from outside: one line, the outside named', [s.listShown[3], s.listClasses[3]],
        ['Tag Manager container Ab12Cd34 118 ms 100% from outside', 'is-up']);

    // W2: while results from outside show, the answer line and the note name "the Matomo server"; a screen without
    // any result from outside stays the page without the add-on ("this server")
    const hidden = target('web:intranet.example.com', 'web', 'https://intranet.example.com/', 'not_checkable', { error: 'connect' });
    s = await mounted(browser, both({ status: { 0: matomoBoth(), 1: [hidden] }, uptime: { 0: matomoUptime(), 1: [] }, outsideMeasured: { matomo: true, website: false } }));
    check('W2 with results from outside: the answer and the note name the Matomo server',
        [s.lines[0].text.indexOf('This website: Not checkable from the Matomo server'), s.nc.indexOf('1 address cannot be checked from the Matomo server and does not count as an outage.')], [0, 0]);
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [hidden] }, uptime: { 0: ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100)), 1: [] },
        config: { external: ACTIVE } }));
    check('W2 an active source, nothing from outside on the screen: "this server" as before',
        [s.lines[0].text.indexOf('This website: Not checkable from this server'), s.nc.indexOf('1 address cannot be checked from this server and does not count as an outage.')], [0, 0]);

    // W5: an agreeing row shows one value; screen readers hear the outside's too
    s = await mounted(browser, both());
    check('W5 an agreeing row: the outside\'s value for screen readers, not on screen', [s.cellAsides[0], s.rows[0]],
        [', Checked from outside: 118 ms', ['is-up', 'Interface', '120 ms', '100%', '63 days']]);
    s = await mounted(browser, both({ width: 390 }));
    check('W5 ... in the narrow list too', [s.listShown[0], s.listRaw[0].indexOf('Checked from outside: 118 ms') > 0], ['Interface 120 ms 100%', true]);
    s = await mounted(browser, serverOnly());
    check('W5 two lines: nothing more to hear', s.cellAsides[3], null);
    s = await mounted(browser, scenario({ config: { external: null } }));
    check('W5 without a source: no such text', s.cellAsides, [null, null, null, null]);
}

/**
 * Review fixes before 5.3.0 (Peter's standing order, verbatim "alle offenen punkte umsetzen"). L8 blocker: 3a never
 * shows a real outage as amber: amber only when the outside's "up" is newer than the start of the server's failure (its
 * open outage, else its failing check) and no outage seen from outside is open for the address; the cause names a side
 * by the same rule. NIT 2 the answer lines worst first by their own colour; NIT 3 an outside without a current result
 * adds no words; NIT 4 P3 per address; UI review B1 the side lines' values one unit; L2, L3, L4. Without a source nothing
 * changes.
 */
async function review530(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const DAY = '2026-11-25';
    const CONTAINER = 'ctr:Ab12Cd34';
    const CONTAINER_URL = 'https://matomo.example.org/js/container_Ab12Cd34.js';
    const SHOP = 'web:shop.example.com';
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = () => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')));
    // the server cannot read the container since 9:20 (its outage open), its latest check at 9:55
    const LOCAL_OPEN = { idSite: 1, targetKey: CONTAINER, kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' };
    const OUTSIDE_OPEN = Object.assign({}, LOCAL_OPEN, { source: 'external', start: '2026-11-26T09:22:00Z' });
    const container = (more, extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'down', Object.assign({ days: 63, error: 'http_status', httpStatus: 403, outside: 'up' }, more))] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 94.65), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE }, incidents: [LOCAL_OPEN],
    }, extra));
    const RED = 'Matomo: Tag Manager container Ab12Cd34 not reachable since 9:20 AM (HTTP status 403) checked 5 minutes ago';
    const AMBER = 'Matomo: Tag Manager container Ab12Cd34 not reachable from the Matomo server since 9:20 AM (HTTP status 403) checked 5 minutes ago';
    const MATOMO_WIDGET = { width: 300, config: { variant: 'matomo', external: ACTIVE } };
    const SITE_WIDGET = { width: 300, config: { variant: 'site', external: ACTIVE } };

    // L8 blocker, scenario A: the outside's "up" was probed at 9:15, before the server's outage opened at 9:20
    const a = { outsideCheckedAt: '2026-11-26T09:15:00Z' };
    let s = await mounted(browser, container(a));
    check('L8 A the answer: red, no side', s.lines[0], { cls: 'is-down', muted: false, text: RED });
    // quick UI review before 5.3.0, QL2: the outside's "up" that does not count is muted
    check('L8 A the row and the server\'s line: red', [s.rows[3][0], s.subTones], ['is-down', ['is-down', 'fwum-line--muted']]);
    s = await mounted(browser, container(a, { width: 390 }));
    check('L8 A narrow: the row and the server\'s line red', [s.listClasses[3], s.sideClasses], ['is-down', ['fwum-targets__text is-down', 'fwum-targets__text is-up']]);
    s = await mounted(browser, container(a, MATOMO_WIDGET));
    check('L8 A Matomo widget: the count names no side, the line red', [s.lines[0].text.indexOf('1 of 4 addresses not reachable since 9:20 AM (HTTP status 403)'),
        s.lines[0].text.indexOf('Matomo server'), s.listClasses], [0, -1, ['is-down']]);
    s = await mounted(browser, container(a, SITE_WIDGET));
    check('L8 A website widget: the container note names no side', (s.containerNote || '').indexOf('Tag Manager container Ab12Cd34 not reachable (counted with Matomo).'), 0);
    s = await mounted(browser, container(a, { date: DAY }));
    check('L8 A past day: the Now line red, no side', [s.lines[0].cls, s.lines[0].text.indexOf('Now: Matomo: Tag Manager container Ab12Cd34 not reachable since')], ['is-down', 0]);

    // probed at 9:25, after the failure began: amber (3a)
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }));
    check('L8 an "up" after the failure began: amber', s.lines[0], { cls: 'is-partial', muted: false, text: AMBER });

    // scenario B: the same "up" at 9:25, but an outage seen from outside is open since 9:22 (its latest minute read up)
    const b = { outsideCheckedAt: '2026-11-26T09:25:00Z' };
    const bOpen = { incidents: [LOCAL_OPEN, OUTSIDE_OPEN] };
    s = await mounted(browser, container(b, bOpen));
    check('L8 B the answer: red, no side', s.lines[0], { cls: 'is-down', muted: false, text: RED });
    check('L8 B the row: red', [s.rows[3][0], s.subTones[0]], ['is-down', 'is-down']);
    s = await mounted(browser, container(b, Object.assign({ width: 390 }, bOpen)));
    check('L8 B narrow: the server\'s line red', [s.listClasses[3], s.sideClasses[0]], ['is-down', 'fwum-targets__text is-down']);
    s = await mounted(browser, container(b, Object.assign({}, MATOMO_WIDGET, bOpen)));
    check('L8 B Matomo widget: no side, the line red', [s.lines[0].text.indexOf('Matomo server'), s.listClasses], [-1, ['is-down']]);
    s = await mounted(browser, container(b, Object.assign({}, SITE_WIDGET, bOpen)));
    check('L8 B website widget: the container note names no side', (s.containerNote || '').indexOf('Tag Manager container Ab12Cd34 not reachable (counted with Matomo).'), 0);

    // no outage row of the server: its failing check (9:55) is the start; the outside's 9:50 is older, 9:57 newer
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:50:00Z' }, { incidents: [] }));
    check('L8 without an outage row: an "up" older than the failing check: red', [s.lines[0].cls, s.lines[0].text.indexOf('Matomo server')], ['is-down', -1]);
    // review of the 5.3.0 fixes, SHOULD 2: more than the margin (120 s) after the failing check
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:58:30Z' }, { incidents: [] }));
    check('L8 without an outage row: an "up" after the failing check: amber', [s.lines[0].cls,
        s.lines[0].text.indexOf('Matomo: Tag Manager container Ab12Cd34 not reachable from the Matomo server')], ['is-partial', 0]);
    // the outages open now could not be loaded: never amber
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:58:30Z' }, { incidents: [], failOpen: true }));
    check('L8 the open outages failed to load: red', [s.lines[0].cls, s.rows[3][0]], ['is-down', 'is-down']);

    // the mirror in the cause: down from outside since 9:56 (open), the server's "up" at 9:55 names no side; at 9:57 it does
    const fromOutside = (checkedAt) => scenario({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, checkedAt, outside: 'down',
            outsideError: 'http_status', outsideStatus: 502, outsideCheckedAt: '2026-11-26T09:58:00Z' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 99, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:56:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    });
    s = await mounted(browser, fromOutside('2026-11-26T09:55:00Z'));
    check('L8 mirror: the server has not checked it since the outside\'s failure began: no side',
        s.lines[0].text.indexOf('This website: www.example.com not reachable since 9:56 AM (HTTP status 502) checked'), 0);
    // more than the margin after the outside's failure began (SHOULD 2)
    s = await mounted(browser, fromOutside('2026-11-26T09:58:30Z'));
    check('L8 mirror: the server reached it since: from outside',
        s.lines[0].text.indexOf('This website: www.example.com not reachable since 9:56 AM (HTTP status 502, from outside) checked'), 0);

    // NIT 2: the answer lines worst first by their own colour: the website's red named line before Matomo's amber 3a line
    const twoSites = (matomo, site, extra) => scenario(Object.assign({ status: { 0: matomo, 1: site }, incidents: [LOCAL_OPEN,
        { idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-26T09:30:00Z', end: null }] }, extra));
    s = await mounted(browser, twoSites(matomoBoth(), [target(WEB, 'web', 'https://www.example.com/', 'down', { days: 41, outside: 'down' }),
        target(SHOP, 'web', 'https://shop.example.com/', 'up', { days: 41, outside: 'up' }),
        target(CONTAINER, 'container', CONTAINER_URL, 'down', { days: 63, error: 'http_status', httpStatus: 403, outside: 'up' })],
    { outsideMeasured: true, config: { external: ACTIVE } }));
    check('NIT 2 the red line first, then the amber one', s.lines.map((l) => [l.cls, l.text.slice(0, 13)]),
        [['is-down', 'This website:'], ['is-partial', 'Matomo: Tag M']]);
    // without a source too since part 1 of the robustness release (NIT 2): the red line first, then Matomo's amber count
    s = await mounted(browser, twoSites(['ui', 'tracker'].map((k) => target(k, k, MATOMO_URL + k, 'down', { days: 63 }))
        .concat([target('js', 'js', MATOMO_URL + 'js', 'up', { days: 63 })]), [target(WEB, 'web', 'https://www.example.com/', 'down', { days: 41 }),
        target(SHOP, 'web', 'https://shop.example.com/', 'up', { days: 41 })], { config: { external: null } }));
    check('NIT 2 without a source: the red line first as well', s.lines.map((l) => [l.cls, l.text.slice(0, 13)]),
        [['is-down', 'This website:'], ['is-partial', 'Matomo: 2 of ']]);

    // NIT 3: the outside stopped checking the website (no current result), its uptime today 99.8%: no words for it
    const stopped = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 99.8, 50, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, stopped({ width: 390 }));
    check('NIT 3 narrow: an outside without a current result shows its uptime, no words', s.listShown[3],
        'www.example.com 120 ms 100% from the Matomo server 99.8% from outside');
    s = await mounted(browser, stopped({ width: 300, config: { variant: 'site', external: ACTIVE } }));
    check('NIT 3 widget: no line for it', s.listShown, ['www.example.com 120 ms 100%']);

    // NIT 4: P3 per address: the website down from outside 12:00 to 12:25 only, Matomo's container down from the
    // server all day: the server never saw the website's outage
    s = await mounted(browser, scenario({
        date: DAY, outsideMeasured: true, config: { external: ACTIVE },
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'up', { days: 63, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 0), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        incidents: [{ idSite: 1, targetKey: CONTAINER, kind: 'container', start: DAY + 'T00:00:00Z', end: '2026-11-26T00:00:00Z' },
            { idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: DAY + 'T12:00:00Z', end: DAY + 'T12:25:00Z' }],
    }));
    check('NIT 4 P3 per address: the website\'s minutes seen only from outside count', s.lines[0].text.indexOf('(25 min seen only from outside)') > 0, true);

    // UI review B1: in a side line the values are one unit beside the side's name (they move under it as a whole)
    s = await mounted(browser, container({}, { width: 390 }));
    check('B1 narrow: each side line holds its values as one unit and the name', s.sideUnits,
        [['fwum-targets__pair', 'fwum-targets__from'], ['fwum-targets__pair', 'fwum-targets__from']]);

    // L2, L3: a container too large to read names no side in the narrow list either; "(over 4 MB)" stays whole
    const tooLarge = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'not_checkable', { days: 63, error: 'content', note: 'too_large', outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', null, 0), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }, extra));
    s = await mounted(browser, tooLarge({ width: 390 }));
    check('L2 narrow: too large to read, no side named', s.listShown[3], 'Tag Manager container Ab12Cd34 118 ms 100% from outside Too large to check (over 4 MB)');
    check('L3 narrow: the brackets whole', s.listRaw[3].indexOf('(over 4 MB)') > 0, true);
    s = await mounted(browser, tooLarge());
    check('L3 table: the brackets whole', s.subTextsRaw[1].indexOf('(over 4 MB)') > 0, true);

    // L4: the website widget on a past day lists the lower uptime first, as the page and its figure
    const pastWidget = (extra) => scenario(Object.assign({ date: DAY, width: 300,
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] },
        outsideMeasured: true, config: { variant: 'site', external: ACTIVE } }, extra));
    s = await mounted(browser, pastWidget());
    check('L4 widget, past day: the lower uptime first', s.listShown, ['www.example.com 118 ms 98.26% from outside 120 ms 100% from the Matomo server']);
    s = await mounted(browser, scenario({ date: DAY, width: 300, config: { variant: 'site', external: null } }));
    check('L4 widget, past day, without a source: one line as before', s.listShown, ['www.example.com 120 ms 97.92%']);

    // without a source: no side units, no new words (the guards of the page as in v5.2.0)
    s = await mounted(browser, scenario({ width: 390, config: { external: null } }));
    check('without a source: the narrow list as before', [s.listShown, s.sideUnits],
        [['Interface 120 ms 100%', 'Tracker endpoint 120 ms 100%', 'JavaScript tracker 120 ms 100%', 'www.example.com 120 ms 97.92%'], []]);
    s = await mounted(browser, container({ outside: undefined }, { config: { external: null } }));
    check('without a source: a down container red, no side, as before', [s.lines[0].cls, s.lines[0].text], ['is-down', RED]);
}

/**
 * Peter's answer to the three design proposals of the UI review before 5.3.0, verbatim "Ansonsten alle wie empfohlen
 * umsetzen": D1 the lower of a group's two uptimes at the end of its strips is the bold one; D2 a table row the sides
 * disagree on gets one indented sub-row per side (its name, its plain values); D3 the outage table without the "Checked
 * from" column, the side after the cause in muted words. Without a source nothing changes.
 */
async function design530(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const DAY = '2026-11-25';
    const CONTAINER = 'ctr:Ab12Cd34';
    const CONTAINER_URL = 'https://matomo.example.org/js/container_Ab12Cd34.js';
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = () => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')));
    const both = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }, extra));

    // D1: the website down from outside for an hour on Nov 25: its lane's lower uptime is the bold one, the server's
    // muted; Matomo's two sides are the same: the server's bold, as before
    let s = await mounted(browser, both({ date: DAY, outsideDown: { website: [12] } }));
    check('D1 the lower uptime of a group is the bold one, whichever row', s.stripUptimes,
        [['100%', false], ['100%', true], ['100%', true], ['95.83%', false]]);
    s = await mounted(browser, both({ date: DAY, width: 390, outsideDown: { website: [12] } }));
    check('D1 ... on phones too', s.stripUptimes, [['100%', false], ['100%', true], ['100%', true], ['95.83%', false]]);
    s = await mounted(browser, scenario({ date: DAY, config: { external: null } }));
    check('D1 without a source: each group\'s uptime bold as before', s.stripUptimes, [['100%', false], ['100%', false]]);

    // D2: the container down only from the Matomo server (3a): its row, then a sub-row per side with plain values
    const serverOnly = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'down', { days: 63, error: 'http_status', httpStatus: 403, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 94.65), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: CONTAINER, kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' }],
    }, extra));
    s = await mounted(browser, serverOnly());
    check('D2 the row the sides disagree on: address and certificate', s.rows[3], ['is-partial', 'Tag Manager container Ab12Cd34', '', '', '63 days']);
    check('D2 ... a sub-row per side, the failing side first, each named once, plain values', s.subRows,
        [['Matomo server', 'HTTP status 403', '94.65%', ''], ['Outside', '118 ms', '100%', '']]);
    check('D2 ... the server\'s response amber (3a)', s.subTones, ['is-partial', '']);
    check('D2 ... the tooltip names both sides, as before', s.subTitles[0], 'Checked from the Matomo server: HTTP status 403\nChecked from outside: 118 ms');
    s = await mounted(browser, both());
    check('D2 the sides agree: one line, no sub-rows', [s.rows.length, s.subRows], [4, []]);
    // a container too large for any server: the outside first, the server's sub-row with an empty side cell
    s = await mounted(browser, both({ status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
        target(CONTAINER, 'container', CONTAINER_URL, 'not_checkable', { days: 63, error: 'content', note: 'too_large', outside: 'up' })] },
    uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
        uptimeRow(CONTAINER, 'container', null, 0), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] } }));
    check('D2 too large: the outside first, no side named for the size', s.subRows,
        [['Outside', '118 ms', '100%', ''], ['', 'Too large to check (over 4 MB)', '', '']]);
    // a past day: Uptime only, the lower first
    s = await mounted(browser, both({ date: DAY, uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 98.264, 100, 'external')] } }));
    check('D2 past day: the lower uptime\'s side first', [s.rows[3], s.subRows], [['is-partial', 'www.example.com', '', '41 days'],
        [['Outside', '98.26%', ''], ['Matomo server', '100%', '']]]);
    s = await mounted(browser, scenario({ config: { external: null } }));
    check('D2 without a source: no sub-rows', [s.rows.length, s.subRows], [4, []]);

    // D3: one outage seen from both sides: no Checked from column, the sides after the cause in muted words
    const local = (from, to, extra) => Object.assign({ idSite: 1, targetKey: WEB, kind: 'web', start: DAY + 'T' + from + ':00Z',
        end: DAY + 'T' + to + ':00Z' }, extra);
    const outside = (from, to) => local(from, to, { source: 'external', cause: 'http_status', detail: 'HTTP 502' });
    s = await mounted(browser, both({ date: DAY, incidents: [local('08:00', '09:00'), outside('08:30', '09:30'), outside('12:00', '12:25')] }));
    check('D3 the outage table: four columns, the side after the cause', s.outages, [
        ['Nov 25, 2026, 12:00 PM', '25 min', 'www.example.com', 'HTTP status 502 from outside'],
        ['Nov 25, 2026, 8:00 AM', '1 h 30 min', 'www.example.com', 'no answer within 10 seconds and HTTP status 502 from the Matomo server and from outside']]);
    check('D3 ... read with a comma before the side', s.outageCausesRaw[1].endsWith('HTTP status 502, from the Matomo server and from outside'), true);
    check('D3 ... no Checked from heading', s.outageHeads, ['Start', 'Duration', 'What', 'Cause']);
    s = await mounted(browser, scenario({ date: DAY, config: { external: null }, incidents: [local('08:00', '09:00')] }));
    check('D3 without a source: as before', [s.outages, s.outageHeads],
        [[['Nov 25, 2026, 8:00 AM', '1 h', 'www.example.com', 'no answer within 10 seconds']], ['Start', 'Duration', 'What', 'Cause']]);
}

/**
 * The last findings before 5.3.0 (Peter's standing order, verbatim "alle offenen punkte umsetzen"): the review of the
 * 5.3.0 fixes (SHOULD 1: the other side's outage counts as open while it ended at or after the failing side's latest
 * failing check; SHOULD 2: the other side's result counts only beyond the margin, external.sidesMargin, 120 s by default)
 * and the quick UI review (QB1 the muted uptime in normal weight under Morpheus's bold strong; QL1 the side named once;
 * QL2 an uncounted "up" muted; QL4 the address for screen readers in a sub-row).
 */
async function final530(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null };
    const DAY = '2026-11-25';
    const CONTAINER = 'ctr:Ab12Cd34';
    const CONTAINER_URL = 'https://matomo.example.org/js/container_Ab12Cd34.js';
    const SHOP = 'web:shop.example.com';
    const matomoBoth = () => ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'up', { days: 63, outside: 'up' }));
    const matomoUptime = () => ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100))
        .concat(['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100, 100, 'external')));
    // the server cannot read the container since 9:20 (its outage open)
    const LOCAL_OPEN = { idSite: 1, targetKey: CONTAINER, kind: 'container', start: '2026-11-26T09:20:00Z', end: null, cause: 'http_status', detail: 'HTTP 403' };
    const container = (more, extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'down', Object.assign({ days: 63, error: 'http_status', httpStatus: 403, outside: 'up' }, more))] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', 94.65), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE }, incidents: [LOCAL_OPEN],
    }, extra));
    const amber = (s) => [s.lines[0].cls, s.lines[0].text.indexOf('not reachable from the Matomo server since 9:20 AM') > 0];
    const RED = ['is-down', false];
    const MATOMO_WIDGET = { width: 300, config: { variant: 'matomo', external: ACTIVE } };
    const SITE_WIDGET = { width: 300, config: { variant: 'site', external: ACTIVE } };

    // SHOULD 1: the outside saw the outage too, 9:22 to 9:40, and reaches the container since (9:45); the server's latest
    // failing check was at 9:30, before that end: it has not checked it since the recovery
    const OUTSIDE_CLOSED = { idSite: 1, targetKey: CONTAINER, kind: 'container', source: 'external', start: '2026-11-26T09:22:00Z',
        end: '2026-11-26T09:40:00Z', cause: 'http_status', detail: 'HTTP 502' };
    const closed = (checkedAt, extra) => container({ checkedAt, outsideCheckedAt: '2026-11-26T09:45:00Z' },
        Object.assign({ incidents: [LOCAL_OPEN, OUTSIDE_CLOSED] }, extra));
    let s = await mounted(browser, closed('2026-11-26T09:30:00Z'));
    check('SHOULD 1 the outside closed an outage both saw after the server\'s latest failing check: red, no side', amber(s), RED);
    check('SHOULD 1 ... the row red, the outside\'s "up" muted (QL2)', [s.rows[3][0], s.subTones], ['is-down', ['is-down', 'fwum-line--muted']]);
    check('SHOULD 1 ... the outages open now or ended since yesterday, from both sides', s.incidentRequests.map((r) => [r.idSite, r.period,
        r.date, r.state, r.limit, r.source]).filter((r) => r[3] !== undefined && r[2] === 'last2'),
    [[0, 'range', 'last2', 'all', 1000, 'all'], [1, 'range', 'last2', 'all', 1000, 'all']]);
    s = await mounted(browser, closed('2026-11-26T09:40:00Z'));
    check('SHOULD 1 a failing check at the end itself: red', amber(s), RED);
    s = await mounted(browser, closed('2026-11-26T09:50:00Z'));
    check('SHOULD 1 the server failed again after the end: amber (3a)', amber(s), ['is-partial', true]);
    s = await mounted(browser, closed('2026-11-26T09:30:00Z', { width: 390 }));
    check('SHOULD 1 narrow: the row and the server\'s line red', [s.listClasses[3], s.sideClasses[0]], ['is-down', 'fwum-targets__text is-down']);
    s = await mounted(browser, closed('2026-11-26T09:30:00Z', MATOMO_WIDGET));
    check('SHOULD 1 Matomo widget: no side, the line red', [s.lines[0].text.indexOf('Matomo server'), s.listClasses], [-1, ['is-down']]);
    s = await mounted(browser, closed('2026-11-26T09:30:00Z', SITE_WIDGET));
    check('SHOULD 1 website widget: the container note names no side', (s.containerNote || '').indexOf('Tag Manager container Ab12Cd34 not reachable (counted with Matomo).'), 0);
    s = await mounted(browser, closed('2026-11-26T09:30:00Z', { date: DAY }));
    check('SHOULD 1 past day: the Now line red, no side', [s.lines[0].cls, s.lines[0].text.indexOf('Matomo server')], ['is-down', -1]);
    // across midnight: the server's failing check at 23:40, the outside's outage ended at 23:50 (yesterday's list)
    s = await mounted(browser, container({ checkedAt: '2026-11-25T23:40:00Z', outsideCheckedAt: '2026-11-25T23:55:00Z' }, {
        incidents: [Object.assign({}, LOCAL_OPEN, { start: '2026-11-25T23:30:00Z' }), Object.assign({}, OUTSIDE_CLOSED,
            { start: '2026-11-25T23:32:00Z', end: '2026-11-25T23:50:00Z' })] }));
    check('SHOULD 1 an end before midnight still counts: red, no side', [s.lines[0].cls, s.lines[0].text.indexOf('Matomo server')], ['is-down', -1]);
    // a cut list (1000 rows, the API's limit) may leave out the oldest open outage: not known, red
    const many = [];
    for (let n = 0; n < 1000; n++) {
        const start = Date.parse('2026-11-26T09:21:00Z') + n * 2000;
        many.push({ idSite: 1, targetKey: SHOP, kind: 'web', start: new Date(start).toISOString().replace('.000Z', 'Z'),
            end: new Date(start + 1000).toISOString().replace('.000Z', 'Z') });
    }
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }, { incidents: [LOCAL_OPEN].concat(many) }));
    check('SHOULD 1 a list cut at its limit: red', [s.lines[0].cls, s.lines[0].text.indexOf('Matomo server')], ['is-down', -1]);
    // without a source: the request for the outages open now as before
    s = await mounted(browser, container({ outside: undefined }, { config: { external: null } }));
    check('SHOULD 1 without a source: the open outages as before', s.incidentRequests.filter((r) => r.state === 'open' || r.date === 'last2')
        .map((r) => [r.idSite, r.period, r.date, r.state, r.limit, r.source]), [[0, 'day', 'today', 'open', 100, 'local'], [1, 'day', 'today', 'open', 100, 'local']]);

    // SHOULD 1, the mirror in the cause: the server's outage of the website 9:20 to 9:40, its "up" at 9:40; the outside's
    // outage open since 9:22, its latest pulled result down at 9:35 (before the server's recovery), then at 9:50
    const mirror = (outsideCheckedAt) => scenario({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, checkedAt: '2026-11-26T09:40:00Z',
            outside: 'down', outsideError: 'http_status', outsideStatus: 502, outsideCheckedAt })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 98), uptimeRow(WEB, 'web', 97, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-26T09:20:00Z', end: '2026-11-26T09:40:00Z' },
            { idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:22:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    });
    s = await mounted(browser, mirror('2026-11-26T09:35:00Z'));
    check('SHOULD 1 mirror: the outside has not checked it since the server\'s outage ended: no side',
        s.lines[0].text.indexOf('This website: www.example.com not reachable since 9:22 AM (HTTP status 502) checked'), 0);
    s = await mounted(browser, mirror('2026-11-26T09:50:00Z'));
    check('SHOULD 1 mirror: the outside still fails after the server\'s recovery: from outside',
        s.lines[0].text.indexOf('This website: www.example.com not reachable since 9:22 AM (HTTP status 502, from outside) checked'), 0);

    // SHOULD 2: the server stamps a run's results with its start; an "up" from outside counts only more than the margin
    // (120 s without the server's value) after the start of the failure (9:20)
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:20:30Z' }));
    check('SHOULD 2 an "up" 30 s after the failure began: red', amber(s), RED);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:22:00Z' }));
    check('SHOULD 2 ... exactly the margin: red', amber(s), RED);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:23:00Z' }));
    check('SHOULD 2 ... 3 minutes after: amber', amber(s), ['is-partial', true]);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:20:30Z' }, MATOMO_WIDGET));
    check('SHOULD 2 Matomo widget: no side', [s.lines[0].text.indexOf('Matomo server'), s.listClasses], [-1, ['is-down']]);
    const wider = { config: { external: Object.assign({}, ACTIVE, { sidesMargin: 300 }) } };
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:23:00Z' }, wider));
    check('SHOULD 2 the server\'s margin (300 s): 3 minutes after reads red', amber(s), RED);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:26:00Z' }, wider));
    check('SHOULD 2 ... 6 minutes after: amber', amber(s), ['is-partial', true]);
    // the mirror: down from outside since 9:56, the server's "up" a minute later names no side
    const fromOutside = (checkedAt) => scenario({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, checkedAt, outside: 'down',
            outsideError: 'http_status', outsideStatus: 502, outsideCheckedAt: '2026-11-26T09:58:00Z' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 99, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:56:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    });
    s = await mounted(browser, fromOutside('2026-11-26T09:57:00Z'));
    check('SHOULD 2 mirror: the server\'s "up" a minute after the outside\'s failure began: no side',
        [s.lines[0].text.indexOf('(HTTP status 502) checked') > 0, s.lines[0].text.indexOf('from outside')], [true, -1]);

    // QL1: an address down only from outside, in a group of two: the line names the side once (page and widget)
    const outsideOnly = (extra) => scenario(Object.assign({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, checkedAt: '2026-11-26T09:59:00Z',
            outside: 'down', outsideError: 'http_status', outsideStatus: 502, outsideCheckedAt: '2026-11-26T09:58:00Z' }),
        target(SHOP, 'web', 'https://shop.example.com/', 'up', { days: 41, outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 99, 100, 'external'),
            uptimeRow(SHOP, 'web', 100), uptimeRow(SHOP, 'web', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
        incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', source: 'external', start: '2026-11-26T09:56:00Z', end: null, cause: 'http_status', detail: 'HTTP 502' }],
    }, extra));
    const times = (text) => (text.match(/from outside/g) || []).length;
    s = await mounted(browser, outsideOnly());
    check('QL1 page: the side named once', [s.lines[0].text.indexOf('(HTTP status 502, from outside)') > 0, times(s.lines[0].text)], [true, 1]);
    s = await mounted(browser, outsideOnly(SITE_WIDGET));
    check('QL1 widget: the count line names the side once', [s.lines[0].text.indexOf('1 of 2 addresses not reachable since 9:56 AM (HTTP status 502, from outside)'),
        times(s.lines[0].text)], [0, 1]);

    // QL2: in the amber case the outside's "up" counts: not muted; B (an outage from outside open): muted
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }));
    check('QL2 the amber case: the outside\'s value plain', s.subTones, ['is-partial', '']);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }, { incidents: [LOCAL_OPEN,
        Object.assign({}, LOCAL_OPEN, { source: 'external', start: '2026-11-26T09:22:00Z' })] }));
    check('QL2 B: the outside\'s value muted', s.subTones, ['is-down', 'fwum-line--muted']);
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }, { config: { external: null } }));
    check('QL2 without a source: no sub-rows', s.subTones, []);

    // QL4: screen readers hear the address before a sub-row's side; the too-large container names no side
    s = await mounted(browser, container({ outsideCheckedAt: '2026-11-26T09:25:00Z' }));
    check('QL4 the address before the side, for screen readers', [s.subSidesSr, s.subRows.map((r) => r[0])],
        [['Tag Manager container Ab12Cd34, ', 'Tag Manager container Ab12Cd34, '], ['Matomo server', 'Outside']]);
    s = await mounted(browser, scenario({
        status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' }),
            target(CONTAINER, 'container', CONTAINER_URL, 'not_checkable', { days: 63, error: 'content', note: 'too_large', outside: 'up' })] },
        uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external'),
            uptimeRow(CONTAINER, 'container', null, 0), uptimeRow(CONTAINER, 'container', 100, 100, 'external')] },
        outsideMeasured: true, config: { external: ACTIVE },
    }));
    check('QL4 too large: the address alone where no side is named', s.subSidesSr, ['Tag Manager container Ab12Cd34, ', 'Tag Manager container Ab12Cd34']);

    // QB1: Matomo's Morpheus makes every strong bold with !important; the muted uptime is no strong, so it stays normal
    const { page, context } = await open(browser, false);
    try {
        await page.addStyleTag({ content: 'strong { font-weight: 700 !important; }' });
        const figures = await page.evaluate(async (data) => window.fwumSummary((await window.fwumMount(data)).root).stripFigures,
            scenario({ date: DAY, outsideMeasured: true, outsideDown: { website: [12] }, config: { external: ACTIVE },
                status: { 0: matomoBoth(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41, outside: 'up' })] },
                uptime: { 0: matomoUptime(), 1: [uptimeRow(WEB, 'web', 100), uptimeRow(WEB, 'web', 100, 100, 'external')] } }));
        check('QB1 the bold figure a strong in bold, the muted one a span in normal weight (Morpheus\'s strong rule)', figures,
            [['100%', 'STRONG', '700'], ['100%', 'SPAN', '400'], ['100%', 'SPAN', '400'], ['95.83%', 'STRONG', '700']]);
    } finally {
        await context.close();
    }
}

/** mounts the admin page on a new page; after 'show' the folded websites are shown again */
async function admin(browser, data, after) {
    const { page, context } = await open(browser, false);
    try {
        return await page.evaluate(async ({ data, after }) => {
            const root = await window.fwumMountAdmin(data);
            // P2: a chip's Copy on plain HTTP takes the textarea way; the text it copies is kept
            if (typeof after === 'string' && /^copy2?:/.test(after)) {
                document.execCommand = () => {
                    const area = document.querySelector('body > textarea');
                    window.fwumCopiedText = area ? area.value : null;
                    return true;
                };
                const button = root.querySelector('li.fwum-admin__' + after.split(':')[1] + ' .fwum-chip button');
                if (button) {
                    button.click();
                }
                // L3: "Copied" reaches the polite region a moment after the click
                await new Promise((r) => setTimeout(r, 250));
                // L3: a second click empties the region and fills it again, so screen readers say it again
                if (button && after.indexOf('copy2:') === 0) {
                    const live = button.closest('.fwum-chip').querySelector('[aria-live]');
                    const seen = [];
                    const observer = live ? new MutationObserver(() => seen.push(live.textContent)) : null;
                    if (observer) {
                        observer.observe(live, { childList: true, characterData: true, subtree: true });
                    }
                    button.click();
                    await new Promise((r) => setTimeout(r, 250));
                    if (observer) {
                        observer.disconnect();
                    }
                    window.fwumLiveSeen = seen;
                }
            }
            // L9: the target panel from a website's pencil
            if (after === 'panel') {
                const button = root.querySelector('.fwum-admin__table .fwum-icon-only');
                if (button) {
                    button.click();
                }
                await new Promise((r) => setTimeout(r, 50));
            }
            if (after === 'show' || after === 'why') {
                const button = root.querySelectorAll('.fwum-nc .fwum-link-button')[after === 'why' ? 1 : 0];
                if (button) {
                    button.click();
                }
                await new Promise((r) => requestAnimationFrame(() => r()));
            }
            return window.fwumAdminSummary(root);
        }, { data, after });
    } finally {
        await context.close();
    }
}

/**
 * F2 and the alert row: the admin overview with results checked from outside. The API combines both sides
 * (getSitesOverview); the page folds what no side can check, without "from this server", and names an active source
 * that sends alerts itself instead of "No alerts".
 */
async function adminPage(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null, alerts: false };
    const ALERTING = Object.assign({}, ACTIVE, { alerts: true });
    const site = (idSite, name, counts) => Object.assign({ idSite, name, timezone: 'UTC', targets: 1, off: 0, up: 0, down: 0,
        notCheckable: 0, stale: 0, lastCheckedAt: CHECKED, certificateDaysLeft: null, certificateLevel: null, containersDown: [] }, counts);
    const overview = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { notCheckable: 1 }), site(2, 'Blog', { up: 1 })];
    const NO_ALERTS = 'No alerts: Feinwerk Sentinel is not installed.';
    const SENTINEL = 'Feinwerk Sentinel sends the alerts:';

    let s = await admin(browser, { overview, config: { external: null } });
    check('B11 finding 8, without a source: the intro says the checks run from this server', s.intro,
        'Matomo and every website with check targets. The checks run from this server; Checks and alerts below shows how often.');
    check('F2 without a source: the fold says from this server', s.fold.indexOf('Shop cannot be checked from this server and does not count as an outage.') === 0, true);
    check('alert row without a source: No alerts', [s.alertClass, s.alertLines.length, s.alertLines[0].indexOf(NO_ALERTS) === 0],
        ['is-warn', 1, true]);
    s = await admin(browser, { overview, config: { external: null } }, 'show');
    check('F2 without a source: the folded row, not checkable from this server', s.rows.slice(-1), [['Shop', 'Not checkable from this server']]);

    s = await admin(browser, { overview, config: { external: ACTIVE } });
    check('B11 finding 8, active: the intro names both sides', s.intro,
        'Matomo and every website with check targets. The checks run from the Matomo server and from outside; Checks and alerts below shows how often.');
    // 5.2.0 review B3: the outside has no result for Shop (it did not say it cannot check it): from this server
    // follow-up W2: while results from outside come in, the fold names the Matomo server, as the status rows do
    check('B3, W2 active: folded, from the Matomo server, since the outside did not say so', s.fold.indexOf('Shop cannot be checked from the Matomo server and does not count as an outage.') === 0, true);
    check('alert row: an active source that does not alert: still No alerts', [s.alertClass, s.alertLines[0].indexOf(NO_ALERTS) === 0], ['is-warn', true]);
    s = await admin(browser, { overview, config: { external: ACTIVE } }, 'show');
    check('B3, W2 active: the folded row, from the Matomo server', s.rows.slice(-1), [['Shop', 'Not checkable from the Matomo server']]);
    s = await admin(browser, { overview: [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { up: 1 })], config: { external: ACTIVE } });
    check('F2 active: a website reachable from outside is a row, nothing folded', [s.fold, s.rows.map((r) => r[1])], [null, ['Reachable', 'Reachable']]);

    // B3: no side can check Shop (the outside says so too): both named, and Why? gives both sides' reasons
    const either = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { notCheckable: 1, notCheckableOutside: 1 }), site(2, 'Blog', { up: 1 })];
    s = await admin(browser, { overview: either, config: { external: ACTIVE } }, 'why');
    check('B3 no side can check it: folded, both sides named', s.fold.indexOf('Shop cannot be checked from the Matomo server or from outside and does not count as an outage.'), 0);
    check('B3 ... Why? with both sides\' reasons', [s.why.indexOf('The Matomo server cannot reach'), s.why.indexOf('The checks from outside cannot reach such addresses either') > 0], [0, true]);
    s = await admin(browser, { overview: either, config: { external: ACTIVE } }, 'show');
    check('B3 ... its row', s.rows.slice(-1), [['Shop', 'Not checkable from the Matomo server or from outside']]);
    const mixed = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { notCheckable: 1, notCheckableOutside: 1 }), site(2, 'Blog', { notCheckable: 1 })];
    s = await admin(browser, { overview: mixed, config: { external: ACTIVE } }, 'why');
    check('B3, W2 one of them only from the server: from the Matomo server', s.fold.indexOf('Shop and Blog cannot be checked from the Matomo server and do not count as outages.'), 0);
    const four = [site(0, 'Matomo', { targets: 3, up: 3 })].concat(['Shop', 'Blog', 'Wiki', 'Docs'].map((name, i) => site(i + 1, name, { notCheckable: 1 })));
    s = await admin(browser, { overview: four, config: { external: ACTIVE } });
    check('W2 four folded websites: counted, from the Matomo server', s.fold.indexOf('4 websites cannot be checked from the Matomo server and do not count as outages.'), 0);
    s = await admin(browser, { overview: four, config: { external: null } });
    check('W2 ... without a source: from this server, as before', s.fold.indexOf('4 websites cannot be checked from this server and do not count as outages.'), 0);
    check('B3 ... Why? without the outside sentence', s.why.indexOf('The checks from outside'), -1);

    // L8 finding 6: the time of the latest results, not of the last contact (a push of settings reaches it too)
    s = await admin(browser, { overview, config: { external: Object.assign({}, ACTIVE, { resultsAt: '2026-11-26T08:00:00Z' }) } });
    check('L8 6: the time of the latest results', s.outsideRow, 'Also checked from outside: the latest results arrived 2 hours ago.');
    s = await admin(browser, { overview, config: { external: Object.assign({}, ACTIVE, { resultsAt: null }) } });
    check('L8 6: no results yet', s.outsideRow, 'Also checked from outside: no results have arrived yet.');

    // P4: one row for the checks from outside, right under the cron row, that also says it sends alerts; Sentinel's row
    // follows when Sentinel sends alerts, never "No alerts" while the source sends them
    s = await admin(browser, { overview, config: { external: ALERTING } });
    check('P4 the active source alerts: its row under the cron row says so, no alert row', [s.order, s.outsideRow, s.alertClass],
        [['cron', 'outside'], 'Also checked from outside: no results have arrived yet. Outside checks sends alerts for outages.', null]);
    s = await admin(browser, { overview, config: { external: Object.assign({}, ALERTING, { resultsAt: '2026-11-26T09:57:00Z' }) } });
    check('P4 ... with the time of its latest results', s.outsideRow,
        'Also checked from outside: the latest results arrived 3 minutes ago. Outside checks sends alerts for outages.');
    s = await admin(browser, { overview, config: { external: Object.assign({}, ALERTING, { settingsUrl: 'index.php?module=OutsideChecks&action=index' }) } });
    check('P4 ... its sentences and the link apart, as read', s.outsideRowRaw,
        'Also checked from outside: no results have arrived yet. Outside checks sends alerts for outages. Settings for the checks from outside');
    s = await admin(browser, { overview, config: { external: ALERTING, sentinel: 'active' } });
    check('P4 with Sentinel too: Sentinel\'s row follows in its own words', [s.order, s.alertClass, s.alertLines.length, s.alertLines[0].indexOf(SENTINEL) === 0],
        [['cron', 'outside', 'alerts'], 'is-ok', 2, true]);
    s = await admin(browser, { overview, config: { external: ALERTING, sentinel: 'old', sentinelVersion: '4.9.0' } });
    check('P4 an old Sentinel and an alerting source: no "No alerts" row', s.order, ['cron', 'outside']);
    s = await admin(browser, { overview, config: { external: Object.assign({}, ALERTING, { active: false }) } });
    check('P4 a paused source never counts as alerting: its row first, then No alerts', [s.order, s.alertClass, s.alertLines[0].indexOf(NO_ALERTS) === 0],
        [['cron', 'outside', 'alerts'], 'is-warn', true]);
    s = await admin(browser, { overview, config: { external: ACTIVE } });
    check('P4 an active source that does not alert: its row first, then No alerts', s.order, ['cron', 'outside', 'alerts']);
    s = await admin(browser, { overview, config: { sentinel: 'active' } });
    check('alert row: Sentinel alone as before', [s.order, s.alertClass, s.alertLines.length, s.alertLines[0].indexOf(SENTINEL) === 0], [['cron', 'alerts'], 'is-ok', 2, true]);

    // 5.3.1 hotfix: the server's PHP disables functions the checks need (getStatus disabledPhpFunctions): the reason
    // once, above the table, naming them, with the hint for the server administrator; the fold of the websites keeps
    // its names but no "Why?" about firewalls and no "Allow private addresses", which would not help
    const blocked = [site(0, 'Matomo', { targets: 3, notCheckable: 3 }), site(1, 'Shop', { notCheckable: 1 }), site(2, 'Blog', { notCheckable: 1 })];
    s = await admin(browser, { overview: blocked, config: { disabledPhpFunctions: ['curl_exec', 'curl_multi_exec'] } });
    check('php: the reason once, naming the functions, with the hint', s.php, [
        'The latest checks could not run: PHP on the Matomo server does not allow the outgoing requests they need. Missing PHP functions: curl_exec, curl_multi_exec.',
        'For the server administrator: remove these functions from disable_functions in php.ini.']);
    check('php: Matomo\'s row not checkable, the websites folded by name', [s.rows, s.fold.indexOf('Shop and Blog cannot be checked from this server and do not count as outages.')],
        [[['Matomo', 'Not checkable from this server']], 0]);
    check('php: the fold without Why? and without Allow private addresses', [s.foldControls, s.why], [['Show'], null]);
    s = await admin(browser, { overview: blocked, config: { disabledPhpFunctions: [] } });
    check('php: nothing missing: no reason, the fold as before', [s.php, s.foldControls], [[], ['Show', 'Why?', 'Allow private addresses']]);

    // robustness part 2 (getStatus transport): the checks go out one after the other through curl_exec, or through PHP's
    // streams where curl is missing: they work, so a neutral info row, not a warning; nothing for curl_multi, for no way
    // at all (the php row names the functions) and while Matomo's internet features are off (nothing is sent)
    const fine = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { up: 1 })];
    s = await admin(browser, { overview: fine, config: { transport: 'streams' } });
    check('transport: streams, one info row', [s.transport, s.transportClass, s.serverOrder], [[
        'The checks run through PHP\'s own network functions, as PHP\'s curl extension is not available on the Matomo server. They work as usual; a run with many addresses takes longer.'],
    'is-info icon-info', ['transport']]);
    s = await admin(browser, { overview: fine, config: { transport: 'curl_exec' } });
    check('transport: curl_exec, one info row', [s.transport, s.transportClass], [[
        'The checks run one after the other through PHP\'s curl_exec, as PHP on the Matomo server does not allow curl_multi_exec. They work as usual; a run with many addresses takes longer.'],
    'is-info icon-info']);
    // the streams without PHP's TLS functions: the php row names them, and no row says the checks work as usual
    s = await admin(browser, { overview: fine, config: { transport: 'streams', disabledPhpFunctions: ['stream_socket_enable_crypto'] } });
    check('transport: not beside the php row', [s.transport, s.serverOrder], [[], ['php']]);
    for (const config of [{ transport: 'curl_multi' }, { transport: 'none' }, { transport: 'streams', internetOff: true }, {}]) {
        s = await admin(browser, { overview: fine, config });
        check('transport: no row for ' + JSON.stringify(config), s.transport, []);
    }

    // 3a and the side of a one-sided failure (getSitesOverview downFromServerOnly, downFromOutsideOnly)
    const sided = [site(0, 'Matomo', { targets: 4, up: 3, down: 1, downFromServerOnly: 1, containersDown: [{ idSite: 1, name: 'Shop' }] }),
        site(1, 'Shop', { down: 1, downFromOutsideOnly: 1 }), site(2, 'Blog', { down: 1, downFromServerOnly: 1 }), site(3, 'Wiki', { targets: 2, up: 1, down: 1, downFromOutsideOnly: 1 })];
    s = await admin(browser, { overview: sided, config: { external: ACTIVE } });
    check('3a admin: only from the Matomo server: amber and named; only from outside: named', [s.rows, s.statusClasses],
        [[['Matomo', '1 of 4 addresses not reachable from the Matomo server Tag Manager container of Shop not reachable from the Matomo server'],
            ['Shop', 'Not reachable from outside'], ['Blog', 'Not reachable from the Matomo server'], ['Wiki', '1 of 2 addresses not reachable from outside']],
        ['is-partial', 'is-down', 'is-partial', 'is-partial']]);
    // UI review of this round, F1: the container line names the side when the status does
    s = await admin(browser, { overview: [site(0, 'Matomo', { targets: 5, up: 3, down: 2, downFromOutsideOnly: 2,
        containersDown: [{ idSite: 1, name: 'Shop' }, { idSite: 2, name: 'Blog' }] })], config: { external: ACTIVE } });
    check('F1 admin: containers down only from outside: both lines name the side', s.rows[0],
        ['Matomo', '2 of 5 addresses not reachable from outside Tag Manager containers of Shop and Blog not reachable from outside']);
    s = await admin(browser, { overview: [site(0, 'Matomo', { targets: 5, up: 3, down: 2, downFromServerOnly: 1, downFromOutsideOnly: 1,
        containersDown: [{ idSite: 1, name: 'Shop' }] })], config: { external: ACTIVE } });
    check('F1 admin: a mixed row names no side', s.rows[0], ['Matomo', '2 of 5 addresses not reachable Tag Manager container of Shop not reachable']);
    s = await admin(browser, { overview: sided.map((row) => Object.assign({}, row, { downFromServerOnly: 0, downFromOutsideOnly: 0 })), config: { external: null } });
    check('3a admin without a source: as before', [s.rows.map((r) => r[1]), s.statusClasses],
        [['1 of 4 addresses not reachable Tag Manager container of Shop not reachable', 'Not reachable', 'Not reachable', '1 of 2 addresses not reachable'],
            ['is-partial', 'is-down', 'is-down', 'is-partial']]);
}

async function figuresAndReasons(browser) {
    // D3: the website widget whose addresses share one certificate names the host, not one address
    const shop = { 0: matomoTargets(), 1: [
        target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }),
        target('web:www.example.com/shop', 'web', 'https://www.example.com/shop', 'up', { days: 41 })] };
    let s = await mounted(browser, scenario({ width: 300, status: shop, config: { variant: 'site' } }));
    check('D3: the shared certificate names its host', s.figures.find((f) => f[0] === 'Certificate'),
        ['Certificate', '41 days', 'www.example.com']);
    // Matomo's widget for a viewer without Matomo's URLs: no host to name, none exposed
    s = await mounted(browser, scenario({ width: 300, status: { 0: matomoTargets(false), 1: [] },
        config: { variant: 'matomo', isSuperUser: false, isAdmin: false } }));
    check('D3: Matomo\'s certificate without its URLs names nothing', s.figures.find((f) => f[0] === 'Certificate'),
        ['Certificate', '63 days']);
    // the page with differing certificates: the soonest one's address
    s = await mounted(browser, scenario({}));
    check('D3: differing certificates: the soonest one\'s address', s.figures.find((f) => f[0] === 'Certificate'),
        ['Certificate', '41 days', 'www.example.com']);

    // item 7: a container larger than 4 MB has its own reason, without firewall text or the private-address link
    const big = target('ctr:Ab12Cd34', 'container', 'https://matomo.example.org/js/container_Ab12Cd34.js', 'not_checkable',
        { error: 'content', note: 'too_large' });
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'), big] } }), 'why');
    check('7, D2: one address cannot be checked, by any server', s.nc, '1 address cannot be checked and does not count as an outage. Why?');
    check('D2, L3 (UI review of 5.3.0): its row says why in a few words, the brackets whole', s.rowTexts.indexOf('Too large to check (over\u00a04\u00a0MB)') >= 0, true);
    check('D4: the reason keeps "4 MB" together', s.why.indexOf('larger than 4\u00a0MB') > 0, true);
    check('7: its own reason only', s.why, 'The file of this Tag Manager container is larger than 4\u00a0MB and cannot be read whole, so its version cannot be checked. This is not counted as an outage.');
    check('7: no link to allow private addresses', s.allowPrivateLink, false);
    const hidden = target('web:intranet.example.com', 'web', 'https://intranet.example.com/', 'not_checkable', { error: 'connect' });
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'), hidden, big] } }), 'why');
    check('D2: an unreachable one among them: from this server', s.nc.indexOf('2 addresses cannot be checked from this server') === 0, true);
    check('7: both reasons, each once, and the link for the unreachable one', [s.why.indexOf('firewall') > 0,
        s.why.indexOf('larger than 4\u00a0MB') > s.why.indexOf('firewall'), s.allowPrivateLink], [true, true, true]);
}

/**
 * Robustness release, part 1: the reasons for what cannot be checked when nothing was sent (Matomo's internet features
 * off, PHP functions disabled) or the address needs intl; Matomo stored as http behind a proxy; and NIT 2 of the 5.3.0
 * review without results from outside.
 */
async function robustness1(browser) {
    // NIT 2: without a source too, the worst line first by its own colour: a red line naming the website's address
    // before Matomo's amber count, though both groups are partly down
    const mixed = { 0: [target('ui', 'ui', MATOMO_URL + 'ui', 'down', { days: 63 }), target('tracker', 'tracker', MATOMO_URL + 'tracker', 'down', { days: 63 }),
        target('js', 'js', MATOMO_URL + 'js', 'up', { days: 63 })],
    1: [target(WEB, 'web', 'https://www.example.com/', 'up', { days: 41 }), target('web:shop.example.org', 'web', 'https://shop.example.org/', 'down', { days: 12 })] };
    let s = await mounted(browser, scenario({ status: mixed }));
    check('NIT 2 without a source: the red line first', [s.lines[0].cls, s.lines[0].text.indexOf('This website: ') === 0], ['is-down', true]);
    check('NIT 2 without a source: the amber count second', [s.lines[1].cls, s.lines[1].text.indexOf('Matomo: 2 of 3 addresses not reachable') === 0],
        ['is-partial', true]);

    // the server's PHP cannot send the checks (php_disabled): no "Why?" about firewalls and no "Allow private addresses",
    // as on the admin page
    const php = (note) => ({ 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { error: null, note })] });
    s = await mounted(browser, scenario({ status: php('php_disabled') }), 'why');
    check('php_disabled on the page: the line without Why? and without the link', [s.nc, s.whyButton, s.allowPrivateLink],
        ['1 address cannot be checked from this server and does not count as an outage.', false, false]);
    const both = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { error: null, note: 'php_disabled' }),
        target('web:intranet.example.com', 'web', 'https://intranet.example.com/', 'not_checkable', { error: 'connect' })] };
    s = await mounted(browser, scenario({ status: both }), 'why');
    check('php_disabled next to an unreachable one: Why? and the link for that one', [s.whyButton, s.allowPrivateLink, s.why.indexOf('firewall') > 0],
        [true, true, true]);

    // Matomo's internet features are off (Peter's 2a): the page says so, naming the setting; super users get the opt-in
    const off = { 0: ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'not_checkable', { error: null, note: 'internet_off' })),
        1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { error: null, note: 'internet_off' })] };
    // UI review of 5.4.0, L1 (one voice for the server administrator) and L2 (the other way, what the opt-in allows,
    // and the Matomo server named as the side that sends nothing)
    const OFF = 'The Matomo server sends no checks: Matomo\'s internet features are switched off ([General] enable_internet_features = 0).';
    // P2: the admin page's hint ends with the line as a chip with Copy; since the quick UI review before 5.4.0 (L2) the
    // page's too
    const OPT_IN_ADMIN = 'For the server administrator: switch Matomo\'s internet features on, or let only these checks send requests '
        + 'while Matomo\'s other internet features stay off. For that, add this line to the section [FeinwerkUptimeMonitor] in '
        + 'config/config.ini.php (create the section if it is missing):';
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }), 'why');
    check('internet off: the reason and the opt-in, once', s.internet, [OFF, OPT_IN_ADMIN]);
    check('internet off: no Why? and no link to allow private addresses', [s.whyButton, s.allowPrivateLink], [false, false]);
    // UI review of 5.4.0, L3 (L8 review of 5.4.0, NIT 9): only super users read the server's configuration
    const NEUTRAL = 'The checks are switched off on this Matomo server.';
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true, isSuperUser: false, isAdmin: false } }));
    check('L3 internet off, a viewer: a neutral sentence, no setting named', s.internet, [NEUTRAL]);
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true, isSuperUser: false, isAdmin: false, isAnonymous: true } }));
    check('L3 internet off, a public dashboard: the neutral sentence', s.internet, [NEUTRAL]);
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true, embedded: true } }));
    check('L3 internet off, embedded (whoever reads it): the neutral sentence', s.internet, [NEUTRAL]);
    s = await mounted(browser, scenario({ width: 300, status: off, config: { internetOff: true, variant: 'site' } }));
    check('internet off, a dashboard widget: the reason, the opt-in only on the page', s.internet, [OFF]);
    // L4: the page itself as a dashboard widget shows the reason alone too
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true, inWidget: true } }));
    check('L4 internet off, the page as a dashboard widget: the reason without the opt-in', s.internet, [OFF]);
    s = await mounted(browser, scenario({}));
    check('internet on: no such line', s.internet, []);
    check('B2 internet on: the check-now icon', s.checkTool, true);

    // B2: results that sent nothing are no check: no "checked ..." in the answer, and no check-now icon while the
    // internet features are off (a check would send nothing either)
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }));
    check('B2 internet off: no "checked" in the answer', s.lines.filter((l) => /checked/.test(l.text)).map((l) => l.text), []);
    check('B2 internet off: no check-now icon', s.checkTool, false);
    const allPhp = { 0: ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'not_checkable', { error: null, note: 'php_disabled' })),
        1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { error: null, note: 'php_disabled' })] };
    s = await mounted(browser, scenario({ status: allPhp }));
    check('B2 php_disabled everywhere: no "checked" in the answer', s.lines.filter((l) => /checked/.test(l.text)).map((l) => l.text), []);
    s = await mounted(browser, scenario({ status: php('php_disabled') }));
    check('B2 php_disabled for one address: Matomo\'s own checks still count', s.lines.some((l) => /checked 5 minutes ago/.test(l.text)), true);

    // B1: the server's PHP cannot send the checks: super users read why and what to do, as on the admin page; the
    // widgets the reason alone; nobody else the server's PHP configuration
    const PHP_LINE = 'The latest checks could not run: PHP on the Matomo server does not allow the outgoing requests they need. '
        + 'Missing PHP functions: curl_exec, curl_multi_exec.';
    const PHP_HINT = 'For the server administrator: remove these functions from disable_functions in php.ini.';
    const CURL_HINT = 'For the server administrator: install or enable PHP\'s curl extension on the Matomo server.';
    const missing = ['curl_exec', 'curl_multi_exec'];
    s = await mounted(browser, scenario({ status: php('php_disabled'), disabledPhpFunctions: missing }));
    check('B1 php_disabled, a super user: the reason and what to do', s.php, [PHP_LINE, PHP_HINT]);
    s = await mounted(browser, scenario({ status: php('php_disabled'), disabledPhpFunctions: missing, curlMissing: true }));
    check('L7 php_disabled without the curl extension: the extension named', s.php, [PHP_LINE, CURL_HINT]);
    s = await mounted(browser, scenario({ width: 300, status: php('php_disabled'), disabledPhpFunctions: missing, config: { variant: 'site' } }));
    check('B1 php_disabled, a dashboard widget: the reason alone', s.php, [PHP_LINE]);
    s = await mounted(browser, scenario({ status: php('php_disabled'), disabledPhpFunctions: missing, config: { isSuperUser: false } }));
    check('B1 php_disabled, a website admin: no server configuration', s.php, []);
    s = await mounted(browser, scenario({ status: php('php_disabled'), disabledPhpFunctions: missing, config: { embedded: true } }));
    check('B1 php_disabled, embedded: no server configuration', s.php, []);
    s = await mounted(browser, scenario({ disabledPhpFunctions: missing }));
    check('B1 no address with php_disabled: no such line', s.php, []);

    // B3: an international address as entered, its ASCII form in the tooltip
    const idn = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://\u043c\u0430\u0433\u0430\u0437\u0438\u043d.example/', 'up'),
        target('web:m', 'web', 'https://M\u00fcller.example:8443/shop?x=1#top', 'up')] };
    s = await mounted(browser, scenario({ status: idn }));
    check('B3: the addresses as entered, the ASCII form in the tooltip', s.labelTitles.filter(([label]) => /example/.test(label) && !/matomo/.test(label)).sort(), [
        ['\u043c\u0430\u0433\u0430\u0437\u0438\u043d.example', 'https://\u043c\u0430\u0433\u0430\u0437\u0438\u043d.example/ (xn--80aairftm.example)'],
        ['m\u00fcller.example:8443/shop', 'https://M\u00fcller.example:8443/shop?x=1#top (xn--mller-kva.example:8443)']].sort());
    check('B3: an ASCII address keeps its tooltip', s.labelTitles.find(([label]) => label === 'Interface'), ['Interface', MATOMO_URL + 'ui']);

    // a name only intl converts safely (needs_intl): its own reason, without firewall text or the link
    const intl = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'),
        target('web:xn', 'web', 'https://\u65e5\u672c.example/', 'not_checkable', { error: null, note: 'needs_intl' })] };
    const NEEDS_INTL = 'This address contains characters, such as other scripts or full-width letters, that only PHP\'s intl extension on '
        + 'the Matomo server converts safely, so it is not checked. This is not counted as an outage.';
    s = await mounted(browser, scenario({ status: intl }), 'why');
    // UI review of 5.4.0, L5: super users also read what to do
    check('L5 needs_intl, a super user: its own reason and what to do', [s.why, s.allowPrivateLink], [NEEDS_INTL
        + ' For the server administrator: install or enable PHP\'s intl extension on the Matomo server to check it.', false]);
    s = await mounted(browser, scenario({ status: intl, config: { isSuperUser: false } }), 'why');
    check('L5 needs_intl, a website admin: its own reason only', s.why, NEEDS_INTL);

    // the admin page: the internet line above the table, the fold without Why? and Allow private addresses
    const site = (idSite, name, counts) => Object.assign({ idSite, name, timezone: 'UTC', targets: 1, off: 0, up: 0, down: 0,
        notCheckable: 0, stale: 0, lastCheckedAt: CHECKED, certificateDaysLeft: null, certificateLevel: null, containersDown: [] }, counts);
    const blocked = [site(0, 'Matomo', { targets: 3, notCheckable: 3 }), site(1, 'Shop', { notCheckable: 1 })];
    s = await admin(browser, { overview: blocked, config: { internetOff: true } });
    check('internet off, admin: the reason and the opt-in above the table', s.internet, [OFF, OPT_IN_ADMIN]);
    check('internet off, admin: the fold without Why? and the link', s.foldControls, ['Show']);
    // Matomo's address stored as http behind a proxy that handles https (audit D2)
    const up = [site(0, 'Matomo', { targets: 3, up: 3 })];
    s = await admin(browser, { overview: up, config: { httpsRedirect: true } });
    check('https redirect, admin: what happens and what to set', s.https, [
        'Matomo\'s address is stored with http, and the server redirects it to https. The checks of the tracker endpoint, the JavaScript tracker and the Tag Manager containers follow that redirect.',
        // UI review of 5.4.0, L1 and P2: the server administrator's line ends with a chip
        'For the server administrator: when Matomo runs behind a proxy that handles https, add this line to the section [General] in '
        + 'config/config.ini.php, so that all of these checks use the https address directly:',
        // L8 review of 5.4.0, NIT 7: the tracker address covers the tracker and matomo.js only; L6: named as the settings name it
        'The https address as the Tracker address in the settings covers only the tracker endpoint and the JavaScript tracker, since '
        + 'the Tag Manager containers always follow Matomo\'s own address.']);
    check('B4 https redirect, admin: an info row, not a warning', s.httpsClass, 'is-info');
    // L7: the admin page names a missing curl extension instead of disable_functions
    s = await admin(browser, { overview: blocked, config: { disabledPhpFunctions: ['curl_exec', 'curl_multi_exec'], curlMissing: true } });
    check('L7 admin: without the curl extension, the extension named', s.php, [PHP_LINE, CURL_HINT]);
    s = await admin(browser, { overview: up, config: { httpsRedirect: false } });
    check('https redirect, admin: without it no line', [s.https, s.internet], [[], []]);
}

/**
 * UI review of 5.4.0, the four design proposals (Peter, verbatim: "go", to "P1 to P4, recommendation a each") and the
 * clear text items: P1 the short cause in the answer line's detail slot, P3 each address's own cause in its Response
 * cell, P4 a past day keeps the current state inside the muted Now line, P2 the admin page's server rows in one list with
 * the config lines as chips with Copy; L1 one voice for the server administrator, L6 the tracker address field named and
 * linked, L8 the cron row while nothing is sent, L9 the target panel says why it finds nothing. The guards first: a
 * normal instance without these states reads as before.
 */
async function design540(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null, alerts: false };
    const nc = (key, url, note, extra) => target(key, 'web', url, 'not_checkable', Object.assign({ error: note ? null : 'connect', note }, extra));
    const off = { 0: ['ui', 'tracker', 'js'].map((k) => target(k, k, MATOMO_URL + k, 'not_checkable', { error: null, note: 'internet_off' })),
        1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable', { error: null, note: 'internet_off' })] };
    const php = { 0: matomoTargets(), 1: [nc(WEB, 'https://www.example.com/', 'php_disabled')] };
    const generic = { 0: matomoTargets(), 1: [nc(WEB, 'https://www.example.com/', null)] };
    const IDN = 'web:xn';
    const intl = { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'), nc(IDN, 'https://日本.example/', 'needs_intl')] };
    const intlOnly = { 0: matomoTargets(), 1: [nc(IDN, 'https://日本.example/', 'needs_intl')] };
    const VIEWER = { isSuperUser: false, isAdmin: false };
    const ADMIN = { isSuperUser: false, isAdmin: true };
    const NC = 'Not checkable from this server';
    // quick UI review before 5.4.0, L4: a phrase, as the other short causes
    const CAUSE_OFF = '(Matomo\'s internet features off)';
    const texts = (s) => s.lines.map((l) => l.text);

    // guards: a normal instance today and on a past day, an address this server cannot reach for a general reason
    let s = await mounted(browser, scenario({}));
    check('540 guard today: the answer as before', s.lines, [{ cls: 'is-up', muted: false, text: 'Everything reachable checked 5 minutes ago' }]);
    check('540 guard today: no note lines', [s.nc, s.internet, s.php], [null, [], []]);
    s = await mounted(browser, scenario({ date: '2026-11-24' }));
    check('540 guard past day: the day, then the muted Now line as before', s.lines.map((l) => [l.muted, l.text]),
        [[false, 'Nov 24: no outage'], [true, 'Now: Everything reachable, checked 5 minutes ago']]);
    s = await mounted(browser, scenario({ status: generic }), 'why');
    check('540 guard: a general cause keeps its answer line without a detail', texts(s)[0], 'This website: ' + NC + ' checked 5 minutes ago');
    check('540 guard: a general cause keeps its cell and Why?', [s.rows[3][2], s.whyButton, s.allowPrivateLink], [NC, true, true]);
    s = await mounted(browser, scenario({ status: generic, width: 390 }));
    check('540 guard: a general cause in the narrow list as before', s.narrow.slice(-1), [['is-not_checkable', 'www.example.com Response: ' + NC + ' Uptime: 97.92%']]);

    // P1: the short cause in the answer line's detail slot (super users read the server's configuration; everyone else
    // the neutral words, as the internet line; L3)
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }));
    check('P1 internet off, a super user: each group with the cause', texts(s),
        ['Matomo: ' + NC + ' ' + CAUSE_OFF, 'This website: ' + NC + ' ' + CAUSE_OFF]);
    s = await mounted(browser, scenario({ status: off, config: Object.assign({ internetOff: true }, VIEWER) }));
    check('P1 internet off, a viewer: the neutral cause', texts(s), ['Matomo: ' + NC + ' (checks switched off)', 'This website: ' + NC + ' (checks switched off)']);
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true, embedded: true } }));
    check('P1 internet off, embedded: the neutral cause', texts(s)[1], 'This website: ' + NC + ' (checks switched off)');
    s = await mounted(browser, scenario({ width: 300, status: off, config: { internetOff: true, variant: 'site' } }));
    check('P1 internet off, the website widget: the cause too', texts(s), [NC + ' ' + CAUSE_OFF]);
    s = await mounted(browser, scenario({ width: 300, status: off, config: { internetOff: true, variant: 'matomo' } }));
    check('P1 internet off, the Matomo widget: the cause too', texts(s), [NC + ' ' + CAUSE_OFF]);
    s = await mounted(browser, scenario({ status: php }));
    check('P1 PHP functions missing, a super user: the cause', texts(s)[0], 'This website: ' + NC + ' (PHP functions disabled)');
    s = await mounted(browser, scenario({ status: php, config: ADMIN }));
    check('P1 PHP functions missing, a website admin: no server configuration', texts(s)[0], 'This website: ' + NC);
    s = await mounted(browser, scenario({ status: intlOnly, config: VIEWER }));
    check('P1 a name that needs intl: the cause for everyone (its reason is everyone\'s already)', texts(s)[0], 'This website: ' + NC + ' (needs PHP intl)');
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [nc(WEB, 'https://www.example.com/', 'php_disabled'),
        nc('web:intranet.example.com', 'https://intranet.example.com/', null)] } }));
    check('P1 causes that differ: no detail', texts(s)[0], 'This website: ' + NC + ' checked 5 minutes ago');

    // P3: each address names its own cause in its Response cell; the long reason stays behind Why? (L5)
    s = await mounted(browser, scenario({ status: intl }), 'why');
    check('P3 needs intl: the cell names the cause', s.rows.find((r) => /日/.test(r[1])).slice(0, 3), ['is-not_checkable', '日本.example', 'Not checkable: needs PHP intl']);
    check('P3 needs intl: Why? keeps the reason and what to do', /intl extension on the Matomo server to check it\.$/.test(s.why || ''), true);
    s = await mounted(browser, scenario({ status: intl, config: ADMIN }));
    check('P3 needs intl, a website admin: the cell names it too', s.rows.find((r) => /日/.test(r[1]))[2], 'Not checkable: needs PHP intl');
    // (internet off and PHP functions missing for a whole group: the answer line names the cause, the cells leave it to
    // it, see "polish" below)
    s = await mounted(browser, scenario({ status: php, config: ADMIN }));
    check('P3 PHP functions missing, a website admin: the general words', s.rows[3][2], NC);
    s = await mounted(browser, scenario({ status: intl, width: 390 }));
    check('P3 narrow list: the cause in the address\'s line', s.narrow.slice(-1), [['is-not_checkable', '日本.example Response: Not checkable: needs PHP intl']]);
    s = await mounted(browser, scenario({ width: 300, status: intl, config: { variant: 'site' } }));
    check('P3 the website widget: the same words', s.listShown.slice(-1), ['日本.example Not checkable: needs PHP intl']);
    // with results from outside the sides keep their rules (sides.ts sameAnswer compares the words without the cause)
    const twoSided = (outside) => scenario({ status: { 0: matomoTargets(), 1: [nc(IDN, 'https://日本.example/', 'needs_intl', outside)] },
        config: { external: ACTIVE } });
    s = await mounted(browser, twoSided({ outside: 'up' }));
    check('P3 two sides, the outside reaches it: the row splits as before, the server\'s sub-row with the cause',
        [s.rows[3].slice(0, 3), s.subRows], [['is-up', '日本.example', ''],
            [['Outside', '118 ms', '', ''], ['Matomo server', 'Not checkable: needs PHP intl', '', '']]]);
    s = await mounted(browser, twoSided({ outside: 'not_checkable', outsideError: 'blocked' }));
    check('P3 two sides, neither can check it: one line with the cause, no sub-rows', [s.rows[3][2], s.subRows],
        ['Not checkable: needs PHP intl', []]);
    s = await mounted(browser, Object.assign(twoSided({ outside: 'up' }), { width: 390 }));
    check('P3 two sides, narrow: the server\'s line names the cause', s.listShown.slice(-1),
        ['日本.example 118 ms from outside Not checkable: needs PHP intl from the Matomo server']);

    // Polish before 5.4.0: a group whose answer line names its one cause (P1) leaves it out of its cells, which say only
    // "Not checkable" with the cause in their tooltip (the words P3 gave the cell); where the causes differ, or the
    // answer line names none, each cell keeps its own (P3)
    const OFF_TITLE = 'Not checkable: Matomo\'s internet features off';
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }));
    check('polish internet off, a super user: the cause in the answer, each cell only Not checkable, the cause in its tooltip',
        [texts(s), s.rows.map((r) => r[2]), s.cellTitles],
        [['Matomo: ' + NC + ' ' + CAUSE_OFF, 'This website: ' + NC + ' ' + CAUSE_OFF], Array(4).fill('Not checkable'), Array(4).fill(OFF_TITLE)]);
    s = await mounted(browser, scenario({ status: off, config: Object.assign({ internetOff: true }, VIEWER) }));
    check('polish internet off, a viewer: the neutral cause in the answer and in the tooltips', [texts(s), s.rows.map((r) => r[2]), s.cellTitles],
        [['Matomo: ' + NC + ' (checks switched off)', 'This website: ' + NC + ' (checks switched off)'], Array(4).fill('Not checkable'),
            Array(4).fill('Not checkable: checks switched off')]);
    s = await mounted(browser, scenario({ status: php }));
    check('polish PHP functions missing, a super user: the website\'s cell only Not checkable, Matomo\'s cells untouched',
        [texts(s)[0], s.rows.map((r) => r[2]), s.cellTitles],
        ['This website: ' + NC + ' (PHP functions disabled)', ['120 ms', '120 ms', '120 ms', 'Not checkable'],
            [null, null, null, 'Not checkable: PHP functions disabled']]);
    s = await mounted(browser, scenario({ status: intlOnly, config: VIEWER }));
    check('polish a name that needs intl, the group\'s only address: the cell only Not checkable',
        [texts(s)[0], s.rows[3][2], s.cellTitles[3]], ['This website: ' + NC + ' (needs PHP intl)', 'Not checkable', 'Not checkable: needs PHP intl']);
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true }, width: 390 }));
    check('polish the narrow list: only Not checkable, the cause in the tooltip', [texts(s), s.narrow.slice(-1), s.listTitles],
        [['Matomo: ' + NC + ' ' + CAUSE_OFF, 'This website: ' + NC + ' ' + CAUSE_OFF],
            [['is-not_checkable', 'www.example.com Response: Not checkable Uptime: 97.92%']], Array(4).fill(OFF_TITLE)]);
    s = await mounted(browser, scenario({ width: 300, status: off, config: { internetOff: true, variant: 'site' } }));
    check('polish the website widget: the cause in the answer, the address only Not checkable', [texts(s), s.listShown, s.listTitles],
        [[NC + ' ' + CAUSE_OFF], ['www.example.com Not checkable 97.92%'], [OFF_TITLE]]);
    s = await mounted(browser, scenario({ width: 300, status: off, config: { internetOff: true, variant: 'matomo' } }));
    check('polish the Matomo widget: the same', [texts(s), s.listShown, s.listTitles],
        [[NC + ' ' + CAUSE_OFF], ['Interface Not checkable 100%', 'Tracker endpoint Not checkable 100%', 'JavaScript tracker Not checkable 100%'],
            Array(3).fill(OFF_TITLE)]);
    // with results from outside: Matomo's group has none, its answer names the server and the cause; the website the
    // outside reaches is no group the answer names a cause for, so its server sub-row keeps it
    const offOutside = scenario({ status: { 0: off[0], 1: [target(WEB, 'web', 'https://www.example.com/', 'not_checkable',
        { error: null, note: 'internet_off', outside: 'up' })] }, config: { internetOff: true, external: ACTIVE } });
    const SERVER_TITLE = 'Not checkable from the Matomo server: Matomo\'s internet features off';
    s = await mounted(browser, offOutside);
    check('polish two sides, Matomo without results from outside: the answer names the server and the cause, its cells only Not checkable',
        [texts(s)[0], s.rows.slice(0, 3).map((r) => r[2]), s.cellTitles.slice(0, 3)],
        ['Matomo: Not checkable from the Matomo server ' + CAUSE_OFF, Array(3).fill('Not checkable'), Array(3).fill(SERVER_TITLE)]);
    // quick UI review before 5.4.0, L1: Matomo's answer line names the cause for the screen, so the website the outside
    // reaches leaves it out of its server sub-row too, the cause in the tooltip
    check('polish two sides, L1: the website the outside reaches leaves the cause to the answer line', [s.subRows.map((r) => r.slice(0, 2)),
        s.subTitles.map((t) => (t === null ? null : t.split('\n')[0]))], [[['Outside', '118 ms'], ['Matomo server', 'Not checkable']],
        [SERVER_TITLE, SERVER_TITLE]]);
    s = await mounted(browser, Object.assign({}, offOutside, { width: 390 }));
    check('polish two sides, narrow, L1: Matomo\'s lines and the website\'s server line only Not checkable, the cause in the tooltips',
        [s.listShown, s.listTitles], [['Interface Not checkable 100%', 'Tracker endpoint Not checkable 100%', 'JavaScript tracker Not checkable 100%',
            'www.example.com 118 ms from outside Not checkable 97.92% from the Matomo server'], [SERVER_TITLE, SERVER_TITLE, SERVER_TITLE, null, SERVER_TITLE]]);
    // guards (as before): causes that differ within a group, a general cause
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [off[1][0], nc(IDN, 'https://日本.example/', 'needs_intl')] },
        config: { internetOff: true } }));
    check('polish guard: two causes in one group, no detail, each cell keeps its own, no tooltip',
        [texts(s)[0], s.rows.slice(3).map((r) => r[2]), s.cellTitles.slice(3)],
        ['This website: ' + NC, [OFF_TITLE, 'Not checkable: needs PHP intl'], [null, null]]);
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [nc(WEB, 'https://www.example.com/', 'php_disabled'),
        nc('web:intranet.example.com', 'https://intranet.example.com/', null)] } }));
    check('polish guard: a named cause next to a general one, each cell its own', [s.rows.slice(3).map((r) => r[2]), s.cellTitles.slice(3)],
        [[NC, 'Not checkable: PHP functions disabled'], [null, null]]);
    s = await mounted(browser, scenario({ status: generic }));
    check('polish guard: a general cause, the cell as before, no tooltip', [s.rows[3][2], s.cellTitles[3]], [NC, null]);

    // P4: on a past day the current state stays inside the muted Now line; the count line and the internet and PHP
    // lines show today only
    const PAST = '2026-11-25';
    s = await mounted(browser, scenario({ date: PAST, status: php, disabledPhpFunctions: ['curl_exec'] }));
    check('P4 a past day, the website not checkable: Matomo reachable, the count', s.lines[1], { cls: 'is-now', muted: true,
        text: 'Now: Matomo reachable, 1 address not checkable, checked 5 minutes ago' });
    check('P4 a past day: no count line, no PHP line', [s.nc, s.php], [null, []]);
    s = await mounted(browser, scenario({ date: PAST, status: generic }));
    check('P4 a past day, a general cause: the same Now line, no count line', [s.lines[1].text, s.nc],
        ['Now: Matomo reachable, 1 address not checkable, checked 5 minutes ago', null]);
    s = await mounted(browser, scenario({ date: PAST, status: intl }));
    check('P4 a past day, every group reachable: Reachable and the count', s.lines[1].text, 'Now: Reachable, 1 address not checkable, checked 5 minutes ago');
    const two = { 0: matomoTargets(), 1: [nc(WEB, 'https://www.example.com/', null), nc('web:b', 'https://b.example.com/', null)] };
    s = await mounted(browser, scenario({ date: PAST, status: two }));
    check('P4 a past day, two addresses: counted', s.lines[1].text, 'Now: Matomo reachable, 2 addresses not checkable, checked 5 minutes ago');
    s = await mounted(browser, scenario({ date: PAST, status: off, config: { internetOff: true } }));
    check('P4 a past day, internet off: the state with its cause, no count, no internet line', [s.lines[1].text, s.nc, s.internet],
        ['Now: ' + NC + ' ' + CAUSE_OFF, null, []]);
    s = await mounted(browser, scenario({ date: PAST, status: off, config: Object.assign({ internetOff: true }, VIEWER) }));
    check('P4 a past day, internet off, a viewer: the neutral cause', s.lines[1].text, 'Now: ' + NC + ' (checks switched off)');
    s = await mounted(browser, scenario({ status: php, disabledPhpFunctions: ['curl_exec'] }));
    check('P4 today: the count line and the PHP line stay', [s.nc, s.php.length], ['1 address cannot be checked from this server and does not count as an outage.', 2]);
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }));
    check('P4 today: the internet line stays', s.internet.length, 2);

    // L9: the target panel says why it finds nothing while Matomo's internet features are off
    s = await mounted(browser, scenario({ status: off, config: { internetOff: true } }), 'panel');
    check('L9 the panel, a super user: the internet line', [s.panelOpen, s.panelNotice],
        [true, 'The Matomo server sends no checks: Matomo\'s internet features are switched off ([General] enable_internet_features = 0).']);
    s = await mounted(browser, scenario({ status: off, config: Object.assign({ internetOff: true }, ADMIN) }), 'panel');
    check('L9 the panel, a website admin: the neutral line', [s.panelOpen, s.panelNotice], [true, 'The checks are switched off on this Matomo server.']);
    s = await mounted(browser, scenario({}), 'panel');
    check('L9 guard: internet on, no notice in the panel', [s.panelOpen, s.panelNotice], [true, null]);

    // P2, L6, L8: the admin page
    const site = (idSite, name, counts) => Object.assign({ idSite, name, timezone: 'UTC', targets: 1, off: 0, up: 0, down: 0,
        notCheckable: 0, stale: 0, lastCheckedAt: CHECKED, certificateDaysLeft: null, certificateLevel: null, containersDown: [] }, counts);
    const up = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { up: 1 })];
    const all = { disabledPhpFunctions: ['curl_exec'], internetOff: true, httpsRedirect: true };
    s = await admin(browser, { overview: up });
    check('540 admin guard: no server rows, the cron row as before', [s.checksLists, s.serverOrder, s.cronRow],
        [1, [], ['is-ok', 'icon-ok', ['The checks run every minute (system cron).']]]);
    s = await admin(browser, { overview: up, config: all });
    check('P2 the server rows in one list, the PHP row first', [s.checksLists, s.serverOrder], [2, ['php', 'internet', 'https']]);
    check('P2 the config lines as chips with Copy', s.chips, [['internet', 'checkWithInternetFeaturesOff = 1', 'Copy'],
        ['https', 'assume_secure_protocol = 1', 'Copy']]);
    check('L6 the tracker address field named and linked to the settings', s.httpsLink,
        ['Tracker address', '?module=CoreAdminHome&action=generalSettings#/FeinwerkUptimeMonitor']);
    check('L8 while nothing is sent, the cron row is neutral and says so', s.cronRow, ['is-info', 'icon-info',
        ['The checks run every minute (system cron).', 'While Matomo\'s internet features are switched off, the checks send nothing.']]);
    s = await admin(browser, { overview: up, config: all }, 'copy:internet');
    check('P2 Copy copies the one line, and only its chip says Copied', [s.copiedText, s.copyButtons],
        ['checkWithInternetFeaturesOff = 1', ['Copied', 'Copy']]);
    s = await admin(browser, { overview: up, config: { httpsRedirect: true } }, 'copy:https');
    check('P2 the https chip copies its line, never a section header', [s.serverOrder, s.copiedText], [['https'], 'assume_secure_protocol = 1']);
    s = await admin(browser, { overview: up, config: { internetOff: true, cron: { active: false, intervalSeconds: 0 } } });
    check('L8 without a cron: the warning stays, with the same line', [s.cronRow[0], s.cronRow[2].slice(-1)],
        ['is-warn', ['While Matomo\'s internet features are switched off, the checks send nothing.']]);
    s = await admin(browser, { overview: up, config: { internetOff: true } }, 'panel');
    check('L9 the admin page\'s panel: the internet line', s.panelNotice,
        'The Matomo server sends no checks: Matomo\'s internet features are switched off ([General] enable_internet_features = 0).');
}

/** Review of the 5.4.0 fixes: the strip around a clock change */
async function fixes540(browser) {
    const BERLIN = { timezone: 'Europe/Berlin' };
    const hours = (from, count) => Array.from({ length: count }, (x, i) => new Date(Date.parse(from) + i * 3600000).toISOString().replace('.000Z', 'Z'));
    const days = (from, rest) => [from].concat(rest);
    const last = (s) => s.stripTexts.map((cells) => cells[cells.length - 1]);

    // SHOULD 1: Sunday, the last cell of Matomo's week, has 23 hours (29 March) or 25 (25 October) in Berlin; the cell's
    // measured share and the strip's follow the API's end, not 24 hours
    const spring = { grain: 'day', end: '2026-03-29T22:00:00Z', starts: days('2026-03-22T23:00:00Z', ['2026-03-23T23:00:00Z', '2026-03-24T23:00:00Z',
        '2026-03-25T23:00:00Z', '2026-03-26T23:00:00Z', '2026-03-27T23:00:00Z', '2026-03-28T23:00:00Z']) };
    let s = await mounted(browser, scenario({ period: 'week', date: '2026-03-23', config: BERLIN, cellsAt: spring }));
    check('SHOULD 1 the week of 23 to 29 March in Berlin: the 23 h Sunday fully measured', last(s),
        Array(2).fill('Mar 29: uptime 100%, measured 100% of the time'));
    check('SHOULD 1 the week of 23 to 29 March: the strips measured all of it', s.stripMeasured, Array(2).fill('measured 100% of the time'));
    const fall = { grain: 'day', end: '2026-10-25T23:00:00Z', gap: 3600, starts: days('2026-10-18T22:00:00Z', ['2026-10-19T22:00:00Z',
        '2026-10-20T22:00:00Z', '2026-10-21T22:00:00Z', '2026-10-22T22:00:00Z', '2026-10-23T22:00:00Z', '2026-10-24T22:00:00Z']) };
    s = await mounted(browser, scenario({ period: 'week', date: '2026-10-19', config: BERLIN, cellsAt: fall }));
    check('SHOULD 1 the week of 19 to 25 October in Berlin: the 25 h Sunday with an hour not measured', last(s),
        Array(2).fill('Oct 25: uptime 100%, measured 96% of the time'));
    check('SHOULD 1 the week of 19 to 25 October: the strips miss that hour', s.stripMeasured, Array(2).fill('measured 99% of the time'));

    // NIT 3: on a fall-back day the repeated hour names the zone in its tooltip, for screen readers and on the axis;
    // the other hours and a spring-forward day as before
    s = await mounted(browser, scenario({ date: '2026-10-25', config: BERLIN, cellsAt: { grain: 'hour', end: '2026-10-25T23:00:00Z',
        starts: hours('2026-10-24T22:00:00Z', 25) } }));
    check('NIT 3 Berlin, 25 October: 25 cells, the two 2:00 AM named by their zone', s.stripTexts.map((cells) => [cells.length].concat(cells.slice(1, 5))),
        Array(2).fill([25, '1:00 AM: uptime 100%, measured 100% of the time', '2:00 AM GMT+2: uptime 100%, measured 100% of the time',
            '2:00 AM GMT+1: uptime 100%, measured 100% of the time', '3:00 AM: uptime 100%, measured 100% of the time']));
    check('NIT 3 Berlin, 25 October: the axis as before', s.stripAxes, Array(2).fill(['12:00 AM', '11:00 PM']));
    s = await mounted(browser, scenario({ date: '2026-03-29', config: BERLIN, cellsAt: { grain: 'hour', end: '2026-03-29T22:00:00Z',
        starts: hours('2026-03-28T23:00:00Z', 23) } }));
    check('NIT 3 guard Berlin, 29 March: 23 cells, no zone named', s.stripTexts.map((cells) => [cells.length].concat(cells.slice(1, 3))),
        Array(2).fill([23, '1:00 AM: uptime 100%, measured 100% of the time', '3:00 AM: uptime 100%, measured 100% of the time']));
    s = await mounted(browser, scenario({ date: '2026-11-01', config: { timezone: 'America/New_York' }, cellsAt: { grain: 'hour',
        end: '2026-11-02T05:00:00Z', starts: hours('2026-11-01T04:00:00Z', 25) } }));
    check('NIT 3 New York, 1 November: the two 1:00 AM named EDT and EST', s.stripTexts[1].slice(1, 3).map((t) => t.split(':').slice(0, 2).join(':')),
        ['1:00 AM EDT', '1:00 AM EST']);
}

/**
 * Last fixes before 5.4.0 (quick UI review, /root/fw-docs/uptimemonitor/ui-review-540-quick.md): R1 a past day's address
 * without measurements, Q1 an outage of one failed check that the checks stopping ended there, L1 the server's cause
 * once with results from outside, L2 the page's opt-in line as the admin page's chip, L3 each Copy named and "Copied"
 * announced, L4 the wording.
 */
async function final540(browser) {
    const ACTIVE = { active: true, name: 'Outside checks', reachedAt: '2026-11-26T09:58:00Z', settingsUrl: null, alerts: false };
    const PAST = '2026-11-25';
    const matomoUp = ['ui', 'tracker', 'js'].map((k) => uptimeRow(k, k, 100));
    const texts = (s) => s.lines.map((l) => l.text);
    const first = (title) => (title === null ? null : title.split('\n')[0]);

    // R1: on a past day an address without measurements reads "Not measured" in its Uptime cell and the narrow list, as
    // the two-sided cells do; a screen without any figure keeps no Uptime column (D4) and says nothing of it
    let s = await mounted(browser, scenario({ date: PAST, uptime: { 0: matomoUp, 1: [] } }));
    check('R1 a past day, an address without measurements: Not measured in its Uptime cell, the others their figure',
        s.rows.map((r) => r[2]), ['100%', '100%', '100%', 'Not measured']);
    s = await mounted(browser, scenario({ date: PAST, width: 390, uptime: { 0: matomoUp, 1: [] } }));
    check('R1 narrow: Not measured in the address\'s line', s.narrow.slice(-1), [['is-none', 'www.example.com Uptime: Not measured']]);
    check('R1 narrow: the measured lines as before', s.narrow[0], ['is-up', 'Interface Uptime: 100%']);
    s = await mounted(browser, scenario({ date: PAST, uptime: { 0: [], 1: [] } }));
    check('R1 guard: no figure on the screen, no Uptime column (D4) and no Not measured', [s.heads,
        s.rows.filter((r) => r.indexOf('Not measured') >= 0).length], [['Address', 'Certificate'], 0]);
    s = await mounted(browser, scenario({ date: PAST, width: 390, uptime: { 0: [], 1: [] } }));
    check('R1 guard narrow: no Not measured either', s.narrow.filter((n) => /Not measured/.test(n[1])).length, 0);
    s = await mounted(browser, scenario({ uptime: { 0: matomoUp, 1: [] } }));
    check('R1 guard today: an address without a figure yet leaves its cell empty', s.rows[3][3], '');

    // Q1: the checks stopped sending after one failed check, so the outage ended at that check (0 seconds); the day
    // still counts it, as the strip shows the failed check
    const blip = [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-25T10:05:00Z', end: '2026-11-25T10:05:00Z', detail: 'HTTP 502',
        cause: 'http_status' }];
    s = await mounted(browser, scenario({ date: PAST, incidents: blip }));
    check('Q1 a past day: an outage of one failed check counts', [s.lines[0].text.indexOf('Nov 25: 1 outage, 1 min'), s.outages.length], [0, 1]);
    s = await mounted(browser, scenario({ date: PAST, incidents: [{ idSite: 1, targetKey: WEB, kind: 'web', start: '2026-11-24T23:00:00Z',
        end: '2026-11-25T00:00:00Z' }] }));
    check('Q1 guard: an outage that only touches the day stays out', [s.lines[0].text, s.outages.length], ['Nov 25: no outage', 0]);

    // L1: results from outside, Matomo's internet features off. The outside reaches the website and the container, so
    // the answer is "Everything reachable"; the count line names the one cause once, Matomo's cells say "Not checkable
    // from the Matomo server" and the sub-rows "Not checkable", the cause in their tooltips
    const CAUSE = 'Matomo\'s internet features off';
    const off = (key, kind, url, extra) => target(key, kind, url, 'not_checkable', Object.assign({ error: null, note: 'internet_off' }, extra));
    const CONTAINER = 'ctr:Ab12Cd34';
    const reached = (config, width) => scenario({
        width: width || 1000,
        status: { 0: ['ui', 'tracker', 'js'].map((k) => off(k, k, MATOMO_URL + k)),
            1: [off(WEB, 'web', 'https://www.example.com/', { outside: 'up' }),
                off(CONTAINER, 'container', 'https://matomo.example.org/js/container_Ab12Cd34.js', { outside: 'up' })] },
        config: Object.assign({ internetOff: true, external: ACTIVE }, config || {}),
    });
    // tooltips as written: the server's name with a no-break space (W8)
    const SERVER_CAUSE = 'Not checkable from the Matomo\u00a0server: ' + CAUSE;
    s = await mounted(browser, reached());
    check('L1 the answer: everything reachable', texts(s), ['Everything reachable checked 5 minutes ago']);
    check('L1 the count line names the cause once', s.nc,
        '3 addresses cannot be checked from the Matomo server (' + CAUSE + ') and do not count as outages.');
    check('L1 Matomo\'s cells: Not checkable from the Matomo server, the cause in the tooltip',
        [s.rows.slice(0, 3).map((r) => r[2]), s.cellTitles.slice(0, 3).map(first)], [Array(3).fill('Not checkable from the Matomo server'),
            Array(3).fill(SERVER_CAUSE)]);
    check('L1 the sub-rows: the server only Not checkable, the cause in the tooltip',
        [s.subRows.map((r) => r.slice(0, 2)), s.subTitles.map(first)],
        [[['Outside', '118 ms'], ['Matomo server', 'Not checkable'], ['Outside', '118 ms'], ['Matomo server', 'Not checkable']],
            Array(4).fill(SERVER_CAUSE)]);
    check('L1 the internet line stays', s.internet[0], 'The Matomo server sends no checks: Matomo\'s internet features are switched off ([General] enable_internet_features = 0).');
    s = await mounted(browser, reached({}, 390));
    check('L1 narrow: the same words, the cause in the tooltips', [s.listShown, s.listTitles],
        [['Interface Not checkable from the Matomo server 100%', 'Tracker endpoint Not checkable from the Matomo server 100%',
            'JavaScript tracker Not checkable from the Matomo server 100%',
            'Tag Manager container Ab12Cd34 118 ms from outside Not checkable from the Matomo server',
            'www.example.com 118 ms from outside Not checkable 97.92% from the Matomo server'],
        [SERVER_CAUSE, SERVER_CAUSE, SERVER_CAUSE, null, SERVER_CAUSE, null, SERVER_CAUSE]]);
    s = await mounted(browser, reached({ variant: 'matomo' }, 300));
    check('L1 the Matomo widget: the count line with the cause, the lines without it', [s.nc, s.listShown],
        ['3 addresses cannot be checked from the Matomo server (' + CAUSE + ') and do not count as outages.',
            ['Interface Not checkable from the Matomo server 100%', 'Tracker endpoint Not checkable from the Matomo server 100%',
                'JavaScript tracker Not checkable from the Matomo server 100%', 'Tag Manager container Ab12Cd34 118 ms from outside']]);
    check('L1 the Matomo widget: the cause in the server\'s tooltips, none on the line from outside (D3)', s.listTitles,
        [SERVER_CAUSE, SERVER_CAUSE, SERVER_CAUSE, null]);
    s = await mounted(browser, reached({ isSuperUser: false }));
    check('L1 a website admin: the neutral cause in the count line', s.nc,
        '3 addresses cannot be checked from the Matomo server (checks switched off) and do not count as outages.');
    // the answer line names the cause (Matomo without results from outside, no container: the common case): it is the
    // one place; the count line does not repeat it, the website's cells leave it out, also an address the outside has
    // no answer for (one line: "Not checkable from the Matomo server"). Guards: causes that differ; one side only (P3
    // keeps the cell's cause)
    s = await mounted(browser, scenario({ status: { 0: ['ui', 'tracker', 'js'].map((k) => off(k, k, MATOMO_URL + k)),
        1: [off(WEB, 'web', 'https://www.example.com/', { outside: 'up' })] }, config: { internetOff: true, external: ACTIVE } }));
    check('L1 the answer line names it: the count line not again, the sub-row only Not checkable',
        [texts(s)[0], s.nc, s.subRows.map((r) => r.slice(0, 2))], ['Matomo: Not checkable from the Matomo server (' + CAUSE + ')',
            '3 addresses cannot be checked from the Matomo server and do not count as outages.',
            [['Outside', '118 ms'], ['Matomo server', 'Not checkable']]]);
    s = await mounted(browser, scenario({ status: { 0: ['ui', 'tracker', 'js'].map((k) => off(k, k, MATOMO_URL + k)),
        1: [off(WEB, 'web', 'https://www.example.com/', { outside: 'up' }), off('web:a', 'web', 'https://a.example.com/', { outside: 'up' }),
            off('web:b', 'web', 'https://b.example.com/', { outside: 'up' }), off('web:c', 'web', 'https://c.example.com/')] },
    config: { internetOff: true, external: ACTIVE } }));
    const shownTexts = [].concat(s.rows.map((r) => r.join(' ')), s.subRows.map((r) => r.join(' ')));
    check('L1 the answer line names it: once on the screen, the count line not again, no cell repeats it',
        [texts(s).filter((t) => t.indexOf(CAUSE) >= 0).length, shownTexts.filter((t) => t.indexOf(CAUSE) >= 0).length, s.nc],
        [1, 0, '4 addresses cannot be checked from the Matomo server and do not count as outages.']);
    check('L1 the answer line names it: the website\'s server sub-rows Not checkable, its one-line cell names the server',
        [s.subRows.map((r) => r[1]).filter((t, i) => i % 2 === 1), s.rows.find((r) => /c\.example/.test(r[1]))[2],
            s.subTitles.map(first).filter((t, i) => i % 2 === 1)],
        [Array(3).fill('Not checkable'), 'Not checkable from the Matomo server', Array(3).fill(SERVER_CAUSE)]);
    const nc = (key, url, note, extra) => target(key, key, url, 'not_checkable', Object.assign({ error: note ? null : 'connect', note }, extra));
    s = await mounted(browser, scenario({ status: { 0: [nc('ui', MATOMO_URL + 'ui', 'php_disabled'), nc('tracker', MATOMO_URL + 'tracker', null),
        nc('js', MATOMO_URL + 'js', 'php_disabled')], 1: [target(WEB, 'web', 'https://www.example.com/', 'up', { outside: 'up' })] },
    config: { external: ACTIVE } }));
    check('L1 guard: causes that differ, the count line without a cause, each cell its own', [s.nc, s.rows.slice(0, 3).map((r) => r[2])],
        ['3 addresses cannot be checked from the Matomo server and do not count as outages. Why? Allow private addresses',
            ['Not checkable from the Matomo server: PHP functions disabled', 'Not checkable from the Matomo server',
                'Not checkable from the Matomo server: PHP functions disabled']]);
    const IDN = 'web:xn';
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'),
        target(IDN, 'web', 'https://日本.example/', 'not_checkable', { error: null, note: 'needs_intl' })] } }));
    check('L1 guard: one side only, the cell keeps its cause (P3), the count line as before', [s.rows.find((r) => /日/.test(r[1]))[2], s.nc],
        ['Not checkable: needs PHP intl', '1 address cannot be checked from this server and does not count as an outage. Why?']);

    // L2: the page's opt-in line is the admin page's chip, for super users on the page only; L3 its Copy has its own
    // name and a polite region says Copied
    const allOff = { 0: ['ui', 'tracker', 'js'].map((k) => off(k, k, MATOMO_URL + k)), 1: [off(WEB, 'web', 'https://www.example.com/')] };
    s = await mounted(browser, scenario({ status: allOff, config: { internetOff: true } }));
    check('L2 the page: the hint ends with the line, then the chip', [s.internet, s.pageChips], [[
        'The Matomo server sends no checks: Matomo\'s internet features are switched off ([General] enable_internet_features = 0).',
        'For the server administrator: switch Matomo\'s internet features on, or let only these checks send requests while Matomo\'s other '
            + 'internet features stay off. For that, add this line to the section [FeinwerkUptimeMonitor] in config/config.ini.php (create the '
            + 'section if it is missing):'],
    [['checkWithInternetFeaturesOff = 1', 'Copy', 'Copy checkWithInternetFeaturesOff = 1']]]);
    check('L3 the page: an empty polite region before the click', s.pageLive, [['polite', '']]);
    s = await mounted(browser, scenario({ status: allOff, config: { internetOff: true } }), 'copy');
    check('L3 the page: Copy copies the line, its button and the region say Copied', [s.copiedText, (s.pageChips[0] || [])[1], s.pageLive],
        ['checkWithInternetFeaturesOff = 1', 'Copied', [['polite', 'Copied']]]);
    s = await mounted(browser, scenario({ status: allOff, config: { internetOff: true, isSuperUser: false } }));
    check('L2 guard: a website admin gets no chip', [s.internet.length, s.pageChips], [1, []]);
    s = await mounted(browser, scenario({ width: 300, status: allOff, config: { internetOff: true, variant: 'site' } }));
    check('L2 guard: no chip in a widget', s.pageChips, []);

    // L3 on the admin page: three chips, three names; Copied for the clicked one, announced again on a second click
    const site = (idSite, name, counts) => Object.assign({ idSite, name, timezone: 'UTC', targets: 1, off: 0, up: 0, down: 0,
        notCheckable: 0, stale: 0, lastCheckedAt: CHECKED, certificateDaysLeft: null, certificateLevel: null, containersDown: [] }, counts);
    const up = [site(0, 'Matomo', { targets: 3, up: 3 }), site(1, 'Shop', { up: 1 })];
    const every = { internetOff: true, httpsRedirect: true, cron: { active: false, intervalSeconds: 0 } };
    s = await admin(browser, { overview: up, config: every });
    check('L3 the admin page: each Copy named with its line', s.copyNames,
        ['Copy checkWithInternetFeaturesOff = 1', 'Copy assume_secure_protocol = 1', 'Copy * * * * * php console']);
    check('L3 the admin page: an empty polite region per chip before a click', s.copyLive, Array(3).fill(['polite', '']));
    s = await admin(browser, { overview: up, config: every }, 'copy:https');
    check('L3 the admin page: Copied for the https line only, announced', [s.copiedText, s.copyButtons, s.copyLive],
        ['assume_secure_protocol = 1', ['Copy', 'Copied', 'Copy'], [['polite', ''], ['polite', 'Copied'], ['polite', '']]]);
    s = await admin(browser, { overview: up, config: every }, 'copy2:internet');
    const seen = s.liveSeen || [];
    check('L3 a second click announces Copied again', [seen.slice(-1), seen.indexOf('') >= 0], [['Copied'], true]);

    // L4: the short cause a phrase as in the other languages; the cron hint in the server administrator's voice
    s = await mounted(browser, scenario({ status: allOff, config: { internetOff: true } }));
    check('L4 the short cause', texts(s)[0], 'Matomo: Not checkable from this server (' + CAUSE + ')');
    s = await admin(browser, { overview: up, config: { cron: { active: false, intervalSeconds: 0 } } });
    check('L4 the cron hint for the server administrator', s.cronRow[2][0], 'Without a cron of its own, the checks run with Matomo\'s '
        + 'hourly tasks, and alerts can come up to two hours late. For the server administrator: for checks every minute, add this line to '
        + 'the cron of the Matomo server (as the user that runs Matomo\'s other cron jobs).');
}

/** a dashboard of frames as Matomo builds them; the apps mount into their .widgetContent */
const DASHBOARD = (ids) => '<div id="dashboardWidgetsArea"><div class="col">' + ids.map((id) => '<div class="sortable" widgetId="'
    + id + '"><div class="widget"><div class="widgetTop"></div><div class="widgetContent"></div></div></div>').join('')
    + '</div></div>';
const SMALL = 'widgetFeinwerkUptimeMonitorgetSiteStatusforceView1viewDataTableplugin';
const BIG = 'widgetFeinwerkUptimeMonitorgetUptimePageforceView1';
const PRO = 'widgetFeinwerkUptimeMonitorProgetOutsideChecks';

async function card(browser) {
    const { page, context } = await open(browser, true);
    try {
        const result = await page.evaluate(async ({ html, ids, promoCard }) => {
            const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            document.body.insertAdjacentHTML('beforeend', html);
            const content = (id) => document.querySelector('[widgetId="' + id + '"] .widgetContent');
            const out = {};
            const base = (variant, fail) => ({ width: 380, config: { variant, promoCard }, fail,
                status: { 0: [], 1: [] }, uptime: { 0: [], 1: [] }, incidents: [] });
            // the Pro widget comes first, then the small website widget (whose first load fails), then the big one
            await window.fwumMount(base('site', ['getStatus']), content(ids.small));
            await window.fwumMount(base('page'), content(ids.big));
            await frame();
            const slots = () => [ids.pro, ids.small, ids.big].map((id) => !!content(id).querySelector('.fwum-promo-card-slot'));
            const shown = () => Array.from(document.querySelectorAll('[data-fwpromo-ready]'))
                .map((e) => e.closest('[widgetId]').getAttribute('widgetId'));
            out.failed = !!content(ids.small).querySelector('.fwum-error');
            out.start = slots();
            out.startShown = shown();
            // minimised: the small widget takes the card
            document.querySelector('[widgetId="' + ids.big + '"] .widget').classList.add('hiddenContent');
            await frame();
            await frame();
            out.minimised = slots();
            out.minimisedShown = shown();
            // restored: back to the big one, never two
            document.querySelector('[widgetId="' + ids.big + '"] .widget').classList.remove('hiddenContent');
            await frame();
            await frame();
            out.restored = slots();
            out.restoredShown = shown();
            // removed: the small one again
            document.querySelector('[widgetId="' + ids.big + '"]').remove();
            await frame();
            await frame();
            out.removed = [ids.pro, ids.small].map((id) => !!content(id).querySelector('.fwum-promo-card-slot'));
            out.removedShown = shown();
            return out;
        }, { html: DASHBOARD([PRO, SMALL, BIG]), ids: { pro: PRO, small: SMALL, big: BIG }, promoCard: CARD('c1-card') });
        check('card: the small widget failed to load (its card below shows anyway)', result.failed, true);
        check('card: the big widget owns it, the Pro widget never counts as ours', result.start, [false, false, true]);
        check('card: the kit shows it once, in the big widget', result.startShown, [BIG]);
        check('card: a minimised owner hands it to the first visible widget', result.minimised, [false, true, false]);
        check('card: shown once, in the small widget', result.minimisedShown, [SMALL]);
        check('card: restored, the big widget takes it back', result.restored, [false, false, true]);
        check('card: never two', result.restoredShown, [BIG]);
        check('card: the big widget removed, the small one owns it', result.removed, [false, true]);
        check('card: and shows it', result.removedShown, [SMALL]);
    } finally {
        await context.close();
    }
}

async function cardItself(browser) {
    // PromoCard without the kit: the group and its inert template as the kit expects them; rebuilt when the card changes
    const { page, context } = await open(browser, false);
    try {
        const result = await page.evaluate(async ({ html, id, card, demo, script }) => {
            document.body.insertAdjacentHTML('beforeend', html);
            const host = document.querySelector('.widgetContent');
            const data = { width: 380, config: { variant: 'site', promoCard: card }, status: { 0: [], 1: [] }, uptime: { 0: [], 1: [] }, incidents: [] };
            const { config, root } = await window.fwumMount(data, host);
            const read = () => {
                const group = root.querySelector('.fwum-promo-card-slot > div');
                if (!group) {
                    return null;
                }
                const item = group.querySelector('template').content.querySelector('.fwpromo-card');
                const link = item.querySelector('a');
                const close = item.querySelector('.fwpromo-card__close');
                return {
                    group: ['data-fwpromo-pausable', 'data-fwpromo-pause', 'data-fwpromo-pause-days', 'data-fwpromo-rotation',
                        'data-fwpromo-only-in'].map((a) => group.getAttribute(a)),
                    item: [item.getAttribute('data-fwpromo-id'), item.getAttribute('data-fwpromo-days'), item.getAttribute('data-fwpromo-demo')],
                    name: item.querySelector('strong').textContent,
                    link: [link.getAttribute('href'), link.getAttribute('target'), link.getAttribute('rel'), link.getAttribute('title'), link.textContent],
                    close: [close.getAttribute('aria-label'), close.hasAttribute('data-fwpromo-close')],
                    html: item.querySelector('img, script') === null,
                };
            };
            const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const out = { first: read() };
            config.promoCard = demo;
            await frame();
            out.demo = read();
            config.promoCard = Object.assign({}, demo, { id: 'x-card', url: script, name: '<img src=x onerror=alert(1)>' });
            await frame();
            out.script = read();
            config.promoCard = null;
            await frame();
            out.none = read();
            return out;
        }, {
            html: DASHBOARD([SMALL]), id: SMALL, card: CARD('c1-card'),
            demo: Object.assign(CARD('d1-card'), { days: 0, pauseDays: 0, demo: true }), script: 'javascript:alert(1)',
        });
        check('PromoCard: a pausable place, only on dashboards', result.first.group, ['card', 'card', '30', null, 'dashboard']);
        check('PromoCard: the card waits in the template with its id and days', result.first.item, ['c1-card', '90', null]);
        check('PromoCard: name, link out in a new tab, close button', [result.first.name, result.first.link, result.first.close], [
            'Conversions for your ad accounts',
            ['https://plugins.feinwerk.io/en/plugins/FeinwerkConversionsApi', '_blank', 'noopener', 'Feinwerk Conversions API', 'Learn more'],
            ['Hide this tip for 30 days', true]]);
        check('PromoCard: demo mode is a plain rotation, hidden for the session', [result.demo.group, result.demo.item],
            [[null, null, null, 'card', 'dashboard'], ['d1-card', '0', '1']]);
        check('PromoCard: a script URL gets no href, markup stays text', [result.script.link[0], result.script.name, result.script.html],
            [null, '<img src=x onerror=alert(1)>', true]);
        check('PromoCard: no card, no slot', result.none, null);
    } finally {
        await context.close();
    }
}

(async () => {
    const args = process.env.FW_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
    const browser = await chromium.launch({ executablePath: process.env.FW_BROWSER_CHROME, args });
    try {
        await answers(browser);
        await outsideResults(browser);
        await review520(browser);
        await nextRelease(browser);
        await followUps(browser);
        await review530(browser);
        await design530(browser);
        await final530(browser);
        await adminPage(browser);
        await figuresAndReasons(browser);
        await robustness1(browser);
        await design540(browser);
        await fixes540(browser);
        await final540(browser);
        await card(browser);
        await cardItself(browser);
    } catch (e) {
        failures++;
        console.log('FAIL ' + (e && e.stack ? e.stack : e));
    } finally {
        await browser.close();
    }
    console.log(failures ? failures + ' check(s) failed' : 'all checks passed');
    process.exit(failures ? 1 : 0);
})();
