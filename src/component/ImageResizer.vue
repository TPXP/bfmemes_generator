<template>
  <modal visible>
    <slot name="title">
      <h1>Recadrer l'image</h1>
    </slot>
    <canvas :width="canvasWidth" :height="canvasHeight" ref="canvas" />
    <a class="btn large" @click="confirm">Terminé</a>
  </modal>
</template>

<script>
import Modal from "@/component/Modal";
export default {
  name: "ImageResizer",
  components: {Modal},
  props:{
    image: Image,
    canExpand: Boolean,
    canCrop: Boolean,
  },
  data() { return {
    // Those values indicate the cropped proportion of the image - from border to image center
    // Negative values imply a larger image
    top:30,
    left:30,
    right:0,
    bottom:0,
    // Note to self: would switching to x,y,width,height (canvas drawImage style) simplify the computations?
  } },
  computed:{
    canvasWidth() {
      return (this.image.width - Math.min(0, this.left + this.right)) * (1 + !!this.canExpand);
    },
    canvasHeight() {
      return (this.image.height - Math.min(0, this.top + this.bottom)) * (1 + !!this.canExpand);
    },
  },
  methods: {
    confirm() {
      this.$emit('done', {
        test: true, // TODO
      })
    },
    draw() {
      const ctx = this.$refs.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      // Put the image in the middle, half-transparent first (So we can see what we cropped)
      // FIXME Handle negative crop offsets properly, centering stuff is not enough
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.image,
          // Put it in the middle of the canvas
          (this.canvasWidth - this.image.width) / 2,
          (this.canvasHeight - this.image.height) / 2,
          this.image.width, this.image.height);

      ctx.globalAlpha = 1;
      const width = this.image.width - (this.left + this.right), height = this.image.height - (this.top + this.bottom)
      ctx.drawImage(this.image, this.left, this.top, width, height, // Crop the image
          // Put it in the middle of the canvas
          (this.canvasWidth - this.image.width) / 2 + this.left,
          (this.canvasHeight - this.image.height) / 2 + this.top,
          width, height);
    },
  },
  mounted() {
    this.draw();
  },
}
</script>

<style scoped>
  canvas {
    max-width: 100%;
    max-height: 100%;
    background:red;
  }
</style>