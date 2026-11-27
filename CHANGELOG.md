# Changelog

## 5.4.0

- When Matomo's internet features are switched off (`enable_internet_features = 0` in `[General]`), the checks send
  nothing and every address reads "not checkable" with the reason; Visitors > Uptime and Administration > Diagnostic >
  Uptime Monitor name the setting to super users, everyone else reads that the checks are switched off. Instances with
  this setting are no longer checked after the update; to keep checking, set `checkWithInternetFeaturesOff = 1` in
  `[FeinwerkUptimeMonitor]` of `config/config.ini.php` (Visitors > Uptime and the admin page have the line to copy).
- An outage that was open when the checks stopped sending (Matomo's internet features switched off, PHP functions
  missing) ends at its last failed check instead of staying open.
- Certificates are verified with the CA file that comes with Matomo, as Matomo's own requests do, so HTTPS addresses
  are also checked on servers whose own trust store is missing or outdated. Intranet certificates that only the
  server's own trust store knows, from an internal CA or self-signed, keep working.
- Through Matomo's proxy, a local name server that does not answer no longer makes every address read as a DNS failure.
- When Matomo's address is stored with http and the server redirects it to https, the tracker endpoint, the JavaScript
  tracker and the Tag Manager containers follow that redirect instead of reading "unexpected redirect", and the admin
  page says what to set.
- Website addresses with ß (such as straße.de) are checked under their own domain, as browsers open them, and no
  longer under the spelling with ss (strasse.de), which can be another domain.
- Website addresses with umlauts and other common accented letters are checked on servers without PHP's intl
  extension too; other characters there read "not checkable" with the reason, and super users read what to install.
- Addresses with international characters are shown as entered, with their ASCII form in the tooltip.
- Visitors > Uptime: when the server's PHP cannot send the checks, super users read which PHP functions are missing and
  what to do, as on the admin page; a missing curl extension is named as such on both.
