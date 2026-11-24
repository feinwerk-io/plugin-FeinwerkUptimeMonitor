<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\tests\Integration\Targets;

use Piwik\API\Request;
use Piwik\Common;
use Piwik\Db;
use Piwik\Plugin\Manager;
use Piwik\Plugins\FeinwerkUptimeMonitor\Check\Kind;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\ContainerSource;
use Piwik\Plugins\FeinwerkUptimeMonitor\Targets\DefaultTargets;
use Piwik\Tests\Framework\Fixture;
use Piwik\Tests\Framework\Mock\FakeAccess;
use Piwik\Tests\Framework\TestCase\IntegrationTestCase;

/**
 * @group FeinwerkUptimeMonitor
 */
class DefaultTargetsTest extends IntegrationTestCase
{
    public function provideContainerConfig()
    {
        return ['Piwik\\Access' => new FakeAccess()];
    }

    public function setUp(): void
    {
        parent::setUp();
        FakeAccess::$superUser = true;
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Shop', 'https://www.shop.example/');
        Fixture::createWebsite('2026-01-01 00:00:00', 0, 'Blog', 'https://blog.example/');
    }

    private static function byKey(array $specs): array
    {
        $out = [];
        foreach ($specs as $spec) {
            $out[$spec['idSite'] . '|' . $spec['key']] = $spec;
        }
        return $out;
    }

    private static function defaults(string $trackerBase = '', string $loginHost = ''): DefaultTargets
    {
        return new DefaultTargets($trackerBase, $loginHost, null, static fn(): string => 'https://matomo.example.com/');
    }

    public function test_instanceTargets_fromPiwikUrl(): void
    {
        $specs = self::byKey(self::defaults()->specs());
        // Matomo's login page shows its form also where anonymous users may view websites (review L8 #1)
        $this->assertSame('https://matomo.example.com/index.php?module=Login', $specs['0|ui']['url']);
        $this->assertSame('https://matomo.example.com/matomo.php', $specs['0|tracker']['url']);
        $this->assertSame('https://matomo.example.com/matomo.js', $specs['0|js']['url']);
        $this->assertSame('matomo.example.com', $specs['0|tracker']['extra']['matomoHost']);
    }

    public function test_singleSignOnLoginPlugin_keepsIndexPhp(): void
    {
        $defaults = new DefaultTargets('', '', null, static fn(): string => 'https://matomo.example.com/', null, static fn(): string => 'LoginSaml');
        $this->assertSame('https://matomo.example.com/index.php', self::byKey($defaults->specs())['0|ui']['url']);
    }

    public function test_trackerBaseOverride_andLoginHost(): void
    {
        $specs = self::byKey(self::defaults('https://t.example.net', 'SSO.example.org')->specs());
        $this->assertSame('https://t.example.net/matomo.php', $specs['0|tracker']['url']);
        $this->assertSame('https://t.example.net/matomo.js', $specs['0|js']['url']);
        $this->assertSame('https://matomo.example.com/index.php?module=Login', $specs['0|ui']['url'], 'the interface stays on Matomo');
        $this->assertSame('sso.example.org', $specs['0|ui']['extra']['loginHost']);
    }

    public function test_siteMainUrl_isWebTarget(): void
    {
        $specs = self::byKey(self::defaults()->specs());
        $key = '1|' . DefaultTargets::webKey('https://www.shop.example/');
        $this->assertSame(Kind::WEB, $specs[$key]['kind']);
        $this->assertSame('https://www.shop.example', rtrim($specs[$key]['url'], '/'));
        $this->assertSame(DefaultTargets::webKey('https://WWW.shop.example'), DefaultTargets::webKey('https://www.shop.example/'));
        $this->assertArrayHasKey('2|' . DefaultTargets::webKey('https://blog.example/'), $specs);
        $this->assertLessThanOrEqual(12, strlen(DefaultTargets::webKey('https://www.shop.example/')));
    }

    /** whether this test created the Tag Manager tables itself (then it drops them again) */
    private bool $ownTables = false;

    public function tearDown(): void
    {
        if ($this->ownTables) {
            Db::query('DROP TABLE IF EXISTS ' . Common::prefixTable('tagmanager_container') . ', '
                . Common::prefixTable('tagmanager_container_version') . ', ' . Common::prefixTable('tagmanager_container_release'));
        }
        parent::tearDown();
    }

    /** TagManager installed with its own tables (CI), not only listed in the config (harness) */
    private static function tagManagerInstalled(): bool
    {
        return Manager::getInstance()->isPluginLoaded('TagManager')
            && (bool) Db::fetchOne('SHOW TABLES LIKE ?', [Common::prefixTable('tagmanager_container')]);
    }

