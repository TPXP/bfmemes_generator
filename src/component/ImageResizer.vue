<template>
  <modal visible>
    <template v-slot:title>
      Recadrer l'image
    </template>
    <canvas :width="canvasWidth" :height="canvasHeight" ref="canvas"
      @mousedown.prevent='mousedown($event)'
      @mousemove.prevent='mousemove($event)'
      @mouseleave.prevent='mouseup($event)'
      @mouseup.prevent='mouseup($event)' />
    <a class="btn large" @click="confirm">Terminé</a>
  </modal>
</template>

<script>
import Modal from "@/component/Modal";

// Double ternary time. I'm not sorry
function limitToInterval(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export default {
  name: "ImageResizer",
  components: {Modal},
  props:{
    image: Image,
    canExpand: Boolean,
    canCrop: Boolean,
  },
  data({image}) { return {
    // Those values indicate the cropped proportion of the image - from border to image center
    // Negative values imply a larger image
    x:-30,
    y:30,
    width:image.width,
    height:image.height,
    tX: 0,
    tY: 0,
    tWidth: 0,
    tHeight: 0,
    editArea: null, // from 0 to 9, depending on the edited rectangle area (each area corresponds to a 3x3 subdivision of the current rectangle)
    editCanvasWidth: null,
    // Last edit positions - we update the values from the last one every time
    lastX: null,
    lastY: null,
  } },
  computed:{
    canvasWidth() {
      return Math.max(this.image.width, this.width) * (1 + !!this.canExpand);
    },
    canvasHeight() {
      return Math.max(this.image.height, this.height) * (1 + !!this.canExpand);
    },
    // Where should the image be put ? It would be in the middle, except if we already expanded it
    imgX() {
      return Math.max(0, -this.x) + (this.canvasWidth - this.image.width) / 2;
    },
    imgY() {
      return Math.max(0, -this.y) + (this.canvasHeight - this.image.height) / 2;
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
          this.imgX,
          this.imgY,
          this.image.width, this.image.height);

      ctx.globalAlpha = 1;
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height, // Crop the image - TODO handle negative margins, even though the canvas engine seems to hangle them for us nicely
          // Put it in the middle of the canvas
          this.imgX + this.x,
          this.imgY + this.y,
          this.width, this.height);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#fff'; // FIXME dashed
      ctx.strokeRect(this.imgX + this.x + this.tX, this.imgY + this.y + this.tY, this.width + this.tWidth, this.height + this.tHeight);
      if(this.editArea !== null) {
        const lX = (this.editArea % 3) / 3 * this.width, lY = Math.floor(this.editArea / 3) / 3 * this.height;
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.imgX + this.x + lX, this.imgY + this.y + lY, this.width / 3, this.height / 3);
      }
    },
    mousedown(e) {
      this.editing = true;
      this.canvasBounds = e.target.getBoundingClientRect()
      const {clientX, clientY} = e, {width, height, top, left} = this.canvasBounds;
      
      // Update last known positions
      this.lastX = (clientX - left) / width * this.canvasWidth;
      this.lastY = (clientY - top) / height * this.canvasHeight;
      
      // Compute the position compared to the upper left corner of the rectangle, the find in which area we are
      const dX = this.lastX - (this.imgX + this.x),
        dY = this.lastY - (this.imgY + this.y),
        rDX = dX / this.width, rDY = dY / this.height;
      this.editArea = limitToInterval(Math.floor(rDX * 3), 0, 2) + 3 * limitToInterval(Math.floor(rDY * 3), 0, 2);
      this.draw();
    },
    mousemove(e) {
      if(this.editArea === null)
        return;
      // Scale the positions
      const {clientX, clientY} = e, {width, height, top, left} = this.canvasBounds,
        posX = (clientX - left) / width * this.canvasWidth, posY = (clientY - top) / height * this.canvasHeight;
      // PERF : You can avoid a division above by caching the scale factors, but do we _really_ need this?
      const dX = posX - this.lastX, dY = posY - this.lastY;
      this.lastX = posX; this.lastY = posY;
      // Now, update the temp values (that's the kinda hard part - but not too much don't worry)
      switch (this.editArea) {
        // This code has some repetitions. There may be a better way, but it's all I could find in flight from Paris to Nice
        // Feel free to refactor this though, but it's not worth the hassle in my opinion
        case 0:
          this.tX += dX;
          this.tWidth -= dX;
          this.tY += dY;
          this.tHeight -= dY;
          break;
        case 1:
          this.tY += dY;
          this.tHeight -= dY;
          break;
        case 2:
          this.tWidth += dX;
          this.tY += dY;
          this.tHeight -= dY;
          break;
        case 3:
          this.tX += dX;
          this.tWidth -= dX;
          break;
        case 4:
          this.tX += dX;
          this.tY += dY;
          break;
        case 5:
          this.tWidth += dX;
          break;
        case 6:
          this.tX += dX;
          this.tWidth -= dX;
          this.tHeight += dY;
          break;
        case 7:
          this.tHeight += dY;
          break;
        case 8:
          this.tWidth += dX;
          this.tHeight += dY;
          break;
      }
      this.draw();
    },
    mouseup() {
      this.editArea = null;
      // Update the final X, Y, width, height - and redraw all this
      this.x += this.tX; this.y += this.tY;
      this.width += this.tWidth; this.height += this.tHeight;
      this.tX = 0; this.tY = 0;
      this.tWidth = 0; this.tHeight = 0;
      this.draw();

      // NOTE: we might need a hook since canvasWidth and canvasHeight will be updated
      setTimeout(() => this.draw(), 0);
    }
  },
  mounted() {
    this.draw();
  },
}
</script>

<style scoped lang="scss">
  canvas {
    max-width: 100%;
    max-height: 100%;
    background:red;
  }
</style>