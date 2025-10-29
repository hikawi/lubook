<script setup lang="ts">
import { $administrator } from "@/i18n";
import { useStore } from "@nanostores/vue";
import { onMounted, ref } from "vue";
import IconCategory from "../icons/IconCategory.vue";
import IconChevronRight from "../icons/IconChevronRight.vue";
import IconFolderManaged from "../icons/IconFolderManaged.vue";
import IconManageAccount from "../icons/IconManageAccount.vue";
import IconReport from "../icons/IconReport.vue";
import AdminPanel from "./AdminPanel.vue";

const selection = ref(-1);
const mounted = ref(false);
const tl = useStore($administrator);

onMounted(() => (mounted.value = true));
</script>

<template>
  <div
    class="-mx-8 my-12 flex w-auto flex-row items-start lg:mx-0 lg:my-20 lg:w-full"
    v-if="!mounted"
  >
    <div
      class="flex w-full flex-col divide-y divide-blue lg:w-fit lg:min-w-fit lg:shrink-0 lg:gap-2 lg:divide-y-0"
    >
      <div class="h-12 w-full animate-pulse bg-light-gray"></div>
      <div class="h-12 w-full animate-pulse bg-light-gray"></div>
      <div class="h-12 w-full animate-pulse bg-light-gray"></div>
      <div class="h-12 w-full animate-pulse bg-light-gray"></div>
    </div>

    <div
      class="hidden h-[32rem] animate-pulse items-center justify-center bg-darker-navy lg:flex"
    ></div>
  </div>

  <div
    class="-mx-8 my-12 flex w-auto flex-row items-start lg:mx-0 lg:my-20 lg:w-full"
    v-else
  >
    <div
      class="flex w-full flex-col divide-y divide-blue lg:w-fit lg:min-w-fit lg:shrink-0 lg:gap-2 lg:divide-y-0"
    >
      <button
        class="flex flex-row items-center justify-between gap-2 px-4 py-5 font-semibold hover:bg-white/25 lg:px-4 lg:py-2 lg:hover:bg-transparent"
        :class="{
          'lg:opacity-50 lg:duration-200 lg:hover:opacity-100': selection != 0,
          'lg:opacity-100': selection == 0,
        }"
        @click="selection = 0"
      >
        <div class="flex flex-row items-center gap-2">
          <IconManageAccount class="size-6 fill-white" />
          {{ tl.manageAccounts }}
        </div>

        <IconChevronRight class="size-6 fill-white lg:hidden" />
      </button>

      <button
        class="flex flex-row items-center justify-between gap-2 px-4 py-5 font-semibold hover:bg-white/25 lg:px-4 lg:py-2 lg:hover:bg-transparent"
        :class="{
          'lg:opacity-50 lg:duration-200 lg:hover:opacity-100': selection != 1,
          'lg:opacity-100': selection == 1,
        }"
        @click="selection = 1"
      >
        <div class="flex flex-row items-center gap-2">
          <IconFolderManaged class="size-6 fill-white" />
          {{ tl.managePublications }}
        </div>

        <IconChevronRight class="size-6 fill-white lg:hidden" />
      </button>

      <button
        class="flex flex-row items-center justify-between gap-2 px-4 py-5 font-semibold hover:bg-white/25 lg:px-4 lg:py-2 lg:hover:bg-transparent"
        :class="{
          'lg:opacity-50 lg:duration-200 lg:hover:opacity-100': selection != 2,
          'lg:opacity-100': selection == 2,
        }"
        @click="selection = 2"
      >
        <div class="flex flex-row items-center gap-2">
          <IconReport class="size-6 fill-white" />
          {{ tl.manageReports }}
        </div>

        <IconChevronRight class="size-6 fill-white lg:hidden" />
      </button>

      <button
        class="flex flex-row items-center justify-between gap-2 px-4 py-5 font-semibold hover:bg-white/25 lg:px-4 lg:py-2 lg:hover:bg-transparent"
        :class="{
          'lg:opacity-50 lg:duration-200 lg:hover:opacity-100': selection != 3,
          'lg:opacity-100': selection == 3,
        }"
        @click="selection = 3"
      >
        <div class="flex flex-row items-center gap-2">
          <IconCategory class="size-6 fill-white" />
          {{ tl.manageTags }}
        </div>

        <IconChevronRight class="size-6 fill-white lg:hidden" />
      </button>
    </div>

    <AdminPanel v-model="selection" />
  </div>
</template>
