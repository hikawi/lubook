<script setup lang="ts">
import { $blackLayer } from "@/stores/black-layer";
import { useStore } from "@nanostores/vue";

const blackLayer = useStore($blackLayer);
</script>

<template>
  <div
    class="fixed inset-0 z-30 size-full bg-black/50 duration-200"
    :class="{
      'invisible opacity-0': !blackLayer,
      'visible opacity-100': blackLayer,
    }"
    data-testid="black-layer"
  ></div>
</template>
