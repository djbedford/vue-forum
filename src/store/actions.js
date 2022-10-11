import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

export default {
  fetchItem({ commit }, { id, resource, handleUnsubscribe = null }) {
    return new Promise(resolve => {
      const unsubscribe = firebase
        .firestore()
        .collection(resource)
        .doc(id)
        .onSnapshot(doc => {
          if (doc.exists) {
            const item = {
              id: doc.id,
              ...doc.data()
            };

            commit("setItem", { resource, item });

            resolve(item);
          } else {
            resolve(null);
          }
        });

      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe);
      } else {
        commit("appendUnsubscribe", { unsubscribe });
      }
    });
  },
  fetchItems: ({ dispatch }, { ids, resource }) =>
    Promise.all(ids.map(id => dispatch("fetchItem", { id, resource }))),
  unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe());
    commit("clearAllUnsubscribes");
  }
};
