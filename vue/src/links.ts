/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { MatomoUrl } from 'CoreHome';

/** Visitors > Uptime of a website for today (the admin overview's links) */
export function uptimePageToday(idSite: number): string {
  const query = MatomoUrl.stringify({
    module: 'CoreHome', action: 'index', idSite, period: 'day', date: 'today',
  });
  const hash = MatomoUrl.stringify({
    idSite,
    period: 'day',
    date: 'today',
    category: 'General_Visitors',
    subcategory: 'FeinwerkUptimeMonitor_Uptime',
  });
  return `?${query}#?${hash}`;
}
