<script setup lang="ts">
import { getJson } from "@/utils/fetcher";
import { onMounted, ref } from "vue";

const avatarUrl = ref<string | null>();
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
</script>

<template>
  <div
    class="size-14 animate-pulse rounded-full bg-darker-navy"
    v-if="loading"
  ></div>

  <div class="group hover:p-2" v-else-if="avatarUrl">
    <img :src="avatarUrl" alt="" class="size-14 rounded-full object-contain" />
  </div>

  <a
    href="/login"
    class="lighten flex h-14 items-center justify-center rounded-xl bg-light-blue px-4 text-xl font-semibold text-white"
    v-else
  >
    Login
  </a>
</template>
