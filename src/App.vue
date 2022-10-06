<template>
  <the-navbar />
  <div class="container">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import TheNavbar from "@/components/TheNavbar.vue";

export default {
  name: "App",
  components: {
    TheNavbar
  },
  methods: {
    ...mapActions(["fetchAuthUser"])
  },
  created() {
    this.fetchAuthUser();
  }
};
</script>

<style>
@import "assets/styles/main.css";
</style>
