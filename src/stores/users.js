import { defineStore } from "pinia";
import { usePostsStore } from "./posts";
import { useRootStore } from "./root";
import { useThreadsStore } from "./threads";
import firebase from "@/helpers/firebase";
import { findById, docToResource, upsert } from "@/helpers";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
  }),
  getters: {
    user: (state) => {
      return (id) => {
        const user = findById(state.users, id);

        if (!user) {
          return null;
        }

        const postsStore = usePostsStore();

        return {
          ...user,
          get posts() {
            return postsStore.posts.filter((post) => post.userId === user.id);
          },
          get postsCount() {
            return user.postsCount || 0;
          },
          get threads() {
            const threadsStore = useThreadsStore();

            return threadsStore.threads.filter(
              (thread) => thread.userId === user.id
            );
          },
          get threadIds() {
            return user.threads;
          },
          get threadsCount() {
            return user.threads?.length || 0;
          },
        };
      };
    },
  },
  actions: {
    async createUser({ id, name, username, email, avatar = null }) {
      const registeredAt = firebase.firestore.FieldValue.serverTimestamp();
      const usernameLower = username.toLowerCase();
      email = email.toLowerCase();

      const user = {
        name,
        username,
        email,
        avatar,
        registeredAt,
        usernameLower,
      };
      const userReference = firebase.firestore().collection("users").doc(id);

      userReference.set(user);

      const newUser = await userReference.get();

      upsert(this.users, { id: newUser.id, ...newUser.data() });
    },

    async updateUser(user) {
      const updates = {
        avatar: user.avatar || null,
        username: user.username || null,
        name: user.name || null,
        bio: user.bio || null,
        website: user.website || null,
        email: user.email || null,
        location: user.location || null,
      };

      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(user.id);

      await userReference.update(updates);
      upsert(this.users, user);
    },

    fetchUser({ id }) {
      const rootStore = useRootStore();
      return rootStore.fetchItem({
        id,
        resource: "users",
        resources: this.users,
      });
    },

    fetchUsers({ ids }) {
      const rootStore = useRootStore();
      return rootStore.fetchItems({
        ids,
        resource: "users",
        resources: this.users,
      });
    },

    appendThreadToUser({ childId, parentId }) {
      const resource = findById(this.users, parentId);

      if (!resource) {
        console.warn(
          `Appending thread ${childId} to user ${parentId} failed because the parent didn't exist`
        );
        return;
      }

      resource["threads"] = resource["threads"] || [];

      if (!resource["threads"].includes(childId)) {
        resource["threads"].push(childId);
      }
    },
  },
});
