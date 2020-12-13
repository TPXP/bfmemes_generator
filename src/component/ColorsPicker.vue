<template>
  <div class="colorPickers">
    <div class="color" v-for="(color, index) of value" @click="opened = index" :key="index">
      <div class="preview" :style="`background:${color}`" />
      <span class="delete material-icons" v-if="value.length > 1" @click="deleteColor(index)">cancel</span>
    </div>
    <span class="material-icons add" @click="addColor">add</span>
    <Modal v-if="value" :visible="opened !== null" @close="opened = null">
      <template v-slot:title>Couleur</template>
      <div class="center">
        <sketch :value="value[opened] || '#0000'" @input="setColor(opened, $event)" />
      </div>
    </Modal>
  </div>
</template>

<script>
import {Sketch} from 'vue-color';
import Modal from "@/component/Modal";
export default {
  name: "ColorsPicker",
  components: {
    Modal,
    Sketch
  },
  props: {
    value: Array,
  },
  data:() => ({
    opened: null,
  }),
  methods:{
    close(){
      this.opened = null;
    },
    deleteColor(index){
      if(confirm('Voulez-vous vraiment supprimer cette couleur?')) {
        this.$emit('input', this.value.filter((v, i) => i !== index));
      }
    },
    setColor(index, event) {
      this.$emit('input', this.value.map((v, i) => {
        if(i !== index)
          return v;
        return v ? event.hex8 : event.hex8.substr(0, 6);
      }))
    },
    addColor(){
      this.$emit('input', [...(this.value || []), '#fff']);
      this.opened = null;
    },
  },
}
</script>

<style scoped lang="scss">
  .colorPickers{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  .color {
    position: relative;
    height: 40px;
    width: 40px;
    padding:4px;
    border:1px solid #fff9;
    background: #fff5;
    border-radius: 5px;
    margin-right:10px;
    .preview {
      width: 30px;
      height: 30px;
      border: 1px solid #333;
      border-radius: 3px;
    }
    .delete {
      position: absolute;
      top:-7px;
      right:-7px;
      color:white;
      opacity: 0.6;
      cursor: pointer;
      text-shadow: 0 1px 0 black;
      &:hover{
        opacity: 1;
      }
    }
  }
  .wrapper{
    background: #fff;
    border-radius: 5px;
    padding: 5px;
    position: absolute;
    top:110%;
    left:-21px;
    z-index: 33;
    &::before{
      position: absolute;
      top:-10px;
      left:29px;
      z-index: -1;
      height:20px;
      width:20px;
      transform: rotate(45deg);
      content:'';
      background: white;
    }
  }
  .pop-enter-active{
    animation: pop .2s;
  }
  .pop-leave-active{
    animation: pop reverse .2s;
  }

  .add {
    color: white;
    background: #fff5;
    border:1px solid #fff;
    border-radius: 30px;
    height:29px;
    width:29px;
    line-height: 26px;
    text-align: center;
    cursor: pointer;
    &:hover{
      background: #fff8;
    }
  }

  @keyframes pop {
    0% {
      top:50%;
      opacity: 0;
    }
    100% {
      top:110%;
      opacity: 1;
    }
  }
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    height:100%;
    justify-content: center;
  }
</style>