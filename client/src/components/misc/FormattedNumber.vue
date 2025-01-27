<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  num: number;
}>();

const displayed = computed(() => props.num?.toLocaleString());
</script>

<template>
  {{ displayed }}
</template>
