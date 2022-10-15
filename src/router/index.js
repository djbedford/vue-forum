import { createRouter, createWebHistory } from "vue-router";
import { findById } from "@/helpers";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/PageHome.vue"),
  },
  {
    path: "/me",
    name: "Profile",
    component: () => import("@/pages/PageProfile.vue"),
    meta: {
      toTop: true,
      smoothScroll: true,
      requiresAuth: true,
    },
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    component: () => import("@/pages/PageProfile.vue"),
    props: {
      edit: true,
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/category/:id",
    name: "Category",
    component: () => import("@/pages/PageCategory.vue"),
    props: true,
  },
  {
    path: "/forum/:id",
    name: "Forum",
    component: () => import("@/pages/PageForum.vue"),
    props: true,
  },
  {
    path: "/forum/:id/thread/create",
    name: "ThreadCreate",
    component: () => import("@/pages/PageThreadCreate.vue"),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: () => import("@/pages/PageThreadShow.vue"),
    props: true,
    async beforeEnter(to, from, next) {
      await store.dispatch("threads/fetchThread", {
        id: to.params.id,
        once: true,
      });
      const threadExists = findById(store.state.threads.items, to.params.id);

      if (!threadExists) {
        return next({
          name: "NotFound",
          params: { pathMatch: to.path.substring(1).split("/") },
          query: to.query,
          hash: to.hash,
        });
      }

      return next();
    },
  },
  {
    path: "/thread/:id/edit",
    name: "ThreadEdit",
    component: () => import("@/pages/PageThreadEdit.vue"),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/pages/PageRegister.vue"),
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/login",
    name: "LogIn",
    component: () => import("@/pages/PageLogIn.vue"),
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/logout",
    name: "LogOut",
    async beforeEnter() {
      await store.dispatch("auth/logOut");

      return { name: "Home" };
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/PageNotFound.vue"),
  },
];

const router = createRouter({
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
  },
});

router.beforeEach(async (to) => {
  await store.dispatch("auth/initAuthentication");
  store.dispatch("unsubscribeAllSnapshots");

  if (to.meta.requiresAuth && !store.state.auth.authId) {
    return {
      name: "LogIn",
      query: { redirectTo: to.path },
    };
  }

  if (to.meta.requiresGuest && store.state.auth.authId) {
    return { name: "Home" };
  }
});

router.afterEach(() => {
  store.dispatch("clearItems", {
    modules: ["categories", "forums", "threads", "posts"],
  });
});

export default router;
