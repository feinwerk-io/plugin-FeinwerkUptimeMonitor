// Browser check of javascripts/promocard.js (kit 2.2) with the card script version 1 that Campaign Score 5.2.0 and
// 6.0.0-beta.4 ship (tests/js/fixtures/promocard-v1.js), in every load order: rotation groups, the dashboard gate, the
// banner's widget hiding, single cards and the 30-day keys. Run it with tests/js/run-promocard-check.sh, which puts
// both scripts in as V1 and V2 and starts it through the devtools' browser runner (fw_browser_run). Exit 1 on a failure.
const { chromium } = require(process.env.FW_SANDBOX_PLAYWRIGHT);

const ORIGIN = 'http://fwpromo.test/';
const card = (id) => '<div class="fwpromo-card" data-fwpromo-id="' + id + '" data-fwpromo-days="30">'
    + '<a class="fwpromo-card__link" href="#' + id + '">more</a>'
    + '<button type="button" class="fwpromo-card__close" data-fwpromo-close>x</button></div>';
// a single card in a dashboard column of a given width (232 px = Matomo's two columns at 768 px)
const COLUMN = (width) => '<!doctype html><html><body><div style="width:' + width + 'px">' + card('n1-card') + '</div></body></html>';
const PAGE = '<!doctype html><html><body>'
    + '<div id="dashboardWidgetsArea"><div class="matomo-widget" id="report"><table></table>'
    + '<div class="fwpromo-rotation" data-fwpromo-rotation="card" data-fwpromo-only-in="dashboard"><template>'
    + card('c1-card') + card('c2-card') + '</template></div></div></div>'
    + '<div id="sectionPage"><div class="fwpromo-rotation" data-fwpromo-rotation="card" data-fwpromo-only-in="dashboard">'
    + '<template>' + card('p1-card') + '</template></div></div>'
    + '<div class="matomo-widget" id="bannerWidget"><div class="fwpfr-premium" data-fwpromo-rotation="banner" data-fwpromo-widget="hide">'
    + '<section data-fwpromo-id="b1" data-fwpromo-days="30"><button type="button" data-fwpromo-close>x</button></section>'
    + '<section data-fwpromo-id="b2" data-fwpromo-days="30"><button type="button" data-fwpromo-close>x</button></section>'
    + '</div></div></body></html>';
const SINGLE = '<!doctype html><html><body><div class="matomo-widget" id="w">' + card('s1-card') + '</div></body></html>';
// pausable places (version 5, Peter 2026-11-24: "Ein × blendet alles 30 Tage aus", for Page Filter Report "Ja, Kachel
// und Karten"): any x empties the place for 30 days, the closed item stays away 90 days, then the next one shows
const card90 = (id) => card(id).replace('data-fwpromo-days="30"', 'data-fwpromo-days="90"');
const PAUSE_PAGE = '<!doctype html><html><body><a id="start" href="#">start</a>'
    + '<div id="dashboardWidgetsArea"><div class="matomo-widget" id="report"><table></table>'
    + '<div class="fwpromo-rotation" data-fwpromo-pausable="card" data-fwpromo-pause="card" data-fwpromo-pause-days="30" data-fwpromo-only-in="dashboard"><template>'
    + card90('c1-card') + card90('c2-card') + '</template></div></div>'
    + '<div class="matomo-widget" id="other"><table></table><div class="fwpromo-rotation" data-fwpromo-pausable="card" data-fwpromo-pause="card" data-fwpromo-pause-days="30" data-fwpromo-only-in="dashboard"><template>'
    + card90('o1-card') + '</template></div></div></div>'
    + '<div class="matomo-widget" id="tileWidget"><div class="fwpfr-premium" data-fwpromo-pausable="banner" data-fwpromo-pause="fwpfr-tile" data-fwpromo-pause-days="30" data-fwpromo-widget="hide">'
    + '<section data-fwpromo-id="b1" data-fwpromo-days="90"><a href="#b1">b1</a><button type="button" data-fwpromo-close>x</button></section>'
    + '<section data-fwpromo-id="b2" data-fwpromo-days="90"><a href="#b2">b2</a><button type="button" data-fwpromo-close>x</button></section>'
    + '</div></div><a id="end" href="#">end</a></body></html>';
const DAY = 86400000;
// localStorage as a visitor would have it: pause and item keys set the given days ago (relative to now)
const ago = (days, ids) => '(() => { const at = String(Date.now() - ' + days + ' * ' + DAY + '); '
    + JSON.stringify(ids) + '.forEach((k) => window.localStorage.setItem(k, at)); })()';
// demo mode (test instances): the page sends days 0 and data-fwpromo-demo; x hides the card for the session only
const DEMO = SINGLE.replace('data-fwpromo-days="30"', 'data-fwpromo-days="0" data-fwpromo-demo="1"');

