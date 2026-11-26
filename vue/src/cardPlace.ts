/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Matomo's dashboard names each widget's frame `widget<Module><action>...` (attribute widgetId).
 * Our widgets' actions all start with "get": the prefix never matches another module whose name
 * starts with ours (FeinwerkUptimeMonitorPro).
 */
const OURS = 'widgetFeinwerkUptimeMonitorget';
const BIG = `${OURS}UptimePage`;

/**
 * The kit's card on a dashboard (L5): the kit shows the first card that arrives, and our widgets
 * load in any order, so the card moved between them. Every widget asks this instead and only one
 * renders its card: the big Uptime widget when the dashboard has one, else the first small one
 * (Matomo's order: column by column, top down); minimised widgets do not count. The dashboard
 * creates every widget's frame before any content loads, so all of them answer alike. Outside a
 * dashboard: true (the kit shows the card only on dashboards anyway).
 */
export function ownsDashboardCard(element: Element): boolean {
  const area = element.closest('#dashboardWidgetsArea');
  const own = element.closest('[widgetId]');
  if (!area || !own) {
    return true;
  }
  const ours = Array.prototype.filter.call(
    area.querySelectorAll(`[widgetId^="${OURS}"]`),
    (frame: Element) => !frame.querySelector('.widget.hiddenContent'),
  ) as Element[];
  const owner = ours.find((frame) => (frame.getAttribute('widgetId') || '').startsWith(BIG))
    || ours[0];
  return owner === own;
}

interface Watcher {
  element: Element;
  owns: boolean;
  changed: (owns: boolean) => void;
}

/** every widget that watches, with its last answer; one observer and one frame for all of them */
const watchers = new Set<Watcher>();
let observer: MutationObserver | null = null;
let observed: Element | null = null;
let frame = 0;

/**
 * All widgets decide in the same frame and change together: the old owner's card leaves in the
 * same update in which the new one's arrives, so the kit (one card per page, the first stays)
 * never sees two and never drops the new one.
 */
function decideAll(): void {
  frame = 0;
  watchers.forEach((watcher) => {
    if (!watcher.element.isConnected) {
      // a dashboard reload replaced the widget's HTML without unmounting its app
      watchers.delete(watcher);
      return;
    }
    const owns = ownsDashboardCard(watcher.element);
    if (owns !== watcher.owns) {
      // eslint-disable-next-line no-param-reassign
      watcher.owns = owns;
      watcher.changed(owns);
    }
  });
  if (!watchers.size && observer) {
    observer.disconnect();
    observer = null;
    observed = null;
  }
}

/**
 * Decides again whenever the dashboard changes what counts: a widget minimised or restored (its
 * class hiddenContent; Matomo fires no DOM event for it), added, moved or removed. Calls back with
 * the new answer only when it changed. Every widget watches, so the card moves to the new owner
 * and never shows twice. Returns the function that stops the watch; outside a dashboard nothing
 * is watched.
 */
export function watchDashboardCard(
  element: Element,
  changed: (owns: boolean) => void,
): () => void {
  const area = element.closest('#dashboardWidgetsArea');
  if (!area || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }
  const watcher: Watcher = { element, owns: ownsDashboardCard(element), changed };
  watchers.add(watcher);
  if (observed !== area) {
    if (observer) {
      observer.disconnect();
    }
    observed = area;
    // many changes come at once (a widget's content arrives): decide once per frame
    observer = new MutationObserver(() => {
      if (!frame) {
        frame = window.requestAnimationFrame(decideAll);
      }
    });
    observer.observe(area, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['class'],
    });
  }
  return () => {
    watchers.delete(watcher);
  };
}
