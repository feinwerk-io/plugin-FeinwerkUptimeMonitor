<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration;

use Piwik\Db;
use Piwik\Option;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\CheckResult;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Outcome;
use Piwik\Plugins\FeinwerkUptimeMonitor\FeinwerkUptimeMonitor;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\Schema;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\StateStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Store\TargetStore;
use Piwik\Plugins\FeinwerkUptimeMonitor\Widgets\ScreenProps;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * Audit D2: when Matomo's own addresses answer only after the redirect to https (stored as http behind a TLS proxy),
 * the admin page says so with what to set.
 *
 * @group FeinwerkUptimeMonitor
 */
class HttpsRedirectHintTest extends IntegrationTestCase
{
    public function provideContainerConfig()
    {
        return ['Piwik\\Access' => new FakeAccess()];
    }

    public function setUp(): void
    {
        parent::setUp();
        FakeAccess::clearAccess(true);
        (new FeinwerkUptimeMonitor())->install();
        foreach (Schema::tables() as $table) {
            Db::query('TRUNCATE TABLE ' . Schema::table($table));
        }
        Option::deleteLike('fw_uptimemonitor_%');
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', 'https://www.shop.example/');
        (new TargetStore())->syncDefaults([
            ['idSite' => 0, 'key' => Kind::TRACKER, 'kind' => Kind::TRACKER, 'url' => 'http://matomo.example.com/matomo.php', 'extra' => []],
            ['idSite' => 1, 'key' => 'ctr:abc123', 'kind' => Kind::CONTAINER, 'url' => 'http://matomo.example.com/js/container_abc123.js', 'extra' => ['idContainer' => 'abc123']],
        ]);
    }

    private static function state(int $idSite, string $key, ?string $note, string $source = StateStore::LOCAL): void
    {
        $id = (new TargetStore())->get($idSite, $key)->id;
        (new StateStore())->upsertMany([new CheckResult($id, Outcome::UP, null, $note, 200, ['total' => 50], null, gmdate('Y-m-d H:i:s'))], $source);
    }

    public function test_theAdminPage_namesIt_whileMatomosAddressesAnswerOnlyAfterTheRedirect(): void
    {
        $this->assertFalse(ScreenProps::for(0, 'admin')['httpsRedirect']);
        self::state(0, Kind::TRACKER, null);
        $this->assertFalse(ScreenProps::for(0, 'admin')['httpsRedirect']);
        self::state(1, 'ctr:abc123', Outcome::HTTPS_REDIRECT);
        $this->assertTrue(ScreenProps::for(0, 'admin')['httpsRedirect'], 'a container: its file is on the Matomo server');
        $this->assertNull(ScreenProps::for(1, 'page')['httpsRedirect'], 'the admin page only');
        self::state(1, 'ctr:abc123', null);
        self::state(0, Kind::TRACKER, Outcome::HTTPS_REDIRECT, StateStore::EXTERNAL);
        $this->assertFalse(ScreenProps::for(0, 'admin')['httpsRedirect'], "the server's own checks only");
    }

    /**
     * L8 review of 5.4.0, NIT 11: one query for Matomo's own addresses (idSite 0, and the containers with Matomo's
     * default address), not every website's targets per admin page view.
     */
    public function test_oneQuery_forMatomosOwnAddresses(): void
    {
        $store = new StateStore();
        $this->assertFalse($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT));
        (new TargetStore())->setUrl(1, 'web:own', Kind::WEB, 'http://www.shop.example/', TargetStore::SOURCE_MANUAL);
        self::state(1, 'web:own', Outcome::HTTPS_REDIRECT);
        $this->assertFalse($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT), "a website's own address");
        self::state(1, 'ctr:abc123', Outcome::HTTPS_REDIRECT);
        $this->assertTrue($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT), 'a container with Matomo\'s address');
        (new TargetStore())->setUrl(1, 'ctr:abc123', Kind::CONTAINER, 'http://cdn.shop.example/container_abc123.js', TargetStore::SOURCE_MANUAL);
        $this->assertFalse($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT), 'a container on another address');
        self::state(0, Kind::TRACKER, Outcome::HTTPS_REDIRECT);
        $this->assertTrue($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT));
        $this->assertFalse($store->instanceAddressHasNote(Outcome::HTTPS_REDIRECT, StateStore::EXTERNAL));
    }
}
