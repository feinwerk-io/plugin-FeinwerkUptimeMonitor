<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Categories;

use Piwik\Category\Category;

/**
 * The dashboard widgets "Uptime: Matomo" and "Uptime: Website". Without a subcategory they appear in the dashboard's
 * widget menu only, not on a report page.
 */
class UptimeWidgetsCategory extends Category
{
    protected $id = 'FeinwerkUptimeMonitor_Widgets';
    protected $order = 8;
}
