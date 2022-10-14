import {
  makeAppendChildToParentMutation,
  makeFetchItemAction,
  makeFetchItemsAction
} from "@/helpers";

export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {},
  actions: {
    fetchForum: makeFetchItemAction({ resource: "forums" }),

    fetchForums: makeFetchItemsAction({ resource: "forums" })
  },
  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({
      parent: "forums",
      child: "threads"
    })
  }
};
