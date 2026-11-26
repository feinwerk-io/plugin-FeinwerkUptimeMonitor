// Behaviour checks of the uptime page's Vue app as built (vue/dist/FeinwerkUptimeMonitor.umd.js), mounted with Matomo's
// Vue and a stand-in for CoreHome (translate from lang/en.json, the URL, AjaxHelper answering from fixtures): the answer
// for a past day and for now (5.1.5 review D1, D2), outage totals inside a period (F1), a day without measurements (D4),
// the certificate figure (D3), the reasons for what cannot be checked (item 7), the dashboard card's one place and the
// card itself (items 4, 5, 6 of the code review). The clock is pinned to NOW. Run it with tests/js/run-uptimepage-check.sh,
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
            .filter((i) => Date.parse(i.start) < to && (i.end === null || Date.parse(i.end) >= from))
            .filter((i) => params.state !== 'open' || i.end === null)
            .sort((a, b) => b.start.localeCompare(a.start))
            .map((i, n) => {
                const start = Date.parse(i.start);
                const end = i.end === null ? NOW_MS : Date.parse(i.end);
                const begin = Math.max(start, from);
                return {
                    idIncident: n + 1, type: 'outage', targetKey: i.targetKey, kind: i.kind, source: 'local',
                    start: i.start, end: i.end, durationSeconds: (end - start) / 1000, startInPeriod: iso(begin),
                    durationInPeriodSeconds: Math.max(0, (Math.min(end, to, NOW_MS) - begin) / 1000), open: i.end === null,
                    cause: i.cause || 'timeout', detail: i.detail || null, failedChecks: 2,
                };
            });
    }

    /** a day's hour strip: every address of the group measured (all up) up to now, or nothing measured */
    function timeline(scenario, params) {
        const { from } = range(params.period, params.date);
        const measured = scenario.measured !== false;
        const status = scenario.status || {};
        const site = status[1] || [];
        const count = Math.max(1, params.group === 'matomo'
            ? (status[0] || []).length + site.filter((t) => t.kind === 'container').length
            : site.filter((t) => t.kind !== 'container').length);
        const seconds = measured ? 3600 * count : 0;
        const cells = [];
        for (let h = 0; h < 24; h++) {
            const t = from + h * 3600000;
            const future = t >= NOW_MS;
            cells.push({
                time: iso(t), measuredSeconds: future ? 0 : seconds, upSeconds: future ? 0 : seconds,
                state: future ? 'future' : (measured ? 'up' : 'none'),
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
        const copy = (value) => Promise.resolve(JSON.parse(JSON.stringify(value)));
        switch (method) {
            case 'getStatus':
                return copy({ targets: (scenario.status || {})[id] || [], processing: null });
            case 'getUptime':
                return copy((scenario.uptime || {})[id] || []);
            case 'getResponseTimes':
                return copy([]);
            case 'getIncidents':
                return copy(incidents(scenario, params));
            case 'getTimeline':
                return copy(timeline(scenario, params));
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
                return answer(window.fwumScenarios[params.idSite > 0 ? 'site' : 'matomo'] || window.fwumScenario, params);
            },
        },
        ContentBlock: { props: ['contentTitle'], render() { return window.Vue.h('div', this.$slots.default ? this.$slots.default() : []); } },
    };

    /** Mounts the page or a widget into the element (or a new one of the given width); resolves when it has loaded. */
    window.fwumMount = function (scenario, element) {
        window.fwumScenario = scenario;
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
            rows: table ? Array.from(table.querySelectorAll('tbody tr:not(.fwum-group-row):not(.fwum-group-empty)'))
                .map((tr) => [tr.className].concat(Array.from(tr.children).map(clean))) : null,
            narrow: Array.from(root.querySelectorAll('.fwum-narrow-list li')).map((li) => [li.className, clean(li)]),
            groupCerts: Array.from(root.querySelectorAll('.fwum-group-head__cert')).map(clean),
            outagesNote: clean(root.querySelector('.fwum-outages > p')),
            figures: Array.from(root.querySelectorAll('.fwum-figures > div')).map((d) => Array.from(d.children)
                .filter((c) => !c.classList.contains('fwum-figures__spark')).map(clean)),
            nc: clean(root.querySelector('.fwum-nc > p')),
            why: why ? why.textContent.trim() : null,
            allowPrivateLink: !!root.querySelector('.fwum-nc a'),
            lists: Array.from(root.querySelectorAll('ul.fwum-targets')).map((ul) => ul.getAttribute('role')),
            card: !!root.querySelector('.fwum-promo-card-slot'),
            // the outage rows as read, without the texts for screen readers and the phone-only duration
            outages: Array.from(root.querySelectorAll('table.fwum-outages__table tbody tr')).map((tr) => Array.from(tr.children).map(shown)),
            outageList: Array.from(root.querySelectorAll('.fwum-outages__list li')).map(shown),
            outageCount: clean(root.querySelector('.fwum-outages__head .fwum-muted')),
            hasOutages: !!root.querySelector('.fwum-outages'),
            hasStrips: !!root.querySelector('.fwum-strips'),
            hasAddresses: !!table || !!root.querySelector('.fwum-narrow-list'),
            answerLink: (() => { const a = root.querySelector('.fwum-answer a'); return a ? [a.textContent.trim(), a.getAttribute('href')] : null; })(),
            // raw, with its no-break spaces
            rawLines: Array.from(root.querySelectorAll('.fwum-answer__text > p')).map((p) => p.textContent.replace(/\s+(?=\S)/g, (m) => (m.indexOf('\u00a0') >= 0 ? '\u00a0' : ' ')).trim()),
            rowTexts: table ? Array.from(table.querySelectorAll('td.fwum-targets__text')).map((td) => td.textContent) : null,
        };
    };
}

