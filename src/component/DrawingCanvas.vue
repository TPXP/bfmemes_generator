<template>
  <div class="canvasWrapper" ref="wrapper" :style="`height:${wrapperHeight}px`"
       @mousedown.prevent="onMouseDown"
       @mousemove.prevent="onMouseMove"
       @mouseleave.prev="onMouseUp"
       @mouseup.prevent="onMouseUp"
       @wheel.prevent="onWheel"
       @touchstart.prevent="onTouchStart"
       @touchmove.prevent="onTouchMove"
       @touchend.prevent="onMouseUp"
       @touchcancel.prevent="onMouseUp">
    <canvas ref="canvas" :width="width" :height="height" :style="`transform:scale(${scale})`"/>
  </div>
</template>

<script>
import {mdiArrowLeftRightBold, mdiArrowTopLeftBottomRightBold, mdiArrowUpDownBold, mdiRotateLeft} from "@mdi/js";
import * as Geometry from "../lib/geometry";
import {mapState} from 'vuex';
import {fitTextInRectangle} from "../lib/geometry";

const ZOOM_FACTOR = 1.1, SCALE_ONLY_ONE_SIDE = true,
    MAGIC_ANGLES = true, MAGIC_ANGLES_PER_CIRCLE = 8, MAGIC_ANGLES_TOLERANCE = Math.PI / (MAGIC_ANGLES_PER_CIRCLE * 3);

const MAGIC_CORNERS = [
  { // Bottom right
    icon: mdiArrowTopLeftBottomRightBold,
    mode: 'RESIZE_XY',
    scale: 0.8,
  },
  { // Bottom left
    icon: mdiArrowUpDownBold,
    mode: 'RESIZE_Y',
  },
  { // Top left
    icon: mdiRotateLeft,
    mode: 'ROTATE',
  },
  { // Top Right
    icon: mdiArrowLeftRightBold,
    mode: 'RESIZE_X',
  },
];

