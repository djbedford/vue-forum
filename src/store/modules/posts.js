import firebase from "@/helpers/firebase";
import { makeFetchItemAction, makeFetchItemsAction } from "@/helpers";

export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {},
  actions: {
    async createPost({ commit, state, rootState }, post) {
      post.userId = rootState.auth.authId;
      post.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      post.firstInThread = post.firstInThread || false;

      const batch = firebase.firestore().batch();
      const postReference = firebase
        .firestore()
        .collection("posts")
        .doc();
      const threadReference = firebase
        .firestore()
        .collection("threads")
        .doc(post.threadId);
      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(rootState.auth.authId);

      batch.set(postReference, post);

      const threadUpdates = {
        posts: firebase.firestore.FieldValue.arrayUnion(postReference.id)
      };

      if (!post.firstInThread) {
        threadUpdates.contributors = firebase.firestore.FieldValue.arrayUnion(
          rootState.auth.authId
        );
      }

      batch.update(threadReference, threadUpdates);
      batch.update(userReference, {
        postsCount: firebase.firestore.FieldValue.increment(1)
      });
      await batch.commit();

      const newPost = await postReference.get();

      commit(
        "setItem",
        {
          resource: "posts",
          item: { id: newPost.id, ...newPost.data() }
        },
        { root: true }
      );
      commit(
        "threads/appendPostToThread",
        {
          childId: newPost.id,
          parentId: post.threadId
        },
        { root: true }
      );

      if (!post.firstInThread) {
        commit(
          "threads/appendContributorToThread",
          {
            childId: rootState.auth.authId,
            parentId: post.threadId
          },
          { root: true }
        );
      }
    },
    async updatePost({ commit, state, rootState }, { text, id }) {
      const post = {
        text,
        edited: {
          at: firebase.firestore.FieldValue.serverTimestamp(),
          by: rootState.auth.authId,
          moderated: false
        }
      };
      const postReference = firebase
        .firestore()
        .collection("posts")
        .doc(id);

      await postReference.update(post);

      const updatedPost = postReference.get();

      commit(
        "setItem",
        { resource: "posts", item: updatedPost },
        { root: true }
      );
    },

    fetchPost: makeFetchItemAction({ resource: "posts" }),

    fetchPosts: makeFetchItemsAction({ resource: "posts" })
  },
  mutations: {}
};
