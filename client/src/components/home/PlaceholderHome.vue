<script setup lang="ts">
import { getJson } from "@/utils/fetcher";
import { onMounted, ref } from "vue";

const loading = ref(true);
const profileData = ref<any>(null);

onMounted(() => {
  getJson("profile").then(async (res) => {
    loading.value = false;
    if (res.status != 200) {
      return;
    }

    const json = await res.json();
    profileData.value = json;
  });
});
</script>

<template>
  <p v-if="loading">Loading</p>
  <p v-else-if="profileData == null">Not logged in</p>
  <p v-else>
    Hello <strong>@{{ profileData.username }}</strong
    >! You registered with <strong>{{ profileData.email }}</strong> and
    successfully verified!
  </p>
</template>
