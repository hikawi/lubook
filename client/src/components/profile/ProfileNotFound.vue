<script setup lang="ts">
import { $profile } from "@/i18n";
import { useStore } from "@nanostores/vue";

const tl = useStore($profile);
</script>

<template>
  <div class="my-20 flex w-full flex-col items-center justify-center gap-8">
    <img
      src="/ojisan3_question.png"
      alt="ojisan3_question"
      class="size-32 lg:size-48"
    />

    <div class="flex flex-col gap-4 text-center">
      <h1 class="text-3xl font-bold">{{ tl.notFound }}</h1>
      <p class="text-lg">{{ tl.notFoundDesc }}</p>
    </div>
  </div>
</template>
