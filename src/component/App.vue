<template>
  <div id="app">
    <nav-bar />
    <div id="editor">
      <div class="spacer" />
      <drawing-canvas ref="canvas" />
      <div class="spacer" />
      <elements-list @forceRedraw="$refs.canvas.draw()">
        <slot name="listBottom">
          <div class="downloadRow">
            <a class="button large secondary" @click="download">
              <span class="material-icons">cloud_download</span>
              Télécharger
            </a>
            <a class="button primary" @click="beginResize">
              <span class="material-icons">crop</span>
              Redimensionner
            </a>
          </div>
        </slot>
      </elements-list>
    </div>
    <image-resizer v-if="resizeData" @done="resizeComplete" :image="resizeData.image"
                   :can-crop="true" :can-expand="true" />
  </div>
</template>

<script>
import DrawingCanvas from "./DrawingCanvas";
import ElementsList from "./ElementsList";
import NavBar from "./NavBar";
import {downloadImage, readBlobAsDataURL} from "@/lib/download";
import ImageResizer from "@/component/ImageResizer";

export default {
  name: "App.vue",
  components: {ImageResizer, NavBar, ElementsList, DrawingCanvas},
  data() { return {
    resizeData: null,
  } },
  methods:{
    async download() {
      const now = new Date, blob = await this.$refs.canvas?.render();
      return downloadImage(
        `bfmeme_${now.getFullYear()}${now.getMonth()+1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.png`,
        blob,
      );
    },
    async beginResize() {
      // Put the canvas blob in an image source, and pass the whole data to the resize object
      const image = new Image();
      image.onload = () => this.resizeData = {
        image,
      };
      image.src = await this.$refs.canvas?.render().then(r => readBlobAsDataURL(r));
    },
    async resizeComplete(data) {

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