<script setup lang="ts">
import { $popup } from "@/stores/popup";
import { useStore } from "@nanostores/vue";

const popup = useStore($popup);
</script>

<template>
  <div
    class="inset-0 z-30 size-full bg-black/50 duration-200"
    :class="{ 'hidden opacity-0': !popup, 'fixed opacity-100': popup }"
  ></div>
</template>
