<template>
  <div class="col-full">
    <vee-form @submit="save" :key="formKey">
      <app-form-field
        as="textarea"
        rows="10"
        cols="30"
        name="text"
        v-model="postCopy.text"
        rules="required"
      />

      <div class="form-actions">
        <button type="submit" class="btn-blue">
          {{ post.id ? "Update post" : "Submit post" }}
        </button>
      </div>
    </vee-form>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      default: () => ({ text: null })
    }
  },
  data() {
    return {
      postCopy: { ...this.post },
      formKey: Math.random()
    };
  },
  methods: {
    save() {
      this.$emit("save", { post: this.postCopy });

      this.postCopy.text = "";
      this.formKey = Math.random();
    }
  }
};
</script>

<style scoped></style>
