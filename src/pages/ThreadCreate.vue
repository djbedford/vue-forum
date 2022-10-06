<template>
  <div v-if="forum" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor @save="save" @cancel="cancel" />
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
    forum() {
      return findById(this.$store.state.forums, this.id);
    }
  },
  methods: {
    ...mapActions(["createThread", "fetchForum"]),
    async save({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum.id,
        title,
        text
      });

      this.$router.push({ name: "ThreadShow", params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: "Forum", params: { id: this.forum.id } });
    }
  },
  created() {
    this.fetchForum({ id: this.id });
  }
};
</script>
