<template>
  <div id="editor">
    <elements-list />
    <div class="spacer" />
    <drawing-canvas />
    <div class="spacer" />
  </div>
</template>

<script>
import DrawingCanvas from "./DrawingCanvas";
import ElementsList from "./ElementsList";
export default {
  name: "App.vue",
  components: {ElementsList, DrawingCanvas}
}
</script>

<style scoped>
#editor{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.spacer {
  flex:1;
}
</style>