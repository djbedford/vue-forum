import { createRouter, createWebHistory } from "vue-router";

import PageHome from "@/components/PageHome.vue";
import PageThreadShow from "@/components/PageThreadShow.vue";
import PageNotFound from "@/components/PageNotFound.vue";

import sourceData from "@/data.json";

const routes = [
  {
    path: "/",
    name: "Home",
    component: PageHome
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: PageThreadShow,
    props: true,
    beforeEnter(to, from, next) {
      const threadExists = sourceData.threads.find(
        thread => thread.id === to.params.id
      );

      if (!threadExists) {
        return next({
          name: "NotFound",
          params: { pathMatch: to.path.substring(1).split("/") },
          query: to.query,
          hash: to.hash
        });
      }

      return next();
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: PageNotFound
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
