import './style.css';
import {mdiArrowUpDownBold, mdiArrowLeftRightBold, mdiArrowTopLeftBottomRightBold, mdiRotateLeft} from '@mdi/js';
const canvas = document.getElementsByTagName("canvas")[0];

const MAGIC_ANGLES = [
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

class MyMath {
  // Returns the Z coordinate of AB ^ BC
  static signOfVectorProduct(a, b, c) {
    return (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
  }

  // Returns OA.OB
  static scalarProduct(o, a, b) {
    return (a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1]);
  }

  static distance (a, b) {
    return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
  }

  static isPointInTriangle(p, a, b, c) {
    // A bit of geometry
    // See https://stackoverflow.com/a/2049593/3841242
    // Compute the vector product (along Z) to know the angle. All must have the same sign
    const results = [
      this.signOfVectorProduct(a, b, p),
      this.signOfVectorProduct(b, c, p),
      this.signOfVectorProduct(c, a, p),
    ];
    const hasPos = results.reduce((a, v) => a || (v > 0), false),
      hasNeg = results.reduce((a, v) => a || (v < 0), false);
    return !(hasNeg && hasPos);
  }

  static vectorRotation(x, y, alpha) {
    // Time for some complex numbers!
    return [x * Math.cos(alpha) - y * Math.sin(alpha), x * Math.sin(alpha) + y * Math.cos(alpha)];
  }

  static findRectangleCorners(width, height, centerX, centerY, angle) {
    return [[1,1], [-1, 1], [-1, -1], [1,-1]].map(([mx, my]) =>
       this.vectorRotation( width / 2 * mx,  height / 2 * my, angle),
    ).map(([x,y]) => [centerX + x, centerY + y]);
  }
}

class ElementsManager {
  backgroundColor = '#000';
  width = 1280;
  height = 720;
  manipulatingHandle = null;
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.elements = [{
      type: 'color',
      color: '#f00',
      centerX: 100,
      centerY: 100,
      angle: Math.PI / 4,
      width:100,
      height:100,
    },{
      type: 'color',
      color: '#ff0',
      centerX: 500,
      centerY: 300,
      angle: 0,
      width:200,
      height:100,
    }];
    this.selected = 1;
    this.draw();
  }

  getElements() {
    return this.elements;
  }

  setElements(elements) {
    this.elements = elements;
  }

  setManipulatingHandle(value) {
    this.manipulatingHandle = value;
    this.draw();
  }

  getSelectedElement() {
    return this.elements?.[this.selected];
  }

  updateSelectedElement(update) {
    if(!this.elements?.[this.selected])
      return;
    this.elements[this.selected] = {...this.elements[this.selected], ...update};
    this.draw();
  }

  draw() {
    const {ctx} = this, elements = [{
      // Background
      type: 'color',
      color: this.backgroundColor,
      centerX: this.width / 2,
      centerY: this.height / 2,
      width: this.width,
      height: this.height,
      angle: 0,
    }, ...this.elements.map((v,i) => ({...v, selected: i === this.selected}))];
    // Start with the background - cover the rest
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, this.width, this.height);

    elements.forEach(({type, color, centerX, centerY, width, height, angle, asset, text, selected}) => {
      ctx.save();
      // Get to the center of the element and perform the rotation - we'll draw from here
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      if (type === 'image' && asset) {
        ctx.drawImage(asset.resource,
          /* This may change if we have cropping */ 0, 0, asset.width, asset.height, -width / 2, -height / 2, width, height);
      } else if (type === 'color' && color) {
        ctx.fillStyle = color;
        ctx.fillRect(-width / 2, -height / 2, width, height);
      } else {
        // TODO: Show a broken square
      }
      ctx.restore();
    });
    // Add the selected item handles - done afterwards so that they appear over any other element
    elements.filter(({selected}) => selected).forEach(({centerX, centerY, width, height, angle}) => {
      // For the love of maths, we'll compute the points of the rectangle ourselves
      const points = MyMath.findRectangleCorners(width, height, centerX, centerY, angle);
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
      // Add circles at every corner
      points.map(([x,y], i) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        // As you can see, drawing circles is trivial in WebCanvas /s
        ctx.fillStyle = i === this.manipulatingHandle ? '#1bb61b' : '#ff6600';
        ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2)
        ctx.fill();
        const scale = MAGIC_ANGLES[i].scale ?? 1;
        ctx.translate(-12 * scale, -12 * scale);
        ctx.scale(scale, scale)
        const path = new Path2D(MAGIC_ANGLES[i].icon);
        ctx.fillStyle = '#fff';
        ctx.fill(path);
        ctx.restore();
      });
    });
  }

  getSelectedIndex() {
    return this.selected;
  }

  setSelectedIndex(i) {
    this.selected = i;
    this.draw();
  }

  getSelectedIndexesForPosition(x,y) {
    // Find all elements matching the given coordinates - super useful in case of an overlay!
    const res = [];
    this.elements.forEach(({centerX, centerY, width, height, angle}, i) => {
      // Find the corners
      const corners = MyMath.findRectangleCorners(width, height, centerX, centerY, angle);
      if(MyMath.isPointInTriangle([x,y], corners[0], corners[1], corners[2])
        || MyMath.isPointInTriangle([x,y], corners[0], corners[3], corners[2]))
        res.push(i);
    });
    // Items drawn the later are the last of the array
    res.reverse();
    return res;
  }
}

