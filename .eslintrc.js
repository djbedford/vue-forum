module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
  // rules: {
  //   "no-unused-vars": import.meta.env.MODE === "production" ? "error" : "warn",
  // },
};
