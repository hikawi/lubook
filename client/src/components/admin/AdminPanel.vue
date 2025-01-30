<script setup lang="ts">
import { $administrator } from "@/i18n";
import { useStore } from "@nanostores/vue";

const model = defineModel<number>({ required: true });
const tl = useStore($administrator);
</script>

<template>
  <div
    class="fixed inset-0 z-10 size-full bg-dark-navy p-8 duration-200 lg:hidden"
    :class="{
      'invisible translate-x-full': model < 0,
      'visible translate-x-0': model >= 0,
    }"
  >
    <button
      class="font-semibold underline hover:text-very-light-blue"
      @click="model = -1"
    >
      {{ tl.back }}
    </button>

    {{ model }}
  </div>

  <div
    class="hidden size-full h-fit min-h-[32rem] flex-col items-center justify-center gap-4 bg-darker-navy p-6 lg:flex"
    v-if="model < 0"
  >
    <img src="/onepiece01_luffy.png" alt="" class="size-[11rem]" />
    <h1 class="text-2xl font-semibold">{{ tl.noCategoryPicked }}</h1>
  </div>

  <div
    class="hidden size-full h-fit min-h-[32rem] bg-darker-navy p-6 lg:flex"
    v-else
  >
    {{ model }}
  </div>
</template>
