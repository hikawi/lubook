<script setup lang="ts">
import { ref } from "vue";
import ValidatedField from "../misc/ValidatedField.vue";

const profile = ref("");
const profileError = ref("");

const password = ref("");
const passwordError = ref("");
</script>

<template>
  <div
    class="flex w-full max-w-screen-sm flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8"
  >
    <h2 class="text-2xl font-bold">Log In</h2>
    <form action="" class="flex flex-col gap-4">
      <ValidatedField
        v-model="profile"
        label="Username or Email Address"
        :error="profileError"
        placeholder="luna OR luna@example.com"
      />
      <ValidatedField
        v-model="password"
        label="Password"
        :error="passwordError"
      />

      <div class="mt-4 flex flex-col gap-2">
        <a href="/login/forgot" class="underline">I forgot my password</a>
        <button
          type="submit"
          class="w-fit rounded-full bg-sky-blue from-white/50 to-white/50 px-4 py-2 font-semibold text-black duration-200 hover:bg-gradient-to-r"
        >
          Login
        </button>
      </div>
    </form>
  </div>
</template>
