<script setup lang="ts">
import { $registerPage } from "@/i18n";
import { postJson, redirect } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
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
const tl = useStore($registerPage);

/**
 * Checks the username. A valid username is between 2-32 characters,
 * has only English characters, hyphens and underscores.
 */
function checkUsername() {
  const schema = z
    .string()
    .min(2, tl.value.usernameMin2)
    .max(32, tl.value.usernameMax32)
    .regex(/^[\w-_][\w\d-_]+$/, tl.value.usernameNoSpecial);
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
  const schema = z.string().email(tl.value.emailInvalid);
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
    passwordError.value = tl.value.passwordTooShort;
  } else {
    passwordError.value = "";
  }
}

/**
 * Checks the confirm field. It must match the password field to be valid.
 */
function checkConfirm() {
  if (password.value != confirm.value)
    confirmError.value = tl.value.passwordsDontMatch;
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
      usernameError.value = tl.value.badUsername;
      passwordError.value = tl.value.badPassword;
      confirmError.value = tl.value.badConfirm;
      return;
    case 409:
      usernameError.value = tl.value.usernameTaken;
      emailError.value = tl.value.emailTaken;
      return;
    case 201:
      redirect("/register/success");
      return;
  }
}
</script>

<template>
  <p
    class="text-balance text-center text-xl font-semibold lg:text-[2rem] lg:leading-normal"
  >
    {{ tl.tagline }}
  </p>

  <form
    class="flex w-full max-w-[40rem] flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8"
    novalidate
  >
    <h2 class="text-2xl font-bold">{{ tl.register }}</h2>

    <div class="flex w-full flex-col gap-4">
      <ValidatedField
        :label="tl.nameField"
        :placeholder="tl.namePlaceholder"
        v-model="name"
      />
      <ValidatedField
        :label="tl.usernameField"
        :placeholder="tl.usernamePlaceholder"
        v-model="username"
        prefix="@"
        :error="usernameError"
      />
      <ValidatedField
        :label="tl.emailField"
        :placeholder="tl.emailPlaceholder"
        v-model="email"
        :error="emailError"
      />
      <ValidatedField
        :label="tl.passwordField"
        v-model="password"
        type="password"
        :error="passwordError"
      />
      <ValidatedField
        :label="tl.confirmField"
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
      {{ tl.register }}
    </button>
  </form>

  <a href="/login" class="text-sm underline underline-offset-2 lg:text-lg">{{
    tl.alreadyHasAccount
  }}</a>
</template>
