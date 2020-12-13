import Vue from 'vue';
import Vuex from 'vuex';
import BFMemesTVPNG from '../assets/images/bfmemestv.png?size=130';
import {MODE_ADVANCED, MODE_EXPERT, MODE_EXPRESS, MODES} from "./constants";

Vue.use(Vuex);

const now = new Date;
let time = now.getMinutes().toString();
if(time.length < 2)
  time = '0' + time;
time = now.getHours() + '.' + time;
if(time.length < 4)
  time = '0' + time;
const store = new Vuex.Store({
  state: {
    count: 0,
    elements: [{
      name: "Image de fond",
      height: 720,
      width: 1280,
      centerX: 640,
      centerY: 360,
      angle: 0,
      image: {},
      holdsSelectedUntilMode: MODE_EXPRESS,
    }, {
      name: "Bandeau blanc",
      backgroundColors: ['#fff'],
      centerX: 640,
      centerY: 670,
      angle:0,
      width:1280,
      height:100,
      requiresMode: MODE_EXPERT,
    }, {
      name: "Bandeau bleu",
      backgroundColors: ['#0423fa', '#000052'],
      centerX: 560,
      centerY: 585,
      angle: 0,
      width:990,
      height:70,
      requiresMode: MODE_EXPERT,
    }, {
      name: "Logo BFMemesTV",
      centerX: 80,
      centerY: 75,
      width: 130,
      height: 82,
      angle: 0,
      image:{
        src: BFMemesTVPNG.src,
      },
      requiresMode: MODE_EXPERT,
    }, {
      name: "Bandeau en haut à gauche",
      centerX: 235,
      centerY: 55,
      width:170,
      height:25,
      angle:0,
      backgroundColors: ['#fff'],
      requiresMode: MODE_EXPERT,
    }, {
      name: "Heure",
      centerX: 212,
      centerY: 54,
      width: 100,
      height: 25,
      angle: 0,
      text: {
        colors: ['#0423fa'],
        font: 'Pilat Light',
        value: time,
      },
      requiresMode: MODE_ADVANCED,
    }, {
      name: "Direct",
      centerX: 282,
      centerY: 54,
      width: 100,
      height: 25,
      angle: 0,
      text: {
        colors: ['#0423fa'],
        font: 'Pilat Black',
        value: "DIRECT",
      },
      requiresMode: MODE_EXPERT,
    }, {
      name: "Le live BFM...",
      centerX: 1143,
      centerY: 650,
      width:140,
      height:45,
      angle:0,
      text:{
        colors:['#f00'],
        font: 'Pilat Condensed Black',
        value: "LE LIVE BFM",
      },
      requiresMode: MODE_EXPERT,
    }, {
      name: "...emes",
      centerX: 1252,
      centerY: 651,
      width:80,
      height:31,
      angle:0,
      text:{
        colors:['#f00'],
        font: 'Pilat Condensed Black',
        value: "EMES",
      },
      requiresMode: MODE_EXPERT,
    }, {
      name: "Alerte Info",
      centerX: 200,
      centerY: 645,
      width:250,
      height:45,
      angle:0,
      text:{
        colors:['#f00'],
        font: 'Pilat Black',
        value: "ALERTE INFO",
      },
      requiresMode: MODE_EXPERT,
    }, {
      name: "Carré Alerte Info",
      centerX: 335,
      centerY: 652,
      width:10,
      height:10,
      angle:0,
      backgroundColors:['#f00'],
      requiresMode: MODE_EXPERT,
    }, {
      name: "Titre principal",
      centerX: 560,
      centerY: 582,
      width: 960,
      height: 60,
      angle: 0,
      text: {
        colors: ['#fff'],
        font: 'Pilat Condensed Black',
        value: "",
      },
    }, {
      name: "Détails (1/2)",
      centerX: 700,
      centerY: 645,
      width:680,
      height:40,
      angle: 0,
      text: {
        colors: ['#000'],
        font: 'Camber',
        value: "",
      },
    }, {
      name: "Détails (2/2)",
      centerX: 425,
      centerY: 685,
      width:700,
      height:40,
      angle: 0,
      text: {
        colors: ['#000'],
        font: 'Camber',
        value: "",
      },
    }, {
      name: "Source",
      centerX: 920,
      centerY: 686,
      width: 250,
      height: 40,
      angle: 0,
      text: {
        colors: ['#000'],
        font: 'Pilat Light',
        value: "",
      },
    }],
    selectedElement: 0,
    selectedCorner: null,
    mode: 0,
  },
  mutations: {
    updateSelectedElement (state, update) {
      if(!state.elements?.[state.selectedElement])
        return;
      // Clone the elements array to trigger a new render
      state.elements = [...state.elements];
      state.elements[state.selectedElement] = {
        ...state.elements[state.selectedElement],
        ...update,
        _isNew: false,
      };
    },
    updateElementByIndex(state, {update, index}){
      state.elements = [...state.elements];
      state.elements[index] = {
        ...state.elements[index],
        ...update,
        _isNew: false,
      };
    },
    deleteElementByIndex(state, index) {
      if(index === state.selectedElement)
        state.selectedElement = null;
      state.elements = state.elements.filter((_, i) => i !== index);
    },
    zoomSelectedElement(state, factor){
      const element = state.elements?.[state.selectedElement]
      if(!element)
        return;
      state.elements = [...state.elements];
      state.elements[state.selectedElement] = {
        ...element,
        width: element.width * factor,
        height: element.height * factor,
      };
    },
    setSelectedCorner (state, v) {
      state.selectedCorner = v;
    },
    setSelectedElement (state, v) {
      state.selectedElement = v;
    },
    addElement (state, v){
      state.elements = [...state.elements, {...v, _isNew: true}];
      state.selectedElement = state.elements.length - 1;
    },
    organizeElement (state, {oldIndex, newIndex}){
      const elements = state.elements.filter((v, i) => i !== oldIndex);
      elements.splice(newIndex, 0, state.elements[oldIndex]);
      state.elements = elements;
    },
    setMode (state, value){
      if(!MODES[value])
        return;
      state.mode = value;
    },
  }
});
export default store;
