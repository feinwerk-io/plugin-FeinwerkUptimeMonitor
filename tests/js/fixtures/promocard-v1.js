/*!
 * Matomo - free/libre analytics platform
 * @link https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/*
 * Feinwerk promotion kit, the card in a dashboard widget (templates/_promoCard.twig): its x keeps that card out of this
 * browser for its days (localStorage fwpromo:<id>:dismissed holds the time of the dismissal) and removes only the card,
 * never the widget around it (promo.js would hide the whole widget of a box). One card per page: when several widgets
 * render one, the first that arrives stays. Nothing is loaded and nothing is sent. Widgets arrive after the page, so
 * new cards are prepared through a MutationObserver and clicks are caught at the document. Plain script without a build
 * and without jQuery. Several Feinwerk plugins may ship this file: the first copy on the page does the work.
 */
(function () {
    'use strict';

    if (window.fwpromoCardKit) {
        return;
    }
    window.fwpromoCardKit = 1;

    var DAY = 86400000;

    function key(card) {
        return 'fwpromo:' + card.getAttribute('data-fwpromo-id') + ':dismissed';
    }

    function dismissed(card) {
        try {
            var at = parseInt(window.localStorage.getItem(key(card)) || '0', 10);
            var days = parseInt(card.getAttribute('data-fwpromo-days') || '30', 10);
            return at > 0 && Date.now() - at < days * DAY;
        } catch (e) {
            return false;
        }
    }

    function remove(card) {
        if (card.parentNode) {
            card.parentNode.removeChild(card);
        }
    }

    function prepare() {
        var cards = document.querySelectorAll('.fwpromo-card:not([data-fwpromo-ready])');
        Array.prototype.forEach.call(cards, function (card) {
            if (dismissed(card) || document.querySelector('.fwpromo-card[data-fwpromo-ready]')) {
                remove(card);
            } else {
                card.setAttribute('data-fwpromo-ready', '1');
            }
        });
    }

    document.addEventListener('click', function (event) {
        var button = event.target && event.target.closest ? event.target.closest('.fwpromo-card__close') : null;
        var card = button ? button.closest('.fwpromo-card') : null;
        if (!card) {
            return;
        }
        event.preventDefault();
        try {
            window.localStorage.setItem(key(card), String(Date.now()));
        } catch (e) {
            // storage blocked: hidden on this page only
        }
        remove(card);
    });

    if (typeof window.MutationObserver === 'function') {
        new window.MutationObserver(prepare).observe(document.documentElement, {childList: true, subtree: true});
    }
    document.addEventListener('DOMContentLoaded', prepare);
    prepare();
})();
