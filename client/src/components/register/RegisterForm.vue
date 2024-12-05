<script setup lang="ts">
import { authenticate, postJson, redirect } from "@/utils/fetcher";
import { z } from "astro/zod";
import { ref } from "vue";
import ValidatedField from "../misc/ValidatedField.vue";

const name = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");

const usernameError = ref("");
const emailError = ref("");
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
 * Checks the email field.
 */
function checkEmail() {
  const schema = z.string().email("Must be a valid email address");
  const result = schema.safeParse(email.value);
  if (result.success) {
    emailError.value = "";
    return;
  }
  emailError.value = result.error.errors[0].message;
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
  if (password.value != confirm.value)
    confirmError.value = "Passwords don't match";
  else confirmError.value = "";
}

/**
 * Checks the credentials and sends to the server.
 */
async function register() {
  checkUsername();
  checkPassword();
  checkConfirm();
  checkEmail();

  if (
    [usernameError, confirmError, passwordError, emailError]
      .map((it) => it.value)
      .some(Boolean)
  )
    return;

  const [vName, vUsername, vEmail, vPassword] = [
    name.value,
    username.value,
    email.value,
    password.value,
  ];

  processing.value = true;
  const res = await postJson("register", {
    name: vName,
    username: vUsername,
    email: vEmail,
    password: vPassword,
  });

  processing.value = false;
  switch (res.status) {
    case 400:
      usernameError.value = "Username might be invalid?";
      passwordError.value = "Password might be invalid?";
      confirmError.value = "Confirm might be invalid?";
      return;
    case 409:
      usernameError.value = "Username might be taken";
      emailError.value = "Email might be taken";
      return;
    case 201:
      await authenticate(vUsername, vPassword);
      redirect("/");
      return;
  }
}
</script>

<template>
  <form
    class="flex w-full max-w-[40rem] flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8"
    novalidate
  >
    <h2 class="text-2xl font-bold">Register</h2>

    <div class="flex w-full flex-col gap-4">
      <ValidatedField
        label="Pen Name"
        placeholder="Luna (optional)"
        v-model="name"
      />
      <ValidatedField
        label="Username"
        placeholder="luna"
        v-model="username"
        prefix="@"
        :error="usernameError"
      />
      <ValidatedField
        label="Email"
        placeholder="luna@example.com"
        v-model="email"
        :error="emailError"
      />
      <ValidatedField
        label="Password"
        v-model="password"
        type="password"
        :error="passwordError"
      />
      <ValidatedField
        label="Confirm Password"
        v-model="confirm"
        type="password"
        :error="confirmError"
      />
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
