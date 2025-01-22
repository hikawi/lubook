<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import IconInvalid from "../icons/IconInvalid.vue";

const props = defineProps<{
  label: string;
  error?: string;
  placeholder?: string;
  type?: string;
  prefix?: string;
  required?: boolean;
}>();

const model = defineModel();
const name = computed(() => props.label.toLowerCase().replaceAll(/\s+/g, "-"));
const element = useTemplateRef<HTMLInputElement>("element");

watchEffect(() => {
  element.value?.setCustomValidity(props.error || "");
});
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <label :for="name" class="text-sm font-semibold">{{ label }}</label>

    <div
      class="flex flex-row items-center justify-between rounded-lg bg-darker-navy p-2 has-[:invalid]:ring-2 has-[:invalid]:ring-red"
    >
      <div
        class="-my-2 -ml-2 mr-2 rounded-lg bg-medium-navy px-3 py-2"
        v-if="prefix"
      >
        {{ prefix }}
      </div>
      <input
        :type="type || 'text'"
        :id="name"
        ref="element"
        :placeholder
        :required
        :aria-invalid="error != null"
        :aria-errormessage="`${name}-error`"
        class="w-full bg-transparent outline-none placeholder:text-white/50"
        v-model="model"
      />
      <IconInvalid class="size-6 fill-red" v-if="error" />
    </div>

    <span
      :id="`${name}-error`"
      class="text-right text-sm font-semibold text-red"
      v-if="error"
      >{{ error }}</span
    >
  </div>
</template>
