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
 * Dashboard widget "Uptime: Matomo": Matomo's interface, tracker, JavaScript tracker and the tracker's processing time.
 */
class GetMatomoStatus extends GetUptimePage
{
    protected const VARIANT = 'matomo';

    public static function configure(WidgetConfig $config)
    {
        $config->setCategoryId('FeinwerkUptimeMonitor_Widgets');
        $config->setName('FeinwerkUptimeMonitor_WidgetMatomo');
        $config->setOrder(1);
        $idSite = Common::getRequestVar('idSite', 0, 'int');
        // Matomo's own health is for logged-in users (API: idSite 0 refuses anonymous requests)
        $config->setIsEnabled($idSite > 0 && Piwik::isUserHasViewAccess($idSite) && !Piwik::isUserIsAnonymous());
    }
}
