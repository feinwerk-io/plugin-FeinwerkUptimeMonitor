/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/** below this width (px) a screen takes its phone layout (.fwum-narrow, lists instead of tables) */
export const NARROW_PX = 600;

/**
 * Calls back whether the element is narrower than NARROW_PX, now and whenever its own width
 * changes: a screen follows its own width, not the window's (a dashboard column, a phone). A
 * dashboard reload replaces a widget's HTML without unmounting the app: the observer lets go
 * once the element left the page. Null without ResizeObserver (the media query then decides).
 */
export function observeNarrow(
  element: Element,
  narrow: (isNarrow: boolean) => void,
): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') {
    return null;
  }
  const observer = new ResizeObserver((entries) => {
    if (!element.isConnected) {
      observer.disconnect();
      return;
    }
    const width = entries[0] ? entries[0].contentRect.width : 0;
    if (width > 0) {
      narrow(width < NARROW_PX);
    }
  });
  observer.observe(element);
  return observer;
}
