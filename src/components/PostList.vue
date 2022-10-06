<template>
  <div class="post-list">
    <div v-for="post in posts" :key="post.id" class="post">
      <div v-if="userById(post.userId)" class="user-info">
        <a href="#" class="user-name">{{ userById(post.userId).name }}</a>

        <a href="#">
          <img
            class="avatar-large"
            :src="userById(post.userId).avatar"
            alt=""
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
        <div>
          <p>
            {{ post.text }}
          </p>
        </div>
        <a
          href="#"
          style="margin-left: auto;"
          class="link-unstyled"
          title="Make a change"
          ><fa icon="pencil-alt"
        /></a>
      </div>

      <div class="post-date text-faded">
        <AppDate :timestamp="post.publishedAt" />
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export default {
  props: {
    posts: {
      required: true,
      type: Array
    }
  },
  computed: {
    users() {
      return this.$store.state.users;
    }
  },
  methods: {
    userById(userId) {
      return this.$store.getters.user(userId);
    },
    diffForHumans(timestamp) {
      return dayjs.unix(timestamp).fromNow();
    },
    humanFriendlyDate(timestamp) {
      return dayjs.unix(timestamp).format("llll");
    }
  }
};
</script>

<style scoped></style>
