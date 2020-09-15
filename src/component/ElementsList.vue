<template>
  <div class="elementsList">
    <h2>Éléments</h2>
    <div :class="['element', index === activeElement && 'active']" v-for="(element, index) in elements" :key="index">
      <div class="elementTitle" @click="selectElement(index)">
        <span class="material-icons">drag_indicator</span>
        <b>{{ getTitle(element, index) }}</b>
        <div class="spacer" />
        <span class="material-icons">
          {{index === activeElement ? "expand_less" : "expand_more"}}
        </span>
      </div>
      <element-form v-if="index === activeElement" />
    </div>
    <h2>Ajouter un élément</h2>
    <div class="buttonGroup">
      <a class="button material-icons">insert_photo</a>
      <a class="button material-icons">notes</a>
      <a class="button material-icons">palette</a>
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
    }
  },
  methods:{
    getTitle(element, index){
      switch(element.type) {
        case "color":
          return `Rectangle #${index}`;
        case "text":
          if(element.text)
            return `Texte "${element.text.substr(0,10)}${element.text.length > 10 ? '...':''}"`;
          return `Texte #${index}`;
      }
    },
    selectElement(index){
      this.$store.commit('setSelectedElement', index);
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
  b{
    font-size: 20px;
    padding-left:10px;
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