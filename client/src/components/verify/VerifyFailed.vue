<script setup lang="ts">
import { $verifyPage } from "@/i18n";
import { postJson, redirect } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { ref, useTemplateRef, watch } from "vue";
import IconInvalid from "../icons/IconInvalid.vue";

const tl = useStore($verifyPage);
const disabled = ref(false);

const showProfile = ref(false);
const profile = ref("");
const profileError = ref("");
const profileElement = useTemplateRef<HTMLInputElement>("profileRef");

// Hook up to the profile error.
watch(profileError, (error) => {
  profileElement.value?.setCustomValidity(error);
});

async function requestVerification() {
  disabled.value = true;
  if (!showProfile.value) {
    showProfile.value = true;
    disabled.value = false;
    return;
  }

  const res = await postJson("verify/request", { profile: profile.value });
  switch (res.status) {
    case 400:
      profileError.value = tl.value.profileInvalid;
      break;
    case 404:
      profileError.value = tl.value.profileNotExist;
      break;
    case 304:
      profileError.value = tl.value.requestTooRecent;
      break;
    case 201:
      redirect("/register/success");
      return;
  }

  profileElement.value?.focus();
  disabled.value = false;
}
</script>

<template>
  <div class="flex w-full items-center justify-center">
    <div
      class="flex max-w-screen-sm flex-col items-center gap-6 rounded-xl bg-medium-navy p-6"
    >
      <img src="/book_character_cry.png" alt="" class="w-32 object-contain" />
      <h1 class="text-2xl font-semibold text-light-red">
        {{ tl.verifyFailed }}
      </h1>
      <p class="text-balance text-center">{{ tl.verifyFailedMessage }}</p>

      <div
        class="flex w-full flex-row items-end justify-center gap-2 duration-200"
        :class="{
          'invisible m-0 max-h-0': !showProfile,
          'visible mt-4 max-h-32': showProfile,
        }"
      >
        <label class="flex w-full flex-col gap-2 text-sm font-semibold">
          {{ tl.profileField }}
          <div
            class="flex flex-row items-center gap-2 rounded-lg bg-darker-navy p-2 text-base font-normal placeholder:text-white/50 has-[:invalid]:ring-2 has-[:invalid]:ring-red"
          >
            <input
              type="text"
              class="w-full border-2 border-transparent bg-transparent outline-none"
              ref="profileRef"
              v-model="profile"
              :aria-invalid="profileError != ''"
              :placeholder="tl.profilePlaceholder"
              aria-errormessage="profile-error"
            />

            <IconInvalid class="size-6 fill-light-red" v-if="profileError" />
          </div>

          <p
            class="text-right text-base font-semibold text-light-red"
            id="profile-error"
          >
            {{ profileError }}
          </p>
        </label>
      </div>

      <button
        class="lighten min-w-fit shrink-0 rounded-lg bg-light-red px-4 py-2 font-semibold text-black disabled:cursor-progress disabled:opacity-50"
        @click.prevent="requestVerification"
        :disabled
      >
        {{ tl.requestVerify }}
      </button>
    </div>
  </div>
</template>
