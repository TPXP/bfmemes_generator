import './style.css';

const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext('2d');
let imageLogo = null;
let imageAlerte = null;
let bgd = null;
let sx, sy, dx, dy;
let sWidth, sHeight, dWidth, dHeight;
let angle = 0;

// Redraw the canvas image
function reDraw() {
  ctx.fillStyle='#000';
  ctx.fillRect(0,0, 1280, 720);

  if(bgd) {
    ctx.save();
    ctx.translate(dx+dWidth/2,dy+dHeight/2);
    ctx.rotate(angle*Math.PI/180);
    ctx.drawImage(bgd, sx, sy, sWidth, sHeight, -dWidth/2, -dHeight/2, dWidth, dHeight);
    ctx.restore();
  }

  /* Bottom Ribbon: 100px */
  ctx.fillStyle = '#F0EFEE';
  ctx.fillRect(0, 595, 1280, 100);

  /* Top Ribbon: 100px */
  let gradient = ctx.createLinearGradient(0, 469, 0, 582);
  gradient.addColorStop(0,"#1B296F");
  gradient.addColorStop(1,"#2C4190");
  ctx.fillStyle = gradient;
  ctx.fillRect(230, 469, 1280, 113);

  /*** DIRECT and time in upper left corner***/
  ctx.fillRect(0, 25, 290, 50);

  // The orange square between direct and time
  ctx.fillStyle = '#e88c17';
  ctx.fillRect(125, 45, 12, 12);

  // The "DIRECT" text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';

  ctx.fillText('DIRECT', 150, 62, 130);

  // Time
  ctx.textAlign = 'right';

  let time = new Date();
  let hour = '' + time.getMinutes();
  if(hour.length < 2)
    hour = 0 + hour;
  hour = time.getHours() + ':' + hour;

  ctx.fillText(hour, 112, 62, 100);

  ctx.textAlign = 'left';


  // Headline
  let headLineText = document.getElementById('headline').value;
  const headline = document.getElementById('upperCase').checked? headLineText.toUpperCase():headLineText;
  if(headline) {
    ctx.font = 'condensed bold 60px sans-serif';
    if(document.getElementById('fit-head').checked)
      ctx.fillText(headline, 250, 548, 1010);
    else
      ctx.fillText(headline, 250, 548);
  }

  // Subtitle (bottom ribbon)
  const subtitle = document.getElementById('subtitle').value;
  if(subtitle) {
    ctx.fillStyle = '#000';
    ctx.font = 'condensed 30px sans-serif';
    if(document.getElementById('fit-sub').checked)
      ctx.fillText(subtitle, 240, 660, 1030);
    else
      ctx.fillText(subtitle, 240, 660);
  }

  // "Alerte Info"
  if(imageAlerte)
    ctx.drawImage(imageAlerte, 75, 595);

  // BFMemes Logo
  if(imageLogo)
    ctx.drawImage(imageLogo, 73, 450);
}

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
  input.oninput = reDraw;
}

// In case there is already something in the text fields, redraw the image
reDraw();

// Load images for "Alerte Info"...
const imgTagAlerte = new Image();
imgTagAlerte.onload = function(){
  imageAlerte = imgTagAlerte;
  reDraw();
};
imgTagAlerte.src = require('./alerteInfo.jpeg?size=150').src;

// ... and the BFMemes logo
const imgTagLogo = new Image();
imgTagLogo.onload = function(){
  imageLogo = imgTagLogo;
  reDraw();
};
imgTagLogo.src = require('./bfmemes.png?size=150').src;

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
  angle+=10;
  reDraw();
};

document.getElementById('turnLeft').onclick = function(e) {
  e.preventDefault();
  angle-=10;
  reDraw();
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
};
window.onresize(null);

/*** Zoom Handling ***/
  // Last known position of the mouse/main finger
let lastX, lastY;
// Last known position of the second finger if relevant
let secondFingerX, secondFingerY;
let mouseDown = false;
const scaleFactor = 1.1;

canvasWrapper.addEventListener('mousedown', mouseDownHandler);
canvasWrapper.addEventListener('mouseup', mouseUpHandler);
canvasWrapper.addEventListener('mouseleave', mouseUpHandler);
canvasWrapper.addEventListener('mousemove', mouseMoveHandler);
canvasWrapper.addEventListener('wheel', wheelHandler, false);

canvasWrapper.addEventListener('touchend', mouseUpHandler);
canvasWrapper.addEventListener('touchcancel', mouseUpHandler);

canvasWrapper.addEventListener('touchstart',function (event) {
  // Same processing than mouse for main finger
  mouseDownHandler(event.touches[0]);
  // Just save second finger position if used
  if(event.touches.length>1) {
    secondFingerX = event.touches[1].clientX;
    secondFingerY = event.touches[1].clientY;
  }
  // Use preventDefault everytime handling canvas event for mobile
  event.preventDefault();
});

canvas.addEventListener('touchmove',function (event) {
  //Use finger as mouse when their is only one
  if(event.touches.length===1)
    mouseMoveHandler(event.touches[0]);
  else {
    //Else calculate position on canvas for both
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
  }
  event.preventDefault();
});

// Save current position when click is triggered
function mouseDownHandler(event) {
  lastX = event.clientX;
  lastY = event.clientY;
  mouseDown = true;
}

function mouseUpHandler() {
  mouseDown = false;
}

// Update draw positions when moving mouse and then redraw
function mouseMoveHandler(event) {
  if(mouseDown) {
    let currentX = event.clientX;
    let currentY = event.clientY;
    // Move the image
    dx += (currentX - lastX)/canvasScale;
    dy += (currentY - lastY)/canvasScale;

    // Save the position
    lastX = currentX;
    lastY = currentY;
    reDraw();
  }
}

function wheelHandler(event){
  event.preventDefault();
  let currentX = Math.floor(event.clientX - canvasWrapperBox.left);
  let currentY = Math.floor(event.clientY - canvasWrapperBox.top);
  //Zoom in
  if(event.deltaY<0)
    zoomIn(currentX, currentY);

  //Zoom out
  if(event.deltaY>0)
    zoomOut(currentX, currentY);
}

function zoomIn(x, y, noScaling) {
  if(!noScaling) {
    x /= canvasScale;
    y /= canvasScale;
  }
  dx = x - (x - dx) * scaleFactor;
  dy = y - (y - dy) * scaleFactor;
  dHeight *= scaleFactor;
  dWidth *= scaleFactor;

  reDraw();
}

function zoomOut(x, y, noScaling) {
  if(!noScaling) {
    x /= canvasScale;
    y /= canvasScale;
  }
  dx = x - (x - dx)/scaleFactor;
  dy = y - (y - dy)/scaleFactor;
  dHeight /= scaleFactor;
  dWidth /= scaleFactor;

  reDraw();
}

// Button events
document.getElementById('zoomIn').onclick = function(e){
  e.preventDefault();
  return bgd && zoomIn(dx + dWidth / 2, dy + dHeight / 2, true);
};

document.getElementById('zoomOut').onclick = function(e){
  e.preventDefault();
  return bgd && zoomOut(dx + dWidth / 2, dy + dHeight / 2, true);
};