import { createStore } from "vuex";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { findById, upsert } from "@/helpers";

export default createStore({
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    authId: "VXjpr2WHa8Ux4Bnggym8QFLdv5C3"
  },
  getters: {
    authUser: (state, getters) => {
      return getters.user(state.authId);
    },
    user: state => {
      return id => {
        const user = findById(state.users, id);

        if (!user) {
          return null;
        }

        return {
          ...user,
          get posts() {
            return state.posts.filter(post => post.userId === user.id);
          },
          get postsCount() {
            return this.posts.length;
          },
          get threads() {
            return state.threads.filter(thread => thread.userId === user.id);
          },
          get threadsCount() {
            return this.threads.length;
          }
        };
      };
    },
    thread: state => {
      return id => {
        const thread = findById(state.threads, id);

        if (!thread) {
          return {};
        }

        return {
          ...thread,
          get author() {
            return findById(state.users, thread.userId);
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
    fetchCategory({ dispatch }, { id }) {
      return dispatch("fetchItem", { id, resource: "categories" });
    },
    fetchCategories({ dispatch }, { ids }) {
      return dispatch("fetchItems", { ids, resource: "categories" });
    },
    fetchForum({ dispatch }, { id }) {
      return dispatch("fetchItem", { id, resource: "forums" });
    },
    fetchForums({ dispatch }, { ids }) {
      return dispatch("fetchItems", { ids, resource: "forums" });
    },
    fetchThread({ dispatch }, { id }) {
      return dispatch("fetchItem", { id, resource: "threads" });
    },
    fetchThreads({ dispatch }, { ids }) {
      return dispatch("fetchItems", { ids, resource: "threads" });
    },
    fetchPost({ dispatch }, { id }) {
      return dispatch("fetchItem", { id, resource: "posts" });
    },
    fetchPosts({ dispatch }, { ids }) {
      return dispatch("fetchItems", { ids, resource: "posts" });
    },
    fetchUser({ dispatch }, { id }) {
      return dispatch("fetchItem", { id, resource: "users" });
    },
    fetchUsers({ dispatch }, { ids }) {
      return dispatch("fetchItems", { ids, resource: "users" });
    },
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
    fetchItems({ dispatch }, { ids, resource }) {
      return Promise.all(
        ids.map(id => dispatch("fetchItem", { id, resource }))
      );
    }
  },
  mutations: {
    setItem(state, { resource, item }) {
      upsert(state[resource], item);
    },
    appendPostToThread: makeAppendChildToParentMutation({
      parent: "threads",
      child: "posts"
    }),
    appendThreadToForum: makeAppendChildToParentMutation({
      parent: "forums",
      child: "threads"
    }),
    appendThreadToUser: makeAppendChildToParentMutation({
      parent: "users",
      child: "threads"
    }),
    appendContributorToThread: makeAppendChildToParentMutation({
      parent: "threads",
      child: "contributors"
    })
  }
});

function makeAppendChildToParentMutation({ parent, child }) {
  return (state, { childId, parentId }) => {
    const resource = findById(state[parent], parentId);

    if (!resource) {
      console.warn(
        `Appending ${child} ${childId} to ${parent} ${parentId} failed because the parent didn't exist`
      );
      return;
    }

    resource[child] = resource[child] || [];

    if (!resource[child].includes(childId)) {
      resource[child].push(childId);
    }
  };
}
