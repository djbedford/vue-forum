import firebase from "@/helpers/firebase";
import { makeFetchItemAction, makeFetchItemsAction } from "@/helpers";

export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {},
  actions: {
    fetchAllCategories({ commit }) {
      return new Promise(resolve => {
        const unsubscribe = firebase
          .firestore()
          .collection("categories")
          .onSnapshot(querySnapshot => {
            const categories = querySnapshot.docs.map(doc => {
              const item = { id: doc.id, ...doc.data() };

              commit(
                "setItem",
                { resource: "categories", item },
                { root: true }
              );

              return item;
            });

            resolve(categories);
          });

        commit("appendUnsubscribe", { unsubscribe }, { root: true });
      });
    },
    fetchCategory: makeFetchItemAction({ resource: "categories" }),

    fetchCategories: makeFetchItemsAction({ resource: "categories" })
  },
  mutations: {}
};
