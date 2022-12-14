<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <div class="col-full push-top">
      <div class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <router-link
          :to="{ name: 'ThreadCreate', params: { id: forum.id } }"
          class="btn-green btn-small"
          >Start a thread</router-link
        >
      </div>
    </div>
    <div class="col-full push-top">
      <thread-list :threads="forumThreads" />
      <v-pagination v-model="page" :pages="totalPages" active-color="#57AD8D" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useForumsStore } from "../stores/forums";
import { useThreadsStore } from "../stores/threads";
import { useUsersStore } from "../stores/users";
import { findById } from "@/helpers";
import asyncDataStatus from "@/mixins/asyncDataStatus";
import ThreadList from "@/components/ThreadList.vue";

export default {
  props: {
    id: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      page: parseInt(this.$route.query.page) || 1,
      perPage: 10,
    };
  },
  components: {
    ThreadList,
  },
  mixins: [asyncDataStatus],
  computed: {
    ...mapState(useForumsStore, ["forums"]),
    ...mapState(useThreadsStore, {
      threads: "threads",
      thread: (store) => store.thread,
    }),
    forum() {
      return findById(this.forums, this.id);
    },
    forumThreads() {
      if (!this.forum) {
        return [];
      }

      return this.forum.threads
        ? this.threads
            .filter((thread) => thread.forumId === this.forum.id)
            .map((thread) => this.thread(thread.id))
        : [];
    },
    threadCount() {
      return this.forum.threads?.length || 0;
    },
    totalPages() {
      if (!this.threadCount) {
        return 0;
      }

      return Math.ceil(this.threadCount / this.perPage);
    },
  },
  methods: {
    ...mapActions(useForumsStore, ["fetchForum"]),
    ...mapActions(useThreadsStore, ["fetchThreadsByPage"]),
    ...mapActions(useUsersStore, ["fetchUsers"]),
  },
  watch: {
    async page() {
      this.$router.push({ query: { page: this.page } });
    },
  },
  async created() {
    const forum = await this.fetchForum({ id: this.id });
    const threads = await this.fetchThreadsByPage({
      ids: forum.threads,
      page: this.page,
      perPage: this.perPage,
    });

    await this.fetchUsers({
      ids: threads.map((thread) => thread.userId),
    });

    this.asyncDataStatus_fetched();
  },
};
</script>

<style scoped></style>
