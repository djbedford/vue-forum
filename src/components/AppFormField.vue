<template>
  <div class="form-group">
    <label :for="name">{{ label }}</label>
    <vee-field
      :modelValue="modelValue"
      :id="name"
      :name="name"
      :label="label"
      class="form-input"
      v-bind="$attrs"
      @input="$emit('modelUpdate', $event)"
    />
    <vee-error-message :name="name" class="form-error" />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    name: { required: true, type: String },
    label: { required: true, type: String },
    modelValue: { type: String, default: "" }
  }
};
</script>
