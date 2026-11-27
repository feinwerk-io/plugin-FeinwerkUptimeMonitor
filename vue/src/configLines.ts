/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * The opt-in's line for [FeinwerkUptimeMonitor] in config/config.ini.php, on the admin page and on
 * Visitors > Uptime (quick UI review before 5.4.0, L2). Only the line (UI review of 5.4.0, P2):
 * Matomo reads a section header that is in the file twice as one section that replaces the first
 * (parse_ini_string), so a pasted header would drop the settings already in it.
 */
export const INTERNET_LINE = 'checkWithInternetFeaturesOff = 1';
