<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->
<template>
  <svg
    class="fwum-sparkline"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    role="img"
    :aria-label="label"
    preserveAspectRatio="none"
  >
    <title>{{ label }}</title>
    <path
      v-if="path"
      :d="path"
      class="fwum-sparkline__line"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

/** A small line of the values; null values leave a gap (nothing measured there). */
export default defineComponent({
  props: {
    values: { type: Array as PropType<(number | null)[]>, required: true },
    label: { type: String, required: true },
    width: { type: Number, default: 240 },
    height: { type: Number, default: 36 },
  },
  computed: {
    path(): string {
      const numbers = this.values.filter((v): v is number => v !== null);
      if (numbers.length < 2) {
        return '';
      }
      const max = Math.max(...numbers, 1);
      const step = this.width / Math.max(1, this.values.length - 1);
      let d = '';
      let pen = false;
      this.values.forEach((value, i) => {
        if (value === null) {
          pen = false;
          return;
        }
        const x = (i * step).toFixed(1);
        const y = (this.height - 2 - (value / max) * (this.height - 4)).toFixed(1);
        d += `${pen ? 'L' : 'M'}${x} ${y} `;
        pen = true;
      });
      return d.trim();
    },
  },
});
</script>
