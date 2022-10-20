import { defineStore } from "pinia";
import { usePostsStore } from "./posts";
import { useRootStore } from "./root";
import { useUsersStore } from "./users";
import firebase from "@/helpers/firebase";
import { upsert } from "@/helpers";
import useNotifications from "@/composables/useNotifications";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authId: "",
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null,
  }),
  getters: {
    authUser: (state) => {
      const usersStore = useUsersStore();
      return usersStore.user(state.authId);
    },
  },
  actions: {
    initAuthentication() {
      if (this.authObserverUnsubscribe) {
        this.authObserverUnsubscribe();
      }

      return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          this.unsubscribeAuthUserSnapshot();

          if (user) {
            await this.fetchAuthUser();
            resolve(user);
          } else {
            resolve(null);
          }
        });

        this.setAuthObserverUnsubscribe(unsubscribe);
      });
    },

    logInWithEmailAndPassword({ email, password }) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    },

    async logInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      const response = await firebase.auth().signInWithPopup(provider);
      const user = response.user;
      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(user.uid);
      const userDocument = await userReference.get();

      if (!userDocument.exists) {
        const usersStore = useUsersStore();
        return usersStore.createUser({
          id: user.uid,
          name: user.displayName,
          username: user.email,
          email: user.email,
          avatar: user.photoURL,
        });
      }
    },

    async logOut() {
      await firebase.auth().signOut();
      this.setAuthId(null);
    },

    async registerUserWithEmailAndPassword({
      name,
      username,
      email,
      password,
      avatar = null,
    }) {
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      avatar = await this.uploadAvatar({
        authId: result.user.uid,
        file: avatar,
      });

      const usersStore = useUsersStore();
      await usersStore.createUser({
        id: result.user.uid,
        name,
        username,
        email,
        avatar,
      });
    },

    async updateEmail({ email }) {
      firebase.auth().currentUser.updateEmail(email);
    },

    async reauthenticate({ email, password }) {
      const credential = firebase.auth.EmailAuthProvider.credential(
        email,
        password
      );

      await firebase
        .auth()
        .currentUser.reauthenticateWithCredential(credential);
    },

    async uploadAvatar({ authId, file, filename }) {
      if (!file) {
        return null;
      }

      authId = authId || this.authId;
      filename = filename || file.name;

      try {
        const storageBucket = firebase
          .storage()
          .ref()
          .child(`uploads/${authId}/images/${Date.now()}-${filename}`);
        const snapshot = await storageBucket.put(file);
        const url = await snapshot.ref.getDownloadURL();

        return url;
      } catch (error) {
        const { addNotification } = useNotifications();
        addNotification({
          message: "Error uploading avatar.",
          type: "error",
          timeout: 3000,
        });
      }
    },

    async fetchAuthUser() {
      const userId = firebase.auth().currentUser?.uid;

      if (!userId) {
        return;
      }

      const rootStore = useRootStore();
      const usersStore = useUsersStore();
      await rootStore.fetchItem({
        id: userId,
        resource: "users",
        resources: usersStore.users,
        handleUnsubscribe: (unsubscribe) => {
          this.setAuthUserUnsubscribe(unsubscribe);
        },
      });

      this.setAuthId(userId);
    },

    async fetchAuthUserPosts({ startAfter }) {
      let query = firebase
        .firestore()
        .collection("posts")
        .where("userId", "==", this.authId)
        .orderBy("publishedAt", "desc")
        .limit(10);

      if (startAfter) {
        const doc = await firebase
          .firestore()
          .collection("posts")
          .doc(startAfter.id)
          .get();

        query = query.startAfter(doc);
      }

      const posts = await query.get();
      const postsStore = usePostsStore();

      posts.forEach((item) => {
        upsert(postsStore.posts, item);
      });
    },

    async unsubscribeAuthUserSnapshot() {
      if (this.authUserUnsubscribe) {
        this.authUserUnsubscribe();
        this.setAuthUserUnsubscribe(null);
      }
    },

    setAuthId(id) {
      this.authId = id;
    },

    setAuthUserUnsubscribe(unsubscribe) {
      this.authUserUnsubscribe = unsubscribe;
    },

    setAuthObserverUnsubscribe(unsubscribe) {
      this.authObserverUnsubscribe = unsubscribe;
    },
  },
});
