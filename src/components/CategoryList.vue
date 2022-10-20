<template>
  <div class="col-full">
    <div class="forum-list">
      <forum-list
        v-for="category in categories"
        :key="category.id"
        :forums="getCategoryForums(category)"
        :title="category.name"
        :category-id="category.id"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useForumsStore } from "../stores/forums";
import ForumList from "@/components/ForumList.vue";

export default {
  props: {
    categories: {
      required: true,
      type: Array,
    },
  },
  components: {
    ForumList,
  },
  computed: {
    ...mapState(useForumsStore, ["forums"]),
  },
  methods: {
    getCategoryForums(category) {
      return this.forums.filter((forum) => forum.categoryId === category.id);
    },
  },
};
</script>

<style scoped></style>
