<script setup lang="ts">
import { $popup } from "@/stores/popup";
import { useStore } from "@nanostores/vue";

const popupElement = useStore($popup);
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed z-40 flex items-center justify-center bg-transparent p-6 duration-200"
      v-if="popupElement"
    >
      <div class="rounded-xl bg-light-blue p-6 shadow-lg">
        {{ popupElement }}
      </div>
    </div>
  </Teleport>
</template>
