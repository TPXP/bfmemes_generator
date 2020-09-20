import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    count: 0,
    elements: [{
      backgroundColor: '#f00',
      centerX: 100,
      centerY: 100,
      angle: Math.PI / 4,
      width:100,
      height:100,
    },{
      backgroundColor: '#ff0',
      centerX: 500,
      centerY: 300,
      angle: 0,
      width:200,
      height:100,
    }],
    selectedElement: 1,
    selectedCorner: null,
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
    }
  }
});
export default store;