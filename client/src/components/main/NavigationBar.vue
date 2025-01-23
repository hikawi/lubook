<script setup lang="ts">
import { $navigationBar } from "@/i18n";
import { getJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { onMounted, ref } from "vue";
import IconBookmark from "../icons/IconBookmark.vue";
import IconCircleAdd from "../icons/IconCircleAdd.vue";
import IconHome from "../icons/IconHome.vue";
import IconNotifications from "../icons/IconNotifications.vue";
import DesktopProfileIcon from "./DesktopProfileIcon.vue";
import SearchBar from "./SearchBar.vue";

defineProps<{
  showSearchBar?: boolean;
}>();

const tl = useStore($navigationBar);

const loading = ref(true);
const profile = ref<any>(null);

onMounted(async () => {
  const res = await getJson("profile");
  if (res.status != 200) {
    loading.value = false;
    return;
  }

  const body = await res.json();
  profile.value = body;
  loading.value = false;
});
</script>

<template>
  <div
    class="hidden w-full flex-row items-center justify-between lg:flex"
    data-testid="desktop-nav-bar"
  >
    <div class="flex flex-row items-center justify-center gap-5">
      <img src="/icon.png" :alt="tl.iconAlt" class="h-16 object-contain" />
      <h1 class="font-josefin text-[2rem]">Lubook</h1>
    </div>

    <div class="flex flex-row items-center gap-8">
      <SearchBar v-if="showSearchBar" />
      <DesktopProfileIcon :loading :profile />
    </div>
  </div>

  <div
    class="fixed bottom-0 left-0 z-20 flex w-full flex-row items-center justify-between gap-6 bg-darker-navy px-6 py-2 lg:hidden"
    data-testid="mobile-nav-bar"
    v-if="profile"
  >
    <a href="/">
      <IconHome class="size-8 fill-white hover:fill-light-gray" />
    </a>

    <a href="/publish">
      <IconCircleAdd class="size-8 fill-white hover:fill-light-gray" />
    </a>

    <a
      href="/profile"
      aria-label="Profile"
      class="relative flex size-12 -translate-y-4 scale-[1.5] items-center justify-center rounded-full bg-darker-navy p-2 duration-200 hover:-translate-y-8"
    >
      <img :src="profile.avatar" alt="" class="rounded-full object-contain" />
    </a>

    <a href="/library">
      <IconBookmark class="size-8 fill-white hover:fill-light-gray" />
    </a>

    <a href="/notifications">
      <IconNotifications class="size-8 fill-white hover:fill-light-gray" />
    </a>
  </div>
</template>
