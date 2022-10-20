<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Editing <i>{{ thread.title }}</i>
    </h1>

    <thread-editor
      :title="thread.title"
      :text="text"
      @save="save"
      @cancel="cancel"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { usePostsStore } from "../stores/posts";
import { useThreadsStore } from "../stores/threads";
import { findById } from "@/helpers";
import asyncDataStatus from "@/mixins/asyncDataStatus";
import ThreadEditor from "@/components/ThreadEditor.vue";

export default {
  props: {
    id: {
      required: true,
      type: String,
    },
  },
  components: {
    ThreadEditor,
  },
  mixins: [asyncDataStatus],
  computed: {
    ...mapState(useThreadsStore, ["threads"]),
    ...mapState(usePostsStore, ["posts"]),
    thread() {
      return findById(this.threads, this.id);
    },
    text() {
      const post = findById(this.posts, this.thread?.posts[0]);

      return post ? post.text : "";
    },
  },
  methods: {
    ...mapActions(useThreadsStore, ["updateThread", "fetchThread"]),
    ...mapActions(usePostsStore, ["fetchPost"]),
    async save({ title, text }) {
      const thread = await this.updateThread({
        id: this.id,
        title,
        text,
      });

      this.$router.push({ name: "ThreadShow", params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: "ThreadShow", params: { id: this.thread.id } });
    },
  },
  async created() {
    const thread = await this.fetchThread({ id: this.id });

    await this.fetchPost({ id: thread.posts[0] });

    this.asyncDataStatus_fetched();
  },
};
</script>
