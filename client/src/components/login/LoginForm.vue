<script setup lang="ts">
import { $loginPage } from "@/i18n";
import { postJson, redirect } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { onMounted, ref, useTemplateRef } from "vue";
import IconInvalid from "../icons/IconInvalid.vue";
import ValidatedField from "../misc/ValidatedField.vue";

const tl = useStore($loginPage);

const profile = ref("");
const profileError = ref("");

const password = ref("");
const passwordError = ref("");

const verify = ref("");
const verifyError = ref("");
const verifyElement = useTemplateRef("verifyRef");

const btnDisabled = ref(false);
const showVerify = ref(false);
const showGetCode = ref(false);
const getCodeText = ref("");
const getCodeDisabled = ref(false);

// Setup the document's title to be in line with the user's locale settings.
onMounted(() => {
  document.title = tl.value.logIn;
  getCodeText.value = tl.value.getCode;
});

/**
 * Handles the click event for the button.
 *
 * This reaches out to the server, checks for credentials.
 * And provide a verification form if the user isn't verified.
 */
async function logIn() {
  btnDisabled.value = true;
  profileError.value = "";
  passwordError.value = "";

  // If there is a verify code, try to verify first.
  if (showVerify.value) {
    const res = await postJson("verify", {
      profile: profile.value,
      code: verify.value,
    });
    if (res.status != 200) {
      verifyError.value = tl.value.codeInvalid;
      showGetCode.value = true;
      btnDisabled.value = false;
      return;
    }

    const json = await res.json();
    if (!json.success) {
      verifyError.value = tl.value.codeInvalid;
      showGetCode.value = true;
      btnDisabled.value = false;
      return;
    }

    showVerify.value = false;
  }

  // Checks whether they are verified first.
  const loginRes = await postJson("login", {
    profile: profile.value,
    password: password.value,
  });

  switch (loginRes.status) {
    case 404:
      profileError.value = tl.value.accountDoesNotExist;
      break;
    case 401:
      passwordError.value = tl.value.wrongPassword;
      break;
    case 403:
      profileError.value = tl.value.unverified;
      showVerify.value = true;
      getCodeText.value = tl.value.getCode;
      verifyElement.value?.focus();
      break;
    case 200:
      const data = await loginRes.json();
      if (data && data.success) {
        redirect("/");
      } else {
        profileError.value = tl.value.unknownError;
      }
      break;
  }

  btnDisabled.value = false;
}

/**
 * Function to request a new code.
 */
async function requestCode() {
  getCodeDisabled.value = true;
  verifyError.value = "";
  const res = await postJson("verify/request", { profile: profile.value });

  switch (res.status) {
    case 304:
      verifyError.value = tl.value.requestTooRecently;
      break;
    case 400:
      verifyError.value = tl.value.invalidProfile;
      break;
    case 404:
      verifyError.value = tl.value.accountDoesNotExist;
      break;
    case 201:
      getCodeText.value = tl.value.codeSent;
      verifyElement.value?.focus();
      return;
  }

  verifyElement.value?.focus();
  getCodeDisabled.value = false;
}
</script>

<template>
  <p class="text-balance text-center text-xl font-semibold lg:text-[2rem]">
    {{ tl.tagline }}
  </p>
  <div
    class="flex w-full max-w-screen-sm flex-col gap-8 rounded-xl bg-medium-navy px-6 py-8"
  >
    <h2 class="text-2xl font-bold">{{ tl.logIn }}</h2>
    <form action="" class="flex flex-col gap-4">
      <ValidatedField
        v-model="profile"
        :label="tl.profileField"
        :error="profileError"
        placeholder="luna OR luna@example.com"
      />
      <ValidatedField
        type="password"
        v-model="password"
        :label="tl.passwordField"
        :error="passwordError"
      />

      <div
        class="flex w-full flex-col gap-2 duration-200"
        :class="{ 'max-h-0': !showVerify, 'max-h-16': showVerify }"
        v-if="showVerify"
      >
        <label for="verification">{{ tl.verifyField }}</label>
        <div class="flex flex-row items-center justify-between gap-2">
          <div
            class="flex w-full flex-row items-center justify-between rounded-lg bg-darker-navy p-2 has-[:invalid]:ring-2 has-[:invalid]:ring-red"
          >
            <input
              type="text"
              id="verification"
              ref="verifyRef"
              placeholder="xxxxxx"
              required
              :aria-invalid="verifyError != null"
              aria-errormessage="verification-error"
              class="w-full bg-transparent outline-none placeholder:text-white/50"
              v-model="verify"
            />
            <IconInvalid class="size-6 fill-red" v-if="verifyError" />
          </div>

          <button
            class="flex shrink-0 items-center justify-center rounded-lg bg-very-light-blue from-white/50 to-white/50 p-2 px-4 font-semibold text-black hover:bg-gradient-to-r"
            v-if="showGetCode"
            :disabled="getCodeDisabled"
            @click.prevent="requestCode"
          >
            {{ getCodeText }}
          </button>
        </div>

        <span
          id="verification-error"
          class="text-right text-sm font-semibold text-red"
          v-if="verifyError"
        >
          {{ verifyError }}
        </span>
      </div>

      <div class="mt-4 flex flex-col gap-2">
        <a href="/login/forgot" class="underline">{{ tl.forgotPassword }}</a>
        <button
          type="submit"
          class="w-fit rounded-full bg-sky-blue from-white/50 to-white/50 px-4 py-2 font-semibold text-black duration-200 hover:bg-gradient-to-r disabled:cursor-progress disabled:opacity-50"
          :disabled="btnDisabled"
          @click.prevent="logIn"
        >
          {{ tl.logIn }}
        </button>
      </div>
    </form>
  </div>
  <a href="/register" class="text-sm underline underline-offset-2 lg:text-lg">{{
    tl.newUser
  }}</a>
</template>
