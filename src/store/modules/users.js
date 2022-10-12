import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
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
    user: (state, getters, rootState) => {
      return id => {
        const user = findById(state.items, id);

        if (!user) {
          return null;
        }

        return {
          ...user,
          get posts() {
            return rootState.posts.items.filter(
              post => post.userId === user.id
            );
          },
          get postsCount() {
            return user.postsCount || 0;
          },
          get threads() {
            return rootState.threads.items.filter(
              thread => thread.userId === user.id
            );
          },
          get threadsCount() {
            return user.threads?.length || 0;
          }
        };
      };
    }
  },
  actions: {
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

      commit("setItem", { resource: "users", item: newUser }, { root: true });

      return docToResource(newUser);
    },
    async updateUser({ commit }, user) {
      const updates = {
        avatar: user.avatar || null,
        username: user.username || null,
        name: user.name || null,
        bio: user.bio || null,
        website: user.website || null,
        email: user.email || null,
        location: user.location || null
      };

      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(user.id);

      await userReference.update(updates);
      commit("setItem", { resource: "users", item: user }, { root: true });
    },
    fetchUser: makeFetchItemAction({ resource: "users" }),

    fetchUsers: makeFetchItemsAction({ resource: "users" })
  },
  mutations: {
    appendThreadToUser: makeAppendChildToParentMutation({
      parent: "users",
      child: "threads"
    })
  }
};
