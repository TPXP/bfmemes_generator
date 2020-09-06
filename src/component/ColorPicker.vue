<template>
  <div class="colorPicker" @click="opened = !opened" v-on-click-outside="close">
    <div class="color" :style="`background:${value}`" />
    <transition name="pop">
      <div class="wrapper" v-if="opened" @click.stop>
        <chrome :value="value" @input="$emit('input', $event.hex8)" />
      </div>
    </transition>
  </div>
</template>

<script>
import {Chrome} from 'vue-color';
export default {
  name: "ColorPicker",
  components: {
    Chrome
  },
  props: {
    value: String,
  },
  data() {
    return {
      opened:false,
    }
  },
  methods:{
    close(){
      this.opened = false;
    }
  }
}
</script>

<style scoped lang="scss">
  .colorPicker{
    height: 40px;
    width: 40px;
    padding:4px;
    border:1px solid #fff9;
    background: #fff5;
    border-radius: 5px;
    position: relative;
  }
  .color{
    width:30px;
    height:30px;
    border:1px solid #333;
    border-radius: 3px;
  }
  .wrapper{
    background: #fff;
    border-radius: 5px;
    padding: 5px;
    position: absolute;
    top:110%;
    left:-20px;
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