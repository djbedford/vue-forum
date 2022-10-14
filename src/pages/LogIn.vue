<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form @submit="logIn" class="card card-form">
        <h1 class="text-center">Login</h1>

        <app-form-field
          v-model="form.email"
          name="email"
          label="Email"
          type="email"
          rules="required|email"
        />

        <app-form-field
          v-model="form.password"
          name="password"
          label="Password"
          type="password"
          rules="required"
        />

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{ name: 'Register' }"
            >Create an account?</router-link
          >
        </div>
      </vee-form>

      <div class="push-top text-center">
        <button @click="logInWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: "",
        password: ""
      }
    };
  },
  methods: {
    async logIn() {
      try {
        await this.$store.dispatch("auth/logInWithEmailAndPassword", {
          ...this.form
        });
        this.successRedirect();
      } catch (error) {
        alert(error.message);
      }
    },
    async logInWithGoogle() {
      await this.$store.dispatch("auth/logInWithGoogle");
      this.successRedirect();
    },
    successRedirect() {
      const redirectTo = this.$route.query.redirectTo || { name: "Home" };
      this.$router.push(redirectTo);
    }
  },
  created() {
    this.$emit("ready");
  }
};
</script>
