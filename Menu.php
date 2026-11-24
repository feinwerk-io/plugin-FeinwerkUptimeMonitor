<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Menu\MenuAdmin;
use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\ConnectorInstaller\ConnectorInstaller;

class Menu extends \Piwik\Plugin\Menu
{
    public function configureAdminMenu(MenuAdmin $menu)
    {
        $this->addConnectorInstaller($menu);

        // Diagnostic, after Matomo's "Tracking failures" and Feinwerk Sentinel
        if (Piwik::hasUserSuperUserAccess()) {
            $menu->addDiagnosticItem('FeinwerkUptimeMonitor_MenuTitle', $this->urlForAction('admin'), $order = 4);
        }
    }

    /**
     * Kit: "Feinwerk Plugins" > "Feinwerk Connector installieren" (or "aktivieren") for super users while the connector
     * is not active, once across all Feinwerk plugins (ConnectorInstaller::claim()). The connector's own entries take the
     * same section once it is active. Never breaks the menu.
     */
    private function addConnectorInstaller(MenuAdmin $menu): void
    {
        try {
            $env = ConnectorInstaller::environment();
            if (ConnectorInstaller::decide($env) === ConnectorInstaller::HIDDEN || !ConnectorInstaller::claim()) {
                return;
            }
            if (method_exists($menu, 'registerMenuIcon')) {
                // the icon of the connector's own section. Matomo applies a section icon only when the section itself is
                // added as an entry (as PrivacyManager does): without it the left menu shows its default arrow.
                $menu->registerMenuIcon('FeinwerkUptimeMonitor_ConnectorInstallerSection', 'icon-marketplace');
                $menu->addItem('FeinwerkUptimeMonitor_ConnectorInstallerSection', null, [], 1);
            }
            $menu->addItem(
                'FeinwerkUptimeMonitor_ConnectorInstallerSection',
                ConnectorInstaller::usableFiles($env)
                    ? 'FeinwerkUptimeMonitor_ConnectorInstallerMenuActivate'
                    : 'FeinwerkUptimeMonitor_ConnectorInstallerMenu',
                $this->urlForAction('connectorInstaller'),
                1
            );
        } catch (\Throwable $e) {
            // an installer entry never breaks Matomo's menu
        }
    }
}
