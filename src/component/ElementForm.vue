<template>
  <div class="elementForm" v-if="element">
    <label class="option inline" v-if="['color', 'text'].includes(element.type)">
      <span>Couleur</span>
      <color-picker :value="element.backgroundColor" @input="setValue('backgroundColor', $event)" />
    </label>
    <label class="option inline" :for="`${id}text`">
      <span>Texte</span>
      <input :id="`${id}text`" placeholder="Texte" :value="element.text && element.text.value" @input="setValue('text.value', $event.target.value)" />
    </label>
  </div>
</template>

<script>
import ColorPicker from "./ColorPicker";
export default {
  name: "ElementForm",
  components: {ColorPicker},
  data: () => ({
    id: Date.now() + '' + Math.random(),
  }),
  computed: {
    element(){
      return this.$store.state.elements[this.$store.state.selectedElement] ?? {};
    }
  },
  methods:{
    setValue(key, val){
      const parts = key.split('.'), payload = {};
      let currentlyEditing = payload, currentValue = this.$store.state.elements[this.$store.state.selectedElement];
      if(!currentValue)
        return;
      parts.forEach((p,i) => {
        if(i === parts.length - 1)
          return currentlyEditing[p] = val;
        // Dig deeper into the payload
        currentValue = currentValue[p];
        currentlyEditing[p] = {...currentValue};
        currentlyEditing = currentlyEditing[p];
      });
      this.$store.commit('updateSelectedElement', payload);
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
.option > span{
  font-weight: bold;
  width:120px;
  display: block;
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