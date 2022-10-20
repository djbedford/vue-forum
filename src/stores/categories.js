import { defineStore } from "pinia";
import { useRootStore } from "./root";
import firebase from "@/helpers/firebase";
import { upsert } from "@/helpers";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [],
  }),
  actions: {
    fetchCategory({ id }) {
      const rootStore = useRootStore();
      return rootStore.fetchItem({
        id,
        resource: "categories",
        resources: this.categories,
      });
    },

    fetchCategories({ ids }) {
      const rootStore = useRootStore();
      return rootStore.fetchItems({
        ids,
        resource: "categories",
        resources: this.categories,
      });
    },

    fetchAllCategories() {
      return new Promise((resolve) => {
        const unsubscribe = firebase
          .firestore()
          .collection("categories")
          .onSnapshot((querySnapshot) => {
            const categories = querySnapshot.docs.map((doc) => {
              const item = { id: doc.id, ...doc.data() };

              upsert(this.categories, item);

              return item;
            });

            resolve(categories);
          });

        const rootStore = useRootStore();
        rootStore.appendUnsubscribe({ unsubscribe });
      });
    },
  },
});
