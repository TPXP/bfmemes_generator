<template>
  <div id="app">
    <nav id="mainNav">
      <div class="logo">
        <h1>BFMemes Generator</h1>
        <em>Reloaded</em>
      </div>
      <div class="spacer" />
    </nav>
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
export default {
  name: "App.vue",
  components: {ElementsList, DrawingCanvas},
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
}
@media (max-width: $lineToColLayout) {
  #editor{
    flex:0;
    justify-content: flex-end;
  }
}
</style>