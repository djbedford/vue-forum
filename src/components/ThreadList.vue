<template>
  <div class="col-full">
    <div class="thread-list">
      <h2 class="list-title">Threads</h2>
      <div v-if="threads.length">
        <div v-for="thread in threads" :key="thread.id" class="thread">
          <div>
            <p>
              <router-link
                v-if="thread.id"
                :to="{ name: 'ThreadShow', params: { id: thread.id } }"
                >{{ thread.title }}</router-link
              >
            </p>
            <p class="text-faded text-xsmall">
              By <a href="#">{{ userById(thread.userId).name }}</a
              >, <AppDate :timestamp="thread.publishedAt" />.
            </p>
          </div>
          <div class="activity">
            <p class="replies-count">{{ thread.repliesCount }} replies</p>

            <app-avatar-img
              class="avatar-medium"
              :src="userById(thread.userId).avatar"
            />

            <div>
              <p class="text-xsmall">
                <a href="#">{{ userById(thread.userId).name }}</a>
              </p>
              <p class="text-xsmall text-faded">
                <AppDate :timestamp="thread.publishedAt" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!threads.length" style="padding: 10px; text-align: center">
      <em>There are no threads.</em>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { usePostsStore } from "../stores/posts";
import { useUsersStore } from "../stores/users";
import { findById } from "@/helpers";

export default {
  props: {
    threads: {
      required: true,
      type: Array,
    },
  },
  computed: {
    ...mapState(usePostsStore, ["posts"]),
    ...mapState(useUsersStore, ["users"]),
  },
  methods: {
    postById(postId) {
      return findById(this.posts, postId);
    },
    userById(userId) {
      return findById(this.users, userId) || {};
    },
  },
};
</script>

<style scoped></style>
