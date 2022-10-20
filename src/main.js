import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import stores from "@/stores";
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
forumApp.use(stores);
forumApp.use(fontAwesome);
forumApp.use(ClickOutsideDirective);
forumApp.use(PageScrollDirective);
forumApp.use(Vue3Pagination);
forumApp.use(VeeValidatePlugin);

const modules = import.meta.glob("./components/*.vue", { eager: true });

Object.entries(modules).forEach(([path, definition]) => {
  const componentName = path
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");

  if (componentName.startsWith("App")) {
    forumApp.component(componentName, definition.default);
  }
});

forumApp.mount("#app");
