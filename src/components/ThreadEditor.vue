<template>
  <vee-form @submit="save">
    <app-form-field
      v-model="form.title"
      name="title"
      label="Title"
      rules="required"
    />

    <app-form-field
      as="textarea"
      rows="8"
      cols="140"
      v-model="form.text"
      name="content"
      label="Content"
      rules="required"
    />

    <div class="btn-group">
      <button
        @click.prevent="$emit('cancel')"
        type="reset"
        class="btn btn-ghost"
      >
        Cancel
      </button>
      <button class="btn btn-blue" type="submit" name="Publish">
        {{ existing ? "Update" : "Publish" }}
      </button>
    </div>
  </vee-form>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      form: {
        title: this.title,
        text: this.text,
      },
    };
  },
  computed: {
    existing() {
      return !!this.title;
    },
  },
  methods: {
    save() {
      this.$emit("clean");
      this.$emit("save", { ...this.form });
    },
  },
  watch: {
    form: {
      handler() {
        if (this.form.title !== this.title || this.form.text !== this.text) {
          this.$emit("dirty");
        } else {
          this.$emit("clean");
        }
      },
      deep: true,
    },
  },
};
</script>
