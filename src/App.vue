<template>
  <the-navbar />
  <div class="container">
    <router-view v-show="showPage" @ready="onPageReady" :key="$route.path" />
    <app-spinner v-show="!showPage" />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import NProgress from "nprogress";
import TheNavbar from "@/components/TheNavbar.vue";

export default {
  name: "App",
  components: {
    TheNavbar
  },
  data() {
    return {
      showPage: false
    };
  },
  methods: {
    ...mapActions(["fetchAuthUser"]),
    onPageReady() {
      this.showPage = true;
      NProgress.done();
    }
  },
  created() {
    this.fetchAuthUser();

    NProgress.configure({
      speed: 200,
      showSpinner: false
    });

    this.$router.beforeEach(() => {
      this.showPage = false;
      NProgress.start();
    });
  }
};
</script>

<style>
@import "~nprogress/nprogress.css";
@import "assets/styles/main.css";

#nprogress .bar {
  background-color: #57ad8d;
}
</style>
