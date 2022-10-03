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
import sourceData from "@/data.json";
import ForumList from "@/components/ForumList.vue";

export default {
  props: {
    categories: {
      required: true,
      type: Array
    }
  },
  components: {
    ForumList
  },
  methods: {
    getCategoryForums(category) {
      return sourceData.forums.filter(
        forum => forum.categoryId === category.id
      );
    }
  }
};
</script>

<style scoped></style>
