// Browser check of javascripts/promo.js (kit version 4) with the oldest version 2 still shipped
// (tests/js/fixtures/promo-v2.js), in every load order: one notice per placement, the compact logo on a narrow tip line,
// 30-day hiding, and session-only hiding in demo mode. Run it with tests/js/run-promo-check.sh, which puts in V2, V3, CSS
// and LOGO and starts it through the devtools' browser runner (fw_browser_run). Exit 1 on a failure.
const { chromium } = require(process.env.FW_SANDBOX_PLAYWRIGHT);

const ORIGIN = 'http://fwpromo.test/';
const line = (id, demo) => '<div class="fwpromo-line" data-fwpromo-id="' + id + '" data-fwpromo-placement="line" data-fwpromo-days="'
    + (demo ? '0" data-fwpromo-demo="1"' : '30"') + '>' + LOGO
    + '<span class="fwpromo-line__text">Exklusive Plugins for Matomo von Feinwerk, kostenlos, Freemium und Premium:</span>'
    + '<a class="fwpromo-line__link" href="#">Feinwerk Connector im Matomo Marketplace installieren</a>'
    + '<button type="button" class="fwpromo-line__dismiss fwpromo-dismiss">x</button></div>';
const page = (width, lines) => '<!doctype html><html><head><style>' + CSS + '</style></head><body>'
    + '<div id="report" style="width:' + width + 'px">' + lines + '</div></body></html>';

let failures = 0;
function check(name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
        failures++;
    }
    console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected)));
}

async function load(page, order) {
    for (const version of order) {
        await page.addScriptTag({ content: version === 2 ? V2 : (version === 'old3' ? OLD3 : V3) });
    }
    await page.waitForTimeout(200);
}

async function open(context, html, order) {
    const page = await context.newPage();
    await page.route(ORIGIN + '**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    await page.goto(ORIGIN);
    await load(page, order);
    return page;
}

const shown = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.fwpromo-line[data-fwpromo-ready]'))
    .map((e) => e.getAttribute('data-fwpromo-id')));
const compact = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.fwpromo-line'))
    .map((e) => e.classList.contains('fwpromo-line--compact')));

