<script>
import CenteredImagePreview from "./CenteredImagePreview";
export default {
  components: {CenteredImagePreview}
}
</script>
<template>
  <div class="elementForm" v-if="element">
    <label class="option inline" v-if="element.backgroundColors">
      <span>Couleur de fond</span>
      <colors-picker :value="element.backgroundColors" @input="setValue('backgroundColors', $event)" />
      <div class="spacer" />
      <a class="material-icons deleteButton" @click.prevent="deleteValue('backgroundColors')">delete</a>
    </label>
    <label class="option inline" v-if="element.image">
      <span>Image</span>
      <div class="fullWidthSelector">
        <centered-image-preview :resource="element.image.resource" v-if="element.image.resource" class="preview" />
        <span class="material-icons" v-else>photo</span>
        <span :class="[!element.image.fileName && 'placeholder']">
          {{element.image.fileName || "Choisir une image..."}}
        </span>
        <input type="file" @input="handleImageFile" />
      </div>
      <a class="material-icons deleteButton" @click.prevent="deleteValue('image')">delete</a>
    </label>
    <section v-if="element.text">
      <div class="sectionTitle">
        <h3>Texte</h3>
        <span class="deleteButton material-icons" @click="deleteValue('text')">delete</span>
      </div>
      <label class="option" :for="`${id}text`">
        <textarea :id="`${id}text`" placeholder="Texte" :value="element.text.value" @input="setValue('text.value', $event.target.value)" rows="3" />
      </label>
      <label class="option inline">
        <span>Couleur</span>
        <colors-picker :value="element.text.colors" @input="setValue('text.colors', $event)" />
      </label>
      <label class="option inline">
        <span>Couleur du contour</span>
        <colors-picker :value="element.text.strokeColors" @input="setValue('text.strokeColors', $event)" />
      </label>
      <label class="option inline">
        <span>Taille du contour</span>
        <input type="range" min="0" max="200" step="1" :value="element.text.strokeSize || 0" @input="setValue('text.strokeSize', $event.target.value)" />
      </label>
      <label class="option inline">
        <span>Taille du texte max</span>
        <input type="range" min="1" max="1000" step="1" :value="element.text.maxSize || 1000" @input="setValue('text.maxSize', parseInt($event.target.value, 10))" />
      </label>
      <label class="option inline">
        <span>Police</span>
        <select :value="element.text.font || 'sans-serif'" @input="setFont($event.target.value)">
          <option v-for="font of availableFonts" :value="font.fontName || font.name">{{font.name}}</option>
        </select>
      </label>
    </section>
    <label class="option inline" v-if="missingComponents.length">
      <span>Ajouter</span>
      <div class="buttonGroup">
        <a v-for="component of missingComponents" @click="addValue(component.key, component.defaultValue)" :key="component.key"
           class="button material-icons">{{ component.icon }}</a>
      </div>
      <div class="spacer" />
      <a class="material-icons button danger" @click="confirmWholeDelete">delete</a>
    </label>
  </div>
</template>

<script>
import ColorsPicker from "./ColorsPicker";
import {ELEMENT_COMPONENTS} from "../lib/elementConstants";
import CenteredImagePreview from "./CenteredImagePreview";
import {getFonts, loadFont} from "../lib/fonts";
export default {
  name: "ElementForm",
  components: {ColorsPicker, CenteredImagePreview},
  data: () => ({
    id: Date.now() + '' + Math.random(),
    imageError: null,
  }),
  computed: {
    element(){
      return this.$store.state.elements[this.$store.state.selectedElement] ?? {};
    },
    missingComponents() {
      return ELEMENT_COMPONENTS.filter(({key}) => !this.element[key]);
    },
    availableFonts(){
      return getFonts();
    },
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
    setFont(fontName){
      this.setValue('text.font', fontName);
      // Find back the font object
      const fontObject = getFonts().filter(v => (v.fontName || v.name) === fontName);
      if(fontObject.length !== 1)
        throw new Error('Could not find back the font object. Duplicate or missing font name?');
      loadFont(fontObject[0]).then(() => this.$emit('forceRedraw', {reason: 'fontLoaded'}));
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
    confirmWholeDelete(){
      if(confirm("Voulez-vous vraiment supprimer cet élément complet ?"))
        this.$store.commit('deleteSelectedElement');
    },
  },
}
</script>

<style scoped lang="scss">
@import "src/scss/variables";
.elementForm{
  padding:10px 10px 0;
}
.option{
  padding-bottom: 10px;
  font-size: 17px;
  display: flex;
  flex-direction: row;

  .material-icons{
    flex-shrink:0;
  }
}
.option.inline{
  height:50px;
  align-items: center;
}
.option > span{
  font-weight: bold;
  width:120px;
  display: block;
}
input, textarea {
  background: #fff0;
  border: 0 none;
  border-bottom:1px solid #bbb;
  height:40px;
  padding:5px;
  color: white;
  flex:1;
  transition: all 300ms;
  font-family: Lato, sans-serif;
  &:focus{
    background: #fff2;
    border-bottom-color: #fff;
  }
}
textarea{
  height:60px;
  line-height: 23px;
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
  span:not(.material-icons){
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex:1;
  }
  .preview{
    width:33px;
    height:33px;
    margin-right:10px;
    flex-shrink:0;
  }
}
.sectionTitle{
  display: flex;
  align-items: center;
  flex-direction: row;
  h3{
    flex:1;
  }
}
.deleteButton{
  color:$red;
  cursor: pointer;
  margin-left:5px;
  &:hover{
    color: $lightRed;
  }
}
</style>