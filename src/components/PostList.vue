<template>
  <div class="post-list">
    <div v-for="post in posts" :key="post.id" class="post">
      <div v-if="userById(post.userId)" class="user-info">
        <a href="#" class="user-name">{{ userById(post.userId).name }}</a>

        <a href="#">
          <app-avatar-img
            class="avatar-large"
            :src="userById(post.userId).avatar"
          />
        </a>

        <p class="desktop-only text-small">
          {{ userById(post.userId).postsCount }} posts
        </p>
        <p class="desktop-only text-small">
          {{ userById(post.userId).threadsCount }} threads
        </p>
      </div>

      <div class="post-content">
        <div class="col-full">
          <post-editor
            v-if="editing === post.id"
            :post="post"
            @save="handleUpdate"
          />
          <div v-else>
            <p>
              {{ post.text }}
            </p>
          </div>
        </div>
        <a
          v-if="post.userId === this.authId"
          @click.prevent="toggleEditMode(post.id)"
          href="#"
          style="margin-left: auto"
          class="link-unstyled"
          title="Make a change"
          ><font-awesome icon="pencil-alt"
        /></a>
      </div>

      <div class="post-date text-faded">
        <div v-if="post.edited?.at" class="edition-info">edited</div>
        <AppDate :timestamp="post.publishedAt" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "../stores/auth";
import { usePostsStore } from "../stores/posts";
import { useUsersStore } from "../stores/users";
import PostEditor from "@/components/PostEditor.vue";

export default {
  props: {
    posts: {
      required: true,
      type: Array,
    },
  },
  components: {
    PostEditor,
  },
  data() {
    return {
      editing: null,
    };
  },
  computed: {
    ...mapState(useUsersStore, {
      user: (store) => store.user,
      users: "users",
    }),
    ...mapState(useAuthStore, ["authId"]),
  },
  methods: {
    ...mapActions(usePostsStore, ["updatePost"]),
    userById(userId) {
      return this.user(userId);
    },
    toggleEditMode(id) {
      this.editing = id === this.editing ? null : id;
    },
    async handleUpdate(event) {
      await this.updatePost(event.post);
      this.editing = null;
    },
  },
};
</script>

<style scoped></style>
