<script setup lang="ts">
import IconDelete from "@/components/icons/IconDelete.vue";
import IconEdit from "@/components/icons/IconEdit.vue";
import FormattedNumber from "@/components/misc/FormattedNumber.vue";
import { $adminTags } from "@/i18n";
import { useStore } from "@nanostores/vue";

defineProps<{
  id: number;
  name: string;
  publications: number;
}>();

defineEmits<{
  update: [id: number, name: string];
  delete: [id: number, name: string, publications: number];
}>();

const tl = useStore($adminTags);
</script>

<template>
  <div class="rounded-xl bg-darker-navy lg:bg-dark-navy">
    <div class="flex w-full flex-col gap-2 rounded-xl bg-medium-navy p-4">
      <h3 class="font-semibold">{{ name }}</h3>
      <p class="text-sm">
        <span class="font-semibold">
          <FormattedNumber :num="publications" />
        </span>
        <span class="ml-1">{{ tl.publications(publications) }}</span>
      </p>
    </div>

    <div class="flex flex-row items-center justify-center gap-2 px-4 py-2">
      <button
        :aria-label="tl.edit"
        class="fill-white hover:opacity-50"
        @click="$emit('update', id, name)"
      >
        <IconEdit class="size-6" />
      </button>
      <button
        :aria-label="tl.delete"
        class="fill-white hover:opacity-50"
        @click="$emit('delete', id, name, publications)"
      >
        <IconDelete class="size-6" />
      </button>
    </div>
  </div>
</template>
