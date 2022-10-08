import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import firebaseConfig from "@/config/firebase";
import fontAwesome from "@/plugins/fontawesome";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    store.dispatch("fetchAuthUser");
  }
});

const forumApp = createApp(App);
forumApp.use(router);
forumApp.use(store);
forumApp.use(fontAwesome);

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
