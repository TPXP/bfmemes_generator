<template>
  <div :class="['elementsList', expressMode && 'express']">
    <h2>Éléments</h2>
    <draggable :value="elements" @start="onDragStart" @end="onDragEnd" @change="onDragChange" handle=".handle">
      <div :class="['element', index === activeElement && 'active']" v-for="(element, index) in elements" :key="index"
        v-if="(element.requiresMode || 0) <= mode">
        <div class="elementTitle" @click="selectElement(index)" v-if="!expressMode">
          <span class="material-icons handle">drag_indicator</span>
          <input type="text" :value="getTitle(element, index)" @input="setElementTitle($event.target.value, index)" @blur="onElementTitleBlur(index)" />
          <span class="material-icons" @click.stop="selectElement(index === activeElement ? null : index)">
          {{index === activeElement ? "expand_less" : "expand_more"}}
        </span>
        </div>
        <element-form v-if="index === activeElement || expressMode"
                      :element="elements[index]"
                      @update="updateElement(index, $event)"
                      @delete="deleteElement(index)"
                      @forceRedraw="$emit('forceRedraw', $event)" />
      </div>
    </draggable>
    <template v-if="!expressMode">
      <h2>Ajouter un élément</h2>
      <div class="buttonGroup">
        <a class="button material-icons" v-for="element of elementTypes" :key="element.key"
          @click="addElement({[element.key]:element.defaultValue})">{{ element.icon }}</a>
      </div>
    </template>
    <slot v-slot="listBottom"></slot>
  </div>
</template>

<script>
import {mapState} from "vuex";
import ElementForm from "./ElementForm";
import {ELEMENT_COMPONENTS, MODE_EXPRESS} from "../lib/constants";
import draggable from 'vuedraggable';
import {getFonts, loadFont} from "../lib/fonts";

export default {
  name: "ElementsList",
  components: {ElementForm, draggable},
  computed: {
    ...mapState(['elements', 'mode']),
    expressMode(){
      return this.mode === MODE_EXPRESS;
    },
    activeElement: {
      get() {
        return this.$store.state.selectedElement;
      },
      set(v) {
        this.$store.commit('setSelectedElement', v);
      }
    },
    elementTypes: () => ELEMENT_COMPONENTS,
  },
  data: () => ({
    selectedOnDrag: null,
  }),
  mounted() {
    // If the template has custom fonts and images, load them
    this.elements.forEach(({image, text}, index) => {
      if(image?.src) {
        const img = new Image;
        img.onload = () => {
          this.$store.commit('updateElementByIndex', {
            index,
            update: {
              image: {
                fileName: "Image fournie",
                resource: img,
                width: img.width,
                height: img.height,
              }
            }
          })
        };
        img.src = image.src;
      }
      if(text?.font){
        // Find the corresponding font and load it
        const fontObject = getFonts().filter(({name, fontName}) => (fontName || name) === text.font)[0];
        if(fontObject)
          loadFont(fontObject).then(() => this.$emit('forceRender',  {reason: 'initialFontLoaded'}));
      }
    })
  },
  methods:{
    getTitle(element, index){
      if(element.name !== void 0)
        return element.name;
      if(element.text) {
        if(element.text.value)
          return `${element.image?.resource ? 'Image et ' : ''}Texte "${element.text.value.substr(0, 10)}${element.text.value.length > 10 ? '...' : ''}"`;
        return `Texte #${index}`;
      }
      if(element.image)
        return `Image #${index}`;
      if(element.backgroundColor)
        return `Rectangle #${index}`;
      return `Élément #${index}`;
    },
    updateElement(index, update) {
      this.$store.commit('updateElementByIndex', {index, update});
    },
    deleteElement(index){
      this.$store.commit('deleteElementByIndex', index);
    },
    selectElement(index){
      this.$store.commit('setSelectedElement', index);
    },
    addElement(data){
      this.$store.commit('addElement', {
        ...data,
        width:500, // FIXME
        height:500,
        centerX:300,
        centerY:300,
        angle:0,
      });
    },
    setElementTitle(name, index){
      this.$store.commit('updateElementByIndex', {index, update:{name}});
    },
    onElementTitleBlur(index){
      const element = this.elements[index];
      if(!element.name)
        this.setElementTitle(void 0, index);
    },
    onDragStart(){
      this.selectedOnDrag = this.activeElement;
      this.$store.commit('setSelectedElement', null);
    },
    onDragEnd(){ // This will always be called, even if there are no changes. So we want to reset the selected element here
      // NOTE: The selected element might move, the onDragChange method handles this!
      this.$store.commit('setSelectedElement', this.selectedOnDrag);
      this.selectedOnDrag = null;
    },
    onDragChange(e){
      if(!e?.moved)
        return;
      const {oldIndex, newIndex} = e.moved;
      if(oldIndex === this.selectedOnDrag)
        this.selectedOnDrag = newIndex;
      else if(oldIndex < this.selectedOnDrag)
        this.selectedOnDrag -= newIndex >= this.selectedOnDrag;
      else if(oldIndex > this.selectedOnDrag)
        this.selectedOnDrag += newIndex <= this.selectedOnDrag;
      this.$store.commit('organizeElement', {oldIndex, newIndex});
    }
  }
}
</script>

<style scoped lang="scss">
@import "../scss/variables";

.elementsList{
  flex:30;
  max-width: 620px;
  min-width: 300px;
  align-self: stretch;
  height:100%;
  overflow-y: auto;
  border-right: 3px solid #000;
  &.express .element {
    border-top: 0 none;
  }
}
h2{
  margin:0;
  padding:20px 10px 10px 30px;
  position: relative;
}
h2::before{
  content:'';
  height:1px;
  position: absolute;
  top:10px;
  left:0;
  bottom:0;
  margin:auto;
  width:20px;
  background: $secondary;
}
.buttonGroup{
  margin:5px 10px;
}
.elementTitle{
  background: $primary;
  padding:10px 10px 10px 5px;
  height:50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  .material-icons{
    cursor: pointer;
  }
  .handle{
    cursor: move;
  }
  input{
    border:0 none;
    margin-left:10px;
    flex:1;
    padding:0;
    background: transparent;
    font-size: 20px;
    font-weight: bold;
    color: white;
    font-family: Lato, sans-serif;
    min-width: 0;
  }
}
.element.active .elementTitle {
  background: $darkerPrimary;
}
.element + .element {
  border-top:1px solid $darkerPrimary;
}
.downloadRow{
  text-align: center;
  margin-top:40px;
  padding-bottom: 30px;
}
@media (max-width: $lineToColLayout){
  .elementsList{
    border-right-width: 0;
    height: auto;
  }
}
</style>