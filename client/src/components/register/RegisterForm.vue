<script setup lang="ts">
import { postJson } from "@/utils/fetcher";
import { z } from "astro/zod";
import { ref } from "vue";
import ValidatedField from "../misc/ValidatedField.vue";

const name = ref("");
const username = ref("");
const password = ref("");
const confirm = ref("");

const usernameError = ref("");
const passwordError = ref("");
const confirmError = ref("");

const processing = ref(false);

/**
 * Checks the username. A valid username is between 2-32 characters,
 * has only English characters, hyphens and underscores.
 */
function checkUsername() {
  const schema = z
    .string()
    .min(2, "Username must be from 2 characters")
    .max(32, "Username must be below 32 characters")
    .regex(/^[\w\d-_]+$/, "Username can't contain special characters");
  const result = schema.safeParse(username.value);

  if (result.success) {
    usernameError.value = "";
    return;
  }

  usernameError.value = result.error.errors[0].message;
}

/**
 * Checks the password field.
 */
function checkPassword() {
  if (password.value.length <= 1) {
    passwordError.value = "Password too short";
  } else {
    passwordError.value = "";
  }
}

/**
 * Checks the confirm field. It must match the password field to be valid.
 */
function checkConfirm() {
  if (password.value != confirm.value) confirmError.value = "Passwords don't match";
  else confirmError.value = "";
}

/**
 * Checks the credentials and sends to the server.
 */
function register() {
  checkUsername();
  checkPassword();
  checkConfirm();
  if (usernameError.value || confirmError.value || passwordError.value) return;

  processing.value = true;
  postJson("register", { name: name.value, username: username.value, password: password.value }).then((res) => {
    processing.value = false;
    switch (res.status) {
      case 400:
        usernameError.value = "Username might be invalid?";
        passwordError.value = "Password might be invalid?";
        confirmError.value = "Confirm might be invalid?";
        return;
      case 409:
        usernameError.value = "Username already taken";
        return;
      case 201:
        window.location.href = "/login";
        return;
    }
  });
}
</script>

<template>
  <form class="flex w-full max-w-[40rem] flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8" novalidate>
    <h2 class="text-2xl font-bold">Register</h2>

    <div class="flex w-full flex-col gap-4">
      <ValidatedField label="Pen Name" placeholder="Luna (optional)" v-model="name" />
      <ValidatedField label="Username" placeholder="luna" v-model="username" prefix="@" :error="usernameError" />
      <ValidatedField label="Password" v-model="password" type="password" :error="passwordError" />
      <ValidatedField label="Confirm Password" v-model="confirm" type="password" :error="confirmError" />
    </div>

    <button
      type="submit"
      :disabled="processing"
      @click.prevent="register"
      class="w-fit rounded-full bg-sky-blue px-4 py-2 font-semibold text-black disabled:cursor-progress disabled:opacity-50"
    >
      Register
    </button>
  </form>
</template>

<style scoped>
label {
  @apply text-sm font-semibold lg:text-lg;
}

input {
  @apply rounded-lg bg-darker-navy p-2 placeholder:text-white/50;
}
</style>
