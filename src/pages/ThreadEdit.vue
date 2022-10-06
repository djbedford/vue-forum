<template>
  <div v-if="thread && text" class="col-full push-top">
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
import { mapActions } from "vuex";
import { findById } from "@/helpers";
import ThreadEditor from "@/components/ThreadEditor.vue";

export default {
  props: {
    id: {
      required: true,
      type: String
    }
  },
  components: {
    ThreadEditor
  },
  computed: {
    thread() {
      return findById(this.$store.state.threads, this.id);
    },
    text() {
      const post = findById(this.$store.state.posts, this.thread.posts[0]);

      return post ? post.text : "";
    }
  },
  methods: {
    ...mapActions(["updateThread", "fetchThread", "fetchPost"]),
    async save({ title, text }) {
      const thread = await this.updateThread({
        id: this.id,
        title,
        text
      });

      this.$router.push({ name: "ThreadShow", params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: "ThreadShow", params: { id: this.thread.id } });
    }
  },
  async created() {
    const thread = await this.fetchThread({ id: this.id });

    this.fetchPost({ id: thread.posts[0] });
  }
};
</script>
