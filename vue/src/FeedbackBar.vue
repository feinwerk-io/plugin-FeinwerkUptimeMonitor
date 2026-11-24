<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Feinwerk feedback kit (FeinwerkEmailReportsPro docs/feedback-kit.md): a question with
  thumbs up and down, sent through the plugin's API method sendFeedback (the Matomo server
  talks to Feinwerk, never the browser), and a support link in a new tab. To reuse it in
  another plugin, change PLUGIN and the "fwum-" class prefix; nothing else is plugin specific.
-->
<template>
  <!-- footer variant A (Peter, 2026-11-13; Page Filter Report docs/footer.md): one row,
       never wrapped, the question cut with an ellipsis, borderless thumbs, a quiet Support
       link at the end; after a vote the thanks takes the place of question and thumbs -->
  <div
    v-if="feedback.enabled || feedback.supportUrl"
    class="fwum-feedback"
    :class="{ 'is-voted': vote !== '' }"
  >
    <template v-if="feedback.enabled">
      <span
        class="fwum-feedback__question"
        :title="question"
      >{{ question }}</span>
      <button
        v-for="choice in choices"
        :key="choice"
        type="button"
        class="fwum-feedback__thumb"
        :title="label(choice)"
        :aria-label="label(choice)"
        :aria-pressed="vote === choice ? 'true' : 'false'"
        :disabled="vote !== ''"
        @click="send(choice)"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          :class="`fwum-feedback__icon--${choice}`"
        >
          <path
            :d="thumbPath"
          />
        </svg>
      </button>
      <span class="fwum-feedback__thanks" role="status">{{ thanks }}</span>
    </template>
    <a
      v-if="feedback.supportUrl"
      class="fwum-feedback__support"
      :href="feedback.supportUrl"
      target="_blank"
      rel="noopener noreferrer"
      :title="tr('SupportTitle')"
    ><svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    ><circle cx="12" cy="12" r="9" /><path :d="helpPath" /></svg>{{ tr('Support') }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AjaxHelper, translate } from 'CoreHome';

const PLUGIN = 'FeinwerkUptimeMonitor';

/** a thumb outline (24 x 24); the down thumb is the same, rotated */
const THUMB_PATH = 'M3 10h4v10H3zM7 10l4-7c1.3 0 2.2 1.1 2 2.4L12.4 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7';

type Vote = 'up' | 'down';

/** delivered by the plugin (here getEditorMetadata): switch, support URL, plugin version */
export interface FeedbackSettings {
  enabled: boolean;
  supportUrl: string;
  version: string;
}

/** localStorage: this browser's vote per question and plugin version (a convenience only) */
function storageKey(topic: string): string {
  return `${PLUGIN}.feedback.${topic}`;
}

function storedVote(topic: string, version: string): '' | Vote {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey(topic)) || '{}');
    return stored.version === version && (stored.vote === 'up' || stored.vote === 'down') ? stored.vote : '';
  } catch (e) {
    return '';
  }
}

export default defineComponent({
  props: {
    idSite: { type: Number, required: true },
    /** the store "topic": one of the plugin's PluginFeedback::TOPICS */
    topic: { type: String, required: true },
    /** the question, already translated */
    question: { type: String, required: true },
    feedback: {
      type: Object as PropType<FeedbackSettings>,
      default: () => ({ enabled: false, supportUrl: '', version: '' }),
    },
  },
  data() {
    return { vote: storedVote(this.topic, this.feedback.version) as '' | Vote };
  },
  computed: {
    choices(): Vote[] {
      return ['up', 'down'];
    },
    thumbPath(): string {
      return THUMB_PATH;
    },
    helpPath(): string {
      return 'M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01';
    },
    thanks(): string {
      if (this.vote === '') {
        return '';
      }
      return this.vote === 'up' ? this.tr('FeedbackThanks') : this.tr('FeedbackThanksDown');
    },
  },
  methods: {
    tr(key: string): string {
      return translate(`${PLUGIN}_${key}`);
    },
    label(choice: Vote): string {
      return choice === 'up' ? this.tr('FeedbackYes') : this.tr('FeedbackNo');
    },
    send(vote: Vote) {
      this.vote = vote;
      try {
        const stored = { version: this.feedback.version, vote };
        window.localStorage.setItem(storageKey(this.topic), JSON.stringify(stored));
      } catch (e) {
        // private mode or blocked storage: the thanks is shown anyway
      }
      // Best effort: the vote is a hint for Feinwerk, a failed request needs no error message.
      AjaxHelper.post(
        { method: `${PLUGIN}.sendFeedback`, idSite: this.idSite },
        { topic: this.topic, vote },
        { createErrorNotification: false },
      ).catch(() => undefined);
    },
  },
});
</script>
