<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor;

use Piwik\Piwik;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Thresholds;
use Piwik\Settings\FieldConfig;
use Piwik\Settings\Plugin\SystemSetting;

/**
 * Super user settings (spec 12). The addresses of the three Matomo targets themselves are changed as targets
 * (API `updateTarget` with idSite 0), so that there is one write path per value.
 */
class SystemSettings extends \Piwik\Settings\Plugin\SystemSettings
{
    /** the heading: the name with spaces, the same in every language, never translated (house rule 2026-10-20) */
    public const TITLE = 'Feinwerk Uptime Monitor';

    public const DEFAULT_SLOW_TRACKER_MS = Thresholds::DEFAULT_SLOW_TRACKER_MS;
    public const DEFAULT_CERT_WARNING_DAYS = Thresholds::DEFAULT_CERT_WARNING_DAYS;
    public const CERT_CRITICAL_DAYS = Thresholds::CERT_CRITICAL_DAYS;

    /** @var SystemSetting */
    public $trackerBaseUrl;

    /** @var SystemSetting */
    public $loginHost;

    /** @var SystemSetting */
    public $allowPrivate;

    /** @var SystemSetting */
    public $slowTrackerMs;

    /** @var SystemSetting */
    public $certWarningDays;

    protected function init()
    {
        $this->title = self::TITLE;

        $this->trackerBaseUrl = $this->makeSetting('trackerBaseUrl', '', FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = Piwik::translate('FeinwerkUptimeMonitor_SettingTrackerBase');
            $field->description = Piwik::translate('FeinwerkUptimeMonitor_SettingTrackerBaseHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_URL;
            $field->validate = static function ($value): void {
                $value = trim((string) $value);
                if ($value !== '' && (!preg_match('~^https?://[^/\s]+(/\S*)?$~i', $value) || preg_match('~[?#]~', $value))) {
                    throw new \Exception(Piwik::translate('FeinwerkUptimeMonitor_ErrorUrl'));
                }
            };
        });

        $this->loginHost = $this->makeSetting('loginHost', '', FieldConfig::TYPE_STRING, function (FieldConfig $field) {
            $field->title = Piwik::translate('FeinwerkUptimeMonitor_SettingLoginHost');
            $field->description = Piwik::translate('FeinwerkUptimeMonitor_SettingLoginHostHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->validate = static function ($value): void {
                $value = trim((string) $value);
                if ($value !== '' && !preg_match('/^[a-z0-9.-]+$/i', $value)) {
                    throw new \Exception(Piwik::translate('FeinwerkUptimeMonitor_ErrorHost'));
                }
            };
        });

        $this->allowPrivate = $this->makeSetting('allowPrivate', false, FieldConfig::TYPE_BOOL, function (FieldConfig $field) {
            $field->title = Piwik::translate('FeinwerkUptimeMonitor_SettingAllowPrivate');
            $field->description = Piwik::translate('FeinwerkUptimeMonitor_SettingAllowPrivateHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_CHECKBOX;
        });

        $this->slowTrackerMs = $this->makeSetting('slowTrackerMs', self::DEFAULT_SLOW_TRACKER_MS, FieldConfig::TYPE_INT, function (FieldConfig $field) {
            $field->title = Piwik::translate('FeinwerkUptimeMonitor_SettingSlowTracker');
            $field->description = Piwik::translate('FeinwerkUptimeMonitor_SettingSlowTrackerHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->validate = static function ($value): void {
                if (!is_numeric($value) || (int) $value < 50 || (int) $value > 60000) {
                    throw new \Exception(Piwik::translate('FeinwerkUptimeMonitor_ErrorRange', ['50', '60000']));
                }
            };
        });

        $this->certWarningDays = $this->makeSetting('certWarningDays', self::DEFAULT_CERT_WARNING_DAYS, FieldConfig::TYPE_INT, function (FieldConfig $field) {
            $field->title = Piwik::translate('FeinwerkUptimeMonitor_SettingCertWarning');
            $field->description = Piwik::translate('FeinwerkUptimeMonitor_SettingCertWarningHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
            $field->validate = static function ($value): void {
                if (!is_numeric($value) || (int) $value < 4 || (int) $value > 90) {
                    throw new \Exception(Piwik::translate('FeinwerkUptimeMonitor_ErrorRange', ['4', '90']));
                }
            };
        });
    }
}
