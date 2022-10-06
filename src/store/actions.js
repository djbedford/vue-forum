import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { findById, docToResource } from "@/helpers";

export default {
  async createPost({ commit, state }, post) {
    post.userId = state.authId;
    post.publishedAt = firebase.firestore.FieldValue.serverTimestamp();

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
      .doc(state.authId);

    batch.set(postReference, post);
    batch.update(threadReference, {
      posts: firebase.firestore.FieldValue.arrayUnion(postReference.id),
      contributors: firebase.firestore.FieldValue.arrayUnion(state.authId)
    });
    batch.update(userReference, {
      postsCount: firebase.firestore.FieldValue.increment(1)
    });
    await batch.commit();

    const newPost = await postReference.get();

    commit("setItem", {
      resource: "posts",
      item: { id: newPost.id, ...newPost.data() }
    });
    commit("appendPostToThread", {
      childId: newPost.id,
      parentId: post.threadId
    });
    commit("appendContributorToThread", {
      childId: state.authId,
      parentId: post.threadId
    });
  },
  async createThread({ commit, state, dispatch }, { title, text, forumId }) {
    const userId = state.authId;
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

    commit("setItem", {
      resource: "threads",
      item: { id: newThread.id, ...newThread.data() }
    });
    commit("appendThreadToForum", {
      childId: threadReference.id,
      parentId: forumId
    });
    commit("appendThreadToUser", {
      childId: threadReference.id,
      parentId: userId
    });
    await dispatch("createPost", { text, threadId: threadReference.id });

    return findById(state.threads, threadReference.id);
  },
  updateUser({ commit }, user) {
    commit("setItem", { resource: "users", item: user });
  },
  async updateThread({ commit, state }, { id, title, text }) {
    const thread = findById(state.threads, id);
    const post = findById(state.posts, thread.posts[0]);
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

    commit("setItem", { resource: "threads", item: newThread });
    commit("setItem", { resource: "posts", item: newPost });

    return docToResource(newThread);
  },
  fetchAllCategories({ commit }) {
    return new Promise(resolve => {
      firebase
        .firestore()
        .collection("categories")
        .onSnapshot(querySnapshot => {
          const categories = querySnapshot.docs.map(doc => {
            const item = { id: doc.id, ...doc.data() };

            commit("setItem", { resource: "categories", item });

            return item;
          });

          resolve(categories);
        });
    });
  },
  fetchCategory: ({ dispatch }, { id }) =>
    dispatch("fetchItem", { id, resource: "categories" }),

  fetchCategories: ({ dispatch }, { ids }) =>
    dispatch("fetchItems", { ids, resource: "categories" }),

  fetchForum: ({ dispatch }, { id }) =>
    dispatch("fetchItem", { id, resource: "forums" }),

  fetchForums: ({ dispatch }, { ids }) =>
    dispatch("fetchItems", { ids, resource: "forums" }),

  fetchThread: ({ dispatch }, { id }) =>
    dispatch("fetchItem", { id, resource: "threads" }),

  fetchThreads: ({ dispatch }, { ids }) =>
    dispatch("fetchItems", { ids, resource: "threads" }),

  fetchPost: ({ dispatch }, { id }) =>
    dispatch("fetchItem", { id, resource: "posts" }),

  fetchPosts: ({ dispatch }, { ids }) =>
    dispatch("fetchItems", { ids, resource: "posts" }),

  fetchUser: ({ dispatch }, { id }) =>
    dispatch("fetchItem", { id, resource: "users" }),

  fetchUsers: ({ dispatch }, { ids }) =>
    dispatch("fetchItems", { ids, resource: "users" }),

  fetchAuthUser: ({ dispatch, state }) =>
    dispatch("fetchUser", { id: state.authId }),

  fetchItem({ commit }, { id, resource }) {
    return new Promise(resolve => {
      firebase
        .firestore()
        .collection(resource)
        .doc(id)
        .onSnapshot(doc => {
          const item = {
            id: doc.id,
            ...doc.data()
          };

          commit("setItem", { resource, item });

          resolve(item);
        });
    });
  },
  fetchItems: ({ dispatch }, { ids, resource }) =>
    Promise.all(ids.map(id => dispatch("fetchItem", { id, resource })))
};
