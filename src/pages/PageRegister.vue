<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form @submit="register" class="card card-form">
        <h1 class="text-center">Register</h1>

        <app-form-field
          v-model="form.name"
          name="name"
          label="Name"
          rules="required"
        />

        <app-form-field
          v-model="form.username"
          name="username"
          label="Username"
          rules="required|unique:users,username"
        />

        <app-form-field
          v-model="form.email"
          name="email"
          label="Email"
          type="email"
          rules="required|email|unique:users,email"
        />

        <app-form-field
          v-model="form.password"
          name="password"
          label="Password"
          type="password"
          rules="required|min:8"
        />

        <div class="form-group">
          <label for="avatar">
            Avatar
            <div v-if="avatarPreview">
              <img :src="avatarPreview" class="avatar-xlarge" />
            </div>
          </label>
          <vee-field
            v-show="!avatarPreview"
            @change="handleImageUpload"
            id="avatar"
            name="avatar"
            type="file"
            class="form-input"
            accept="image/*"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </vee-form>
      <div class="text-center push-top">
        <button @click="registerWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useAuthStore } from "../stores/auth";

export default {
  data() {
    return {
      avatarPreview: null,
      form: {
        name: "",
        username: "",
        email: "",
        password: "",
        avatar: "",
      },
    };
  },
  methods: {
    ...mapActions(useAuthStore, [
      "registerUserWithEmailAndPassword",
      "logInWithGoogle",
    ]),
    async register() {
      await this.registerUserWithEmailAndPassword(this.form);
      this.$router.push({ name: "Home" });
    },
    async registerWithGoogle() {
      await this.logInWithGoogle();
      this.$router.push({ name: "Home" });
    },
    handleImageUpload(e) {
      this.form.avatar = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => (this.avatarPreview = event.target.result);
      reader.readAsDataURL(this.form.avatar);
    },
  },
  created() {
    this.$emit("ready");
  },
};
</script>
