<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Categories;

use Piwik\Category\Subcategory;
use Piwik\Piwik;

/**
 * Visitors > Uptime: Matomo itself and the website (spec 10).
 */
class UptimeSubcategory extends Subcategory
{
    protected $categoryId = 'General_Visitors';
    protected $id = 'FeinwerkUptimeMonitor_Uptime';
    // after Feinwerk Sentinel's "Tracking health" (90): the health entries together, and Real-time next to Real-time Map
    protected $order = 91;

    public function getHelp()
    {
        return '<p>' . Piwik::translate('FeinwerkUptimeMonitor_Help') . '</p>';
    }
}
