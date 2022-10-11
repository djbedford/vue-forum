<template>
  <div class="container col-full">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <user-profile-card v-if="!edit" :user="user" />
        <user-profile-card-editor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead"> {{ user.username }}'s recent activity </span>
          <a href="#">See only started threads?</a>
        </div>

        <hr />

        <post-list :posts="user.posts" />
        <app-infinite-scroll
          @load="fetchUserPosts"
          :done="user.posts.length === user.postsCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import asyncDataStatus from "@/mixins/asyncDataStatus";
import PostList from "@/components/PostList.vue";
import UserProfileCard from "@/components/UserProfileCard.vue";
import UserProfileCardEditor from "@/components/UserProfileCardEditor.vue";

export default {
  props: {
    edit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    PostList,
    UserProfileCard,
    UserProfileCardEditor
  },
  mixins: [asyncDataStatus],
  computed: {
    ...mapGetters("auth", { user: "authUser" }),
    lastPostFetched() {
      if (this.user.posts.length === 0) {
        return null;
      }

      return this.user.posts[this.user.posts.length - 1];
    }
  },
  methods: {
    fetchUserPosts() {
      return this.$store.dispatch("auth/fetchAuthUserPosts", {
        startAfter: this.lastPostFetched
      });
    }
  },
  async created() {
    await this.fetchUserPosts();
    this.asyncDataStatus_fetched();
  }
};
</script>
