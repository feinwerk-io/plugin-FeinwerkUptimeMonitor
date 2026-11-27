<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  One line for the server administrator to copy (the cron line, a line for config/config.ini.php)
  as a code chip with Copy: the admin page and Visitors > Uptime (quick UI review before 5.4.0,
  L2). L3: the button's name says which line it copies ("Copy checkWithInternetFeaturesOff = 1"),
  and "Copied" is said in a polite region that is there, empty, before the click; a second click
  empties it and fills it again, so screen readers say it again. The button itself reads "Copied"
  once its line is copied. The parent gives the chip its class (fwum-chip, fwum-cron).
-->
<template>
  <div>
    <code>{{ line }}</code>
    <button
      type="button"
      class="btn-flat"
      :aria-label="translate('FeinwerkUptimeMonitor_UiCopyLine', line)"
      @click="copy"
    >{{ translate(copied ? 'FeinwerkUptimeMonitor_UiCopied'
      : 'FeinwerkUptimeMonitor_UiCopy') }}</button>
    <span
      class="fwum-sr"
      aria-live="polite"
    >{{ announced }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { translate } from 'CoreHome';

/** how long the polite region stays empty before "Copied" again: long enough for screen readers */
const ANNOUNCE_DELAY_MS = 100;

export default defineComponent({
  props: {
    /** the line, exactly as it is copied */
    line: { type: String, required: true },
  },
  data() {
    return {
      copied: false,
      announced: '',
      timer: 0,
    };
  },
  beforeUnmount() {
    window.clearTimeout(this.timer);
  },
  methods: {
    translate,
    /** the button says Copied; the polite region empties and says it a moment later */
    done(): void {
      this.copied = true;
      this.announced = '';
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.announced = translate('FeinwerkUptimeMonitor_UiCopied');
      }, ANNOUNCE_DELAY_MS);
    },
    /** The clipboard API needs HTTPS; many intranet Matomos run on HTTP: then the classic way. */
    copy(): void {
      const text = this.line;
      const fallback = () => {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          if (document.execCommand('copy')) {
            this.done();
          }
        } finally {
          document.body.removeChild(area);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => this.done()).catch(fallback);
      } else {
        fallback();
      }
    },
  },
});
</script>
