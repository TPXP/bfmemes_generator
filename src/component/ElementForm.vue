<template>
  <el-form>
    <el-form-item label="Color" v-if="element.color">
      <el-color-picker :value="element.color" @input="setValue('color', $event, true)" />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "ElementForm",
  props: {
    elementIndex: Number,
  },
  computed: {
    element(){
      return this.$store.state.elements[this.elementIndex];
    }
  },
  methods:{
    setValue(index, val, dontClear = false){
      if(dontClear && !val)
        return;
      // Update the store - assume we're the selected element
      this.$store.commit('updateSelectedElement', {
        [index]: val,
      });
    }
  }
}
</script>

<style scoped>

</style>