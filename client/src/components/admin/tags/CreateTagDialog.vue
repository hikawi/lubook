<script setup lang="ts">
import ValidatedField from "@/components/misc/ValidatedField.vue";
import { $adminTags } from "@/i18n";
import { postJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { ref } from "vue";

const tl = useStore($adminTags);

const emits = defineEmits<{
  cancel: [];
  confirm: [id: number, name: string];
}>();

const tagValue = ref("");
const tagError = ref("");

// Sends a POST request to create a tag.
async function createTag() {
  const res = await postJson("tags", { name: tagValue.value });
  tagError.value = "";
  switch (res.status) {
    case 409:
      tagError.value = tl.value.tagExists;
      break;
    case 201:
      const body = await res.json();
      emits("confirm", body.id, body.name);
      break;
  }
}
</script>

<template>
  <div
    class="z-10 flex h-1/2 min-h-fit w-1/2 max-w-screen-md flex-col gap-4 rounded-xl bg-blue px-6 py-4 lg:p-6"
  >
    <h2 class="font-semibold">{{ tl.createTitle }}</h2>

    <ValidatedField
      :label="tl.tag"
      :placeholder="tl.placeholder"
      :error="tagError"
      autofocus
      v-model="tagValue"
    />

    <div class="flex w-full flex-col gap-2 text-black">
      <button
        class="lighten h-12 rounded-full bg-sky-blue font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!tagValue"
        @click="createTag"
      >
        {{ tl.confirm }}
      </button>
      <button
        class="lighten h-12 rounded-full bg-light-red font-semibold"
        @click="$emit('cancel')"
      >
        {{ tl.cancel }}
      </button>
    </div>
  </div>
</template>