let failures = 0;
function check(name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
        failures++;
    }
    console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected)));
}

async function open(browser, html, order, before) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(ORIGIN + '**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    await page.goto(ORIGIN);
    if (before) {
        await page.evaluate(before);
    }
    for (const version of order) {
        await page.addScriptTag({ content: version === 1 ? V1 : (version === 'old3' ? OLD3 : (version === 'old4' ? OLD4 : V2)) });
    }
    await page.waitForTimeout(150);

    return { page, context };
}

const shown = (page) => page.evaluate(() => Array.from(document.querySelectorAll('[data-fwpromo-ready]'))
    .map((e) => e.getAttribute('data-fwpromo-id')).sort());
const keys = (page) => page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.indexOf('fwpromo:') === 0).sort());
const close = async (page, id) => {
    await page.click('[data-fwpromo-id="' + id + '"] [data-fwpromo-close]');
    await page.waitForTimeout(100);
};

(async () => {
    const args = process.env.FW_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
    const browser = await chromium.launch({ executablePath: process.env.FW_BROWSER_CHROME, args });
    try {
        for (const order of [[2], [1, 2], [2, 1]]) {
            const label = 'order ' + order.join(' then ') + ': ';
            if (order.indexOf(2) !== -1) {
                for (const [width, narrow] of [[232, true], [600, false]]) {
                    const opened = await open(browser, COLUMN(width), order);
                    check(label + 'a card ' + width + ' px wide ' + (narrow ? 'is' : 'is not') + ' narrow',
                        await opened.page.evaluate(() => document.querySelector('.fwpromo-card').classList.contains('fwpromo-card--narrow')), narrow);
                    await opened.context.close();
                }
            }
            let { page, context } = await open(browser, PAGE, order);
            check(label + 'first card in the dashboard, first banner, nothing on the section page', await shown(page), ['b1', 'c1-card']);
            check(label + 'the section page group went', await page.evaluate(() => document.querySelectorAll('#sectionPage [data-fwpromo-rotation]').length), 0);
            await close(page, 'c1-card');
            check(label + 'after the card x the next card', await shown(page), ['b1', 'c2-card']);
            if (order[order.length - 1] === 2 || order.length === 1) {
                check(label + 'after the card x the focus is on the next card', await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('href')), '#c2-card');
            }
            await close(page, 'c2-card');
            check(label + 'after the last card x the group went, the report stays',
                await page.evaluate(() => [document.querySelectorAll('#report [data-fwpromo-rotation]').length, getComputedStyle(document.getElementById('report')).display]),
                [0, 'block']);
            await close(page, 'b1');
            check(label + 'after the banner x the next banner', await shown(page), ['b2']);
            await close(page, 'b2');
            check(label + 'after the last banner x its widget is hidden', await page.evaluate(() => getComputedStyle(document.getElementById('bannerWidget')).display), 'none');
            check(label + 'one key per x', await keys(page), ['fwpromo:b1:dismissed', 'fwpromo:b2:dismissed', 'fwpromo:c1-card:dismissed', 'fwpromo:c2-card:dismissed']);
            await context.close();

            ({ page, context } = await open(browser, PAGE, order, () => window.localStorage.setItem('fwpromo:c1-card:dismissed', String(Date.now()))));
            check(label + 'a card hidden in the last 30 days is skipped', await shown(page), ['b1', 'c2-card']);
            await context.close();

            ({ page, context } = await open(browser, SINGLE, order));
            check(label + 'a single card shows', await shown(page), ['s1-card']);
            await close(page, 's1-card');
            check(label + 'its x removes only the card', await page.evaluate(() => [document.querySelectorAll('.fwpromo-card').length, getComputedStyle(document.getElementById('w')).display]), [0, 'block']);
            check(label + 'and keeps it away', await keys(page), ['fwpromo:s1-card:dismissed']);
            await context.close();

            ({ page, context } = await open(browser, DEMO, order));
            check(label + 'demo: the card shows', await shown(page), ['s1-card']);
            await close(page, 's1-card');
            check(label + 'demo: x keeps nothing for 30 days', await keys(page), []);
            check(label + 'demo: x keeps it for the session', await page.evaluate(() => Object.keys(window.sessionStorage)), ['fwpromo:s1-card:dismissed']);
            await page.reload();
            for (const version of order) {
                await page.addScriptTag({ content: version === 1 ? V1 : (version === 'old3' ? OLD3 : (version === 'old4' ? OLD4 : V2)) });
            }
            await page.waitForTimeout(150);
            check(label + 'demo: still hidden after a reload in the same session', await shown(page), []);
            await context.close();
            ({ page, context } = await open(browser, DEMO, order));
            check(label + 'demo: back in a new session', await shown(page), ['s1-card']);
            await context.close();
        }
        // the released version 3 (still in other plugins) loaded first: no error on its x
        {
            const { page, context } = await open(browser, PAGE.replace('</body>', '<a id="after" href="#">after</a></body>'), ['old3', 2]);
            const errors = [];
            page.on('pageerror', (e) => errors.push(String(e.message || e)));
            await close(page, 'c1-card');
            await close(page, 'c2-card');
            check('order old 3 then 4: no error on x', errors, []);
            await context.close();
        }
        // after the last card of a group the focus does not jump to the page start
        {
            const { page, context } = await open(browser, PAGE.replace('<body>', '<body><a id="start" href="#">start</a>'), [2]);
            await close(page, 'c1-card');
            await close(page, 'c2-card');
            // the next control after the dashboard group is the banner's x, the page start is #start
            check('after the last card x the focus goes to the next control, not to the page start',
                await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName)), 'BUTTON');
            await context.close();
        }
        // Peter, 2026-11-24: many active plugins carry the kit, in different versions. 20 copies of versions 1, old 3
        // and 4 behave like one: the same cards, each x hides one card, no error
        {
            const many = Array.from({ length: 20 }, (_, i) => [1, 'old3', 2][i % 3]);
            const { page, context } = await open(browser, PAGE, many);
            const errors = [];
            page.on('pageerror', (e) => errors.push(String(e.message || e)));
            check('20 copies (1, old 3, 4): first card in the dashboard, first banner', await shown(page), ['b1', 'c1-card']);
            await close(page, 'c1-card');
            check('20 copies (1, old 3, 4): x shows the next card', await shown(page), ['b1', 'c2-card']);
            await close(page, 'c2-card');
            check('20 copies (1, old 3, 4): no error, both cards kept away', [errors, await keys(page)],
                [[], ['fwpromo:c1-card:dismissed', 'fwpromo:c2-card:dismissed']]);
            await context.close();
        }
        // pausable places in every load order, with the released versions 1, 3 and 4 before or after this one
        const many = Array.from({ length: 20 }, (_, i) => [1, 'old3', 'old4', 2][i % 4]);
        for (const order of [[2], ['old4', 2], [2, 'old4'], ['old3', 2], [1, 2], many]) {
            const label = (order.length > 4 ? '20 copies (1, old 3, old 4, 5)' : 'order ' + order.join(' then ')) + ', pause: ';
            let { page, context } = await open(browser, PAUSE_PAGE, order);
            const errors = [];
            page.on('pageerror', (e) => errors.push(String(e.message || e)));
            check(label + 'first card and first tile', await shown(page), ['b1', 'c1-card']);
            await close(page, 'c1-card');
            check(label + 'the card x empties the card place, no next card, no other plugin\'s card', await shown(page), ['b1']);
            check(label + 'after the card x the focus is not at the page start',
                await page.evaluate(() => document.activeElement && document.activeElement.id !== 'start' && document.activeElement !== document.body), true);
            await close(page, 'b1');
            check(label + 'the tile x empties the tile place and hides its widget',
                [await shown(page), await page.evaluate(() => getComputedStyle(document.getElementById('tileWidget')).display)], [[], 'none']);
            check(label + 'after the tile x the focus goes to the next control', await page.evaluate(() => document.activeElement && document.activeElement.id), 'end');
            check(label + 'keys: the closed items and both places', await keys(page),
                ['fwpromo:b1:dismissed', 'fwpromo:c1-card:dismissed', 'fwpromo:place:card:paused', 'fwpromo:place:fwpfr-tile:paused']);
            check(label + 'no error', errors, []);
            await context.close();

            const closed = ['fwpromo:b1:dismissed', 'fwpromo:c1-card:dismissed', 'fwpromo:place:card:paused', 'fwpromo:place:fwpfr-tile:paused'];
            ({ page, context } = await open(browser, PAUSE_PAGE, order, ago(29, closed)));
            check(label + '29 days later both places are still empty',
                [await shown(page), await page.evaluate(() => getComputedStyle(document.getElementById('tileWidget')).display)], [[], 'none']);
            await context.close();
            ({ page, context } = await open(browser, PAUSE_PAGE, order, ago(31, closed)));
            check(label + '31 days later the next plugin shows, not the closed one', await shown(page), ['b2', 'c2-card']);
            await context.close();
            ({ page, context } = await open(browser, PAUSE_PAGE, order, ago(91, closed)));
            check(label + '91 days later the closed plugin may come back', await shown(page), ['b1', 'c1-card']);
            await context.close();
        }
    } finally {
        await browser.close();
    }
    console.log(failures === 0 ? 'promocard check: all passed' : 'promocard check: ' + failures + ' failed');
    process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
    console.error(String(e && e.stack || e).slice(0, 500));
    process.exit(1);
});