- Results for which nothing could be sent (Matomo's internet features off, PHP functions missing) no longer read as a
  recent check on Visitors > Uptime, in the widgets and in the admin page's last check, and a certificate date that no
  check confirmed no longer reads as expired. The check button is hidden while Matomo's internet features are off.
- The strip and the uptime figures of a week or a month with a clock change, such as October in Europe, follow the
  website's own days, also when the change falls on the week's last day; on the day the clocks go back, the hour that
  comes twice names its time zone (such as "2:00 AM GMT+2" and "2:00 AM GMT+1").
- Days in time zones with half or quarter hours, such as India or Nepal, show one cell per local hour and count only
  their own hours in their uptime.
- On servers with a libcurl older than 7.59, addresses with both IPv4 and IPv6 records no longer read as a DNS failure.
- Visitors > Uptime: addresses the server cannot check because its PHP disables functions, or because Matomo's internet
  features are off, no longer show the general reasons and the link to allow private addresses.
- Visitors > Uptime: the answer lists red lines before amber ones.
- Visitors > Uptime: on a past day, addresses that cannot be checked now are counted in the muted "Now" line (such as
  "Now: Matomo reachable, 1 address not checkable"); the line about them under the table shows for today only. An
  address without measurements on that day reads "Not measured".
- Visitors > Uptime with results checked from outside: when the Matomo server cannot check addresses for one reason,
  the reason is named once, in the answer or in the line under the table, instead of in every row.
- The Copy buttons name the line they copy for screen readers and announce when it is copied.
- API: `getStatus` names `internetFeaturesOff` and, for super users, `curlExtensionMissing`; results can carry the notes
  `internet_off`, `https_redirect` and `needs_intl`; `getTimeline` returns `end`, the end of its last cell;
  `detectTargets` says why the main page could not be read
  (`readError`), and with `apply=1` it changes nothing then (`applied` is false).

## 5.3.3

- Addresses with international characters (such as ß or umlauts) are always fetched under exactly the name that was
  checked.

## 5.3.2

- The tracker endpoint counts as reachable when Matomo answers it with an empty page (some servers hide Matomo's note on
  matomo.php), instead of reporting unexpected content.

## 5.3.1

- Checks now also run on servers whose PHP has curl_multi_exec disabled; where outgoing requests are not allowed at
  all, the admin page says which PHP functions are missing instead of showing an error.
- Where PHP has sleep, set_time_limit or random_int disabled, the checks keep their results and tracking requests are
  never affected.
- API: a wrongly typed value, such as a list where a text is expected, is answered with HTTP 400 naming the parameter
  instead of an error.

## 5.3.0

- Administration > Diagnostic > Uptime Monitor: a long status wraps onto a second line, so the column Last check stays
  in view on narrower screens.
- "Too large to check (over 4 MB)" no longer breaks inside the brackets.

## 5.2.0

- An address the Matomo server does not check, such as 192.168.1.10 or 127.0.0.1 while private addresses are not
  allowed in the settings, reads "Not checkable from this server" as soon as it is set, on Visitors > Uptime, in the
  dashboard widgets and on Administration > Diagnostic > Uptime Monitor, instead of "Not checked yet" until the next
  check. The API method `getStatus` says so for each address as `serverRefuses`.
- On a past day the answer names the addresses of an outage in the same order as the outage list ("Matomo:
  Interface, Tracker endpoint, and JavaScript tracker").
- French: a colon, semicolon, question mark or exclamation mark no longer starts a new line on its own.

## 5.1.5

- Visitors > Uptime today: a line that names an address that is not reachable is red, also when the other addresses
  of its group answer ("Matomo: Tag Manager container Ab12Cd34 not reachable"), as the "Now" line of a past day.
  A line that counts partly reachable addresses ("Matomo: 2 of 4 addresses not reachable") is amber, today and on a
  past day; when a group does not answer at all, its line stays red.
- The outage list: outages of several addresses of Matomo (or of the website) at the same time are one row that
  names them, "Matomo: Interface, Tracker endpoint, and JavaScript tracker". On a past day or a longer period each
  row's duration is its part inside it, with the whole length when that is longer ("30 min of 1 h"); on phones the
  list follows the same rows.
- A Tag Manager container larger than 4 MB reads "Too large to check (over 4 MB)" in its row, and when only such
  containers cannot be checked, the note under the list no longer says "from this server".
- A day or period without any measurement is one line, without empty hour strips, addresses or outage list. Before
  the first measurement it names the day the measurements start, with a link to it ("Nov 21: not measured.
  Measurements start on Nov 23"). The API's `getTimeline` gives that moment as `firstMeasured`.
- Shorter texts: the answer line of a past day names Matomo once before its addresses ("Matomo: JavaScript tracker,
  Interface, and Tracker endpoint"); durations read "1 h 30 min" instead of "1.5 h"; a number and its unit stay
  together on one line.
- Administration > Diagnostic > Uptime Monitor shows a certificate that expires soon in the warning colour and one
  that expires within 3 days, or has expired, in red, as the uptime page and the widgets do. The API's
  `getSitesOverview` gives its level as `certificateLevel`.
- On a past day Visitors > Uptime first answers for that day ("Nov 24: no outage", or how many outages, how long and
  where), with the measured share when less than 95 % of the time was measured; the current state follows in one
  muted line ("Now: Everything reachable, checked 4 minutes ago"). When something is not reachable right now, the
  "Now" line comes first and in full, with its dot, since when and why and the address that fails, and the day follows;
  a finished outage of that day shows in the warning colour, not in red. Longer periods answer for "In this period".
- The totals of a day or period count only the part of each outage inside it (an outage from 23:30 to 00:30 counts
  30 minutes on each day), and outages of several addresses at the same time count once, with their real length.
  The API's outages name that part: `startInPeriod` and `durationInPeriodSeconds` in `getIncidents`.
- On a past day the dots of the addresses follow that day's uptime (reachable, partly reachable, not measured) and the
  Response column, which only knows the latest answer, is left out.
- On phones and in narrow dashboard columns the outages are a list like the addresses: start and duration first, then
  what failed and why.
- In the narrow address list and in the dashboard widgets, response time, uptime and certificate stay together on the
  right and move to the next line as a whole under a long address. When all addresses of a group share one
  certificate, its heading names it once ("Certificate 63 days"); in the widgets the certificate figure does, with
  the host it belongs to. Differing certificates are named in each row ("Certificate 41 days").
- The dashboard widgets show the measured share under their uptime only when less than 95 % of the time was measured
  (always as the number's tooltip), as the hour strips do.
- Administration > Diagnostic > Uptime Monitor on phones: one block per website, its name with the edit button, its
  status, then certificate and last check.
- The group headings Matomo and This website look the same in the table and in the narrow list, and the measured share
  wraps evenly in narrow columns.
- On a dashboard the tip card of Feinwerk Plugins always sits in the same widget: the big Uptime widget when it is
  there, else the first of the small ones. It moves along when that widget is minimised or restored, never shows
  twice, and also shows while a widget loads or after a failed load.
- A Tag Manager container larger than 4 MB whose version the check cannot read in its first 4 MB no longer counts as
  current or as outdated by mistake: it shows as not checkable, with its own reason under "Why?" (the file is larger
  than 4 MB and cannot be read whole), without the firewall text or the link to private addresses. In the API
  (`getStatus`) such a result carries the note `too_large`.
- Notes inside cards (what cannot be checked, the check's answer, "Nothing was measured") show in the muted colour as
  intended; Matomo coloured them as normal text. In light and dark mode.
- Smaller things: on phones the website names on Administration > Diagnostic > Uptime Monitor look like the table's
  links; French "Conteneur Tag Manager du site ...", with own words for several websites in all languages; in the
  small widgets no empty band under the response time line; at full width the measured share at the end of an hour
  strip stays on one line. Lists are announced as lists by screen readers.

## 5.1.4

- In a narrow dashboard column and on phones, Visitors > Uptime lists the addresses like the dashboard widgets, under
  the headings Matomo and This website, instead of a table that had to cut its columns.
- The end of each hour strip shows the uptime alone; the measured share appears only when less than 95 % of the time
  was measured (always as the number's tooltip).
- On Administration > Diagnostic > Uptime Monitor the words "Sentinel's settings" in the alerts note are the link to
  them.
- The values in the narrow list say what they are for screen readers, and the certificate names itself on hover.
- On a past day the answer line gives the date of a running outage's start ("since Nov 25, 10:06 PM"), not the clock
  alone, and "HTTP-Status 403" stays whole in the outage list and the widgets.

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
