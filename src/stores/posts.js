import { defineStore } from "pinia";
import firebase from "@/helpers/firebase";
import { upsert, docToResource } from "@/helpers";
import { useAuthStore } from "./auth";
import { useRootStore } from "./root";
import { useThreadsStore } from "./threads";

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: [],
  }),
  actions: {
    async createPost(post) {
      const authStore = useAuthStore();

      post.userId = authStore.authId;
      post.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      post.firstInThread = post.firstInThread || false;

      const batch = firebase.firestore().batch();
      const postReference = firebase.firestore().collection("posts").doc();
      const threadReference = firebase
        .firestore()
        .collection("threads")
        .doc(post.threadId);
      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(authStore.authId);

      batch.set(postReference, post);

      const threadUpdates = {
        posts: firebase.firestore.FieldValue.arrayUnion(postReference.id),
      };

      if (!post.firstInThread) {
        threadUpdates.contributors = firebase.firestore.FieldValue.arrayUnion(
          authStore.authId
        );
      }

      batch.update(threadReference, threadUpdates);
      batch.update(userReference, {
        postsCount: firebase.firestore.FieldValue.increment(1),
      });
      await batch.commit();

      const newPost = await postReference.get();

      upsert(this.posts, { id: newPost.id, ...newPost.data() });

      const threadsStore = useThreadsStore();

      threadsStore.appendPostToThread({
        childId: newPost.id,
        parentId: post.threadId,
      });

      if (!post.firstInThread) {
        threadsStore.appendContributorToThread({
          childId: authStore.authId,
          parentId: post.threadId,
        });
      }
    },

    async updatePost({ text, id }) {
      const authStore = useAuthStore();
      const post = {
        text,
        edited: {
          at: firebase.firestore.FieldValue.serverTimestamp(),
          by: authStore.authId,
          moderated: false,
        },
      };
      const postReference = firebase.firestore().collection("posts").doc(id);

      await postReference.update(post);

      const updatedPost = await postReference.get();

      upsert(this.posts, { id: updatedPost.id, ...updatedPost.data() });
    },

    fetchPost({ id }) {
      const rootStore = useRootStore();
      return rootStore.fetchItem({
        id,
        resource: "posts",
        resources: this.posts,
      });
    },

    fetchPosts({ ids }) {
      const rootStore = useRootStore();
      return rootStore.fetchItems({
        ids,
        resource: "posts",
        resources: this.posts,
      });
    },
  },
});
