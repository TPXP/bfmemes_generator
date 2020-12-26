<script>
import CenteredImagePreview from "./CenteredImagePreview";
export default {
  components: {CenteredImagePreview}
}
</script>
<template>
  <div class="elementForm" v-if="element">
    <label class="option inline" v-if="element.backgroundColors">
      <span>{{expressMode ? element.name : "Couleur de fond"}}</span>
      <colors-picker :value="element.backgroundColors" @input="setValue('backgroundColors', $event)" />
      <template v-if="!expressMode">
        <div class="spacer" />
        <a class="material-icons deleteButton" @click.prevent="deleteValue('backgroundColors')">delete</a>
      </template>
    </label>
    <label class="option inline" v-if="element.image">
      <span>{{expressMode ? element.name : "Image"}}</span>
      <div class="fullWidthSelector">
        <centered-image-preview :resource="element.image.resource" v-if="element.image.resource" class="preview" />
        <span class="material-icons" v-else>photo</span>
        <span :class="[!element.image.fileName && 'placeholder']">
          {{element.image.fileName || "Choisir une image..."}}
        </span>
        <input type="file" @input="handleImageFile" />
      </div>
      <a class="material-icons deleteButton" @click.prevent="deleteValue('image')" v-if="!expressMode">delete</a>
    </label>
    <section v-if="element.text">
      <div class="sectionTitle" v-if="!expressMode">
        <h3>Texte</h3>
        <span class="deleteButton material-icons" @click="deleteValue('text')">delete</span>
      </div>
      <label class="option" :for="`${id}text`">
        <textarea :id="`${id}text`" :placeholder="expressMode ? element.name : 'Texte'" :value="element.text.value" @input="setValue('text.value', $event.target.value)" rows="3" />
      </label>
      <template v-if="!expressMode">
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
      </template>
    </section>
    <label class="option inline" v-if="!expressMode">
      <template v-if="missingComponents.length">
        <span>Ajouter</span>
        <div class="buttonGroup">
          <a v-for="component of missingComponents" @click="addValue(component.key, component.defaultValue)" :key="component.key"
             class="button material-icons">{{ component.icon }}</a>
        </div>
      </template>
      <div class="spacer" />
      <a class="material-icons button danger" @click="confirmWholeDelete">delete</a>
    </label>
  </div>
</template>

<script>
import ColorsPicker from "./ColorsPicker";
import {ELEMENT_COMPONENTS, MODE_EXPRESS} from "../lib/constants";
import CenteredImagePreview from "./CenteredImagePreview";
import {getFonts, loadFont} from "../lib/fonts";
import {mapState} from "vuex";
import {readBlobAsDataURL} from "@/lib/download";
import {fitTextInRectangle} from "@/lib/geometry";
export default {
  name: "ElementForm",
  components: {ColorsPicker, CenteredImagePreview},
  props: {
    element: Object,
  },
  data: () => ({
    id: Date.now() + '' + Math.random(),
    imageError: null,
  }),
  computed: {
    ...mapState(['mode']),
    missingComponents() {
      return ELEMENT_COMPONENTS.filter(({key}) => !this.element[key]);
    },
    availableFonts(){
      return getFonts();
    },
    expressMode() {
      return this.mode === MODE_EXPRESS;
    }
  },
  methods:{
    setValue(key, val){
      const parts = key.split('.'), payload = {};
      let currentlyEditing = payload, currentValue = this.element;
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
      this.$emit('update', {payload});
      // Spread text in sub zones if needed
      if(key === 'text.value') {
        // Shall we spread the text?
        const spreadZoneIds = this.element?.text?.spreadInTextZones;
        if(!spreadZoneIds?.length)
          return false;
        // Find the corresponding element IDS
        const matchedZones = {};
        spreadZoneIds.forEach(id => matchedZones[id] = true);
        this.$store.state.elements.forEach((element, index) => {
          if(matchedZones[element.id] && element.text)
            matchedZones[element.id] = {element, index};
        });
        // Determine the zone dimensions
        const zones = spreadZoneIds.map(id => matchedZones[id]).filter(v => !!v),
          textOptions = {...this.element.text};
        delete textOptions.spreadInTextZones;
        // Set the text for every zone
        const {zones: zonesText, fontSize} = fitTextInRectangle(
            null,
          {...textOptions, zones: zones.map(({element}) => element), text: val}
        );
        zones.forEach(({index}, zoneIndex) => {
          const value = (zonesText[zoneIndex]?.lines || []).map(v => v?.text ?? '').join(' ');
          this.$emit('update', {index, payload: {text: {...textOptions, value, maxSize: fontSize+1}}})
        });
      }
    },
    addValue(type, value = {}){
      return this.$emit('update', {payload: {[type]: value}});
    },
    deleteValue(type){
      if(!confirm('Vous voulez vraiment supprimer ça ?'))
        return;
      this.$emit('update',{ payload: {
        [type]: null,
      }});
    },
    setFont(fontName){
      this.setValue('text.font', fontName);
      // Find back the font object
      const fontObject = getFonts().filter(v => (v.fontName || v.name) === fontName);
      if(fontObject.length !== 1)
        throw new Error('Could not find back the font object. Duplicate or missing font name?');
      loadFont(fontObject[0]).then(() => this.$emit('forceRedraw', {reason: 'fontLoaded'}));
    },
    async handleImageFile(event){
      try {
        const {files} = event.target;
        if (files.length !== 1) // No file selected (or multiple files?)
          return;
        // Read the image file, and get its dimensions
        const image = new Image;
        image.onload = () => {
          // Resize the rectangle to not stretch the image for now - cover strategy
          let {height, width} = this.element;
          const imageRatio = image.width / image.height,
              elementRatio = width / height;

          if (imageRatio > elementRatio) // We must increase the width
            width = height * imageRatio;
          else // We must increase the height
            height = width / imageRatio;
          // No need to update centerX and centerY

          this.$emit('update', {
            payload: {
              height, width,
              image: {
                fileName: files[0].name,
                resource: image,
                width: image.width,
                height: image.height,
              }
            }
          })
        };
        image.onerror = e => { throw e }
        // Load the image
        image.src = await readBlobAsDataURL(files[0]);
      } catch (e) {
        this.imageError = e;
      }
    },
    confirmWholeDelete(){
      if(confirm("Voulez-vous vraiment supprimer cet élément complet ?"))
        this.$emit('delete');
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