<script setup lang="ts">
import { $profile } from "@/i18n";
import { $blackLayer } from "@/stores/black-layer";
import { getJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { onMounted, ref } from "vue";
import IconBookmark from "../icons/IconBookmark.vue";
import IconCircleAdd from "../icons/IconCircleAdd.vue";
import IconHome from "../icons/IconHome.vue";
import IconSettings from "../icons/IconSettings.vue";

const tl = useStore($profile);

const avatarUrl = ref<string | null>();
const username = ref("");
const loading = ref(true);

onMounted(async () => {
  const res = await getJson("profile");
  switch (res.status) {
    case 401:
      break;
    case 200:
      const body = await res.json();
      avatarUrl.value = body.avatar;
      break;
  }
  loading.value = false;
});

/**
 * Toggles the state of the black layer.
 *
 * @param on The state of the black layer.
 */
function setBlackLayer(on: boolean) {
  $blackLayer.set(on);
}
</script>

<template>
  <div
    class="size-14 animate-pulse rounded-full bg-darker-navy"
    v-if="loading"
  ></div>

  <div
    class="group relative z-50 flex flex-col items-center justify-center gap-10 rounded-full bg-transparent"
    v-else-if="avatarUrl"
    @mouseenter="setBlackLayer(true)"
    @mouseleave="setBlackLayer(false)"
  >
    <a
      :href="`/profile/${username}`"
      :aria-label="tl.myProfile"
      class="relative z-50 rounded-full"
    >
      <img
        :src="avatarUrl"
        :alt="tl.myProfile"
        class="size-14 rounded-full object-contain"
      />
    </a>

    <ul
      class="absolute left-0 top-0 z-40 hidden w-full flex-col items-center gap-2 overflow-y-hidden rounded-full bg-medium-navy p-2 pt-20 duration-200 group-hover:flex"
    >
      <li>
        <a href="/" :aria-label="tl.home">
          <IconHome class="size-8 fill-white hover:fill-light-gray" />
        </a>
      </li>

      <li>
        <a href="/publish" :aria-label="tl.publish">
          <IconCircleAdd class="size-8 fill-white hover:fill-light-gray" />
        </a>
      </li>

      <li>
        <a href="/library" :aria-label="tl.library">
          <IconBookmark class="size-8 fill-white hover:fill-light-gray" />
        </a>
      </li>

      <li>
        <a href="/settings" :aria-label="tl.settings">
          <IconSettings class="size-8 fill-white hover:fill-light-gray" />
        </a>
      </li>
    </ul>
  </div>

  <a
    href="/login"
    class="lighten flex h-14 items-center justify-center rounded-xl bg-light-blue px-4 text-xl font-semibold text-white"
    v-else
  >
    Login
  </a>
</template>
