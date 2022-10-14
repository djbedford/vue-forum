import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import ThreadCreate from "@/pages/ThreadCreate.vue";
import ThreadShow from "@/pages/ThreadShow.vue";
import ThreadEdit from "@/pages/ThreadEdit.vue";
import NotFound from "@/pages/NotFound.vue";
import Forum from "@/pages/Forum.vue";
import Category from "@/pages/Category.vue";
import Profile from "@/pages/Profile.vue";
import Register from "@/pages/Register.vue";
import LogIn from "@/pages/LogIn.vue";
import { findById } from "@/helpers";
import store from "@/store";

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
      smoothScroll: true,
      requiresAuth: true
    }
  },
  {
    path: "/me/edit",
    name: "ProfileEdit",
    component: Profile,
    props: {
      edit: true
    },
    meta: {
      requiresAuth: true
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
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/thread/:id",
    name: "ThreadShow",
    component: ThreadShow,
    props: true,
    async beforeEnter(to, from, next) {
      await store.dispatch("threads/fetchThread", {
        id: to.params.id,
        once: true
      });
      const threadExists = findById(store.state.threads.items, to.params.id);

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
    path: "/thread/:id/edit",
    name: "ThreadEdit",
    component: ThreadEdit,
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: "/login",
    name: "LogIn",
    component: LogIn,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: "/logout",
    name: "LogOut",
    async beforeEnter() {
      await store.dispatch("auth/logOut");

      return { name: "Home" };
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound
  }
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
  }
});

router.beforeEach(async to => {
  await store.dispatch("auth/initAuthentication");
  store.dispatch("unsubscribeAllSnapshots");

  if (to.meta.requiresAuth && !store.state.auth.authId) {
    return {
      name: "LogIn",
      query: { redirectTo: to.path }
    };
  }

  if (to.meta.requiresGuest && store.state.auth.authId) {
    return { name: "Home" };
  }
});

router.afterEach(() => {
  store.dispatch("clearItems", {
    modules: ["categories", "forums", "threads", "posts"]
  });
});

export default router;
