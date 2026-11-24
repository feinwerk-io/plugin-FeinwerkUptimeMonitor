# Changelog

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
