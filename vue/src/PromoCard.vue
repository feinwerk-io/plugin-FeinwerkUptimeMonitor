<!--
  Matomo - free/libre analytics platform
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  The kit's card in a dashboard widget (Page Filter Report docs/footer.md "The card in dashboard
  widgets"; Peter, 2026-11-24, 7b): the dashboard's one card place, pausable (kit promocard.js 5,
  Page Filter Report templates/_premiumCard.twig 2b6e3f5: "Ein × blendet alles 30 Tage aus").
  promoCard = Promo\PromoCard::fromLine() through ScreenProps: the tip line's message of the day,
  its title as the bold name, its sentence and a short link; the id ends in -card, so card and
  line hide independently.

  Vue renders only the slot div and never its children (L5): promocard.js removes and adds nodes
  in there. The kit's markup travels as an inert native <template>, which a Vue template cannot
  emit, so it is built here with createElement, setAttribute and textContent (no raw HTML).
  promocard.js finds the group through its observer and unpacks the card only inside a dashboard
  (data-fwpromo-only-in), so Widgetize and the uptime page never show it. Pause days 0 (demo
  mode): a plain rotation group, hidden for the browser session only. The mark is the kit's card
  mark, inline; no Feinwerk logo in the card.
-->
<template>
  <div
    ref="slot"
    class="fwum-promo-card-slot"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface PromoCardVariables {
  id: string;
  /** days the closed card stays away (90; 0 in demo mode) */
  days: number;
  /** days an x empties the dashboard's card place (30; 0 in demo mode: no pause) */
  pauseDays: number;
  demo: boolean;
  name: string;
  text: string;
  link: string;
  url: string;
  external: boolean;
  note: string;
  title: string;
}

/** the dashboard's one card place, shared by every Feinwerk plugin */
const PLACE = 'card';
const SVG = 'http://www.w3.org/2000/svg';

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.keys(attributes).forEach((name) => node.setAttribute(name, attributes[name]));
  if (text !== '') {
    node.textContent = text;
  }
  return node;
}

function svgElement(tag: string, attributes: Record<string, string>): Element {
  const node = document.createElementNS(SVG, tag);
  Object.keys(attributes).forEach((name) => node.setAttribute(name, attributes[name]));
  return node;
}

/** the kit's card mark */
function mark(): HTMLElement {
  const box = element('span', { class: 'fwpromo-card__mark' });
  const svg = svgElement('svg', { viewBox: '0 0 32 32', 'aria-hidden': 'true', focusable: 'false' });
  svg.appendChild(svgElement('rect', {
    width: '32', height: '32', rx: '7', fill: '#0e3b3a',
  }));
  const dots = svgElement('g', { fill: '#9fd8d2' });
  [['16', '8.6'], ['8.6', '16'], ['23.4', '16'], ['16', '23.4']].forEach(([cx, cy]) => {
    dots.appendChild(svgElement('circle', { cx, cy, r: '2.5' }));
  });
  svg.appendChild(dots);
  svg.appendChild(svgElement('circle', {
    cx: '16', cy: '16', r: '4.3', fill: '#8ee6c8',
  }));
  box.appendChild(svg);
  return box;
}

/** one card as in the kit's template */
function cardNode(card: PromoCardVariables, dismissLabel: string): HTMLElement {
  const attributes: Record<string, string> = {
    class: 'fwpromo-card',
    'data-fwpromo-id': card.id,
    'data-fwpromo-days': String(card.days),
  };
  if (card.demo) {
    attributes['data-fwpromo-demo'] = '1';
  }
  const node = element('div', attributes);
  node.appendChild(mark());
  const body = element('span', { class: 'fwpromo-card__body' });
  body.appendChild(element('strong', {}, card.name));
  if (card.text) {
    body.appendChild(element('span', { title: card.text }, card.text));
  }
  node.appendChild(body);
  const link: Record<string, string> = { class: 'fwpromo-card__link' };
  // the server's store or Matomo link; never a script URL
  if (!/^\s*javascript:/i.test(card.url)) {
    link.href = card.url;
  }
  if (card.external !== false) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  if (card.title) {
    link.title = card.title;
  }
  node.appendChild(element('a', link, card.link));
  const close = element('button', {
    type: 'button',
    class: 'fwpromo-card__close',
    'data-fwpromo-close': '',
    title: dismissLabel,
    'aria-label': dismissLabel,
  });
  close.appendChild(element('span', { 'aria-hidden': 'true' }, '×'));
  node.appendChild(close);
  return node;
}

/**
 * The kit's group: a pausable place (an x empties it for pauseDays) or, in demo mode, a plain
 * rotation; only on a dashboard; the card waits in an inert template.
 */
function groupNode(card: PromoCardVariables, dismissLabel: string): HTMLElement {
  const group = element('div', { class: 'fwpromo-rotation' });
  if (card.pauseDays > 0) {
    group.setAttribute('data-fwpromo-pausable', PLACE);
    group.setAttribute('data-fwpromo-pause', PLACE);
    group.setAttribute('data-fwpromo-pause-days', String(card.pauseDays));
  } else {
    group.setAttribute('data-fwpromo-rotation', PLACE);
  }
  group.setAttribute('data-fwpromo-only-in', 'dashboard');
  const template = document.createElement('template');
  template.content.appendChild(cardNode(card, dismissLabel));
  group.appendChild(template);
  return group;
}

export default defineComponent({
  props: {
    card: {
      type: Object as PropType<PromoCardVariables|null>,
      default: null,
    },
    dismissLabel: { type: String, required: true },
  },
  watch: {
    card: {
      handler() {
        this.build();
      },
      deep: true,
    },
  },
  mounted() {
    this.build();
  },
  methods: {
    /** Empties the slot, then adds the whole group at once: the kit's observer sees it complete. */
    build(): void {
      const slot = this.$refs.slot as HTMLElement | undefined;
      if (!slot) {
        return;
      }
      while (slot.firstChild) {
        slot.removeChild(slot.firstChild);
      }
      if (this.card) {
        slot.appendChild(groupNode(this.card, this.dismissLabel));
      }
    },
  },
});
</script>
