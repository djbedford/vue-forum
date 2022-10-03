<template>
  <!-- <div class="col-full">
    <div class="forum-list">
      <h2 class="list-title">
        <a href="#">Categories</a>
      </h2> -->
  <h1>{{ category.name }}</h1>
  <forum-list :title="category.name" :forums="getCategoryForums(category)" />
  <!-- </div>
  </div> -->
</template>

<script>
import sourceData from "@/data.json";
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
      return sourceData.categories.find(category => category.id === this.id);
    }
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
