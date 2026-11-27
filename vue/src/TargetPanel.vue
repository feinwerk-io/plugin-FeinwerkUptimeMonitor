<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later

  Side panel (house UI standard 2): the check targets of one website (idSite 0: Matomo's own),
  to change an address, switch a target off and on, add another address or a tracking proxy,
  remove a target set by hand, and adopt what was found on the website. The address is text; the
  switch is its own control with its own name ("Check <address>") and a small On/Off next to it
  (F2), so a click on the address never switches a check off. Escape first leaves an open change
  or removal, then closes the panel; an error shows next to what caused it (L9).
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
        <!-- UI review of 5.4.0, L9: why nothing is found on the website while no check is sent -->
        <p
          v-if="notice"
          class="fwum-muted fwum-panel__notice"
        >{{ notice }}</p>
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
          v-if="error && errorOnTop"
          class="fwum-inline-error"
          role="alert"
        >{{ error }}</p>

        <!-- Peter's 4a (P3): what was found comes first, adopted with one click -->
        <section
          v-if="suggestions.length"
          class="fwum-suggestions"
        >
          <h3>{{ translate('FeinwerkUptimeMonitor_UiSuggestions') }}</h3>
          <ul>
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.key + suggestion.url"
            >
              <span class="fwum-suggestions__kind">
                {{ kindLabel(suggestion.kind, suggestion.key) }}
              </span>
              <span class="fwum-suggestions__url">{{ suggestion.url }}</span>
              <button
                v-if="canAdopt(suggestion)"
                type="button"
                class="btn-flat"
                :disabled="busy"
                @click="adopt(suggestion)"
              >{{ translate('FeinwerkUptimeMonitor_UiAdopt') }}</button>
            </li>
          </ul>
        </section>

        <ul
          v-if="targets.length"
          class="fwum-edit-list"
        >
          <li
            v-for="target in targets"
            :key="target.targetKey"
            :data-fwum-key="target.targetKey"
          >
            <div class="fwum-edit-list__row">
              <!-- the state word is no span: Matomo draws "checkbox + span" as its own box -->
              <label class="fwum-edit-list__toggle">
                <input
                  type="checkbox"
                  data-fwum-focus="toggle"
                  :checked="target.enabled"
                  :disabled="busy"
                  :aria-label="translate('FeinwerkUptimeMonitor_UiCheckTarget', addressOf(target))"
                  @change="toggle(target, $event)"
                >
                <small aria-hidden="true">{{ translate(target.enabled
                  ? 'FeinwerkUptimeMonitor_UiOn' : 'FeinwerkUptimeMonitor_UiOff') }}</small>
              </label>
              <div
                class="fwum-edit-list__address"
                :class="{ 'is-off': !target.enabled }"
              >
                <span class="fwum-edit-list__url">{{ addressOf(target) }}</span>
                <span class="fwum-muted">{{ kindLabel(target.kind, target.targetKey) }},
                  {{ sourceLabel(target.urlSource) }}</span>
              </div>
              <span
                v-if="editing !== target.targetKey && removing !== target.targetKey"
                class="fwum-edit-list__actions"
              >
                <button
                  v-if="target.url !== null"
                  type="button"
                  class="btn-flat fwum-icon-only"
                  data-fwum-focus="change"
                  :title="translate('FeinwerkUptimeMonitor_UiChange')"
                  :aria-label="`${translate('FeinwerkUptimeMonitor_UiChange')}: ${target.url}`"
                  @click="startEdit(target)"
                ><span
                  class="icon-edit"
                  aria-hidden="true"
                /></button>
                <button
                  v-if="target.urlSource !== 'default'"
                  type="button"
                  class="btn-flat fwum-icon-only"
                  :title="translate('FeinwerkUptimeMonitor_UiDelete')"
                  :aria-label="`${translate('FeinwerkUptimeMonitor_UiDelete')}: ${target.url}`"
                  :disabled="busy"
                  @click="startRemove(target)"
                ><span
                  class="icon-delete"
                  aria-hidden="true"
                /></button>
              </span>
            </div>
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
                :aria-invalid="draftUrl !== '' && !validUrl(draftUrl)"
                @keydown.enter.prevent="validUrl(draftUrl) && saveUrl(target)"
              >
              <button
                type="button"
                class="btn-flat"
                :disabled="busy || !validUrl(draftUrl)"
                @click="saveUrl(target)"
              >{{ translate('FeinwerkUptimeMonitor_UiSave') }}</button>
              <button
                type="button"
                class="btn-flat"
                @click="cancel(target.targetKey)"
              >{{ translate('FeinwerkUptimeMonitor_UiCancel') }}</button>
              <p
                v-if="draftUrl !== '' && !validUrl(draftUrl)"
                class="fwum-inline-error"
              >{{ translate('FeinwerkUptimeMonitor_ErrorUrl') }}</p>
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
            <p
              v-if="error && errorAt === target.targetKey"
              class="fwum-inline-error"
              role="alert"
            >{{ error }}</p>
          </li>
        </ul>

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
              :aria-invalid="newUrl !== '' && !validUrl(newUrl)"
            >
            <button
              type="submit"
              class="btn-flat"
              :disabled="busy || !validUrl(newUrl)"
            >{{ translate('FeinwerkUptimeMonitor_UiAdd') }}</button>
          </div>
          <p
            v-if="newUrl !== '' && newUrl !== 'https://' && !validUrl(newUrl)"
            class="fwum-inline-error"
          >{{ translate('FeinwerkUptimeMonitor_ErrorUrl') }}</p>
          <p
            v-if="error && errorAt === 'add'"
            class="fwum-inline-error"
            role="alert"
          >{{ error }}</p>
        </form>
      </div>

      <!-- every change saves at once: the footer only closes -->
      <div class="fwum-panel__foot">
        <button
          type="button"
          class="btn"
          :disabled="busy"
          @click="done"
        >{{ translate('FeinwerkUptimeMonitor_UiDone') }}</button>
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
    /**
     * UI review of 5.4.0, L9: one muted line at the top while the checks send nothing (Matomo's
     * internet features off), which also leaves the suggestions empty; the opener picks the words
     */
    notice: { type: String, default: '' },
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
      /** where the error shows: '' at the top, 'add' under the add row, else a target's row */
      errorAt: '',
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
  computed: {
    /** an error shows next to its row or the add row; at the top when that is not there */
    errorOnTop(): boolean {
      if (this.errorAt === 'add') {
        return this.idSite <= 0;
      }
      return this.errorAt === '' || !this.targets.some((t) => t.targetKey === this.errorAt);
    },
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
    /**
     * "Done" never drops what was typed: a valid address in the add row or an open change is saved
     * first, an invalid one keeps the panel open with its message next to the field.
     */
    done(): void {
      const typed = this.newUrl.trim() !== '' && this.newUrl.trim() !== 'https://';
      const target = this.targets.find((t) => t.targetKey === this.editing);
      const changed = target !== undefined && this.draftUrl.trim() !== (target.url || '');
      if ((typed && !this.validUrl(this.newUrl)) || (changed && !this.validUrl(this.draftUrl))) {
        return;
      }
      const saves: Promise<unknown>[] = [];
      // the first save that fails says where its message shows
      let failedAt: string | null = null;
      const at = (where: string) => (e: unknown) => {
        failedAt = failedAt ?? where;
        throw e;
      };
      if (changed && target) {
        saves.push(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), '')
          .catch(at(target.targetKey)));
      }
      if (typed && this.idSite > 0) {
        saves.push(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).catch(at('add')));
      }
      if (!saves.length) {
        this.close();
        return;
      }
      this.busy = true;
      this.error = '';
      Promise.all(saves).then(() => {
        this.changed = true;
        this.close();
      }).catch((e: unknown) => {
        this.showError(e, failedAt ?? '');
        this.load();
      }).finally(() => {
        this.busy = false;
      });
    },
    onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        // first out of an open change or removal, then out of the panel
        const open = this.editing || this.removing;
        if (open) {
          this.cancel(open);
        } else {
          this.close();
        }
      } else if (event.key === 'Tab') {
        this.trap(event);
      }
    },
    /**
     * @param focus after success: [target key, control] to focus once the list is back
     * @param where where a failure shows: '' at the top, 'add' under the add row, or a target key
     */
    run(request: Promise<unknown>, focus: [string, string] | null = null, where = ''): void {
      this.busy = true;
      this.error = '';
      request.then(() => {
        this.changed = true;
        this.editing = '';
        this.removing = '';
        this.focusAfter = focus;
        this.load();
      }).catch((e: unknown) => {
        this.showError(e, where);
        this.$nextTick(() => this.restoreFocus());
      }).finally(() => {
        this.busy = false;
      });
    },
    showError(e: unknown, where: string): void {
      // the API escapes its messages for XML (&amp;, &quot;): show them as text
      const box = document.createElement('textarea');
      box.innerHTML = errorText(e);
      this.error = box.value;
      this.errorAt = where;
    },
    /** the address as the row shows it, also in the switch's name */
    addressOf(target: TargetRow): string {
      return target.url || this.kindLabel(target.kind, target.targetKey);
    },
    toggle(target: TargetRow, event?: Event): void {
      const box = event && event.target instanceof HTMLInputElement ? event.target : null;
      this.run(api.updateTarget(this.idSite, target.targetKey, '', target.enabled ? '0' : '1')
        .catch((e: unknown) => {
          // not saved: the box shows the saved state again, like its On/Off
          if (box) {
            box.checked = target.enabled;
          }
          throw e;
        }), [target.targetKey, 'toggle'], target.targetKey);
    },
    startEdit(target: TargetRow): void {
      this.editing = target.targetKey;
      this.draftUrl = target.url || '';
      this.focusRow(target.targetKey, 'url');
    },
    saveUrl(target: TargetRow): void {
      this.run(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), ''),
        [target.targetKey, 'change'], target.targetKey);
    },
    remove(target: TargetRow): void {
      this.run(api.deleteTarget(this.idSite, target.targetKey), null, target.targetKey);
    },
    add(): void {
      if (!this.validUrl(this.newUrl)) {
        return;
      }
      this.run(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).then((row) => {
        this.newUrl = '';
        return row;
      }), null, 'add');
    },
    /** http or https with a host: a missing scheme gets the friendly text at once */
    validUrl(value: string): boolean {
      return /^https?:\/\/[^\s/?#]+/i.test(value.trim());
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
