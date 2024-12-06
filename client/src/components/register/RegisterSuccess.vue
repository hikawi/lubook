<script setup lang="ts">
import IconEmailNotification from "../icons/IconEmailNotification.vue";
</script>

<template>
  <div
    class="flex h-fit max-w-screen-md flex-col items-center justify-center gap-8 rounded-xl bg-medium-navy p-6"
  >
    <IconEmailNotification class="size-16 fill-light-green" />
    <h1 class="text-2xl font-bold">Check your email!</h1>
    <p class="text-balance text-center">
      Look for an admission letter to a great community for manga enjoyers and
      artists alike.
    </p>
    <a
      href="/login"
      class="rounded-full bg-very-light-blue from-white/50 to-white/50 px-4 py-2 font-bold text-black duration-200 hover:bg-gradient-to-r"
      >Login</a
    >
  </div>
</template>

<style lang="css" scoped>
input {
  appearance: none;
  -moz-appearance: textfield;
}

input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  appearance: none;
}
</style>
