<script setup lang="ts">
import { $adminTags } from "@/i18n";
import { deleteJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";

const props = defineProps<{
  id: number;
  name: string;
  publications: number;
}>();

const emit = defineEmits<{
  delete: [id: number];
  cancel: [];
}>();

const tl = useStore($adminTags);

async function deleteTag() {
  const res = await deleteJson("tags", { id: props.id });
  if (res.status == 200) {
    const body = await res.json();
    emit("delete", body.id);
  } else {
    emit("delete", -1);
  }
}
</script>

<template>
  <div
    class="z-10 flex h-1/2 min-h-fit w-1/2 max-w-screen-md flex-col gap-4 rounded-xl bg-blue px-6 py-4 lg:p-6"
  >
    <h2 class="font-semibold">{{ tl.deleteTitle }}</h2>

    <p>
      {{ tl.deleteConfirm({ tag: name, publications }) }}
    </p>

    <div class="flex w-full flex-col gap-2 text-black">
      <button
        class="lighten h-12 rounded-full bg-sky-blue font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        @click="deleteTag"
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
