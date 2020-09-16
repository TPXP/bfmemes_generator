<template>
  <div class="elementsList">
    <h2>Éléments</h2>
    <div :class="['element', index === activeElement && 'active']" v-for="(element, index) in elements" :key="index">
      <div class="elementTitle" @click="selectElement(index)">
        <span class="material-icons">drag_indicator</span>
        <input type="text" :value="getTitle(element, index)" @input="setElementTitle($event.target.value, index)" @blur="onElementTitleBlur(index)" />
        <span class="material-icons">
          {{index === activeElement ? "expand_less" : "expand_more"}}
        </span>
      </div>
      <element-form v-if="index === activeElement" />
    </div>
    <h2>Ajouter un élément</h2>
    <div class="buttonGroup">
      <a class="button material-icons" v-for="element of elementTypes" :key="element.key"
        @click="addElement({[element.key]:element.defaultValue})">{{ element.icon }}</a>
    </div>
    <div class="downloadRow">
      <a class="button large secondary" @click="$emit('download')">
        <span class="material-icons">cloud_download</span>
        Télécharger
      </a>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import ElementForm from "./ElementForm";
import {ELEMENT_COMPONENTS} from "../lib/elementConstants";

export default {
  name: "ElementsList",
  components: {ElementForm},
  computed: {
    ...mapState(['elements']),
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
  methods:{
    getTitle(element, index){
      if(element.name !== void 0)
        return element.name;
      if(element.text) {
        if(element.text.value)
          return `${element.image?.resource ? 'Image et ' : ''}Texte "${element.text.value.substr(0, 10)}${element.text.length > 10 ? '...' : ''}"`;
        return `Texte #${index}`;
      }
      if(element.image)
        return `Image #${index}`;
      if(element.backgroundColor)
        return `Rectangle #${index}`;
      return `Élément #${index}`;
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
      this.$store.commit('setSelectedElement', index);
      this.$store.commit('updateSelectedElement', {name});
    },
    onElementTitleBlur(index){
      const element = this.elements[index];
      if(!element.name)
        this.setElementTitle(void 0, index);
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
  border-right: 3px solid #000;
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
  cursor: move;
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
  margin-top:50px
}
@media (max-width: $lineToColLayout){
  .elementsList{
    border-right-width: 0;
  }
}
</style>