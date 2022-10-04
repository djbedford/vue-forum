<template>
  <div class="container">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <user-profile-card v-if="!edit" :user="user" />
        <user-profile-card-editor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead">
            Joker's recent activity
          </span>
          <a href="#">See only started threads?</a>
        </div>

        <hr />

        <post-list :posts="user.posts" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
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
  computed: {
    ...mapGetters({ user: "authUser" })
  }
};
</script>
