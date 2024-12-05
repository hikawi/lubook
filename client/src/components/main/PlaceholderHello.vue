<script setup lang="ts">
import { getJson } from "@/utils/fetcher";
import { onMounted, ref } from "vue";

type MyProfile = {
  username: string;
  email: string;
  name: string;
  bio: string;
  verified: boolean;
  followers: number;
  followings: number;
};

const data = ref<MyProfile | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await getJson("profile/");
    loading.value = false;
    if (res.status == 200) data.value = (await res.json()) as MyProfile;
  } catch (e) {
    console.log(e);
    loading.value = false;
  }
});
</script>

<template>
  <h1 class="text-2xl font-bold" v-if="loading">Loading...</h1>
  <h1 class="font-bold text-red" v-else-if="data == null">
    Uh oh, an error happened. Are you logged in?
  </h1>
  <div v-else>
    <p>Yes sir!</p>
    <p>Hello @{{ data.username }}</p>
    <p>You registered with {{ data.email }}!</p>
  </div>
</template>
