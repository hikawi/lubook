<script setup lang="ts">
import { $administrator } from "@/i18n";
import { useStore } from "@nanostores/vue";

const tl = useStore($administrator);
</script>

<template>
  <div
    class="-mx-8 -mt-8 flex h-14 w-auto items-center justify-center bg-light-red py-4 text-xl font-semibold text-black lg:m-0 lg:my-12"
  >
    {{ tl.banner }}
  </div>
</template>
