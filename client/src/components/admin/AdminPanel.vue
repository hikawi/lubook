<script setup lang="ts">
import { $administrator } from "@/i18n";
import { useStore } from "@nanostores/vue";
import IconChevronLeft from "../icons/IconChevronLeft.vue";
import AdminTags from "./tags/AdminTags.vue";

const model = defineModel<number>({ required: true });
const tl = useStore($administrator);
</script>

<template>
  <div
    class="fixed inset-0 z-10 size-full bg-dark-navy p-8 pb-32 duration-200 lg:relative lg:flex lg:h-fit lg:min-h-[32rem] lg:flex-col lg:gap-4 lg:rounded-xl lg:bg-darker-navy lg:p-6"
    :class="{
      'translate-x-full lg:translate-x-0 lg:items-center lg:justify-center':
        model < 0,
      'translate-x-0 lg:items-center lg:justify-start': model >= 0,
    }"
  >
    <div
      class="hidden size-full h-fit min-h-[32rem] flex-col items-center justify-center gap-4 rounded-xl bg-darker-navy p-6 lg:flex"
      v-if="model < 0"
    >
      <img src="/onepiece01_luffy.png" alt="" class="size-[11rem]" />
      <h1 class="text-2xl font-semibold">{{ tl.noCategoryPicked }}</h1>
    </div>

    <template v-else-if="model == 3">
      <button
        class="mb-4 flex flex-row items-center justify-start gap-2 hover:underline lg:hidden"
        @click="model = -1"
      >
        <IconChevronLeft class="size-6 fill-white" />
        <h1>{{ tl.manageTags }}</h1>
      </button>
      <AdminTags v-if="model == 3" />
    </template>

    <template v-else>
      <button
        class="mb-4 flex flex-row items-center justify-start gap-2 hover:underline lg:hidden"
        @click="model = -1"
      >
        <IconChevronLeft class="size-6 fill-white" />
        <h1>{{ tl.back }}</h1>
      </button>
    </template>
  </div>
</template>