    /**
     * The harness copies of Matomo come without the TagManager plugin (a submodule in Matomo's repository), so there
     * the test creates its three tables with the columns of Matomo 5.0.0 (plugins/TagManager/Dao/*::install()) and
     * drops them afterwards. In CI TagManager is loaded and its own API publishes a container.
     *
     * @return string the id of the live container
     */
    private function publishLiveContainer(): string
    {
        if (self::tagManagerInstalled()) {
            $id = (string) Request::processRequest('TagManager.addContainer', ['idSite' => 1, 'context' => 'web', 'name' => 'Main']);
            $version = Request::processRequest('TagManager.createContainerVersion', ['idSite' => 1, 'idContainer' => $id, 'name' => 'v1']);
            Request::processRequest('TagManager.publishContainerVersion', ['idSite' => 1, 'idContainer' => $id, 'idContainerVersion' => $version, 'environment' => 'live']);
            return $id;
        }
        $this->ownTables = true;
        $p = static fn(string $t): string => Common::prefixTable($t);
        Db::query('CREATE TABLE ' . $p('tagmanager_container') . " (idcontainer VARCHAR(8) NOT NULL, idsite INT UNSIGNED NOT NULL,
            context VARCHAR(10) NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(1000) NOT NULL DEFAULT '',
            ignoreGtmDataLayer TINYINT(1) UNSIGNED NOT NULL DEFAULT 0, status VARCHAR(10) NOT NULL,
            created_date DATETIME NULL, updated_date DATETIME NULL, deleted_date DATETIME NULL, PRIMARY KEY (idcontainer))");
        Db::query('CREATE TABLE ' . $p('tagmanager_container_version') . " (idcontainerversion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            idcontainer VARCHAR(8) NOT NULL, idsite INT UNSIGNED NOT NULL, status VARCHAR(10) NOT NULL,
            revision MEDIUMINT UNSIGNED NOT NULL DEFAULT 1, name VARCHAR(255) NOT NULL DEFAULT '',
            description VARCHAR(1000) NOT NULL DEFAULT '', created_date DATETIME NULL, updated_date DATETIME NULL,
            deleted_date DATETIME NULL, PRIMARY KEY (idcontainerversion))");
        Db::query('CREATE TABLE ' . $p('tagmanager_container_release') . " (idcontainerrelease BIGINT NOT NULL AUTO_INCREMENT,
            idcontainer VARCHAR(8) NOT NULL, idcontainerversion BIGINT UNSIGNED NOT NULL, idsite INT UNSIGNED NOT NULL,
            status VARCHAR(10) NOT NULL, environment VARCHAR(40) NOT NULL, release_login VARCHAR(100) NULL,
            release_date DATETIME NULL, deleted_date DATETIME NULL, PRIMARY KEY (idcontainerrelease))");
        Db::query('INSERT INTO ' . $p('tagmanager_container') . " (idcontainer, idsite, context, name, status) VALUES
            ('AbC123', 1, 'web', 'Main', 'active'), ('Gone99', 1, 'web', 'Deleted', 'deleted'), ('App777', 2, 'android', 'App', 'active')");
        Db::query('INSERT INTO ' . $p('tagmanager_container_version') . " (idcontainerversion, idcontainer, idsite, status, revision) VALUES
            (1, 'AbC123', 1, 'active', 2), (2, 'AbC123', 1, 'active', 3), (3, 'Gone99', 1, 'active', 1), (4, 'App777', 2, 'active', 1)");
        Db::query('INSERT INTO ' . $p('tagmanager_container_release') . " (idcontainer, idcontainerversion, idsite, status, environment) VALUES
            ('AbC123', 2, 1, 'active', 'live'), ('AbC123', 1, 1, 'active', 'staging'), ('Gone99', 3, 1, 'active', 'live'),
            ('App777', 4, 2, 'active', 'live')");

        return 'AbC123';
    }

    public function test_liveContainer_hasRevision(): void
    {
        $id = $this->publishLiveContainer();
        $source = new ContainerSource(static fn(): bool => true);
        $live = $source->liveContainers();
        $this->assertContains($id, array_column($live, 'idcontainer'));
        $this->assertNotContains('Gone99', array_column($live, 'idcontainer'), 'deleted containers are left out');
        $this->assertNotContains('App777', array_column($live, 'idcontainer'), 'only web containers');

        $specs = self::byKey((new DefaultTargets('', '', $source, static fn(): string => 'https://matomo.example.com/'))->specs());
        $spec = $specs['1|ctr:' . $id];
        $this->assertSame(Kind::CONTAINER, $spec['kind']);
        $this->assertSame('https://matomo.example.com/js/container_' . $id . '.js', $spec['url']);
        $this->assertSame($id, $spec['extra']['idContainer']);
        $this->assertGreaterThanOrEqual(1, $spec['extra']['revision']);
        if ($this->ownTables) {
            $this->assertSame(3, $spec['extra']['revision'], 'the revision of the live release, not the newest version');
        }
    }

    public function test_tagManagerNotActivated_noContainerQuery(): void
    {
        $this->assertSame([], (new ContainerSource(static fn(): bool => false))->liveContainers());
    }

    public function test_unreadableContainers_giveNoContainersButTheOtherTargets(): void
    {
        if (self::tagManagerInstalled()) {
            $this->markTestSkipped('the tables belong to the loaded TagManager plugin here');
        }
        $specs = (new DefaultTargets('', '', new ContainerSource(static fn(): bool => true), static fn(): string => 'https://matomo.example.com/'))->specs();
        $this->assertSame([], array_values(array_filter($specs, static fn(array $s): bool => $s['kind'] === Kind::CONTAINER)));
        $this->assertCount(5, $specs, 'three Matomo targets and two websites');
    }
}
