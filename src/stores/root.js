import { defineStore, getActivePinia } from "pinia";
import firebase from "@/helpers/firebase";
import { findById, upsert } from "@/helpers";

export const useRootStore = defineStore("root", {
  state: () => ({
    unsubscribes: [],
  }),
  actions: {
    fetchItem({
      id,
      resource,
      resources,
      handleUnsubscribe = null,
      once = false,
      onSnapshot = null,
    }) {
      return new Promise((resolve) => {
        const unsubscribe = firebase
          .firestore()
          .collection(resource)
          .doc(id)
          .onSnapshot((doc) => {
            if (once) {
              unsubscribe();
            }

            if (doc.exists) {
              const item = {
                id: doc.id,
                ...doc.data(),
              };

              let previousItem = findById(resources, id);
              previousItem = previousItem ? { ...previousItem } : null;

              upsert(resources, item);

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
          this.appendUnsubscribe({ unsubscribe });
        }
      });
    },

    fetchItems({ ids, resource, resources, onSnapshot = null }) {
      ids = ids || [];

      return Promise.all(
        ids.map((id) => this.fetchItem({ id, resource, resources, onSnapshot }))
      );
    },

    unsubscribeAllSnapshots() {
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      this.clearAllUnsubscribes();
    },

    clearItems({ modules = [] }) {
      const pinia = getActivePinia();

      pinia._s.forEach((store, name) => {
        if (modules.includes(name)) {
          store.$reset();
        }
      });
    },

    appendUnsubscribe({ unsubscribe }) {
      this.unsubscribes.push(unsubscribe);
    },

    clearAllUnsubscribes() {
      this.$reset();
    },
  },
});