(async () => {
    const args = process.env.FW_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
    const browser = await chromium.launch({ executablePath: process.env.FW_BROWSER_CHROME, args });
    try {
        for (const order of [[3], [2, 3], [3, 2]]) {
            const label = 'order ' + order.join(' then ') + ': ';
            let context = await browser.newContext();

            // one line per page; the narrow one gets only the round mark
            let p = await open(context, page(420, line('a', false) + line('b', false)), order);
            check(label + 'one line per page', await shown(p), ['a']);
            check(label + 'a narrow line shows only the round mark', await compact(p), [true]);
            await p.click('.fwpromo-line__dismiss');
            await p.waitForTimeout(100);
            check(label + 'x keeps it away for 30 days', await p.evaluate(() => Object.keys(window.localStorage)), ['fwpromo:a:dismissed']);
            await p.close();
            p = await open(context, page(1300, line('a', false)), order);
            check(label + 'hidden on the next page', await shown(p), []);
            await context.close();

            // a wide line keeps the word mark
            context = await browser.newContext();
            p = await open(context, page(1300, line('w', false)), order);
            check(label + 'a wide line keeps the word mark', await compact(p), [false]);
            await context.close();

            // demo: hidden for the session only, also when version 2 came first
            context = await browser.newContext();
            p = await open(context, page(1300, line('d', true)), order);
            check(label + 'demo: the line shows', await shown(p), ['d']);
            await p.click('.fwpromo-line__dismiss');
            await p.waitForTimeout(100);
            check(label + 'demo: x keeps nothing for 30 days', await p.evaluate(() => Object.keys(window.localStorage)), []);
            check(label + 'demo: x keeps it for the session', await p.evaluate(() => Object.keys(window.sessionStorage)), ['fwpromo:d:dismissed']);
            await p.reload();
            await load(p, order);
            check(label + 'demo: still hidden after a reload in the session', await shown(p), []);
            await context.close();
            context = await browser.newContext();
            p = await open(context, page(1300, line('d', true)), order);
            check(label + 'demo: back in a new session', await shown(p), ['d']);
            await context.close();

            // version 4 (also when version 2 came first): too short for the sentence, it goes entirely, the link stays
            // whole (Peter, 2026-11-23: "Compact: logo, link, x"); 232 px = a dashboard column at 768 px
            if (order.indexOf(3) !== -1) {
                context = await browser.newContext();
                p = await open(context, page(232, line('n', false)), order);
                const narrow = await p.evaluate(() => {
                    const l = document.querySelector('.fwpromo-line[data-fwpromo-ready]');
                    const text = l.querySelector('.fwpromo-line__text');
                    const link = l.querySelector('.fwpromo-line__link');
                    return {
                        bare: l.classList.contains('fwpromo-line--bare'),
                        sentence: getComputedStyle(text).display,
                        linkCut: link.scrollWidth > link.clientWidth + 1,
                    };
                });
                check(label + 'a very narrow line drops the sentence, the link stays whole', narrow, { bare: true, sentence: 'none', linkCut: false });
                await context.close();

                context = await browser.newContext();
                p = await open(context, page(1300, line('m', false)), order);
                check(label + 'a wide line keeps its sentence', await p.evaluate(() => document.querySelector('.fwpromo-line').classList.contains('fwpromo-line--bare')), false);
                // after the x the focus moves on to the next control
                await p.evaluate(() => document.getElementById('report').insertAdjacentHTML('afterend', '<a id="next" href="#">next</a>'));
                await p.focus('.fwpromo-line__dismiss');
                await p.keyboard.press('Enter');
                await p.waitForTimeout(100);
                check(label + 'after the x the focus moves to the next control', await p.evaluate(() => document.activeElement && document.activeElement.id), 'next');
                await context.close();

                // the admin home banner moves below Matomo's notices, right before #content
                context = await browser.newContext();
                const admin = '<!doctype html><html><head><style>' + CSS + '</style></head><body>'
                    + '<aside class="fwpromo-box fwpromo-box--banner" data-fwpromo-id="bn" data-fwpromo-placement="adminHome" data-fwpromo-days="30">Banner</aside>'
                    + '<div id="notificationContainer"><div class="notification">HTTPS warning</div></div>'
                    + '<div id="content">Admin home</div></body></html>';
                p = await open(context, admin, order);
                check(label + 'the admin home banner sits below the notices', await p.evaluate(() => {
                    const b = document.querySelector('.fwpromo-box');
                    return [b.nextElementSibling && b.nextElementSibling.id, b.previousElementSibling && b.previousElementSibling.id];
                }), ['content', 'notificationContainer']);
                await context.close();
            }
        }

        // the released version 3 (still in other plugins) loaded first: version 4 adds no error and loses no focus
        {
            const context = await browser.newContext();
            const p = await open(context, page(1300, line('o', false)), ['old3', 3]);
            const errors = [];
            p.on('pageerror', (e) => errors.push(String(e.message || e)));
            await p.evaluate(() => document.getElementById('report').insertAdjacentHTML('afterend', '<a id="next" href="#">next</a>'));
            await p.click('.fwpromo-line__dismiss');
            await p.waitForTimeout(150);
            check('order old 3 then 4: x hides the line without an error', [await shown(p), errors], [[], []]);
            await context.close();
        }
        // Peter, 2026-11-24: many active plugins carry the kit, in different versions. 20 copies of versions 2, old 3
        // and 4 behave like one: one line, x hides it without an error and keeps it away
        {
            const many = Array.from({ length: 20 }, (_, i) => [2, 'old3', 3][i % 3]);
            const context = await browser.newContext();
            const p = await open(context, page(1300, line('m', false) + line('n', false)), many);
            const errors = [];
            p.on('pageerror', (e) => errors.push(String(e.message || e)));
            check('20 copies (2, old 3, 4): one line per page', await shown(p), ['m']);
            await p.click('.fwpromo-line__dismiss');
            await p.waitForTimeout(150);
            check('20 copies (2, old 3, 4): x hides it without an error and keeps it away',
                [await shown(p), errors, await p.evaluate(() => Object.keys(window.localStorage).filter((k) => k.indexOf('fwpromo:') === 0))],
                [[], [], ['fwpromo:m:dismissed']]);
            await context.close();
        }
    } finally {
        await browser.close();
    }
    console.log(failures === 0 ? 'promo check: all passed' : 'promo check: ' + failures + ' failed');
    process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
    console.error(String(e && e.stack || e).slice(0, 500));
    process.exit(1);
});
