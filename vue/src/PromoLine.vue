<!--
  Matomo - free/libre analytics platform
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Tip line of the Feinwerk promotion kit (PageFilterReport 0338553, docs/promo-kit.md,
  footer variant A), a Vue copy of templates/_promo.twig: one sentence, its link and the
  hide control, in the kit's markup and classes. The shared javascripts/promo.js (loaded by
  Matomo's asset manager) finds it through its MutationObserver, applies the 30-day hiding
  and the one-notice-per-page rule and only then shows it (data-fwpromo-ready). The message
  comes from Promo\PromoLine::current() through ScreenProps: null for users without admin
  access, in embeds and when promotions are switched off. The line starts with the
  Feinwerk Plugins logo (Peter, 2026-11-17: "feinwerk logo immer dabei"); on a narrow line
  only its round mark (promo.css, promo.js). A link with a short form (the connector message,
  Peter, 2026-11-25: "Kurzer Linktext") carries both; promo.js 6 shows the short one where the
  full link does not fit even without the sentence, the full text then in the link's title.
-->
<template>
  <div
    v-if="promo"
    class="fwpromo-line"
    :data-fwpromo-id="promo.id"
    data-fwpromo-placement="line"
    :data-fwpromo-days="promo.dismissDays"
    :data-fwpromo-demo="promo.demo ? '1' : undefined"
  >
    <FeinwerkLogo />
    <span
      class="fwpromo-line__text"
      :title="promo.text"
    >{{ promo.text }}</span>
    <a
      class="fwpromo-line__link"
      :href="promo.url"
      :target="promo.external === false ? undefined : '_blank'"
      :rel="promo.external === false ? undefined : 'noopener'"
      :title="linkTitle || undefined"
    ><template v-if="promo.linkShort"><span
      class="fwpromo-line__link-full"
    >{{ promo.link }}</span><span
      class="fwpromo-line__link-short"
    >{{ promo.linkShort }}</span></template><template
      v-else
    >{{ promo.link }}</template></a>
    <button
      type="button"
      class="fwpromo-line__dismiss fwpromo-dismiss"
      :title="dismissLabel"
      :aria-label="dismissLabel"
    ><span aria-hidden="true">&times;</span></button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import FeinwerkLogo from './FeinwerkLogo.vue';

export interface PromoVariables {
  id: string;
  placement: string;
  title: string;
  text: string;
  link: string;
  url: string;
  dismissDays: number;
  /** demo mode of a test instance: the kit script hides the notice for the browser session only */
  demo?: boolean;
  /** false: a link inside Matomo (the connector in the instance's own Marketplace), same tab */
  external?: boolean;
  /** the connector message for an admin: who can install it (the link's title) */
  note?: string;
  /** the link's short form for a line too narrow for the full one (the connector message) */
  linkShort?: string;
}

export default defineComponent({
  components: { FeinwerkLogo },
  props: {
    promo: {
      type: Object as PropType<PromoVariables|null>,
      default: null,
    },
    dismissLabel: { type: String, required: true },
  },
  computed: {
    /** as templates/_promo.twig: with a short form the full link leads the title, then the note */
    linkTitle(): string {
      if (!this.promo) {
        return '';
      }
      const note = this.promo.note || '';
      if (!this.promo.linkShort) {
        return note;
      }
      return note ? `${this.promo.link}. ${note}` : this.promo.link;
    },
  },
});
</script>
