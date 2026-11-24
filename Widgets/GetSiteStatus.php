<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Widgets;

use Piwik\Common;
use Piwik\Piwik;
use Piwik\Widget\WidgetConfig;

/**
 * Dashboard widget "Uptime: Website": the website's address, its Tag Manager containers and its tracking proxy.
 */
class GetSiteStatus extends GetUptimePage
{
    protected const VARIANT = 'site';

    public static function configure(WidgetConfig $config)
    {
        $config->setCategoryId('FeinwerkUptimeMonitor_Widgets');
        $config->setName('FeinwerkUptimeMonitor_WidgetSite');
        $config->setOrder(2);
        $idSite = Common::getRequestVar('idSite', 0, 'int');
        $config->setIsEnabled($idSite > 0 && Piwik::isUserHasViewAccess($idSite));
    }
}
