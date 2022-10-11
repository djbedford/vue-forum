import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

export default {
  namespaced: true,
  state: {
    authId: "",
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null
  },
  getters: {
    authUser: (state, getters, rootState, rootGetters) => {
      return rootGetters["users/user"](state.authId);
    }
  },
  actions: {
    initAuthentication({ dispatch, commit, state }) {
      if (state.authObserverUnsubscribe) {
        state.authObserverUnsubscribe();
      }

      return new Promise(resolve => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
          dispatch("unsubscribeAuthUserSnapshot");

          if (user) {
            await dispatch("fetchAuthUser");
            resolve(user);
          } else {
            resolve(null);
          }
        });

        commit("setAuthObserverUnsubscribe", unsubscribe);
      });
    },
    logInWithEmailAndPassword(context, { email, password }) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    },
    async logInWithGoogle({ dispatch }) {
      const provider = new firebase.auth.GoogleAuthProvider();
      const response = await firebase.auth().signInWithPopup(provider);
      const user = response.user;
      const userReference = firebase
        .firestore()
        .collection("users")
        .doc(user.uid);
      const userDocument = await userReference.get();

      if (!userDocument.exists) {
        return dispatch(
          "users/createUser",
          {
            id: user.uid,
            name: user.displayName,
            username: user.email,
            email: user.email,
            avatar: user.photoURL
          },
          { root: true }
        );
      }
    },
    async logOut({ commit }) {
      await firebase.auth().signOut();
      commit("setAuthId", null);
    },
    async registerUserWithEmailAndPassword(
      { dispatch },
      { name, username, email, password, avatar = null }
    ) {
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      await dispatch(
        "users/createUser",
        {
          id: result.user.uid,
          name,
          username,
          email,
          avatar
        },
        { root: true }
      );
    },

    fetchAuthUser: async ({ dispatch, commit }) => {
      const userId = firebase.auth().currentUser?.uid;

      if (!userId) {
        return;
      }

      await dispatch(
        "fetchItem",
        {
          id: userId,
          resource: "users",
          handleUnsubscribe: unsubscribe => {
            commit("setAuthUserUnsubscribe", unsubscribe);
          }
        },
        { root: true }
      );
      commit("setAuthId", userId);
    },

    async fetchAuthUserPosts({ state, commit }, { startAfter }) {
      let query = firebase
        .firestore()
        .collection("posts")
        .where("userId", "==", state.authId)
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

      posts.forEach(item => {
        commit("setItem", { resource: "posts", item }, { root: true });
      });
    },
    async unsubscribeAuthUserSnapshot({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe();
        commit("setAuthUserUnsubscribe", null);
      }
    }
  },
  mutations: {
    setAuthId(state, id) {
      state.authId = id;
    },
    setAuthUserUnsubscribe(state, unsubscribe) {
      state.authUserUnsubscribe = unsubscribe;
    },
    setAuthObserverUnsubscribe(state, unsubscribe) {
      state.authObserverUnsubscribe = unsubscribe;
    }
  }
};