// fixtures: the website 1 (UTC) with www.example.com, Matomo's three addresses; NOW is 2026-11-26 10:00 UTC
const CHECKED = '2026-11-26T09:55:00Z';
function target(key, kind, url, outcome, extra) {
    const more = extra || {};
    return {
        targetKey: key, kind, url, urlSource: 'default', enabled: true, lastCheckedAt: CHECKED,
        states: more.unchecked ? {} : { local: {
            outcome, error: outcome === 'up' ? null : (more.error || 'timeout'), note: more.note || null,
            httpStatus: more.httpStatus || (outcome === 'up' ? 200 : null), responseMs: outcome === 'up' ? 120 : null,
            checkedAt: CHECKED, stale: false,
        } },
        certificate: more.days === undefined ? null : { notAfter: '2027-01-01', daysLeft: more.days, level: more.level || 'ok' },
    };
}
function uptimeRow(key, kind, percent, coverage) {
    return {
        targetKey: key, kind, source: 'local', uptimePercent: percent, coveragePercent: coverage === undefined ? 100 : coverage,
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
        // the addresses in the order of the outage list, the newest first
        'Nov 25: 1 outage, 1 h Matomo: JavaScript tracker, Interface, and Tracker endpoint (no answer within 10 seconds)');
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
    check('D2: its row says why in a few words', s.rowTexts.indexOf('Too large to check (over 4\u00a0MB)') >= 0, true);
    check('D4: the reason keeps "4 MB" together', s.why.indexOf('larger than 4\u00a0MB') > 0, true);
    check('7: its own reason only', s.why, 'The file of this Tag Manager container is larger than 4\u00a0MB and cannot be read whole, so its version cannot be checked. This is not counted as an outage.');
    check('7: no link to allow private addresses', s.allowPrivateLink, false);
    const hidden = target('web:intranet.example.com', 'web', 'https://intranet.example.com/', 'not_checkable', { error: 'connect' });
    s = await mounted(browser, scenario({ status: { 0: matomoTargets(), 1: [target(WEB, 'web', 'https://www.example.com/', 'up'), hidden, big] } }), 'why');
    check('D2: an unreachable one among them: from this server', s.nc.indexOf('2 addresses cannot be checked from this server') === 0, true);
    check('7: both reasons, each once, and the link for the unreachable one', [s.why.indexOf('firewall') > 0,
        s.why.indexOf('larger than 4\u00a0MB') > s.why.indexOf('firewall'), s.allowPrivateLink], [true, true, true]);
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
        await figuresAndReasons(browser);
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
