<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Side panel (house UI standard 2): the check targets of one website (idSite 0: Matomo's own),
  to change an address, switch a target off and on, add another address or a tracking proxy,
  remove a target set by hand, and adopt what was found on the website.
-->
<template>
  <div
    class="fwum-panel-backdrop"
    @click.self="close"
  >
    <div
      ref="panel"
      class="fwum-panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <div class="fwum-panel__head">
        <h2
          :id="titleId"
          class="fwum-panel__title"
        >{{ siteName ? translate('FeinwerkUptimeMonitor_UiTargetsTitleOf', siteName)
          : translate('FeinwerkUptimeMonitor_UiTargetsTitle') }}</h2>
        <button
          type="button"
          class="fwum-panel__close"
          :aria-label="translate('FeinwerkUptimeMonitor_UiClose')"
          :title="translate('FeinwerkUptimeMonitor_UiClose')"
          @click="close"
        >&times;</button>
      </div>

      <div class="fwum-panel__body">
        <p
          v-if="loading"
          class="fwum-muted"
          aria-busy="true"
        >{{ translate('FeinwerkUptimeMonitor_UiLoading') }}</p>
        <div
          v-else-if="loadFailed"
          class="fwum-inline-error"
          role="alert"
        >
          {{ translate('FeinwerkUptimeMonitor_UiLoadFailed') }}
          <button
            type="button"
            class="btn-flat"
            @click="load"
          >{{ translate('FeinwerkUptimeMonitor_UiRetry') }}</button>
        </div>
        <p
          v-if="error"
          class="fwum-inline-error"
          role="alert"
        >{{ error }}</p>
        <ul
          v-if="targets.length"
          class="fwum-edit-list"
        >
          <li
            v-for="target in targets"
            :key="target.targetKey"
            :data-fwum-key="target.targetKey"
          >
            <label class="fwum-edit-list__check">
              <input
                type="checkbox"
                data-fwum-focus="toggle"
                :checked="target.enabled"
                :disabled="busy"
                @change="toggle(target)"
              >
              <span>{{ kindLabel(target.kind, target.targetKey) }}</span>
            </label>
            <span class="fwum-muted">{{ sourceLabel(target.urlSource) }}</span>
            <div
              v-if="editing === target.targetKey"
              class="fwum-edit-list__edit"
            >
              <input
                v-model="draftUrl"
                type="url"
                class="browser-default fwum-input"
                data-fwum-focus="url"
                :aria-label="translate('FeinwerkUptimeMonitor_UiUrl')"
                @keydown.enter.prevent="draftUrl && saveUrl(target)"
              >
              <button
                type="button"
                class="btn-flat"
                :disabled="busy || !draftUrl"
                @click="saveUrl(target)"
              >{{ translate('FeinwerkUptimeMonitor_UiSave') }}</button>
              <button
                type="button"
                class="btn-flat"
                @click="cancel(target.targetKey)"
              >{{ translate('FeinwerkUptimeMonitor_UiCancel') }}</button>
            </div>
            <div
              v-else-if="removing === target.targetKey"
              class="fwum-edit-list__confirm"
              role="group"
            >
              <span>{{ translate(
                'FeinwerkUptimeMonitor_UiRemoveConfirm', target.url || '',
              ) }}</span>
              <button
                type="button"
                class="btn-flat"
                data-fwum-focus="confirm"
                :disabled="busy"
                @click="remove(target)"
              >{{ translate('FeinwerkUptimeMonitor_UiDelete') }}</button>
              <button
                type="button"
                class="btn-flat"
                @click="cancel(target.targetKey)"
              >{{ translate('FeinwerkUptimeMonitor_UiCancel') }}</button>
            </div>
            <div
              v-else
              class="fwum-edit-list__url"
            >
              <span :title="target.url || ''">{{ target.url }}</span>
              <button
                v-if="target.url !== null"
                type="button"
                class="btn-flat"
                data-fwum-focus="change"
                @click="startEdit(target)"
              >{{ translate('FeinwerkUptimeMonitor_UiChange') }}</button>
              <button
                v-if="target.urlSource !== 'default'"
                type="button"
                class="btn-flat"
                :disabled="busy"
                @click="startRemove(target)"
              >{{ translate('FeinwerkUptimeMonitor_UiDelete') }}</button>
            </div>
          </li>
        </ul>

        <div
          v-if="suggestions.length"
          class="fwum-suggestions"
        >
          <h3>{{ translate('FeinwerkUptimeMonitor_UiSuggestions') }}</h3>
          <ul>
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.key + suggestion.url"
            >
              <span>{{ kindLabel(suggestion.kind, suggestion.key) }}: {{ suggestion.url }}</span>
              <button
                v-if="canAdopt(suggestion)"
                type="button"
                class="btn-flat"
                :disabled="busy"
                @click="adopt(suggestion)"
              >{{ translate('FeinwerkUptimeMonitor_UiAdopt') }}</button>
            </li>
          </ul>
        </div>

        <form
          v-if="idSite > 0"
          class="fwum-add"
          @submit.prevent="add"
        >
          <h3>{{ translate('FeinwerkUptimeMonitor_UiAdd') }}</h3>
          <div class="fwum-add__row">
            <select
              v-model="newKind"
              class="browser-default fwum-select"
              :aria-label="translate('FeinwerkUptimeMonitor_UiAddKind')"
            >
              <option value="web">{{ translate('FeinwerkUptimeMonitor_UiAddWeb') }}</option>
              <option value="proxy">{{ translate('FeinwerkUptimeMonitor_UiKind_proxy') }}</option>
            </select>
            <input
              v-model="newUrl"
              type="url"
              class="browser-default fwum-input"
              placeholder="https://"
              :aria-label="translate('FeinwerkUptimeMonitor_UiUrl')"
            >
          </div>
        </form>
      </div>

      <div class="fwum-panel__foot">
        <button
          v-if="idSite > 0"
          type="button"
          class="btn"
          :disabled="busy || !newUrl"
          @click="add"
        >{{ translate('FeinwerkUptimeMonitor_UiAdd') }}</button>
        <button
          type="button"
          class="btn-flat"
          @click="close"
        >{{ translate('FeinwerkUptimeMonitor_UiClose') }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { translate } from 'CoreHome';
import { api } from './api';
import { Suggestion, TargetRow } from './types';
import { errorText } from './format';

export default defineComponent({
  props: {
    idSite: { type: Number, required: true },
    /** the website's name for the title ("Check targets: <name>") */
    siteName: { type: String, default: '' },
  },
  emits: ['close'],
  data() {
    return {
      targets: [] as TargetRow[],
      suggestions: [] as Suggestion[],
      busy: false,
      loading: true,
      loadFailed: false,
      removing: '',
      changed: false,
      error: '',
      editing: '',
      draftUrl: '',
      newKind: 'web',
      newUrl: '',
      opener: null as HTMLElement | null,
      titleId: `fwum-panel-${Math.random().toString(36).slice(2, 8)}`,
      /** where the focus goes once the list is back after a change: [target key, control] */
      focusAfter: null as [string, string] | null,
      bodyOverflow: '',
    };
  },
  mounted() {
    this.opener = document.activeElement as HTMLElement | null;
    (this.$refs.panel as HTMLElement).focus();
    // on the document: a control that disappears (Change, Remove, Save) leaves the focus on the
    // body, where keys on the panel element would no longer arrive
    document.addEventListener('keydown', this.onKey);
    this.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.load();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey);
    document.body.style.overflow = this.bodyOverflow;
  },
  methods: {
    translate,
    load(): void {
      this.loadFailed = false;
      api.targets(this.idSite).then((answer) => {
        this.targets = answer.targets.filter((t) => t.kind !== 'processing');
        this.suggestions = answer.suggestions;
      }).catch(() => {
        this.loadFailed = true;
      }).finally(() => {
        this.loading = false;
        this.restoreFocus();
      });
    },
    /** Moves the focus to a control of a target's row, or to the panel when that row is gone. */
    focusRow(key: string, control: string): void {
      this.$nextTick(() => {
        const panel = this.$refs.panel as HTMLElement | undefined;
        if (!panel) {
          return;
        }
        const row = Array.from(panel.querySelectorAll<HTMLElement>('[data-fwum-key]'))
          .find((li) => li.dataset.fwumKey === key);
        const target = row?.querySelector<HTMLElement>(`[data-fwum-focus="${control}"]`)
          || row?.querySelector<HTMLElement>('[data-fwum-focus="toggle"]');
        (target || panel).focus();
      });
    },
    restoreFocus(): void {
      const panel = this.$refs.panel as HTMLElement | undefined;
      if (this.focusAfter) {
        const [key, control] = this.focusAfter;
        this.focusAfter = null;
        this.focusRow(key, control);
      } else if (panel && !panel.contains(document.activeElement)) {
        panel.focus();
      }
    },
    startRemove(target: TargetRow): void {
      this.removing = target.targetKey;
      this.focusRow(target.targetKey, 'confirm');
    },
    cancel(key: string): void {
      this.editing = '';
      this.removing = '';
      this.focusRow(key, 'change');
    },
    onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      } else if (event.key === 'Tab') {
        this.trap(event);
      }
    },
    /** @param focus after success: [target key, control] to focus once the list is back */
    run(request: Promise<unknown>, focus: [string, string] | null = null): void {
      this.busy = true;
      this.error = '';
      request.then(() => {
        this.changed = true;
        this.editing = '';
        this.removing = '';
        this.focusAfter = focus;
        this.load();
      }).catch((e: unknown) => {
        this.error = errorText(e);
        this.$nextTick(() => this.restoreFocus());
      }).finally(() => {
        this.busy = false;
      });
    },
    toggle(target: TargetRow): void {
      this.run(api.updateTarget(this.idSite, target.targetKey, '', target.enabled ? '0' : '1'),
        [target.targetKey, 'toggle']);
    },
    startEdit(target: TargetRow): void {
      this.editing = target.targetKey;
      this.draftUrl = target.url || '';
      this.focusRow(target.targetKey, 'url');
    },
    saveUrl(target: TargetRow): void {
      this.run(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), ''),
        [target.targetKey, 'change']);
    },
    remove(target: TargetRow): void {
      this.run(api.deleteTarget(this.idSite, target.targetKey));
    },
    add(): void {
      if (!this.newUrl) {
        return;
      }
      this.run(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).then((row) => {
        this.newUrl = '';
        return row;
      }));
    },
    canAdopt(suggestion: Suggestion): boolean {
      return suggestion.idSite === this.idSite
        && ['web', 'proxy', 'ui', 'tracker', 'js'].includes(suggestion.kind);
    },
    adopt(suggestion: Suggestion): void {
      this.run(this.idSite === 0
        ? api.updateTarget(0, suggestion.key, suggestion.url, '')
        : api.addTarget(this.idSite, suggestion.kind, suggestion.url));
    },
    kindLabel(kind: string, key: string): string {
      if (kind === 'container') {
        return translate('FeinwerkUptimeMonitor_UiKind_container', key.replace('ctr:', ''));
      }
      return translate(`FeinwerkUptimeMonitor_UiKind_${kind}`);
    },
    sourceLabel(source: string): string {
      return translate(`FeinwerkUptimeMonitor_UiSource_${source}`);
    },
    /** Keeps the focus inside the panel while it is open. */
    trap(event: KeyboardEvent): void {
      const panel = this.$refs.panel as HTMLElement;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select, [href]',
      ));
      if (!items.length) {
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      // also when the panel itself or nothing in it has the focus (right after it opened, or
      // after a control vanished)
      if (document.activeElement === panel || !panel.contains(document.activeElement)) {
        (event.shiftKey ? last : first).focus();
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    },
    close(): void {
      this.$emit('close', this.changed);
      if (this.opener) {
        this.opener.focus();
      }
    },
  },
});
</script>
