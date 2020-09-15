<template>
  <div id="app">
    <nav id="mainNav">
      <div class="logo">
        <h1>BFMemes Generator</h1>
        <em>Reloaded</em>
      </div>
      <div class="spacer" />
      <a class="button secondary" @click="$refs.canvas.download()">
        <span class="material-icons">cloud_download</span>
        Télécharger
      </a>
    </nav>
    <div id="editor">
      <elements-list />
      <div class="spacer" />
      <drawing-canvas ref="canvas" />
      <div class="spacer" />
    </div>
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

<style scoped lang="scss">
#editor{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  flex:1;
}
</style>