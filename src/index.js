import Vue from 'vue';
import DrawingCanvas from "./component/DrawingCanvas";
import store from './lib/vuex';

import './style.css';

// Initialize Vue
new Vue({
  el: '#app',
  store,
  render(h) {
    return h(DrawingCanvas);
  }
});

// Handling of events on inputs
/*
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
  const selected = elementsManager.getSelectedIndex();
  elementsManager.setSelectedIndex(false);
  a.href = canvas.toDataURL("image/png");
  elementsManager.setSelectedIndex(selected);

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

/*** Canvas resizing **

// Button events
document.getElementById('zoomIn').onclick = function(e){
  e.preventDefault();
  changeZoom(true);
};

document.getElementById('zoomOut').onclick = function(e){
  e.preventDefault();
  changeZoom(false);
};
 */