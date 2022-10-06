import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import ThreadCreate from "@/pages/ThreadCreate.vue";
import ThreadShow from "@/pages/ThreadShow.vue";
import ThreadEdit from "@/pages/ThreadEdit.vue";
import NotFound from "@/pages/NotFound.vue";
import Forum from "@/pages/Forum.vue";
import Category from "@/pages/Category.vue";
import Profile from "@/pages/Profile.vue";

import sourceData from "@/data.json";
import { findById } from "@/helpers";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/me",
    name: "Profile",
    component: Profile,
    meta: {
      toTop: true,
      smoothScroll: true
    }
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    component: Profile,
    props: {
      edit: true
    }
  },
  {
    path: "/category/:id",
    name: "Category",
    component: Category,
    props: true
  },
  {
    path: "/forum/:id",
    name: "Forum",
    component: Forum,
    props: true
  },
  {
    path: "/forum/:id/thread/create",
    name: "ThreadCreate",
    component: ThreadCreate,
    props: true
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: ThreadShow,
    props: true
    // beforeEnter(to, from, next) {
    //   const threadExists = findById(sourceData.threads, to.params.id);

    //   if (!threadExists) {
    //     return next({
    //       name: "NotFound",
    //       params: { pathMatch: to.path.substring(1).split("/") },
    //       query: to.query,
    //       hash: to.hash
    //     });
    //   }

    //   return next();
    // }
  },
  {
    path: "/thread/:id/edit",
    name: "ThreadEdit",
    component: ThreadEdit,
    props: true
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    const scroll = {};

    if (to.meta.toTop) {
      scroll.top = 0;
    }

    if (to.meta.smoothScroll) {
      scroll.behavior = "smooth";
    }

    return scroll;
  }
});
