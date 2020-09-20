<template>
  <div class="colorPickers">
    <div class="color" v-for="(value, index) of value" @click="opened = opened === index ? null : index" :key="index" v-on-clickaway="close">
      <div class="preview" :style="`background:${value}`" />
      <transition name="pop">
        <div class="wrapper" v-if="opened === index" @click.stop>
          <chrome :value="value || '#0000'" @input="setColor(index, $event)" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import {Chrome} from 'vue-color';
import { mixin as clickaway } from 'vue-clickaway';
export default {
  name: "ColorsPicker",
  components: {
    Chrome
  },
  mixins: [clickaway],
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
    setColor(index, event) {
      this.$emit('input', this.value.map((v, i) => {
        if(i !== index)
          return v;
        return v ? event.hex8 : event.hex8.substr(0, 6);
      }))
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
    .preview {
      width: 30px;
      height: 30px;
      border: 1px solid #333;
      border-radius: 3px;
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
</style>