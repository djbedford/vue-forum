import { createRouter, createWebHistory } from "vue-router";

import PageHome from "@/components/PageHome.vue";
import PageThreadShow from "@/components/PageThreadShow.vue";

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
    props: true
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
