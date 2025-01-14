<script setup lang="ts">
import { $navigationBar } from "@/i18n";
import { useStore } from "@nanostores/vue";
import IconSearch from "../icons/IconSearch.vue";

const tl = useStore($navigationBar);
</script>

<template>
  <div
    class="flex h-8 w-full flex-row items-center rounded-full bg-medium-navy has-[:focus]:ring-2 has-[:focus]:ring-very-light-blue lg:h-14 lg:w-[23rem]"
  >
    <IconSearch class="size-4 lg:size-5" />
    <input
      type="text"
      class="w-full outline-none placeholder:text-white/50"
      :placeholder="tl.searchPlaceholder"
    />
  </div>
</template>
