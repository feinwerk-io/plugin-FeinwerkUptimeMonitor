<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Nonce;
use Piwik\Piwik;
use Piwik\Plugin\ControllerAdmin;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\FeinwerkUptimeMonitor\ConnectorInstaller\ConnectorInstaller;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Url;
use Piwik\View;

/**
 * Administration > Diagnostic > Uptime Monitor (super users): all websites, Matomo's targets, the cron line, the
 * Sentinel status (spec 10). Also the Feinwerk Connector installer of the promotion kit (PageFilterReport 0338553).
 */
class Controller extends ControllerAdmin
{
    public function admin()
    {
        Piwik::checkUserHasSuperUserAccess();

        return $this->renderTemplate('admin', [
            'props' => ScreenProps::for(0, 'admin') + [
                // the web server's PHP binary is no CLI binary: "php" stands for the admin's command line PHP
                'cronLine' => '* * * * * php ' . rtrim(PIWIK_INCLUDE_PATH, '/') . '/console feinwerkuptimemonitor:check',
            ],
            // admin pages leave piwik.language and <html lang> unset; the app formats dates and numbers with it
            'language' => ScreenProps::language(),
        ]);
    }

    /**
     * Kit: the Feinwerk Connector installer page (ConnectorInstaller/ConnectorInstaller.php). Super users only.
     */
    public function connectorInstaller()
    {
        Piwik::checkUserHasSuperUserAccess();
        $env = ConnectorInstaller::environment();
        $redirect = ConnectorInstaller::redirectFor($env);
        if ($redirect !== null) {
            Url::redirectToUrl($redirect);

            return '';
        }

        return $this->renderConnectorInstaller($env, null);
    }

    /**
     * Kit: the click. Matomo's password check first (it comes back here by GET with these parameters), then the nonce
     * (verified and discarded, as Matomo's own install action does), then install when the files are missing, and
     * activate. Success: on to the connector; any failure: back on the page with Matomo's reason.
     */
    public function connectorInstallerRun()
    {
        Piwik::checkUserHasSuperUserAccess();
        $env = ConnectorInstaller::environment();
        $redirect = ConnectorInstaller::redirectFor($env);
        if ($redirect !== null) {
            // active: the connector; switched off: admin home (never the page's "open the connector" fallback)
            Url::redirectToUrl($redirect);

            return '';
        }
        $state = ConnectorInstaller::decide($env);
        if ($state !== ConnectorInstaller::INSTALL && $state !== ConnectorInstaller::ACTIVATE) {
            return $this->renderConnectorInstaller($env, null);
        }

        $nonce = Common::getRequestVar('nonce', '', 'string');
        $retry = Common::getRequestVar('retry', 0, 'int') === 1;
        $verified = StaticContainer::get(\Piwik\Plugins\Login\PasswordVerifier::class)->requirePasswordVerifiedRecently([
            'module' => ConnectorInstaller::PLUGIN,
            'action' => 'connectorInstallerRun',
            'nonce' => $nonce,
            'retry' => $retry ? 1 : 0,
        ]);
        if (!$verified) {
            // Matomo is sending the user to its password page (it returns only when its redirect is off)
            return '';
        }

        $nonceError = Nonce::verifyNonceWithErrorMessage(ConnectorInstaller::NONCE, $nonce);
        if ($nonceError !== '') {
            // An expired nonce or Matomo's referrer check (seen right after its password step, e.g. after an SSO login):
            // nothing is installed, the page comes back with a fresh button and a short note. A second failure in a row
            // has a lasting cause (proxy, trusted host, origin): then Matomo's own reason, which may hold its FAQ link.
            return $retry
                ? $this->renderConnectorInstaller($env, ['ok' => false, 'message' => $nonceError, 'html' => true])
                : $this->renderConnectorInstaller($env, null, true);
        }
        Nonce::discardNonce(ConnectorInstaller::NONCE);

        $result = ConnectorInstaller::run(
            ConnectorInstaller::usableFiles($env),
            static function (): void {
                (new \Piwik\Plugins\CorePluginsAdmin\PluginInstaller())->installOrUpdatePluginFromMarketplace(ConnectorInstaller::CONNECTOR);
            },
            static function (): void {
                PluginManager::getInstance()->activatePlugin(ConnectorInstaller::CONNECTOR);
            }
        );
        if ($result['ok']) {
            Url::redirectToUrl(ConnectorInstaller::CONNECTOR_URL);
        }

        return $this->renderConnectorInstaller(ConnectorInstaller::environment(), $result);
    }

    /**
     * @param array<string, bool> $env
     * @param array{ok: bool, message: string, html: bool}|null $result
     * @param bool $clickAgain the nonce no longer matched: a fresh button and a short note
     */
    private function renderConnectorInstaller(array $env, ?array $result, bool $clickAgain = false): string
    {
        $view = new View('@FeinwerkUptimeMonitor/connectorInstaller');
        // an admin page without a website (setGeneralVariablesView() would need idSite). This controller extends
        // ControllerAdmin, whose setBasicVariablesView() runs the admin setup too (X-Frame-Options as
        // enable_framed_settings says); calling setBasicVariablesAdminView() again would show the notices twice.
        $this->setBasicVariablesView($view);
        $state = ConnectorInstaller::decide($env);
        $view->installerState = $state;
        $view->installerError = $result !== null && !$result['ok'] ? $result : null;
        $view->installerNonce = $state === ConnectorInstaller::INSTALL || $state === ConnectorInstaller::ACTIVATE
            ? Nonce::getNonce(ConnectorInstaller::NONCE)
            : '';
        $view->installerLinks = ConnectorInstaller::manualLinks();
        $view->installerWordPressUrl = ConnectorInstaller::wordpressUrl();
        $view->installerConnectorUrl = ConnectorInstaller::CONNECTOR_URL;
        $view->installerPhpFloor = ConnectorInstaller::PHP_FLOOR;
        $view->installerPluginsAdmin = $env['pluginsAdmin'];
        $view->installerConsoleCommand = ConnectorInstaller::CONSOLE_COMMAND;
        $view->installerClickAgain = $clickAgain;
        // <html lang> and piwik.language: setBasicVariablesView() does not set them on this page
        $view->language = ConnectorInstaller::pageLanguage();

        return $view->render();
    }
}
