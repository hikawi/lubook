<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
</script>

<template>
  <form
    action=""
    class="flex w-full flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8"
  >
    <h2 class="text-2xl font-bold">Register</h2>

    <div class="flex w-full flex-col gap-4">
      <div class="flex w-full flex-col gap-2">
        <label for="name">Pen Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Luna"
          v-model="name"
        />
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="email">Email Address</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="luna@example.com"
          v-model="email"
        />
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          v-model="password"
        />
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="confirm">Confirm Password</label>
        <input type="password" name="confirm" id="confirm" v-model="confirm" />
      </div>
    </div>

    <button
      type="submit"
      class="w-fit rounded-full bg-sky-blue px-4 py-2 font-semibold text-black"
    >
      Register
    </button>
  </form>
</template>

<style scoped>
label {
  @apply text-sm font-semibold;
}

input {
  @apply rounded-lg bg-darker-navy p-2 placeholder:text-white/50;
}
</style>
