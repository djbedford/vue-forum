import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import firebase from "@/helpers/firebase";
import firebaseConfig from "@/config/firebase";
import fontAwesome from "@/plugins/fontawesome";
import ClickOutsideDirective from "@/plugins/ClickOutsideDirective";
import PageScrollDirective from "@/plugins/PageScrollDirective";
import Vue3Pagination from "@/plugins/vue3pagination";
import VeeValidatePlugin from "@/plugins/VeeValidatePlugin";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const forumApp = createApp(App);
forumApp.use(router);
forumApp.use(store);
forumApp.use(fontAwesome);
forumApp.use(ClickOutsideDirective);
forumApp.use(PageScrollDirective);
forumApp.use(Vue3Pagination);
forumApp.use(VeeValidatePlugin);

const modules = import.meta.glob("./components/*.vue");

for (const path in modules) {
  const componentName = path
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");

  if (componentName.startsWith("App")) {
    modules[path]().then((module) => {
      const componentConfig = module.default || module;

      forumApp.component(componentName, componentConfig);
    });
  }
}

forumApp.mount("#app");
