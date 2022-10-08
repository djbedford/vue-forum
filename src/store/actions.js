import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
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
  async updatePost({ commit, state }, { text, id }) {
    const post = {
      text,
      edited: {
        at: firebase.firestore.FieldValue.serverTimestamp(),
        by: state.authId,
        moderated: false
      }
    };
    const postReference = firebase
      .firestore()
      .collection("posts")
      .doc(id);

    await postReference.update(post);

    const updatedPost = postReference.get();

    commit("setItem", { resource: "posts", item: updatedPost });
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
  async registerUserWithEmailAndPassword(
    { dispatch },
    { name, username, email, password, avatar = null }
  ) {
    const result = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    await dispatch("createUser", {
      id: result.user.uid,
      name,
      username,
      email,
      avatar
    });
  },
  async createUser({ commit }, { id, name, username, email, avatar = null }) {
    const registeredAt = firebase.firestore.FieldValue.serverTimestamp();
    const usernameLower = username.toLowerCase();
    email = email.toLowerCase();

    const user = {
      name,
      username,
      email,
      avatar,
      registeredAt,
      usernameLower
    };
    const userReference = firebase
      .firestore()
      .collection("users")
      .doc(id);

    userReference.set(user);

    const newUser = await userReference.get();

    commit("setItem", { resource: "users", item: newUser });

    return docToResource(newUser);
  },
  updateUser({ commit }, user) {
    commit("setItem", { resource: "users", item: user });
  },
  fetchAllCategories({ commit }) {
    return new Promise(resolve => {
      const unsubscribe = firebase
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

      commit("appendUnsubscribe", { unsubscribe });
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

  fetchAuthUser: ({ dispatch, commit }) => {
    const userId = firebase.auth().currentUser?.uid;

    if (!userId) {
      return;
    }

    dispatch("fetchUser", { id: userId });
    commit("setAuthId", userId);
  },

  fetchItem({ commit }, { id, resource }) {
    return new Promise(resolve => {
      const unsubscribe = firebase
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

      commit("appendUnsubscribe", { unsubscribe });
    });
  },
  fetchItems: ({ dispatch }, { ids, resource }) =>
    Promise.all(ids.map(id => dispatch("fetchItem", { id, resource }))),
  unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe());
    commit("clearAllUnsubscribes");
  }
};
