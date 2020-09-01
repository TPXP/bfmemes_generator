import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    count: 0,
    elements: [{
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
    }
  }
});
export default store;