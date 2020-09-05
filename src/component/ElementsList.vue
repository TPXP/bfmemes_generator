<template>
  <div class="elementsList">
    <div class="element" v-for="(element, index) in elements" :key="index">
      <div class="elementTitle">{{ getTitle(element, index) }}</div>
      <element-form :elementIndex="index" />
    </div>
    <h2>Ajouter un élément</h2>
    <div class="buttonGroup">
      <a class="button material-icons">insert_photo</a>
      <a class="button material-icons">notes</a>
      <a class="button material-icons">crop_square</a>
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
  }
}
</script>

<style scoped>
.elementsList{
  flex:30;
  max-width: 400px;
  min-width: 200px;
  padding:10px;
  align-self: stretch;
}
</style>