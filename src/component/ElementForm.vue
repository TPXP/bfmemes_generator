<script src="../../webpack.config.js"></script>
<template>
  <div class="elementForm" v-if="element">
    <label class="option inline" v-if="element.backgroundColor">
      <span>Couleur de fond</span>
      <color-picker :value="element.backgroundColor" @input="setValue('backgroundColor', $event)" />
      <!-- TODO Remove option -->
    </label>
    <section v-if="element.text">
      <h3>Texte</h3>
      <!-- TODO Remove option -->
      <label class="option inline" :for="`${id}text`">
        <span>Texte</span>
        <input :id="`${id}text`" placeholder="Texte" :value="element.text.value" @input="setValue('text.value', $event.target.value)" />
      </label>
      <label class="option inline">
        <span>Couleur</span>
        <color-picker :value="element.text.color" @input="setValue('text.color', $event)" />
      </label>
      <label class="option inline">
        <span>Couleur du contour</span>
        <color-picker :value="element.text.strokeColor" @input="setValue('text.strokeColor', $event)" />
      </label>
      <label class="option inline">
        <span>Taille du contour</span>
        <input type="range" min="0" max="200" step="1" :value="element.text.strokeSize || 0" @input="setValue('text.strokeSize', $event.target.value)" />
      </label>
      <label class="option inline">
        <span>Taille du texte max</span>
        <input type="range" min="1" max="1000" step="1" :value="element.text.maxSize || 1000" @input="setValue('text.maxSize', parseInt($event.target.value, 10))" />
      </label>
    </section>
    <label class="option inline" v-if="element.image">
      <span>Image</span>
      <div class="fullWidthSelector">
        <!-- TODO Show a preview of the selected image? -->
        <span class="material-icons">photo</span>
        <span :class="[!element.image.fileName && 'placeholder']">{{element.image.fileName || "Choisir une image..."}}</span>
        <input type="file" @input="handleImageFile" />
      </div>
      <a class="btn simple material-icons" @click.prevent="deleteValue('image')">delete</a>
    </label>
    <label class="option inline">
      <span>Ajouter</span>
      <div class="buttonGroup">
        <a @click="addValue('text')" v-if="!element.text" class="button material-icons">title</a>
        <a @click="addValue('backgroundColor', '#fff')" v-if="!element.backgroundColor" class="button material-icons">format_paint</a>
        <a @click="addValue('image')" v-if="!element.image" class="button material-icons">photo</a>
      </div>
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
    imageError: null,
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
    },
    addValue(type, value = {}){
      return this.$store.commit('updateSelectedElement', {[type]: value});
    },
    deleteValue(type){
      if(!confirm('Vous voulez vraiment supprimer ça ?'))
        return;
      this.$store.commit('updateSelectedElement',{
        [type]: null,
      });
    },
    handleImageFile(event){
      const {files} = event.target;
      if(files.length !== 1) // No file selected (or multiple files?)
        return;
      // Read the image file, and get its dimensions
      const fileReader = new FileReader();
      fileReader.onerror = e => this.imageError = e;
      fileReader.onloadend = ev => {
        const {result} = ev.target;
        const image = new Image;
        image.onload = () => {
          // TODO: Resize the rectangle to fit the image width and height?
          this.$store.commit('updateSelectedElement', {
            image: {
              fileName: files[0].name,
              resource: image,
              width: image.width,
              height: image.height,
            }
          })
        };
        image.onerror = e => this.imageError = e;
        // Load the image
        image.src = result;
      };
      fileReader.readAsDataURL(files[0]);
    },
  },
}
</script>

<style scoped lang="scss">
@import "src/scss/colors";
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
h3{
  margin: 0;
  line-height:40px;
  position: relative;
  padding-left:10px;
  &::before{
    position: absolute;
    top:0;
    left:-10px;
    bottom:0;
    height:1px;
    background: $secondary;
    width:10px;
    content:'';
    margin:auto;
  }
}
.fullWidthSelector {
  flex:1;
  height:40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  overflow: hidden;
  input{
    position: absolute;
    opacity: 0;
    top:0;
    left:0;
    width: 100%;
    height:100%;
  }
  .placeholder{
    opacity: 0.5;
  }
  .material-icons{
    margin-right:8px;
  }
}
</style>