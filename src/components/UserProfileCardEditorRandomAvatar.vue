<template>
  <div class="text-center" style="margin-bottom: 15px;">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
      Random Avatar
    </button>
  </div>
  <br />
  <small style="opacity: 0.5;"
    >Powered by <a href="https://pixabay.com">Pixabay</a></small
  >
</template>

<script>
import { arrayRandom } from "@/helpers";

export default {
  methods: {
    async getRandomImage() {
      const searchTerms = ["red", "wildlife", "nature", "flowers", "blue"];
      const randomWord = arrayRandom(searchTerms);
      const response = await fetch(
        `https://pixabay.com/api/?key=30557779-e6cf14e321029f739d58f35d0&q=${randomWord}`
      );
      const data = await response.json();
      const randomImage = arrayRandom(data.hits);

      this.$emit("hit", randomImage.webformatURL);
    }
  }
};
</script>
