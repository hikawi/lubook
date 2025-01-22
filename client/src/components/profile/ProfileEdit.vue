<script setup lang="ts">
import { $profileEdit } from "@/i18n";
import { fetcher, getJson, putJson, redirect } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { onMounted, ref } from "vue";
import IconChevronRight from "../icons/IconChevronRight.vue";
import IconUpload from "../icons/IconUpload.vue";
import ValidatedField from "../misc/ValidatedField.vue";
import ProfileEditLoading from "./ProfileEditLoading.vue";

const tl = useStore($profileEdit);

const profile = ref<any>(null);
const loading = ref(true);

// Form fields' models
const penName = ref("");
const username = ref("");
const biography = ref("");

// Form error fields
const usernameError = ref("");

// Submitting state to disabled the submit button and show a spinning cursor.
const submitting = ref(false);

onMounted(async () => {
  const res = await getJson("profile");
  if (res.status != 200) {
    redirect("/login");
    return;
  }

  const data = await res.json();
  profile.value = data;
  penName.value = data.name || "";
  username.value = data.username;
  biography.value = data.bio || "";

  loading.value = false;
});

/**
 * Opens the file chooser dialog by clicking the hidden file input.
 */
function openImageChooser() {
  document.getElementById("image-chooser")?.click();
}

/**
 * Uploads an avatar to the server.
 */
async function uploadAvatar(e: Event) {
  const file = (e.target as any).files[0];
  const formData = new FormData();
  formData.append("file", file);

  loading.value = true;
  const res = await fetcher({
    path: "profile/avatar",
    body: formData,
    method: "POST",
  });

  if (res.status == 201) {
    const body = await res.json();
    profile.value = {
      ...profile.value,
      avatar: `${body.location}?${Date.now()}`,
    };
  }
  loading.value = false;
}

/**
 * Sends a DELETE request to the avatar route, setting it back to the default avatar.
 */
async function deleteAvatar() {
  loading.value = true;
  const res = await fetcher({
    path: "profile/avatar",
    method: "DELETE",
  });

  if (res.status == 200) {
    redirect("/profile/edit"); // Make it reload the page.
    return;
  }
}

/**
 * Discarding changes means going back to your profile. No changes are saved.
 */
async function discardChanges() {
  redirect("/profile");
}

/**
 * Submits the changes to the server.
 */
async function submitChanges() {
  submitting.value = true;
  const res = await putJson("profile", {
    penName: penName.value,
    username: username.value,
    biography: biography.value,
  });
  submitting.value = false;

  usernameError.value = "";
  switch (res.status) {
    case 400:
      usernameError.value = tl.value.usernameInvalid;
      break;
    case 409:
      usernameError.value = tl.value.usernameConflict;
      break;
    case 200:
      redirect("/profile");
      break;
  }
}
</script>

<template>
  <ProfileEditLoading v-if="loading" />

  <div class="flex w-full flex-col items-center gap-8" v-else>
    <input
      type="file"
      id="image-chooser"
      @change="uploadAvatar"
      class="hidden appearance-none"
      accept="image/jpeg,image/png,image/webp,image/avif,image/heif,image/heic"
      data-testid="image-chooser"
    />

    <div class="flex w-full flex-col items-center gap-4">
      <button
        class="group relative size-[15rem] cursor-pointer after:absolute after:inset-0 after:size-full after:rounded-full after:bg-black/0 hover:after:bg-black/50"
        :aria-label="tl.uploadAvatar"
        @click="openImageChooser"
      >
        <img
          :src="profile.avatar"
          alt=""
          class="size-full rounded-full object-contain"
        />

        <IconUpload
          class="absolute left-1/2 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 fill-white group-hover:block"
        />
      </button>

      <button
        class="lighten rounded-lg bg-red px-4 py-2 font-semibold text-black"
        @click="deleteAvatar"
      >
        {{ tl.deleteAvatar }}
      </button>
    </div>

    <ValidatedField
      :label="tl.penName"
      v-model="penName"
      :placeholder="tl.penNamePlaceholder"
    />
    <ValidatedField
      :label="tl.username"
      v-model="username"
      :error="usernameError"
      prefix="@"
    />

    <label class="flex w-full flex-col gap-2 text-sm font-semibold">
      {{ tl.biography }}

      <textarea
        rows="3"
        class="resize-none bg-darker-navy p-4 text-base font-normal text-white outline-none placeholder:text-white/50"
        v-model="biography"
        :placeholder="tl.biographyPlaceholder"
      ></textarea>
    </label>

    <div class="flex w-full flex-col gap-2">
      <button
        class="group flex w-full items-center justify-between text-sm font-semibold hover:opacity-50"
      >
        <span>{{ tl.blockedAuthors }}</span>
        <IconChevronRight class="size-6 fill-white" />
      </button>

      <button
        class="group flex w-full items-center justify-between text-sm font-semibold hover:opacity-50"
      >
        <span>{{ tl.blockedTags }}</span>
        <IconChevronRight class="size-6 fill-white" />
      </button>
    </div>

    <div class="flex w-full flex-col gap-4">
      <button
        type="submit"
        class="lighten h-12 rounded-full bg-sky-blue text-xl font-semibold text-black disabled:cursor-progress disabled:opacity-50"
        :disabled="submitting"
        @click="submitChanges"
      >
        {{ tl.save }}
      </button>
      <button
        type="submit"
        class="lighten h-12 rounded-full bg-light-red text-xl font-semibold text-black disabled:cursor-progress disabled:opacity-50"
        :disabled="submitting"
        @click="discardChanges"
      >
        {{ tl.discard }}
      </button>
    </div>
  </div>
</template>
