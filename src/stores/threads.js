import { defineStore } from "pinia";
import chunk from "lodash/chunk";
import firebase from "@/helpers/firebase";
import { useAuthStore } from "./auth";
import { useForumsStore } from "./forums";
import { usePostsStore } from "./posts";
import { useRootStore } from "./root";
import { useUsersStore } from "./users";
import { findById, docToResource, upsert } from "@/helpers";

export const useThreadsStore = defineStore("threads", {
  state: () => ({
    threads: [],
  }),
  getters: {
    thread: (state) => {
      return (id) => {
        const thread = findById(state.threads, id);

        if (!thread) {
          return {};
        }

        return {
          ...thread,
          get author() {
            const usersStore = useUsersStore();

            return findById(usersStore.users, thread.userId);
          },
          get repliesCount() {
            return thread.posts?.length - 1 || 0;
          },
          get contributorsCount() {
            return thread.contributors?.length || 0;
          },
        };
      };
    },
  },
  actions: {
    async createThread({ title, text, forumId }) {
      const authStore = useAuthStore();
      const userId = authStore.authId;
      const publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      const threadReference = firebase.firestore().collection("threads").doc();
      const thread = {
        forumId,
        title,
        publishedAt,
        userId,
        id: threadReference.id,
      };
      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(userId);
      const forumReference = firebase
        .firestore()
        .collection("forums")
        .doc(forumId);
      const batch = firebase.firestore().batch();

      batch.set(threadReference, thread);
      batch.update(userReference, {
        threads: firebase.firestore.FieldValue.arrayUnion(threadReference.id),
      });
      batch.update(forumReference, {
        threads: firebase.firestore.FieldValue.arrayUnion(threadReference.id),
      });

      batch.commit();

      const newThread = await threadReference.get();
      upsert(this.threads, { id: newThread.id, ...newThread.data() });

      const forumsStore = useForumsStore();
      forumsStore.appendThreadToForum({
        childId: threadReference.id,
        parentId: forumId,
      });

      const usersStore = useUsersStore();
      usersStore.appendThreadToUser({
        childId: threadReference.id,
        parentId: userId,
      });

      const postsStore = usePostsStore();
      await postsStore.createPost({
        text,
        threadId: threadReference.id,
        firstInThread: true,
      });

      return findById(this.threads, threadReference.id);
    },

    async updateThread({ id, title, text }) {
      const thread = findById(this.threads, id);
      const postsStore = usePostsStore();
      const post = findById(postsStore.posts, thread.posts[0]);
      let newThread = {
        ...thread,
        title,
      };
      let newPost = {
        ...post,
        text,
      };
      const threadReference = firebase
        .firestore()
        .collection("threads")
        .doc(id);
      const postReference = firebase
        .firestore()
        .collection("posts")
        .doc(post.id);
      const batch = firebase.firestore().batch();

      batch.update(threadReference, newThread);
      batch.update(postReference, newPost);

      await batch.commit();

      const updatedThread = await threadReference.get();
      const updatedPost = await postReference.get();

      upsert(this.threads, { id: updatedThread.id, ...updatedThread.data() });
      upsert(postsStore.posts, { id: updatedPost.id, ...updatedPost.data() });

      return docToResource(updatedThread);
    },

    fetchThread({ id }) {
      const rootStore = useRootStore();
      return rootStore.fetchItem({
        id,
        resource: "threads",
        resources: this.threads,
      });
    },

    fetchThreads({ ids }) {
      const rootStore = useRootStore();
      return rootStore.fetchItems({
        ids,
        resource: "threads",
        resources: this.threads,
      });
    },

    fetchThreadsByPage({ ids, page, perPage = 10 }) {
      this.clearThreads();

      const chunks = chunk(ids, perPage);
      const limitedIds = chunks[page - 1];

      return this.fetchThreads({ ids: limitedIds });
    },

    clearThreads() {
      this.$reset();
    },

    appendPostToThread({ childId, parentId }) {
      const resource = findById(this.threads, parentId);

      if (!resource) {
        console.warn(
          `Appending post ${childId} to thread ${parentId} failed because the parent didn't exist`
        );

        return;
      }

      resource["posts"] = resource["posts"] || [];

      if (!resource["posts"].includes(childId)) {
        resource["posts"].push(childId);
      }
    },

    appendContributorToThread({ childId, parentId }) {
      const resource = findById(this.threads, parentId);

      if (!resource) {
        console.warn(
          `Appending post ${childId} to thread ${parentId} failed because the parent didn't exist`
        );

        return;
      }

      resource["contributors"] = resource["contributors"] || [];

      if (!resource["contributors"].includes(childId)) {
        resource["contributors"].push(childId);
      }
    },
  },
});
