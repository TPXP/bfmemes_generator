<template>
  <div :class="['modalContainer', visible && 'visible']" @click.stop="$emit('close')">
    <div class="modal" @click.stop>
      <div class="header">
        <h1 class="title">
          <slot name="title">Fenêtre sans nom</slot>
        </h1>
        <i class="material-icons close" @click="$emit('close')">close</i>
      </div>
      <div class="content">
        <slot>Contenu de la fenêtre manquant</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props:{
    visible: Boolean,
  },
}
</script>

<style scoped lang="scss">
@import "../scss/variables";
.modalContainer {
  position: fixed;
  top:0;
  left:0;
  bottom:0;
  right:0;
  background: #0008;
  align-items: center;
  justify-content: center;
  display: none;

  &.visible {
    // TODO Better show and hide animations
    display: flex;
  }

  .modal {
    width: 80%;
    height: 80%;
    max-height: 600px;
    max-width: 800px;
    background: $background;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 16px;
    line-height: 22px;
    .header {
      height:50px;
      display: flex;
      flex-direction: row;
      align-items: center;
      background: $darkerSecondary;
      justify-content: space-between;
      box-shadow: 0 0 10px black;
      .title {
        font-size: 26px;
        color: $background;
        margin: 0 20px 0 13px;
      }
      .close {
        height:36px;
        width:36px;
        line-height: 36px;
        margin:7px;
        border-radius: 20px;
        text-align: center;
        cursor: pointer;
        &:hover {
          background: #fff2;
        }
      }
    }
    .content {
      overflow-y: scroll;
      flex:1;
      padding:20px;
    }
  }
}
</style>