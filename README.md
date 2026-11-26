# Feinwerk Uptime Monitor

## Description

**Know whether your Matomo, its tracker and your websites are reachable: uptime, response times, outages and
certificate expiry, right in Matomo.**

When Matomo, its tracker or the tracking path on a website breaks, data gets lost without a sound, and you notice it
days later as a hole in your reports. Feinwerk Uptime Monitor checks Matomo itself and every tracked website from your
Matomo server and shows the result where you already look: in Matomo.

- **Matomo itself:** the Matomo interface, the tracker endpoint `matomo.php` and the JavaScript tracker `matomo.js`.
  Each check also looks at the content, so an error page that answers "200 OK" still counts as an outage.
- **Your websites:** the main address of every website, more addresses if you want, the published Tag Manager
  containers (and whether the live version is the one Matomo published) and a tracking proxy.
- **Tracker response time:** how long Matomo needs for real tracking requests, measured on a small sample of the
  requests themselves, with no test visits; plus the response time of the tracker endpoint.
- **Certificates:** the expiry date of every TLS certificate, with a warning 14 days before (you choose the days).
- **Honest numbers:** time without any check counts as "not measured", never as reachable. Uptime is shown together
  with how much of the period was measured. An address the Matomo server cannot reach itself (a firewall, a private
  address) shows as "not checkable from this server", not as an outage.
- **Renamed trackers and tracking proxies:** once a day the plugin reads your website's tracking code. A tracking
  proxy on the website's own address is adopted by itself (it counts as an outage only after it once answered); a
  renamed tracker is shown to super users as a suggestion. Every address can be changed by hand.
- **Dashboard widgets:** "Uptime: Matomo" and "Uptime: Website".
- **No test visits, no visitor data:** the checks never record a visit, and nothing leaves your server except the
  requests to your own addresses and, if you give one, a feedback vote.
- **Light and dark mode, in English, German, French, Spanish and Italian.**

**Works with Feinwerk Sentinel (free):** alerts by e-mail, Slack or Teams when Matomo or a website is down, a
certificate expires or the tracker is slow.

**Get started:** open **Visitors > Uptime**. The first check runs within the hour; for checks every minute, add the
cron line shown under **Administration > Diagnostic > Uptime Monitor**.

