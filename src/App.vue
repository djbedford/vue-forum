<template>
  <the-navbar />
  <div class="container">
    <router-view
      v-show="showPage"
      @ready="onPageReady"
      :key="`${$route.path}${JSON.stringify($route.query)}`"
    />
    <app-spinner v-show="!showPage" />
  </div>
  <app-notifications />
</template>

<script>
import { mapActions } from "vuex";
import NProgress from "nprogress";
import TheNavbar from "@/components/TheNavbar.vue";
import AppNotifications from "@/components/AppNotifications.vue";

export default {
  name: "App",
  components: {
    TheNavbar,
    AppNotifications,
  },
  data() {
    return {
      showPage: false,
    };
  },
  methods: {
    ...mapActions("auth", ["fetchAuthUser"]),
    onPageReady() {
      this.showPage = true;
      NProgress.done();
    },
  },
  created() {
    this.fetchAuthUser();

    NProgress.configure({
      speed: 200,
      showSpinner: false,
    });

    this.$router.beforeEach(() => {
      this.showPage = false;
      NProgress.start();
    });
  },
};
</script>

<style>
@import "nprogress/nprogress.css";
@import "assets/styles/main.css";

#nprogress .bar {
  background-color: #57ad8d;
}
</style>
