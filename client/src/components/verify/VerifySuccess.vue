<script setup lang="ts">
import { $verifyPage } from "@/i18n";
import { useStore } from "@nanostores/vue";

const tl = useStore($verifyPage);
</script>

<template>
  <div class="flex w-full items-center justify-center">
    <div
      class="flex max-w-screen-sm flex-col items-center gap-6 rounded-xl bg-medium-navy p-6"
    >
      <img src="/book_character_smile.png" alt="" class="w-32 object-contain" />
      <h1 class="text-2xl font-semibold">{{ tl.verifySuccess }}</h1>
      <p class="text-balance text-center">{{ tl.verifySuccessMessage }}</p>
      <a
        href="/login"
        class="lighten mt-4 rounded-lg bg-very-light-blue px-4 py-2 font-semibold text-black"
      >
        {{ tl.logIn }}
      </a>
    </div>
  </div>
</template>
