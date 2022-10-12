import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { findById } from "@/helpers";

export default {
  fetchItem(
    { commit, state },
    { id, resource, handleUnsubscribe = null, once = false, onSnapshot = null }
  ) {
    return new Promise(resolve => {
      const unsubscribe = firebase
        .firestore()
        .collection(resource)
        .doc(id)
        .onSnapshot(doc => {
          if (once) {
            unsubscribe();
          }

          if (doc.exists) {
            const item = {
              id: doc.id,
              ...doc.data()
            };

            let previousItem = findById(state[resource].items, id);
            previousItem = previousItem ? { ...previousItem } : null;

            commit("setItem", { resource, item });

            if (typeof onSnapshot === "function") {
              const isLocal = doc.metadata.hasPendingWrites;

              onSnapshot({ item: { ...item }, previousItem, isLocal });
            }

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
  fetchItems: ({ dispatch }, { ids, resource, onSnapshot = null }) =>
    Promise.all(
      ids.map(id => dispatch("fetchItem", { id, resource, onSnapshot }))
    ),
  unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe());
    commit("clearAllUnsubscribes");
  }
};
