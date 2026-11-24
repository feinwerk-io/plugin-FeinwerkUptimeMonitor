__Is Uptime Monitor free?__

Yes. Uptime Monitor is free. Admins and super users see short tips on other Feinwerk offers in the Matomo interface; one line in Matomo's config file switches them off.

__Where do I find it?__

Under Visitors › Uptime for every website you may view, and in the dashboard widgets "Uptime: Matomo" and "Uptime: Website". Super users find all websites on one page under Administration › Diagnostic › Uptime Monitor.

__How often does it check?__

Without a cron of its own, once an hour with Matomo's scheduled tasks. With the cron line shown on the administration page, up to every minute. With many websites we recommend the cron line.

__Do the checks count as visits?__

No. The tracker endpoint is called without parameters, and Matomo does not count the User-Agent `FeinwerkUptimeBot` as a visit. Uptime Monitor measures the tracker's response time on real tracking requests.

__What does "not checkable from this server" mean?__

The Matomo server cannot reach the address itself, for example because of a firewall or a private address. That is not an outage and does not count into the uptime. For a Matomo in an intranet, super users can allow private addresses.

__How do I get alerts?__

Install the free plugin Sentinel. Four checks for Matomo, websites, certificates and the tracker appear there, and Sentinel reports them by e-mail, Slack or Teams.

__What happens when the Matomo server is down completely?__

A server that has stopped completely cannot report itself. The hours without a check show as not measured afterwards, never as reachable.

__Which data is stored?__

Only the results of the checks and the time and duration of sampled tracking requests, never anything about visitors. Raw results are kept 14 days, hourly values 90 days, daily values and outages 400 days.

__Where do I find more Feinwerk plugins?__

Install Feinwerk Connector from the Matomo Marketplace. It lists all Plugins for Matomo by Feinwerk, free and paid, and installs and updates them with one click.

__Who is behind Feinwerk?__

Feinwerk is Peter Boehlke's plugin studio in Unterschleißheim near Munich, Germany. We build Plugins for Matomo, nothing else.