**More Plugins for Matomo by Feinwerk:** install [Feinwerk Connector](https://plugins.matomo.org/FeinwerkMarketplaceConnector)
from the Matomo Marketplace to discover, install and update all Feinwerk plugins, free and paid, right in your Matomo.
Documentation: [plugins.feinwerk.io](https://plugins.feinwerk.io/en/plugins/FeinwerkUptimeMonitor).

## Requirements

- Matomo 5.0 or later (Matomo 5 and Matomo 6), PHP 8.1 or later
- Versions: one version 5.x of this plugin for Matomo 5 and Matomo 6
- PHP's curl extension (Matomo uses it as well). Matomo's own cron job (`core:archive`) or browser-triggered
  archiving runs the hourly checks.

## Installation

With one click through the Feinwerk connector (**Administration > Feinwerk Plugins > Discover**) or as a ZIP
file, see [Installing plugins](https://plugins.feinwerk.io/en/docs/installing-plugins). To install the ZIP
by hand, copy the folder to `plugins/FeinwerkUptimeMonitor` and activate it under
**Administration > Plugins > Manage Plugins** or on the command line:

```
./console plugin:activate FeinwerkUptimeMonitor
```

## Usage

- **Visitors > Uptime** (everyone who may view the website; anonymous visitors of a public dashboard see only the
  website's part): first one answer line, whether Matomo and the website are reachable and when they were last
  checked, or which part has been unreachable since when and why. Below it the key figures (the tracker's processing
  time, the soonest certificate expiry) and an hour strip for Matomo and for the website, which shows every hour of
  the day (every day of longer periods) as reachable, partly reachable, not reachable or not measured, with the uptime
  at its end (and the measured share when less than 95 % of the time was measured). Then one table with Matomo's
  addresses together with the website's Tag Manager containers (Matomo serves their files, so they count in Matomo's
  uptime), the website's addresses and its tracking proxy (on phones and in narrow dashboard columns a list), and the
  outages of the chosen period (on phones and in narrow dashboard columns a list as well): outages of several
  addresses of Matomo, or of the website, at the same time are one row naming them, and on a past day or a longer
  period each row's duration is its part inside it, with the whole length when that is longer ("30 min of 1 h"). On a
  past day the answer line speaks of that day first (no outage, or how many outages, how long and where; outages of
  several addresses at the same time count once, and an outage across midnight counts on each day only with its own
  part) and then names the current state in one muted line. When something is not reachable right now, that line comes
  first and in full, with since when and why, and the day follows. A line that names an address that is not reachable
  is red; a line that counts partly reachable addresses ("2 of 4 addresses not reachable") is amber. On a past day the
  dots of the addresses follow that day's uptime and the Response column is left out. A period without any measurement
  is one line, and before the first measurement it links the day the measurements start ("Nov 21: not measured.
  Measurements start on Nov 23"). Times follow the website's timezone.
  Admins of the website change the check targets with **Edit check targets** and check at once with **Check now**
  (once a minute).
- **Dashboard widgets:** add "Uptime: Matomo" and "Uptime: Website" from the category **Uptime**. They show the state
  first and, when something is down, only what failed, with a link to the uptime page.
- **Administration > Diagnostic > Uptime Monitor** (super users): all websites in one list (on phones one block per
  website), Matomo first, the soonest certificate in the warning or critical colour as on the uptime page, and checks
  and alerts as status rows: whether a system cron runs the checks (else the cron line to copy) and whether alerts go
  out through Feinwerk Sentinel. Websites that cannot be checked from the Matomo server are summed up in one line
  below the list; "Show" brings them back into it.

### How often it checks

Without a cron of its own the checks run once an hour with Matomo's scheduled tasks. For checks every minute add
this line to the cron of the Matomo server, as the user that runs Matomo's other cron jobs:

```
* * * * * php /path/to/matomo/console feinwerkuptimemonitor:check
```

The hourly task then pauses by itself. Every run has a time budget (60 seconds by default, `run_budget_seconds`)
and checks the addresses it could not reach in time first the next time. With browser-triggered archiving (Matomo's
default without its own cron), Matomo may run its hourly tasks inside a visitor's tracking request, so the hourly
check then takes at most 15 seconds. On instances with many websites that covers only part of the addresses per
hour; the others then show "no recent check". Use the cron line above there.

### What is checked, and when it counts as reachable

| Target | Default address | Reachable when |
|---|---|---|
| Interface | Matomo's login page, `index.php?module=Login` (`index.php` with a single sign-on login plugin) | Matomo's login page answers (an SSO login host can be set) |
| Tracker endpoint | `matomo.php` (no parameters, so no visit is recorded) | Matomo's own answer for this address arrives |
| JavaScript tracker | `matomo.js` | the file is Matomo's tracker |
| Website | the website's main address | it answers with a success status |
| Tag Manager container | each published web container | it is the file of the live version (the check reads the first 4 MB: a larger file that ends before its version can be read shows as not checkable, not as an outage) |
| Tracking proxy | found on the website or set by hand | it delivers Matomo's tracker, or Matomo's own answer when the web server forwards the path to Matomo (a PHP proxy that cannot reach Matomo answers "200" with an error text: that counts as an outage) |

### Settings (super users)

Under **Administration > System > General settings > Feinwerk Uptime Monitor**:

- **Tracker address:** only if tracking runs on another address than Matomo, for example a separate tracking host.
- **Login host for single sign-on:** only if Matomo sends visitors who are not logged in to another host.
- **Allow private addresses:** off by default, so that nobody can use the checks to look into your internal network.
  **When it is on, the admins of every website can have the Matomo server request addresses in your internal
  network**, so switch it on only for a Matomo or websites in an intranet. Link-local and cloud metadata addresses stay
  blocked, and addresses of websites never point to the Matomo server itself (`127.0.0.1`) unless you also set
  `allowLoopbackForWebsites = 1` in `[FeinwerkUptimeMonitor]` (config file only, off by default, for websites hosted on
  the Matomo server). **That switch lets the admins of every website send requests to services on the Matomo server
  itself**: set it only when you trust every website admin.
- **Slow tracker from (ms)** (default 1000) and **Certificate warning (days before expiry)** (default 14).

Each setting can also be set in `config/config.ini.php` (Matomo's own mechanism), for example:

```
[FeinwerkUptimeMonitor]
allowPrivate = 1
```

### Options in config.ini.php

```
[FeinwerkUptimeMonitor]
run_budget_seconds = 60        ; time budget of one check run
tracker_timing_sample = 100    ; measure 1 in this many tracking requests; 0 switches the measurement off
```

Certificates are verified like Matomo's own requests: with the file in `[General] custom_cacert_pem` when it is set
(for example behind a proxy that inspects TLS), otherwise with the server's trust store.

The tracker's response time is measured on a sample of real tracking requests: one in 100 by default, with one small
database write per sampled request. With the plugin QueuedTracking it shows the time until a request is queued.

### Alerts through Feinwerk Sentinel

With Feinwerk Sentinel 5.0.0 or newer installed, four checks appear in its settings (an older Sentinel gets none, and
the admin page asks for its update):

- **U01 Matomo not reachable** (Matomo itself),
- **U02 Website not reachable** (website, container or tracking proxy, per website),
- **U03 Certificate expires** (warning from your setting, critical 3 days before),
- **U04 Slow tracker**.

Sentinel sends them by e-mail, Slack or Teams. Without your own cron the checks run hourly and so does Sentinel, so an
alert can come up to two hours after an outage began; with the cron line above, up to one hour.

- Alarms about Matomo itself go to the super users chosen in Sentinel's settings (from Sentinel 5.4.0 on its own page,
  tab "Whole instance", linked on the admin page), its e-mail addresses for the instance
  and its instance webhook. If none of these is set, they reach nobody.
- When Sentinel reports no visits or a drop in visits for a website that is down, the alarm says so.
- A completely stopped Matomo cannot report itself; those hours show as not measured.

## API

Every function of the screens is an API method. idSite 0 stands for Matomo itself; with idSite 0, `getUptime`,
`getResponseTimes`, `getIncidents` and `getTimeline` take `timezoneOf=<idSite>` to follow that website's day instead of UTC. Times are ISO 8601 in UTC,
response times in milliseconds. Wrong input is answered with HTTP 400 and a message naming the parameter and the
allowed values. Each outage of `getIncidents` names its part inside the requested period (`startInPeriod`,
`durationInPeriodSeconds`): add those up for a period's downtime, not `durationSeconds`. `getTimeline` names the
first measured hour of its addresses at any time (`firstMeasured`, null when nothing was ever measured), and each row
of `getSitesOverview` the level of its soonest certificate (`certificateLevel`: ok, warning, critical or expired).
`getStatus` says for each address whether the Matomo server never checks it (`serverRefuses`, for example a private
address while private addresses are not allowed in the settings): such an address is not checkable from the moment it
is set. For super users it also names the PHP functions the latest check run did not find (`disabledPhpFunctions`, for
example `curl_exec` on a server whose php.ini lists it under `disable_functions`): until they are allowed again, the
addresses with the note `php_disabled` cannot be checked.

| Method | Example |
|---|---|
| `getStatus` | `?module=API&method=FeinwerkUptimeMonitor.getStatus&idSite=1&format=json` |
| `getUptime` | `?module=API&method=FeinwerkUptimeMonitor.getUptime&idSite=1&period=month&date=today&format=json` |
| `getResponseTimes` | `?module=API&method=FeinwerkUptimeMonitor.getResponseTimes&idSite=0&period=day&date=today&targetKey=processing&format=json` |
| `getTimeline` | `?module=API&method=FeinwerkUptimeMonitor.getTimeline&idSite=1&period=week&date=today&format=json` (the hour strip; at most 366 days) |
| `getIncidents` | `?module=API&method=FeinwerkUptimeMonitor.getIncidents&idSite=1&period=week&date=today&state=open&format=json` |
| `getCertificates` | `?module=API&method=FeinwerkUptimeMonitor.getCertificates&idSite=1&format=json` |
| `getTargets` | `?module=API&method=FeinwerkUptimeMonitor.getTargets&idSite=1&format=json` |
| `addTarget` | `?module=API&method=FeinwerkUptimeMonitor.addTarget&idSite=1&kind=proxy&url=https://www.example.com/matomo.php` (POST) |
| `updateTarget` | `?module=API&method=FeinwerkUptimeMonitor.updateTarget&idSite=0&targetKey=tracker&url=https://matomo.example.com/js/tracker.php` (POST) |
| `deleteTarget` | `?module=API&method=FeinwerkUptimeMonitor.deleteTarget&idSite=1&targetKey=proxy` (POST) |
| `detectTargets` | `?module=API&method=FeinwerkUptimeMonitor.detectTargets&idSite=1&apply=0&format=json` |
| `checkNow` | `?module=API&method=FeinwerkUptimeMonitor.checkNow&idSite=1` (POST, once a minute) |
| `getSitesOverview` | `?module=API&method=FeinwerkUptimeMonitor.getSitesOverview&format=json` (super users) |
| `getExternalSources` | `?module=API&method=FeinwerkUptimeMonitor.getExternalSources&format=json` |

## Feedback and support

Under **Visitors > Uptime** you can tell us with one click whether the uptime page shows Matomo and your website
correctly. Your vote goes from your Matomo server to Feinwerk together with the plugin and Matomo version, your browser
family and the interface language, nothing else. To switch the question off:

```ini
[FeinwerkUptimeMonitor]
feedback = 0
```

**Support** next to it opens the [Feinwerk contact form](https://feinwerk.io/en/contact?service=plugins).

## Installing the Feinwerk Connector

The free Feinwerk Connector installs, updates and licenses Feinwerk plugins inside Matomo. The easiest way to get it is
the Matomo Marketplace. While it is not active, super users also find a section "Feinwerk Plugins" in Matomo's
Administration with the entry "Install Feinwerk Connector" ("Activate Feinwerk Connector" when its files are already
there). One click installs it from the Matomo Marketplace and activates it; as with every plugin install, Matomo first
asks for your password. Where Matomo cannot install from its Marketplace (Marketplace, internet features or plugin
administration switched off), the page explains the manual way instead. In Matomo for WordPress the connector is
installed as a WordPress plugin through Matomo Analytics, Marketplace. The connector needs PHP 8.1. Nothing is
downloaded before you click. To hide the entry, add to `config/config.ini.php`:

```ini
[FeinwerkUptimeMonitor]
connector_installer = 0
```

The same line in the section `[FeinwerkMarketplaceConnector]` hides it for all Feinwerk plugins.

## Tips from Feinwerk

Under the feedback question on **Visitors > Uptime** the plugin shows one short line with a tip on another Feinwerk
offer, for example Feinwerk Sentinel or Feinwerk Campaigns; on a dashboard, the uptime widgets show the same tip as one
small card. Only users with admin access to at least one website and super users see them, and only in Matomo's
interface: never in embedded widgets, exports or API results. A tip for a Feinwerk plugin you already have installed is not shown, and "×" hides a tip for 30 days in your
browser. The tips are part of the plugin: nothing is loaded from outside and nothing is sent. Links open feinwerk.io
pages in a new tab and carry only the campaign parameters `mtm_campaign`, `mtm_source` and `mtm_content`.

To switch the tips off for this plugin, add to `config/config.ini.php`:

```ini
[FeinwerkUptimeMonitor]
promotions = 0
```

The same line in the section `[FeinwerkMarketplaceConnector]` switches them off for all Feinwerk plugins. Recent
versions of the Feinwerk Marketplace Connector also have the setting "Show notes on other Feinwerk offers".

## Privacy

The checks send requests only to your Matomo and to the addresses of your websites, with the User-Agent
`FeinwerkUptimeBot`, which Matomo's bot detection does not count as a visit. Nothing is sent to Feinwerk unless you
answer the feedback question (see "Feedback and support"). The plugin
stores the results of the checks and, for the tracker's response time, the time and duration of sampled tracking
requests, never anything about visitors. Raw results are kept 14 days, hourly values 90 days, daily values and
outages 400 days.

## License

GPL v3 or later, see `LICENSE`.

## Author

Peter Boehlke, [Feinwerk.io](https://feinwerk.io) · support@feinwerk.io
