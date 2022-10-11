import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

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
    fetchCategory: ({ dispatch }, { id }) =>
      dispatch("fetchItem", { id, resource: "categories" }, { root: true }),

    fetchCategories: ({ dispatch }, { ids }) =>
      dispatch("fetchItems", { ids, resource: "categories" }, { root: true })
  },
  mutations: {}
};
