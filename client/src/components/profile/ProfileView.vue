<script setup lang="ts">
import { $profile } from "@/i18n";
import { getJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { onMounted, ref } from "vue";
import FormattedNumber from "../misc/FormattedNumber.vue";
import ProfileLoading from "./ProfileLoading.vue";
import ProfileNotFound from "./ProfileNotFound.vue";
import IconVerified from "../icons/IconVerified.vue";
import IconShieldPerson from "../icons/IconShieldPerson.vue";

const props = defineProps<{
  username?: string;
}>();

const tl = useStore($profile);
const loading = ref(true);
const data = ref<
  | {
      username: string;
      name?: string;
      avatar?: string;
      bio?: string;
      role: string;
      followers: number;
      followings: number;
      publications: number;
      self: boolean;
    }
  | undefined
>();

onMounted(async () => {
  const res = await getJson(
    props.username
      ? `profile?username=${encodeURIComponent(props.username.replace("@", ""))}`
      : `profile`,
  );

  switch (res.status) {
    case 404:
    case 400:
    case 401:
      break;
    case 200:
      const body = await res.json();
      data.value = body;
      break;
  }
  loading.value = false;
});
</script>

<template>
  <ProfileLoading v-if="loading" />

  <div class="mt-16 flex flex-col gap-8" v-else-if="data">
    <div
      class="flex w-full flex-row items-stretch justify-between gap-4 lg:flex-row-reverse lg:justify-end lg:gap-12"
    >
      <div class="flex flex-col justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-3xl">{{ data.name || data.username }}</h2>
          <span class="font-semibold text-light-gray"
            >@{{ data.username }}</span
          >

          <span
            class="flex flex-row items-center gap-2 text-sm font-bold text-light-green"
            v-if="data.role == 'moderator'"
          >
            <IconVerified class="size-6 fill-light-green" />
            {{ tl.moderator }}
          </span>

          <span
            class="flex flex-row items-center gap-2 text-sm font-bold text-light-red"
            v-else-if="data.role == 'admin'"
          >
            <IconShieldPerson class="size-6 fill-light-red" />
            {{ tl.administrator }}
          </span>
        </div>

        <div class="flex w-full break-words" v-if="data.bio">
          {{ data.bio }}
        </div>
        <div class="flex w-full break-words italic opacity-50" v-else>
          {{ tl.noBio }}
        </div>

        <ul class="flex list-none flex-col gap-1 lg:flex-row lg:gap-8">
          <li>
            <span class="font-semibold">
              <FormattedNumber :num="data.followers" />
            </span>
            {{ tl.follower(data.followers) }}
          </li>
          <li>
            <span class="font-semibold">
              <FormattedNumber :num="data.followings" />
            </span>
            {{ tl.following(data.followings) }}
          </li>
          <li>
            <span class="font-semibold">
              <FormattedNumber :num="data.publications" />
            </span>
            {{ tl.publications(data.publications) }}
          </li>
        </ul>
      </div>

      <div class="flex flex-col items-start gap-4">
        <img
          :src="data.avatar"
          :alt="data.name || data.username"
          class="size-[7.5rem] shrink-0 rounded-full bg-light-blue object-contain shadow-lg lg:size-[10.25rem]"
          :class="{
            'ring-4 ring-light-red': data.role == 'admin',
            'ring-4 ring-light-green': data.role == 'moderator',
          }"
        />

        <div class="flex w-full flex-col gap-2" v-if="!data.self">
          <button
            class="w-full rounded-full border-2 border-very-light-blue bg-transparent px-8 py-2 font-semibold duration-200 hover:bg-very-light-blue hover:text-black"
          >
            {{ tl.follow }}
          </button>
          <button
            class="w-full rounded-full border-2 border-light-red bg-transparent px-8 py-2 font-semibold duration-200 hover:bg-light-red hover:text-black"
          >
            {{ tl.block }}
          </button>
        </div>
        <a
          href="/profile/edit"
          class="flex w-full items-center justify-center rounded-full border-2 border-very-light-blue bg-transparent px-8 py-2 font-semibold duration-200 hover:bg-very-light-blue hover:text-black"
          v-else
        >
          {{ tl.edit }}
        </a>
      </div>
    </div>
  </div>

  <ProfileNotFound v-else />
</template>
