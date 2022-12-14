<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor
      @save="save"
      @cancel="cancel"
      @dirty="formIsDirty = true"
      @clean="formIsDirty = false"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useForumsStore } from "../stores/forums";
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
  data() {
    return {
      formIsDirty: false,
    };
  },
  computed: {
    ...mapState(useForumsStore, ["forums"]),
    forum() {
      return findById(this.forums, this.id);
    },
  },
  methods: {
    ...mapActions(useThreadsStore, ["createThread"]),
    ...mapActions(useForumsStore, ["fetchForum"]),
    async save({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum.id,
        title,
        text,
      });

      this.$router.push({ name: "ThreadShow", params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: "Forum", params: { id: this.forum.id } });
    },
  },
  async created() {
    await this.fetchForum({ id: this.id });

    this.asyncDataStatus_fetched();
  },
  beforeRouteLeave() {
    if (this.formIsDirty) {
      const confirmed = window.confirm(
        "Unsaved changes will be lost! Are you sure you want to leave?"
      );

      if (!confirmed) {
        return false;
      }
    }
  },
};
</script>
