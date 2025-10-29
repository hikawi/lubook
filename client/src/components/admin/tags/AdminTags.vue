<script setup lang="ts">
import IconAdd from "@/components/icons/IconAdd.vue";
import IconSearch from "@/components/icons/IconSearch.vue";
import { $adminTags } from "@/i18n";
import { getJson } from "@/utils/fetcher";
import { useStore } from "@nanostores/vue";
import { computed, onMounted, ref, watch } from "vue";
import CreateTagDialog from "./CreateTagDialog.vue";
import DeleteTagConfirm from "./DeleteTagConfirm.vue";
import EditTagDialog from "./EditTagDialog.vue";
import TagCard from "./TagCard.vue";

const PER_PAGE = 20;

const tl = useStore($adminTags);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(-1);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showMore = computed(
  () => totalPages.value > 0 && page.value < totalPages.value,
);

const editingId = ref(-1);
const editingName = ref("");

const deletingId = ref(-1);
const deletingName = ref("");
const deletingPublications = ref(-1);

const search = ref("");
const tags = ref<Array<{ id: number; name: string; publications: number }>>([]);
const shownTags = computed(() =>
  tags.value
    .filter((node) =>
      node.name.toLowerCase().includes(search.value.toLowerCase()),
    )
    .toSorted((a, b) => a.name.localeCompare(b.name)),
);

// Hooks, on mounted, load the first page.
onMounted(loadData);

// For every page change, load data but append instead.
watch(page, () => loadData(true));

// Load available tags on the server.
async function loadData(append: boolean = false) {
  loading.value = true;

  const res = await getJson(`tags?page=${page.value}&per_page=${PER_PAGE}`);
  const data = await res.json();
  totalPages.value = data.total_pages;

  if (append) tags.value = [...tags.value, ...data.results];
  else tags.value = data.results;

  loading.value = false;
}

// Enable the editing dialog
async function openEditDialog(id: number, name: string) {
  editingId.value = id;
  editingName.value = name;
  showEditDialog.value = true;
}

// Applies the change to the list when creating. This should only append without reloading the list.
async function onTagCreated(id: number, name: string) {
  showCreateDialog.value = false;
  tags.value = [...tags.value, { id, name, publications: 0 }];
}

// Applies the change to the proper tag
async function onTagChanged(id: number, name: string) {
  showEditDialog.value = false;
  tags.value = tags.value.map((node) =>
    node.id != id ? node : { ...node, id, name },
  );
}

// Opens the delete confirmation panel for a tag.
async function onTagPrepareDelete(
  id: number,
  name: string,
  publications: number,
) {
  deletingId.value = id;
  deletingName.value = name;
  deletingPublications.value = publications;
  showDeleteDialog.value = true;
}

// Removes the tag cleanly from the list without refreshing
async function ontagDeleted(id: number) {
  showDeleteDialog.value = false;
  tags.value = tags.value.filter((node) => node.id != id);
}
</script>

<template>
  <div class="flex h-full w-full flex-col gap-5" v-if="loading">
    <div class="h-8 w-full animate-pulse rounded-full bg-light-gray"></div>
    <div
      class="h-8 w-16 animate-pulse self-end rounded-full bg-light-gray"
    ></div>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        class="h-32 animate-pulse rounded-xl bg-light-gray"
        v-for="i in 12"
      ></div>
    </div>
  </div>

  <div class="relative flex h-full w-full scroll-m-0 flex-col gap-5" v-else>
    <div
      class="sticky flex flex-row items-center gap-4 rounded-full bg-medium-navy px-4 py-2 text-xs ring-very-light-blue has-[:focus]:ring-2"
    >
      <IconSearch class="size-4 fill-white" />
      <input
        type="text"
        class="w-full bg-transparent outline-none placeholder:text-white/50"
        :placeholder="tl.search"
        v-model="search"
      />
    </div>

    <button
      class="lighten flex w-fit flex-row items-center gap-2 self-end rounded-full bg-very-light-blue px-4 py-1 text-sm font-semibold text-black"
      @click="showCreateDialog = true"
    >
      <IconAdd class="size-4 fill-black" />
      {{ tl.create }}
    </button>

    <div
      class="grid w-full grid-cols-2 gap-4 overflow-y-scroll lg:grid-cols-3 xl:grid-cols-4"
      v-if="shownTags.length > 0"
    >
      <TagCard
        v-for="tag in shownTags"
        :id="tag.id"
        :name="tag.name"
        :publications="tag.publications"
        @update="openEditDialog"
        @delete="onTagPrepareDelete"
      />
    </div>
    <div class="flex size-full items-center justify-center" v-else>
      <h3 class="text-xl font-bold">{{ tl.noTags }}</h3>
    </div>

    <button
      v-if="showMore"
      @click="page++"
      class="w-fit self-center rounded-full border-2 border-very-light-blue px-3 py-1 text-sm font-bold duration-200 hover:bg-very-light-blue hover:text-black"
    >
      {{ tl.showMore }}
    </button>
  </div>

  <div
    class="absolute inset-0 flex size-full items-center justify-center bg-black/50"
    v-if="showCreateDialog || showEditDialog || showDeleteDialog"
  >
    <CreateTagDialog
      v-if="showCreateDialog"
      @cancel="showCreateDialog = false"
      @confirm="onTagCreated"
    />

    <DeleteTagConfirm
      v-if="showDeleteDialog"
      :id="deletingId"
      :name="deletingName"
      :publications="deletingPublications"
      @delete="ontagDeleted"
      @cancel="showDeleteDialog = false"
    />

    <EditTagDialog
      v-if="showEditDialog"
      :id="editingId"
      :name="editingName"
      @change="onTagChanged"
      @cancel="showEditDialog = false"
    />
  </div>
</template>
