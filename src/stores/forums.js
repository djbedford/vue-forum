import { defineStore } from "pinia";
import { useRootStore } from "./root";
import { findById } from "@/helpers";

export const useForumsStore = defineStore("forums", {
  state: () => ({
    forums: [],
  }),
  actions: {
    fetchForum({ id }) {
      const rootStore = useRootStore();
      return rootStore.fetchItem({
        id,
        resource: "forums",
        resources: this.forums,
      });
    },

    fetchForums({ ids }) {
      const rootStore = useRootStore();
      return rootStore.fetchItems({
        ids,
        resource: "forums",
        resources: this.forums,
      });
    },

    appendThreadToForum({ childId, parentId }) {
      const resource = findById(this.forums, parentId);

      if (!resource) {
        console.warn(
          `Appending thread ${childId} to forum ${parentId} failed because the parent didn't exist`
        );

        return;
      }

      resource["threads"] = resource["threads"] || [];

      if (!this.forums.includes(childId)) {
        resource["threads"].push(childId);
      }
    },
  },
});
