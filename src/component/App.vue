<template>
  <div id="app">
    <nav-bar />
    <div id="editor">
      <div class="spacer" />
      <drawing-canvas ref="canvas" />
      <div class="spacer" />
      <elements-list @download="$refs.canvas.download()" @forceRedraw="$refs.canvas.draw()"/>
    </div>
  </div>
</template>

<script>
import DrawingCanvas from "./DrawingCanvas";
import ElementsList from "./ElementsList";
import NavBar from "./NavBar";

export default {
  name: "App.vue",
  components: {NavBar, ElementsList, DrawingCanvas},
}
</script>

<style scoped lang="scss">
@import "../scss/variables";
#editor{
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex:1;
  overflow: hidden;
}
@media (max-width: $lineToColLayout) {
  #editor{
    flex:0;
    justify-content: flex-end;
    overflow: visible;
  }
}
</style>