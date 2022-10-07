<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <h1>{{ category.name }}</h1>
    <forum-list :title="category.name" :forums="getCategoryForums(category)" />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { findById } from "@/helpers";
import asyncDataStatus from "@/mixins/asyncDataStatus";
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
  mixins: [asyncDataStatus],
  computed: {
    category() {
      return findById(this.$store.state.categories, this.id) || {};
    }
  },
  methods: {
    ...mapActions(["fetchCategory", "fetchForums"]),
    getCategoryForums(category) {
      return this.$store.state.forums.filter(
        forum => forum.categoryId === category.id
      );
    }
  },
  async created() {
    const category = await this.fetchCategory({
      id: this.id
    });

    await this.fetchForums({ ids: category.forums });

    this.asyncDataStatus_fetched();
  }
};
</script>
