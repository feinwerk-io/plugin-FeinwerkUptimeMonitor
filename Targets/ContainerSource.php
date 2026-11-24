<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Targets;

use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Db;
use Piwik\Log;
use Piwik\Plugin\Manager;

/**
 * The published (live) Tag Manager web containers of all websites with the revision of their live release, in one
 * query. Empty when the TagManager plugin is not activated.
 */
final class ContainerSource
{
    /**
     * @param \Closure|null $isActive whether TagManager is activated; default asks Matomo's plugin manager
     */
    /**
     * @param \Closure|null $isActive whether Tag Manager is active; default: Matomo's plugin manager
     * @param \Closure|null $rows the live containers as rows {idsite, idcontainer, revision}; default: Tag Manager's tables
     */
    public function __construct(private ?\Closure $isActive = null, private ?\Closure $rows = null)
    {
    }

    /**
     * @return list<array{idsite: int, idcontainer: string, revision: int}>
     */
    public function liveContainers(): array
    {
        $active = $this->isActive !== null ? ($this->isActive)() : Manager::getInstance()->isPluginActivated('TagManager');
        if (!$active) {
            return [];
        }
        try {
            $rows = $this->query();
        } catch (\Throwable $e) {
            // TagManager activated but its tables missing or changed: no container checks rather than no checks at all
            Log::warning('FeinwerkUptimeMonitor: Tag Manager containers could not be read: ' . $e->getMessage());
            return [];
        }

        return array_map(static fn(array $row): array => [
            'idsite' => (int) $row['idsite'],
            'idcontainer' => (string) $row['idcontainer'],
            'revision' => (int) $row['revision'],
        ], $rows);
    }

    /**
     * The live revision per container, read on every run (a publish in Tag Manager changes the file at once).
     *
     * @return array<string, int>|null "idsite|idcontainer" => revision; null when Tag Manager is not active or its
     *                                tables cannot be read (then nothing is known, rather than nothing is live)
     */
    public function liveRevisions(): ?array
    {
        $active = $this->isActive !== null ? ($this->isActive)() : Manager::getInstance()->isPluginActivated('TagManager');
        if (!$active) {
            return null;
        }
        try {
            $rows = $this->query();
        } catch (\Throwable $e) {
            return null;
        }
        $live = [];
        foreach ($rows as $row) {
            $live[(int) $row['idsite'] . '|' . (string) $row['idcontainer']] = (int) $row['revision'];
        }

        return $live;
    }

    private function query(): array
    {
        if ($this->rows !== null) {
            return ($this->rows)();
        }

        return Db::fetchAll(
            'SELECT r.idsite, r.idcontainer, v.revision'
            . ' FROM ' . Common::prefixTable('tagmanager_container_release') . ' r'
            . ' JOIN ' . Common::prefixTable('tagmanager_container') . ' c'
            . "   ON c.idcontainer = r.idcontainer AND c.idsite = r.idsite AND c.status = 'active' AND c.context = 'web'"
            . ' JOIN ' . Common::prefixTable('tagmanager_container_version') . ' v'
            . "   ON v.idcontainerversion = r.idcontainerversion AND v.status = 'active'"
            . " WHERE r.environment = 'live' AND r.status = 'active'"
            . ' ORDER BY r.idsite, r.idcontainer'
        );
    }

    /**
     * Path of a live container file below Matomo's root, e.g. "js/container_AbC123.js".
     */
    public function path(string $idContainer): string
    {
        try {
            $webDir = trim((string) StaticContainer::get('TagManagerContainerWebDir'), '/');
            $prefix = (string) StaticContainer::get('TagManagerContainerFilesPrefix');
        } catch (\Throwable $e) {
            // TagManager's DI entries are missing when the plugin is not loaded: its defaults
            $webDir = 'js';
            $prefix = 'container_';
        }

        return ($webDir !== '' ? $webDir . '/' : '') . $prefix . $idContainer . '.js';
    }
}
