<template>
  <header
    class="header"
    id="header"
    v-click-outside="() => (mobileNavMenu = false)"
    v-page-scroll="() => (mobileNavMenu = false)"
  >
    <router-link :to="{ name: 'Home' }" class="logo">
      <img src="../assets/images/svg/vueschool-logo.svg" />
    </router-link>

    <div class="btn-hamburger" @click="mobileNavMenu = !mobileNavMenu">
      <div class="top bar"></div>
      <div class="middle bar"></div>
      <div class="bottom bar"></div>
    </div>
    <nav class="navbar" :class="{ 'navbar-open': mobileNavMenu }">
      <ul>
        <li v-if="authUser" class="navbar-user">
          <a
            @click.prevent="userDropdownOpen = !userDropdownOpen"
            v-click-outside="() => (userDropdownOpen = false)"
          >
            <app-avatar-img
              class="avatar-small"
              :src="authUser.avatar"
              :alt="`${authUser.name} profile picture`"
            />
            <span>
              {{ authUser.name }}
              <img
                class="icon-profile"
                src="../assets/images/svg/arrow-profile.svg"
                alt=""
              />
            </span>
          </a>

          <div id="user-dropdown" :class="{ 'active-drop': userDropdownOpen }">
            <div class="triangle-drop"></div>
            <ul class="dropdown-menu">
              <li class="dropdown-menu-item">
                <router-link :to="{ name: 'Profile' }"
                  >View profile</router-link
                >
              </li>
              <li class="dropdown-menu-item">
                <a @click.prevent="logOut(), $router.push({ name: 'Home' })"
                  >Log Out</a
                >
              </li>
            </ul>
          </div>
        </li>

        <li v-if="!authUser" class="navbar-item">
          <router-link :to="{ name: 'LogIn' }">Log In</router-link>
        </li>
        <li v-if="!authUser" class="navbar-item">
          <router-link :to="{ name: 'Register' }">Register</router-link>
        </li>
        <li v-if="authUser" class="navbar-item mobile-only">
          <router-link :to="{ name: 'Profile' }">My Profile</router-link>
        </li>
        <li v-if="authUser" class="navbar-item mobile-only">
          <a @click.prevent="logOut(), $router.push({ name: 'Home' })"
            >Log Out</a
          >
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useAuthStore } from "../stores/auth";

export default {
  data() {
    return {
      userDropdownOpen: false,
      mobileNavMenu: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authUser"]),
  },
  methods: {
    ...mapActions(useAuthStore, ["logOut"]),
  },
  created() {
    this.$router.beforeEach(() => {
      this.mobileNavMenu = false;
    });
  },
};
</script>