const elementsManager = new ElementsManager(canvas);

// Handling of events on inputs
const inputs = document.getElementsByTagName('input');
for(let a=0; a<inputs.length;a++){
  const input = inputs[a];

  // For files, load the image before drawing it again
  if(input.type === 'file'){
    input.onchange = function(){
      if(input.files && input.files.length) {
        // First, read the file as a data URL
        const reader = new FileReader();
        reader.onload = function() {
          // Set it as the source of an image tag
          const imgtag = new Image();
          imgtag.onload = function(){
            // Load the image, show it full screen
            sWidth = imgtag.width;
            sHeight = imgtag.height;
            sx = sy = 0;
            dWidth = sWidth;
            dHeight = sHeight;
            angle = 0;

            // Make the image "cover" the screen
            if(dWidth / dHeight < canvas.width / canvas.height){
              // Image is larger
              dWidth = canvas.width;
              dHeight = dWidth * sHeight / sWidth;
            } else {
              dHeight = canvas.height;
              dWidth = dHeight * sWidth / sHeight;
            }

            //By default the image will be centered
            dx = (canvas.width-dWidth)/2;
            dy = (canvas.height-dHeight)/2;

            bgd = imgtag;
            reDraw();
          };
          // noinspection JSValidateTypes
          imgtag.src = this.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    };

    // In case there is already something (page refresh), load it
    input.onchange(null);
    continue;
  }

  // Text inputs don't need anything special, they're queried when drawing
  // input.oninput = reDraw;
}

// Image download
document.getElementById('download').onclick = function(e) {
  e.preventDefault();
  let a = document.createElement('a');
  a.download = 'bfmeme.png';
  a.href = canvas.toDataURL("image/png");

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Image rotation
document.getElementById('turnRight').onclick = function(e) {
  e.preventDefault();
  const elt = elementsManager.getSelectedElement();
  if(elt)
    elementsManager.updateSelectedElement({
      angle: elt.angle + Math.PI / 18,
    })
};

document.getElementById('turnLeft').onclick = function(e) {
  e.preventDefault();
  const elt = elementsManager.getSelectedElement();
  if(elt)
    elementsManager.updateSelectedElement({
      angle: elt.angle - Math.PI / 18,
    })
};

/*** Canvas resizing ***/
const canvasWrapper = document.getElementById('canvasWrapper');
let canvasWrapperBox;
let canvasScale = 1;
window.onresize = function(){
  canvasWrapperBox = canvasWrapper.getBoundingClientRect();
  canvasScale = canvasWrapperBox.width/canvas.width;
  if(canvasScale > 1)
    canvasScale = 1;
  canvas.style.transform = 'scale(' + canvasScale + ')';

  canvasWrapper.style.height = (canvasWrapperBox.width * canvas.height / canvas.width) + 'px';
  // We changed the height, and we need up-to-date coordinates to know which item to select
  canvasWrapperBox = canvasWrapper.getBoundingClientRect();
};
window.onresize(null);

/*** Zoom Handling ***/
// Last known position of the mouse/main finger
let lastX, lastY;
// Last known position of the second finger if relevant
let secondFingerX, secondFingerY;
let mouseDown = false, currentMode = null, shortIntervalAfterMouseDown = false, mouseUpAction = () => {};
const scaleFactor = 1.1;

canvasWrapper.addEventListener('mousedown', mouseDownHandler);
canvasWrapper.addEventListener('mouseup', mouseUpHandler);
canvasWrapper.addEventListener('mouseleave', mouseUpHandler);
canvasWrapper.addEventListener('mousemove', mouseMoveHandler);
canvasWrapper.addEventListener('wheel', wheelHandler, false);

canvasWrapper.addEventListener('touchend', mouseUpHandler);
canvasWrapper.addEventListener('touchcancel', mouseUpHandler);

/*
canvasWrapper.addEventListener('touchstart',function (event) {
  event.preventDefault();
  // Same processing than mouse for main finger
  mouseDownHandler(event.touches[0]);
  // Just save second finger position if we have one
  if(event.touches.length>1) {
    secondFingerX = (event.touches[1].clientX - canvasWrapperBox.left) / canvasScale;
    secondFingerY = (event.touches[1].clientY - canvasWrapperBox.top) / canvasScale;
  }
});

canvas.addEventListener('touchmove',function (event) {
  event.preventDefault();
  // Behave as a mouse if there's only one finger
  if(event.touches.length===1)
    return mouseMoveHandler(event.touches[0]);
  // Else calculate position on canvas for both
  let f1X = event.touches[0].clientX;
  let f1Y = event.touches[0].clientY;
  let f2X = event.touches[1].clientX;
  let f2Y = event.touches[1].clientY;

  //Also the distance between fingers, the last known distance and the center
  let lastDist = Math.sqrt(Math.pow(lastX - secondFingerX, 2) + Math.pow(lastY - secondFingerY, 2));
  let newDist = Math.sqrt(Math.pow(f1X - f2X, 2) + Math.pow(f1Y - f2Y, 2));

  // Safeguard to avoid zooming too fast when using 2 finger
  if((Math.min(lastDist, newDist)/Math.max(lastDist, newDist))<0.95) {
    // Compute the zoom center
    const centerX = (f1X + f2X) / 2 - canvasWrapperBox.left;
    const centerY = (f1Y + f2Y) / 2 - canvasWrapperBox.top;

    //fingers mooving away
    if (lastDist < newDist) {
      zoomIn(centerX, centerY);
    } //fingers gets closer
    else {
      zoomOut(centerX, centerY);
    }
    //Then save current position for next zoom
    lastX = f1X;
    lastY = f1Y;
    secondFingerX = f2X;
    secondFingerY = f2Y;
  }
});
 */

// Save current position when click is triggered
function mouseDownHandler(event) {
  mouseDown = true;
  lastX = event.clientX - canvasWrapperBox.left;
  lastY = event.clientY - canvasWrapperBox.top;
  // Did we click a handle?
  const element = elementsManager.getSelectedElement();
  if(element) {
    // Get the handles coordinates
    const handles = MyMath.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
    let best = null, bestScore = Math.min(); // Infinity
    handles.forEach(([x,y], i) => {
      const score = MyMath.distance([lastX / canvasScale, lastY / canvasScale], [x, y]);
      if(score > 20 || bestScore < score)
        return;
      best = i;
      bestScore = score;
    });
    if(best !== null) {
      elementsManager.setManipulatingHandle(best);
      currentMode = MAGIC_ANGLES[best].mode;
      return;
    }
  }
  const selected = elementsManager.getSelectedIndexesForPosition(lastX / canvasScale, lastY / canvasScale);
  // If we clicked on the selected item, switch to move mode immediately
  if(selected.includes(elementsManager.getSelectedIndex())) {
    currentMode = 'MOVE';
    return;
  }
  // Else, select the first item only after after some time (or on mouse leave)
  mouseUpAction = () => {
    clearInterval(shortIntervalAfterMouseDown);
    if(mouseDown)
      currentMode = 'MOVE';
    elementsManager.setSelectedIndex(selected[0] ?? false);
    shortIntervalAfterMouseDown = false;
    mouseUpAction = () => {};
  }
  shortIntervalAfterMouseDown = setTimeout(mouseUpAction, 300);
}

function mouseUpHandler() {
  mouseDown = false;
  currentMode = null;
  mouseUpAction();
  elementsManager.setManipulatingHandle(null);
}

// Update draw positions when moving mouse and then redraw
function mouseMoveHandler(event) {
  event.preventDefault();
  bypassWheelCheck = false;
  if(!mouseDown)
    return;
  let currentX = event.clientX - canvasWrapperBox.left;
  let currentY = event.clientY - canvasWrapperBox.top;
  if(shortIntervalAfterMouseDown) {
    // Hold on, you didn't wait for the element below your mouse to be selected. Are you not too far?
    if (Math.abs(currentX - lastX) < 20 && Math.abs(currentY - lastY))
      return;
    else { // You're too far, let's avoid confusing you
      clearInterval(shortIntervalAfterMouseDown);
      shortIntervalAfterMouseDown = false;
      mouseUpAction = () => {};
    }
  }
  const element = elementsManager.getSelectedElement();
  if (!element) // Null or undefined if no items are selected
    return;
  let a,b, height, width;
  switch(currentMode) {
    case 'MOVE':
      // Move the image
      elementsManager.updateSelectedElement({
        centerX: element.centerX + (currentX - lastX) / canvasScale,
        centerY: element.centerY + (currentY - lastY) / canvasScale,
      });
      break;
    case 'RESIZE_X':
      // We need to work on the inclined line
      [,,a,b] = MyMath.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
      width = Math.max(10, MyMath.scalarProduct(a, b, [currentX / canvasScale, currentY / canvasScale])
        / MyMath.distance(a, b));
      elementsManager.updateSelectedElement({
        width,
      });
      break;
    case 'RESIZE_Y':
      [,b,a] = MyMath.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
      height = Math.max(10, MyMath.scalarProduct(a, b, [currentX / canvasScale, currentY / canvasScale])
        / MyMath.distance(a, b));
      elementsManager.updateSelectedElement({
        height,
      });
      break;
    case 'RESIZE_XY':
      [b,,a] = MyMath.findRectangleCorners(element.width, element.height, element.centerX, element.centerY, element.angle);
      const rectangleDiagonal = MyMath.distance(a, b)
      const diagonal = Math.max(10, MyMath.scalarProduct(a, b, [currentX / canvasScale, currentY / canvasScale])
        / rectangleDiagonal);
      elementsManager.updateSelectedElement({
        height: diagonal / rectangleDiagonal * element.height,
        width: diagonal / rectangleDiagonal * element.width,
      });
      break;
  }

  // Save the position
  lastX = currentX;
  lastY = currentY;
}

let bypassWheelCheck = false;

function wheelHandler(event){
  event.preventDefault();
  let currentX = (event.clientX - canvasWrapperBox.left) / canvasScale;
  let currentY = (event.clientY - canvasWrapperBox.top) / canvasScale;
  // Make sure we're hover the selected item
  if(!bypassWheelCheck && !elementsManager.getSelectedIndexesForPosition(currentX, currentY).includes(elementsManager.getSelectedIndex()))
    return;

  // I often use the wrong direction and end up with a tiny element, so here's a forgiving approach : we'll stop this on mouse move
  bypassWheelCheck = true;

  // Update the element zoom factor
  changeZoom(event.deltaY < 0);
}

function changeZoom(zoomIn /* else, zoom out */){
  // Get the current dimensions
  const element = elementsManager.getSelectedElement();
  if(!element)
    return;
  const factor = zoomIn ? scaleFactor : 1/scaleFactor;
  elementsManager.updateSelectedElement({
    width: element.width * factor,
    height: element.height * factor,
  });
}

// Button events
document.getElementById('zoomIn').onclick = function(e){
  e.preventDefault();
  changeZoom(true);
};

document.getElementById('zoomOut').onclick = function(e){
  e.preventDefault();
  changeZoom(false);
};