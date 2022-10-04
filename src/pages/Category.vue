<template>
  <h1>{{ category.name }}</h1>
  <forum-list :title="category.name" :forums="getCategoryForums(category)" />
</template>

<script>
import { findById } from "@/helpers";
import ForumList from "@/components/ForumList.vue";

export default {
  props: {
    id: {
      required: true,
      type: String
    }
  },
  components: {
    ForumList
  },
  computed: {
    category() {
      return findById(this.$store.state.categories, this.id);
    }
  },
  methods: {
    getCategoryForums(category) {
      return this.$store.state.forums.filter(
        forum => forum.categoryId === category.id
      );
    }
  }
};
</script>
