<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Unit\Targets;

use PHPUnit\Framework\TestCase;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\AdoptionPolicy;

/**
 * @group FeinwerkUptimeMonitor
 */
class AdoptionPolicyTest extends TestCase
{
    private const SITE_HOSTS = ['www.shop.example', 'shop.example'];

    public function test_matomoHost_isAdopted(): void
    {
        $this->assertSame(AdoptionPolicy::ADOPT, AdoptionPolicy::decide('https://Matomo.Example.com/js/tracker.php', 'matomo.example.com', self::SITE_HOSTS));
    }

    public function test_siteHost_isAdopted(): void
    {
        $this->assertSame(AdoptionPolicy::ADOPT, AdoptionPolicy::decide('https://shop.example/matomo.php', 'matomo.example.com', self::SITE_HOSTS));
    }

    public function test_foreignHost_isOnlySuggested(): void
    {
        $this->assertSame(AdoptionPolicy::SUGGEST, AdoptionPolicy::decide('https://cdn.agency.example/matomo.js', 'matomo.example.com', self::SITE_HOSTS));
        $this->assertSame(AdoptionPolicy::SUGGEST, AdoptionPolicy::decide('https://evil.example/?x=shop.example', 'matomo.example.com', self::SITE_HOSTS));
        $this->assertSame(AdoptionPolicy::SUGGEST, AdoptionPolicy::decide('https://shop.example.evil.example/', 'matomo.example.com', self::SITE_HOSTS));
    }

    public function test_noHost_isSuggestedOnly(): void
    {
        $this->assertSame(AdoptionPolicy::SUGGEST, AdoptionPolicy::decide('not a url', 'matomo.example.com', self::SITE_HOSTS));
    }
}
