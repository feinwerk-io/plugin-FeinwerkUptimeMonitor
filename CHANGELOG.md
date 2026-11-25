# Changelog

## 5.1.3

- The uptime page on a dashboard (widget "Uptime" from Visitors) keeps its margins: its figures, hour strips and
  tables no longer touch the edges of the widget. In a narrow dashboard column, as in Matomo's default three columns,
  the page and the widgets take their phone layout.
- "Check now" and "Edit check targets" are two small icons next to "checked 3 minutes ago", with their names as
  tooltips; while a check runs the reload icon turns and the line says so.
- Visitors > Uptime shows the uptime of Matomo and of the website at the end of each hour strip, with the measured
  share; the figures above keep the tracker's processing time and the certificate.
- On phones the figures stand in two columns, addresses wrap after their dots and slashes instead of inside a word,
  and "HTTP-Status 403" stays on one line.
- Administration > Diagnostic > Uptime Monitor links Feinwerk Sentinel's settings for the whole instance (from Sentinel
  5.4.0 on its own page, tab "Whole instance").
- Tips from Feinwerk: the campaigns tip offers the free plugin Feinwerk Campaign Manager; with Campaign Manager
  installed it opens its campaign overview, and once it is connected, or switched off, that tip no longer shows. On a narrow line the connector tip uses a
  short link text. The Feinwerk Connector installer keeps its progress label inside the button on phones.

## 5.1.2

- Tag Manager containers are listed and counted with Matomo, not with the website: Matomo serves their files, so a
  container that cannot be loaded is a Matomo problem. The website's uptime now counts only its own addresses and its
  tracking proxy. On Administration > Diagnostic > Uptime Monitor the Matomo row names the websites whose container is
  not reachable. The alarm stays with the website (Feinwerk Sentinel check U02), so the "Uptime: Website" widget names
  a container of the website that is not reachable in one line, without changing its figures.
- "Why?" next to addresses that cannot be checked also names a password or a block on automated requests; the link to
  allow private addresses no longer shows when they are already allowed.
- API: getTimeline takes `group` (all, matomo or website); getSitesOverview gives `containersDown` in Matomo's row.

## 5.1.1

- Administration > Diagnostic > Uptime Monitor sums up the websites that cannot be checked from the Matomo server in
  one line below the list (up to three by name), with the reason on demand and the link to allow private addresses;
  "Show" brings them back at the end of the list, edit button included.
- On phones the outage list keeps three columns: the duration stands under the start, so the cause stays readable.
- With a Feinwerk Sentinel older than 5.0.0 the alerts stay off and the admin page names its version and links to the
  plugin list for the update, instead of promising alerts that would not come.
- The note on addresses that cannot be checked reads more smoothly in English and French; the Spanish texts on Feinwerk
  Sentinel say "rastreador" like the rest of the plugin.

## 5.1.0

- Visitors > Uptime answers first: one line says whether Matomo and the website are reachable and when they were last
  checked, or which part has been unreachable since when and why. Below it the key figures (uptime of Matomo and of the
  website with the measured share, the tracker's processing time, the soonest certificate expiry).
- An hour strip for Matomo and for the website shows each hour of the day (each day of longer periods) as reachable,
  partly reachable, not reachable or not measured; hover or focus a cell for its time, uptime and measured share.
- Matomo and the website share one table with a group for each; a group without checked addresses stays with its note.
- Addresses that cannot be checked from the Matomo server are summed up in one line, with the reason on demand and,
  for super users, the link to allow private addresses.
- The outage list says how many outages the period has ("20 of 57") and shows more on request.
- "Checked 3 minutes ago" stays current while the page is open.
- The dashboard widgets start with the state, show the figures and a small hour strip, and when something is down list
  only the failing addresses with a link to the uptime page.
- A live demo on the Matomo Marketplace and in the store: https://demo.feinwerk.io/demo/uptime-monitor
- Administration > Diagnostic > Uptime Monitor shows checks and alerts as status rows, like Matomo's system check: a
  running system cron is confirmed in one line, the cron line appears only while it is missing, and a missing Feinwerk
  Sentinel is named with a link.
- The panel for check targets puts found addresses first, shows each address large with its kind and source, edits
  and removes with icons, checks the address as you type and closes with "Done" (every change saves at once).
- On a dashboard, admins see one small card with a tip on another Feinwerk offer under the uptime widgets; "x" hides it
  for 30 days and `promotions = 0` switches it off, as for the tip line.
- The tip line shows its sentence only when it fits whole; the Feinwerk Connector installer tells screen readers what
  happens after the click.

## 5.0.2

- No more false outage of the interface on Matomo instances with many plugins: Matomo's login page is read to the
  end (it can be larger than 256 KB), and so are Tag Manager containers.
- Times on the uptime screens follow the website's timezone.

## 5.0.1

- An address that cannot be checked from the Matomo server now says why right under its list (super users get the
  link to the settings), not only in a tooltip.
- The panel's title names the website; errors of the panel and of Check now appear once, in place, in your language.
- Administration > Diagnostic > Uptime Monitor: the edit button sits next to the website's name, and the last check
  reads "3 minutes ago" (the exact time on hover).
- The outage list says when it shows only the most recent ones and leaves out the "Checked from" column (all checks run
  from the Matomo server).
- Small fixes on phones and in the widgets; Uptime moved further down in the Visitors menu, so Real-time and Real-time Map
  stay together.
- The note who can install the Feinwerk Connector reads the same in every language.
- Listed on the Matomo Marketplace: plugin page with screenshots and frequently asked questions.

## 5.0.0

First version, for Matomo 5 and Matomo 6.

- Visitors > Uptime shows whether Matomo itself and the website are reachable, checked from the Matomo server: the
  Matomo interface, the tracker endpoint, the JavaScript tracker, the website's addresses, its published Tag Manager
  containers and a tracking proxy. The checks of Matomo, the containers and the proxy also look at the content, so an
  error page that answers "200" still counts as an outage.
- Uptime always comes with how much of the period was measured: time without any check counts as not measured, never
  as reachable. Addresses the Matomo server cannot reach itself show as "not checkable from this server".
- The tracker's response time: how long Matomo needs for real tracking requests, measured on a small sample of the
  requests themselves with no test visits (`tracker_timing_sample` in `[FeinwerkUptimeMonitor]`, 0 switches it off).
- Outages with start, duration and cause, the expiry of every TLS certificate, the response times per hour.
- A tracking proxy on the website's own address is found once a day and adopted; a renamed tracker is shown to super
  users as a suggestion. Every address can be changed by hand; Matomo's own addresses only by super users.
- Checks once an hour with Matomo's scheduled tasks, or every minute with the cron line shown under Administration >
  Diagnostic > Uptime Monitor.
- With Feinwerk Sentinel installed: alerts by e-mail, Slack or Teams when Matomo or a website is down, a certificate
  expires or the tracker is slow, and a note in Sentinel's no-visits alarm when the website is down.
- Dashboard widgets "Uptime: Matomo" and "Uptime: Website", an overview of all websites for super users, an API method
  for every function.
- Under the uptime page, one click tells us whether it shows Matomo and your website correctly; `feedback = 0` in
  `[FeinwerkUptimeMonitor]` switches the question off.
- Below it, admins and super users see one short line with a tip on another Feinwerk offer; `promotions = 0` switches
  the tips off. Super users without the Feinwerk Connector find "Install Feinwerk Connector" under Administration,
  Feinwerk Plugins (`connector_installer = 0` hides it).
- Light and dark mode, in English, German, French, Spanish and Italian.
