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
use Piwik\Widget\Widget;
use Piwik\Widget\WidgetConfig;

/**
 * Visitors > Uptime: the page of a website, Matomo's card first (spec 10). One wide widget that mounts the Vue page.
 */
class GetUptimePage extends Widget
{
    protected const VARIANT = 'page';

    public static function configure(WidgetConfig $config)
    {
        $config->setCategoryId('General_Visitors');
        $config->setSubcategoryId('FeinwerkUptimeMonitor_Uptime');
        $config->setName('FeinwerkUptimeMonitor_Uptime');
        $config->setOrder(1);
        $config->setIsWide();
        $idSite = Common::getRequestVar('idSite', 0, 'int');
        $config->setIsEnabled($idSite > 0 && Piwik::isUserHasViewAccess($idSite));
    }

    public function render()
    {
        $idSite = Common::getRequestVar('idSite', 0, 'int');
        Piwik::checkUserHasViewAccess($idSite);

        return $this->renderTemplate('mount', ['props' => ScreenProps::for($idSite, static::VARIANT)]);
    }
}
