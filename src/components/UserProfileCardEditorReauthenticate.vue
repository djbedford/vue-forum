<template>
  <vue-final-modal
    v-model="showModal"
    classes="modal-container"
    content-class="modal"
  >
    <div class="modal-content">
      <h4>Log in again to change your email</h4>
      <vee-form @submit="reauthenticate">
        <app-form-field
          name="reauth-email"
          label="Email"
          v-model="email"
          rules="email"
        />
        <app-form-field
          name="reauth-password"
          label="Password"
          v-model="password"
          type="password"
          rules="required"
        />
        <button class="btn btn-green btn-small">Log In</button>
      </vee-form>
    </div>
  </vue-final-modal>
</template>

<script>
import { VueFinalModal } from "vue-final-modal";

export default {
  components: {
    VueFinalModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      email: "",
      password: ""
    };
  },
  computed: {
    showModal: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      }
    }
  },
  methods: {
    async reauthenticate() {
      try {
        await this.$store.dispatch("auth/reauthenticate", {
          email: this.email,
          password: this.password
        });

        this.$emit("success");
      } catch (error) {
        this.$emit("fail", error);
      }
    }
  }
};
</script>
