<script setup lang="ts">
import { $navigationBar } from "@/i18n";
import { useStore } from "@nanostores/vue";
import DesktopProfileIcon from "./DesktopProfileIcon.vue";
import SearchBar from "./SearchBar.vue";

defineProps<{
  showSearchBar?: boolean;
}>();

const tl = useStore($navigationBar);
</script>

<template>
  <div
    class="hidden w-full flex-row items-center justify-between lg:flex"
    data-testid="top-desktop-bar"
  >
    <div class="flex flex-row items-center justify-center gap-5">
      <img src="/icon.png" :alt="tl.iconAlt" class="h-16 object-contain" />
      <h1 class="font-josefin text-[2rem]">Lubook</h1>
    </div>

    <div class="flex flex-row items-center gap-8">
      <SearchBar v-if="showSearchBar" />
      <DesktopProfileIcon />
    </div>
  </div>
</template>
