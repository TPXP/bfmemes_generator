<template>
  <div id="app">
    <nav-bar />
    <div id="editor">
      <div class="spacer" />
      <drawing-canvas ref="canvas" />
      <div class="spacer" />
      <elements-list @download="download" @forceRedraw="$refs.canvas.draw()" />
    </div>
  </div>
</template>

<script>
import DrawingCanvas from "./DrawingCanvas";
import ElementsList from "./ElementsList";
import NavBar from "./NavBar";
import {downloadImage} from "@/lib/download";

export default {
  name: "App.vue",
  components: {NavBar, ElementsList, DrawingCanvas},
  methods:{
    async download() {
      const now = new Date, blob = await this.$refs.canvas?.render();
      return downloadImage(
        `bfmeme_${now.getFullYear()}${now.getMonth()+1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.png`,
        blob,
      );
    }
  }
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