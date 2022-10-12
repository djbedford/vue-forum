import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import chunk from "lodash/chunk";
import {
  findById,
  docToResource,
  makeAppendChildToParentMutation,
  makeFetchItemAction,
  makeFetchItemsAction
} from "@/helpers";

export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {
    thread: (state, getters, rootState) => {
      return id => {
        const thread = findById(state.items, id);

        if (!thread) {
          return {};
        }

        return {
          ...thread,
          get author() {
            return findById(rootState.users.items, thread.userId);
          },
          get repliesCount() {
            return thread.posts.length - 1;
          },
          get contributorsCount() {
            return thread.contributors?.length || 0;
          }
        };
      };
    }
  },
  actions: {
    async createThread(
      { commit, state, dispatch, rootState },
      { title, text, forumId }
    ) {
      const userId = rootState.auth.authId;
      const publishedAt = firebase.firestore.FieldValue.serverTimestamp();

      const threadReference = firebase
        .firestore()
        .collection("threads")
        .doc();

      const thread = {
        forumId,
        title,
        publishedAt,
        userId,
        id: threadReference.id
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
        threads: firebase.firestore.FieldValue.arrayUnion(threadReference.id)
      });
      batch.update(forumReference, {
        threads: firebase.firestore.FieldValue.arrayUnion(threadReference.id)
      });

      batch.commit();

      const newThread = await threadReference.get();

      commit(
        "setItem",
        {
          resource: "threads",
          item: { id: newThread.id, ...newThread.data() }
        },
        { root: true }
      );
      commit(
        "forums/appendThreadToForum",
        {
          childId: threadReference.id,
          parentId: forumId
        },
        { root: true }
      );
      commit(
        "users/appendThreadToUser",
        {
          childId: threadReference.id,
          parentId: userId
        },
        { root: true }
      );
      await dispatch(
        "posts/createPost",
        { text, threadId: threadReference.id },
        { root: true }
      );

      return findById(state.items, threadReference.id);
    },
    async updateThread({ commit, state, rootState }, { id, title, text }) {
      const thread = findById(state.items, id);
      const post = findById(rootState.posts.items, thread.posts[0]);
      let newThread = {
        ...thread,
        title
      };
      let newPost = {
        ...post,
        text
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

      newThread = await threadReference.get();
      newPost = await postReference.get();

      commit(
        "setItem",
        { resource: "threads", item: newThread },
        { root: true }
      );
      commit("setItem", { resource: "posts", item: newPost }, { root: true });

      return docToResource(newThread);
    },

    fetchThread: makeFetchItemAction({ resource: "threads" }),

    fetchThreads: makeFetchItemsAction({ resource: "threads" }),

    fetchThreadsByPage: ({ dispatch, commit }, { ids, page, perPage = 10 }) => {
      commit("clearThreads");

      const chunks = chunk(ids, perPage);
      const limitedIds = chunks[page - 1];

      return dispatch("fetchThreads", { ids: limitedIds });
    }
  },
  mutations: {
    appendPostToThread: makeAppendChildToParentMutation({
      parent: "threads",
      child: "posts"
    }),
    appendContributorToThread: makeAppendChildToParentMutation({
      parent: "threads",
      child: "contributors"
    }),
    clearThreads(state) {
      state.items = [];
    }
  }
};
