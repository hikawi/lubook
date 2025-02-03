<script setup lang="ts">
import ValidatedField from "@/components/misc/ValidatedField.vue";
import { $adminTags } from "@/i18n";
import { putJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { ref } from "vue";

const props = defineProps<{
  id: number;
  name: string;
}>();

const emit = defineEmits<{
  change: [id: number, name: string];
  cancel: [];
}>();

const tl = useStore($adminTags);

const tagValue = ref(props.name);
const tagError = ref("");

// Sends a PUT request to edit a tag.
async function editTag() {
  tagError.value = "";
  const res = await putJson("tags", { id: props.id, name: tagValue.value });
  switch (res.status) {
    case 409:
      tagError.value = tl.value.tagExists;
      break;
    case 200:
      const body = await res.json();
      emit("change", body.tag.id, body.tag.name);
      break;
  }
}
</script>

<template>
  <div
    class="z-10 flex h-1/2 min-h-fit w-1/2 max-w-screen-md flex-col gap-4 rounded-xl bg-blue px-6 py-4 lg:p-6"
  >
    <h2 class="font-semibold">{{ tl.editTitle }}</h2>

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
        @click="editTag"
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
