<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <h1>{{ category.name }}</h1>
    <forum-list :title="category.name" :forums="getCategoryForums(category)" />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useCategoriesStore } from "../stores/categories";
import { useForumsStore } from "../stores/forums";
import { findById } from "@/helpers";
import asyncDataStatus from "@/mixins/asyncDataStatus";
import ForumList from "@/components/ForumList.vue";

export default {
  props: {
    id: {
      required: true,
      type: String,
    },
  },
  components: {
    ForumList,
  },
  mixins: [asyncDataStatus],
  computed: {
    ...mapState(useCategoriesStore, ["categories"]),
    ...mapState(useForumsStore, ["forums"]),
    category() {
      return findById(this.categories, this.id) || {};
    },
  },
  methods: {
    ...mapActions(useCategoriesStore, ["fetchCategory"]),
    ...mapActions(useForumsStore, ["fetchForums"]),
    getCategoryForums(category) {
      return this.forums.filter((forum) => forum.categoryId === category.id);
    },
  },
  async created() {
    const category = await this.fetchCategory({
      id: this.id,
    });

    await this.fetchForums({ ids: category.forums });

    this.asyncDataStatus_fetched();
  },
};
</script>
