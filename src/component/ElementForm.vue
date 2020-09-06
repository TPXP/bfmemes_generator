<template>
  <div class="elementForm" v-if="element">
    <div class="option inline" v-if="['color', 'text'].includes(element.type)">
      <div class="label">Couleur</div>
      <color-picker :value="element.color" @input="setValue('color', $event)" />
    </div>
    <div class="option inline"> <!-- v-if="['color', 'text'].includes(element.type)"> -->
      <div class="label">Texte</div>
      <input placeholder="texte" />
    </div>
  </div>
</template>

<script>
import ColorPicker from "./ColorPicker";
export default {
  name: "ElementForm",
  components: {ColorPicker},
  computed: {
    element(){
      return this.$store.state.elements[this.$store.state.selectedElement] ?? {};
    }
  },
  methods:{
    setValue(key, val){
      // Update the store - assume we're the selected element
      this.$store.commit('updateSelectedElement', {
        [key]: val,
      });
    }
  }
}
</script>

<style scoped>
.elementForm{
  padding:10px 10px 0;
}
.option{
  padding-bottom: 10px;
  font-size: 17px;
}
.option.inline{
  flex-direction: row;
  height:50px;
  display: flex;
  align-items: center;
}
.option .label{
  font-weight: bold;
  width:120px;
}
input {
  background: #fff0;
  border: 0 none;
  border-bottom:1px solid #bbb;
  height:40px;
  padding:5px;
  color: white;
  flex:1;
  transition: all 300ms;
}
input:focus{
  background: #fff2;
  border-bottom-color: #fff;
}
</style>