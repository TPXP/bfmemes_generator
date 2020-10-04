<template>
  <div class="preview" :style="`background-image: url(${resource.src})`" v-once ref="image" />
</template>

<script>
// This is a high-performance wrapper over the image preview component since we manipulate very long strings (Base64 src)
// Basically, we avoid setting the style attribute at every render
export default {
  name: "CenteredImagePreview",
  props: ['resource'],
  watch:{
    resource() {
      // Update the background image manually since we've told Vue not to handle this with v-once
      // @see https://vuejs.org/v2/guide/components-edge-cases.html#Cheap-Static-Components-with-v-once
      this.$refs.image.style = `background-image: url(${this.resource.src})`;
    }
  }
}
</script>

<style scoped>
.preview {
  border:1px solid #000;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
}
</style>