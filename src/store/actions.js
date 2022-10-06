import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { findById } from "@/helpers";

export default {
  createPost({ commit, state }, post) {
    post.id = "gggg" + Math.random();
    post.userId = state.authId;
    post.publishedAt = Math.floor(Date.now() / 1000);

    commit("setItem", { resource: "posts", item: post });
    commit("appendPostToThread", {
      childId: post.id,
      parentId: post.threadId
    });
    commit("appendContributorToThread", {
      childId: state.authId,
      parentId: post.threadId
    });
  },
  async createThread({ commit, state, dispatch }, { title, text, forumId }) {
    const id = "ggqq" + Math.random();
    const userId = state.authId;
    const publishedAt = Math.floor(Date.now() / 1000);

    const thread = {
      forumId,
      title,
      publishedAt,
      userId,
      id
    };

    commit("setItem", { resource: "threads", item: thread });
    commit("appendThreadToForum", { childId: id, parentId: forumId });
    commit("appendThreadToUser", { childId: id, parentId: userId });
    dispatch("createPost", { text, threadId: id });

    return findById(state.threads, id);
  },
  updateUser({ commit }, user) {
    commit("setItem", { resource: "users", item: user });
  },
  async updateThread({ commit, state }, { id, title, text }) {
    const thread = findById(state.threads, id);
    const post = findById(state.posts, thread.posts[0]);
    const newThread = {
      ...thread,
      title
    };
    const newPost = {
      ...post,
      text
    };

    commit("setItem", { resource: "threads", item: newThread });
    commit("setItem", { resource: "posts", item: newPost });

    return newThread;
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
