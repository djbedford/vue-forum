import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import firebaseConfig from "@/config/firebase";
import fontAwesome from "@/plugins/fontawesome";
import ClickOutsideDirective from "@/plugins/ClickOutsideDirective";
import PageScrollDirective from "@/plugins/PageScrollDirective";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const forumApp = createApp(App);
forumApp.use(router);
forumApp.use(store);
forumApp.use(fontAwesome);
forumApp.use(ClickOutsideDirective);
forumApp.use(PageScrollDirective);

const requireComponent = require.context(
  "./components",
  true,
  /App[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach(function(fileName) {
  let baseComponentConfig = requireComponent(fileName);
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig;

  const baseComponentName =
    baseComponentConfig.name ||
    fileName.replace(/^.+\//, "").replace(/\.\w+$/, "");

  forumApp.component(baseComponentName, baseComponentConfig);
});

forumApp.mount("#app");
