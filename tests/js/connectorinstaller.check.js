// Browser check of javascripts/connectorinstaller.js: every Feinwerk plugin ships it and Matomo merges all copies. Loaded
// once or twice, a click on the install button navigates exactly once, the button shows its progress label, and a second
// click does nothing (release review 2026-11-24: without the version guard, the second copy cancelled the navigation).
// Run it with tests/js/run-connectorinstaller-check.sh. Exit 1 on a failure.
const { chromium } = require(process.env.FW_SANDBOX_PLAYWRIGHT);

const ORIGIN = 'http://fwci.test/';
const PAGE = '<!doctype html><html><body><div class="fwci"><a class="btn fwci__run" href="#run" '
    + 'data-fwci-busy="Installing the connector…">Install and activate</a>'
    + '<p class="fwci__status" role="status" data-fwci-status></p></div></body></html>';

let failures = 0;
function check(name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
        failures++;
    }
    console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected)));
}

(async () => {
    const args = process.env.FW_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
    const browser = await chromium.launch({ executablePath: process.env.FW_BROWSER_CHROME, args });
    try {
        // Peter, 2026-11-24: many active plugins carry the kit, in different versions; one click must stay one action.
        // 'cur' = this file (version 3), 'v2' = version 2 (0338553), 'v1' = version 1 (18443c5), 'v0' = the unguarded copy
        // of fe32b50 (one such copy is tolerated; two of them, or one next to v1, cancel each other whatever else loads),
        // 'v4' = a future version (this file with VERSION 4, same rules)
        const V4 = INSTALLER.replace('var VERSION = 3;', 'var VERSION = 4;');
        const scripts = { cur: INSTALLER, v2: OLD2, v1: OLD1, v0: OLD0, v4: V4 };
        const many = Array.from({ length: 20 }, (_, i) => ['v1', 'v2', 'cur', 'v4'][i % 4]);
        const sets = [['cur'], ['cur', 'cur'], Array(20).fill('cur'), ['v2', 'cur'], ['cur', 'v2'], ['v1', 'cur'], ['cur', 'v1'],
            ['v1', 'v2', 'cur'], ['cur', 'v4'], ['v2', 'cur', 'v4'], many, ['cur', 'v0'], ['v0', 'cur'], ['v0', 'v2', 'cur'],
            ['v0'].concat(Array.from({ length: 19 }, (_, i) => ['v2', 'cur', 'v4'][i % 3]))];
        for (const set of sets) {
            const copies = set.length;
            const label = set.length > 4 ? set.length + ' copies (' + Array.from(new Set(set)).join(', ') + ')' : set.join(' + ');
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.route(ORIGIN + '**', (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: PAGE }));
            await page.goto(ORIGIN);
            await page.addScriptTag({ content: JQUERY });
            for (const name of set) {
                await page.addScriptTag({ content: scripts[name] });
            }
            await page.evaluate(() => {
                window.fwciNavigations = 0;
                window.addEventListener('hashchange', () => { window.fwciNavigations++; });
            });
            await page.click('.fwci__run');
            await page.waitForTimeout(150);
            const first = await page.evaluate(() => ({
                navigations: window.fwciNavigations,
                hash: location.hash,
                label: document.querySelector('.fwci__run').textContent,
                disabled: document.querySelector('.fwci__run').getAttribute('aria-disabled'),
            }));
            check(label + ': the click navigates once and shows the label', first,
                { navigations: 1, hash: '#run', label: 'Installing the connector…', disabled: 'true' });
            // a second click (the busy CSS keeps the mouse away; a script click still arrives here) does nothing
            await page.evaluate(() => { location.hash = ''; window.fwciNavigations = 0; });
            await page.waitForTimeout(100);
            await page.evaluate(() => { window.fwciNavigations = 0; document.querySelector('.fwci__run').click(); });
            await page.waitForTimeout(150);
            check(label + ': a second click does not run again',
                await page.evaluate(() => window.fwciNavigations), 0);
            // version 3: the status region names the progress; back from the back-forward cache the button works again
            check(label + ': the status region names the progress',
                await page.evaluate(() => document.querySelector('[data-fwci-status]').textContent), 'Installing the connector…');
            await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
            await page.waitForTimeout(50);
            const reset = await page.evaluate(() => ({
                label: document.querySelector('.fwci__run').textContent.trim(),
                disabled: document.querySelector('.fwci__run').getAttribute('aria-disabled'),
                status: document.querySelector('[data-fwci-status]').textContent,
            }));
            check(label + ': back from the cache the button is free again', reset, { label: 'Install and activate', disabled: null, status: '' });
            await page.evaluate(() => { location.hash = ''; });
            await page.waitForTimeout(100);
            await page.evaluate(() => { window.fwciNavigations = 0; });
            await page.click('.fwci__run');
            await page.waitForTimeout(150);
            check(label + ': and its click runs once more', await page.evaluate(() => window.fwciNavigations), 1);
            await context.close();
        }
    } finally {
        await browser.close();
    }
    console.log(failures === 0 ? 'connector installer check: all passed' : 'connector installer check: ' + failures + ' failed');
    process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
    console.error(String(e && e.stack || e).slice(0, 500));
    process.exit(1);
});