export default {
  name: "DrawingCanvas",
  data: () => ({
    width: 1280,
    height: 720,
    backgroundColor: '#000',
    wrapperBox: {},
    scale: 1,
    wrapperHeight:720,
    touchAngleDelta:0,
    currentMode: null,
    shortIntervalAfterMouseDown: null, // Small delay, triggered on mouse down, used to select an item by holding a click
    mouseUpAction: () => {}, // Action to perform on mouse up
    mouseDown: false, // Shall we follow the mouse mouvement and update the data accordingly?
    bypassWheelCheck: false, // Was there a move since the last wheel event ? (to allow scrolls in reverse if mistaken)
    // Last mouse or 1st finger coordinates
    lastX: null,
    lastY: null,
    // Last 2nd finger coordinates
    secondFingerX: null,
    secondFingerY: null,
  }),
  methods: {
    draw() {
      const ctx = this.$refs.canvas?.getContext?.('2d');
      if(!ctx)
        return;
      const elements = [{
        // Background
        type: 'color',
        backgroundColor: this.backgroundColor,
        centerX: this.width / 2,
        centerY: this.height / 2,
        width: this.width,
        height: this.height,
        angle: 0,
      }, ...this.$store.state.elements];

      // Start with the background
      elements.forEach(({centerX, centerY, width, height, angle, image, text, backgroundColor}) => {
        ctx.save();
        // Get to the center of the element and perform the rotation - we'll draw from here
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(-width / 2, -height / 2, width, height);
        }
        if (image?.resource) {
          ctx.drawImage(image.resource,
              /* This may change if we have cropping */ 0, 0,
              image.width, image.height, -width / 2, -height / 2, width, height);
        }
        if (text?.value) {
          // How does the text fit in the square?
          const {color = '#F60', value, maxSize = 1000, fontFamily, strokeSize, strokeColor, fontWeight, lineHeight} = text;
          ctx.fillStyle = color;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeSize;
          const {lines, fontSize} = fitTextInRectangle(ctx, maxSize, value, width, height, fontFamily, lineHeight, fontWeight);
          lines.forEach((line, i) => {
            const x = - width / 2, y = fontSize * (1.2*i+1) - height / 2;
            if(strokeSize)
              ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
          });
        }
        ctx.restore();
      });
      // Add the selected item handles - done afterwards so that they appear over any other element
      const selectedElement = this.$store.state.elements[this.$store.state.selectedElement];
      if(!selectedElement)
        return;
      const {centerX, centerY, width, height, angle} = selectedElement;
      // For the love of maths, we'll compute the points of the rectangle ourselves
      const points = Geometry.findRectangleCorners(width, height, centerX, centerY, angle);
      ctx.beginPath();
      ctx.moveTo(points[3][0], points[3][1]);
      for(let i = 0; i<=3; i++)
        ctx.lineTo(points[i][0], points[i][1]);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([20, 20]);
      ctx.strokeStyle = '#000';
      ctx.stroke();
      ctx.setLineDash([]);
      // Add circles at every corner
      points.map(([x,y], i) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        // As you can see, drawing circles is trivial in WebCanvas /s
        ctx.fillStyle = i === this.$store.state.selectedCorner ? '#1bb61b' : '#ff6600';
        ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2)
        ctx.fill();
        const scale = MAGIC_CORNERS[i].scale ?? 1;
        ctx.translate(-12 * scale, -12 * scale);
        ctx.scale(scale, scale)
        const path = new Path2D(MAGIC_CORNERS[i].icon);
        ctx.fillStyle = '#fff';
        ctx.fill(path);
        ctx.restore();
      });
    },
    getSelectedIndexesForPosition(x,y) {
      // Find all elements matching the given coordinates - super useful in case of an overlay!
      const res = [];
      this.$store.state.elements.forEach(({centerX, centerY, width, height, angle}, i) => {
        // Find the corners
        const corners = Geometry.findRectangleCorners(width, height, centerX, centerY, angle);
        if(Geometry.isPointInTriangle([x,y], corners[0], corners[1], corners[2])
            || Geometry.isPointInTriangle([x,y], corners[0], corners[3], corners[2]))
          res.push(i);
      });
      // Items drawn the later are the last of the array
      res.reverse();
      return res;
    },
    onResize(){
      const canvasWrapper = this.$refs.wrapper, canvas = this.$refs.canvas;
      if(!canvasWrapper || !canvas)
        return;
      this.wrapperBox = canvasWrapper.getBoundingClientRect();
      this.scale = this.wrapperBox.width/this.width;
      if(this.scale > 1)
        this.scale = 1;

      this.wrapperHeight = this.wrapperBox.width * canvas.height / canvas.width;
      // We changed the height, and we need up-to-date coordinates to know which item to select
      setTimeout(() => this.wrapperBox = canvasWrapper.getBoundingClientRect(), 0);
    },
    onMouseDown(event){
      this.mouseDown = true;
      this.lastX = event.clientX - this.wrapperBox.left;
      this.lastY = event.clientY - this.wrapperBox.top;
      // Did we click a handle?
      const element = this.$store.state.elements[this.$store.state.selectedElement];
      if(element) {
        // Get the handles coordinates
        const handles = Geometry.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
        let best = null, bestScore = Math.min(); // Infinity
        handles.forEach(([x,y], i) => {
          const score = Geometry.distance([this.lastX / this.scale, this.lastY / this.scale], [x, y]);
          if(score > 20 || bestScore < score)
            return;
          best = i;
          bestScore = score;
        });
        if(best !== null) {
          this.$store.commit('setSelectedCorner', best)
          this.currentMode = MAGIC_CORNERS[best].mode;
          return;
        }
      }
      const selected = this.getSelectedIndexesForPosition(this.lastX / this.scale, this.lastY / this.scale);
      // If we clicked on the selected item, switch to move mode immediately
      if(selected.includes(this.$store.state.selectedElement)) {
        this.currentMode = 'MOVE';
        return;
      }
      // Else, select the first item only after after some time (or on mouse leave)
      this.mouseUpAction = () => {
        clearInterval(this.shortIntervalAfterMouseDown);
        if(this.mouseDown)
          this.currentMode = 'MOVE';
        this.$store.commit('setSelectedElement', selected[0] ?? null);
        this.shortIntervalAfterMouseDown = false;
        this.mouseUpAction = () => {};
      }
      this.shortIntervalAfterMouseDown = setTimeout(this.mouseUpAction, 300);
    },
    onMouseUp() {
      this.mouseDown = false;
      this.currentMode = null;
      this.mouseUpAction();
      this.selectedForTouch = false;
      this.touchAngleDelta = 0;
      this.$store.commit('setSelectedCorner', null);
    },
    onMouseMove(event){
      this.bypassWheelCheck = false;
      if(!this.mouseDown)
        return;
      let currentX = event.clientX - this.wrapperBox.left;
      let currentY = event.clientY - this.wrapperBox.top;
      if(this.shortIntervalAfterMouseDown) {
        // Hold on, you didn't wait for the element below your mouse to be selected. Are you not too far?
        if (Math.abs(currentX - this.lastX) < 20 && Math.abs(currentY - this.lastY) < 20)
          return;
        // You're too far, let's avoid confusing you
        clearInterval(this.shortIntervalAfterMouseDown);
        this.shortIntervalAfterMouseDown = false;
        this.mouseUpAction = () => {};
      }
      const element = this.$store.state.elements[this.$store.state.selectedElement];
      if (!element) // Null or undefined if no items are selected
        return;
      let a,b, height, width;
      switch(this.currentMode) {
        case 'MOVE':
          // Move the image
          // When putting 2 fingers simultaneously, we might get a report with the first finger then the second one, before they're uniformized. Let's avoid huge moves
          if(Geometry.distance([currentX, currentY], [this.lastX, this.lastY]) > 100 && this.selectedForTouch)
            break;
          this.$store.commit('updateSelectedElement', {
            centerX: element.centerX + (currentX - this.lastX) / this.scale,
            centerY: element.centerY + (currentY - this.lastY) / this.scale,
          });
          break;
        case 'RESIZE_X':
          // We need to work on the inclined line
          [,,a,b] = Geometry.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
          width = Math.max(10, Geometry.scalarProduct(a, b, [currentX / this.scale, currentY / this.scale])
              / Geometry.distance(a, b));
          this.$store.commit('updateSelectedElement', {
            width,
            centerX: element.centerX + (width - element.width) / 2 * SCALE_ONLY_ONE_SIDE * Math.cos(element.angle),
            centerY: element.centerY + (width - element.width) / 2 * SCALE_ONLY_ONE_SIDE * Math.sin(element.angle),
          });
          break;
        case 'RESIZE_Y':
          [,b,a] = Geometry.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
          height = Math.max(10, Geometry.scalarProduct(a, b, [currentX / this.scale, currentY / this.scale])
              / Geometry.distance(a, b));
          this.$store.commit('updateSelectedElement', {
            height,
            centerX: element.centerX - (height - element.height) / 2 * SCALE_ONLY_ONE_SIDE * Math.sin(element.angle),
            centerY: element.centerY + (height - element.height) / 2 * SCALE_ONLY_ONE_SIDE * Math.cos(element.angle),
          });
          break;
        case 'RESIZE_XY':
          [b,,a] = Geometry.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
          const rectangleDiagonal = Geometry.distance(a, b)
          const diagonal = Math.max(10, Geometry.scalarProduct(a, b, [currentX / this.scale, currentY / this.scale])
              / rectangleDiagonal);
          height = diagonal / rectangleDiagonal * element.height;
          width = diagonal / rectangleDiagonal * element.width;
          this.$store.commit('updateSelectedElement', {
            height,
            width,
            centerX: element.centerX
                + (width - element.width) / 2 * SCALE_ONLY_ONE_SIDE * Math.cos(element.angle)
                - (height - element.height) / 2 * SCALE_ONLY_ONE_SIDE * Math.sin(element.angle),
            centerY: element.centerY
                + (width - element.width) / 2 * SCALE_ONLY_ONE_SIDE * Math.sin(element.angle)
                + (height - element.height) / 2 * SCALE_ONLY_ONE_SIDE * Math.cos(element.angle),
          });
          break;
        case 'ROTATE':
          // Find the position from the center
          a = currentX / this.scale - element.centerX;
          b = currentY / this.scale - element.centerY;
          let angle = Geometry.getVectorAngleFromXAxis(currentX / this.scale - element.centerX,
              currentY / this.scale - element.centerY);
          // Now, adapt this since we're dragging from the upper left corner
          angle += Math.PI - Math.atan(element.height / (element.width || 1));
          if(MAGIC_ANGLES)
            angle = Geometry.tryMatchingMagicAngle(angle, MAGIC_ANGLES_PER_CIRCLE, MAGIC_ANGLES_TOLERANCE);
          this.$store.commit('updateSelectedElement', {
            angle,
          });
          break;
      }

      // Save the position
      this.lastX = currentX;
      this.lastY = currentY;
    },
    onWheel(event){
      let currentX = (event.clientX - this.wrapperBox.left) / this.scale;
      let currentY = (event.clientY - this.wrapperBox.top) / this.scale;
      // Make sure we're hover the selected item
      if(!this.bypassWheelCheck && !this.getSelectedIndexesForPosition(currentX, currentY).includes(this.$store.state.selectedElement))
        return;

      // I often use the wrong direction and end up with a tiny element, so here's a forgiving approach : we'll stop this on mouse move
      this.bypassWheelCheck = true;

      // Update the element zoom factor
      this.$store.commit(`zoomSelectedElement`, event.deltaY < 0 ? ZOOM_FACTOR : 1/ZOOM_FACTOR);
    },
    onTouchStart(event){
      this.selectedForTouch = this.$store.state.selectedElement;
      // Same processing than mouse for main finger
      this.onMouseDown(event.touches[0]);
      // Just save second finger position if we have one
      if(event.touches.length > 1) {
        this.secondFingerX = event.touches[1].clientX - this.wrapperBox.left;
        this.secondFingerY = event.touches[1].clientY - this.wrapperBox.top;
      }
    },
    onTouchMove(event) {
      // Behave as a mouse if there's only one finger
      if (event.touches.length === 1)
        return this.onMouseMove(event.touches[0]);
      // Two fingers ? We're manipulating the initially selected item then
      this.$store.commit('setSelectedElement', this.selectedForTouch);
      // Else calculate position on canvas for both
      const f1X = event.touches[0].clientX - this.wrapperBox.left,
          f1Y = event.touches[0].clientY - this.wrapperBox.top,
          f2X = event.touches[1].clientX - this.wrapperBox.left,
          f2Y = event.touches[1].clientY - this.wrapperBox.top;

      // Get the distance difference to know by how much we need to zoom
      const lastDist = Geometry.distance([this.lastX, this.lastY], [this.secondFingerX, this.secondFingerY]),
          newDist = Geometry.distance([f1X, f1Y], [f2X, f2Y]),
          lastAngle = Geometry.getVectorAngleFromXAxis(this.secondFingerX - this.lastX, this.secondFingerY - this.lastY),
          newAngle = Geometry.getVectorAngleFromXAxis(f2X - f1X, f2Y - f1Y);

      // Save the current position for the next iteration
      this.lastX = f1X;
      this.lastY = f1Y;
      this.secondFingerX = f2X;
      this.secondFingerY = f2Y;

      // Update the element
      const element = this.$store.state.elements[this.selectedForTouch];
      if (!element)
        return;
      if (newDist === 0 || lastDist === 0) // Sometimes, things go wrong
        return;
      let angle = element.angle + newAngle - lastAngle;
      if (MAGIC_ANGLES) {
        const initial = angle;
        angle = Geometry.tryMatchingMagicAngle(angle + this.touchAngleDelta);
        this.touchAngleDelta += initial - angle;
      }
      this.$store.commit('updateSelectedElement', {
        width: element.width * newDist / lastDist,
        height: element.height * newDist / lastDist,
        angle,
      });
    }
  },
  mounted() {
    this.onResize();
    this.draw();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  computed: mapState(['elements', 'selectedElement', 'selectedCorner']),
  watch:{
    elements(){
      this.draw();
    },
    selectedElement(){
      this.draw();
    },
    selectedCorner(){
      this.draw();
    },
  }
}
</script>

<style scoped>
.canvasWrapper{
  flex: 90;
  overflow: hidden;
  max-width: 1280px;
  min-width: 300px;
  align-self: center;
  margin:10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
}
canvas {
  transform-origin: top left;
}
</style>