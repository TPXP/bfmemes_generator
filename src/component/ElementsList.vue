<template>
  <div class="elementsList">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Card name</span>
        <el-button style="float: right; padding: 0" type="text">
          <span class="material-icons">keyboard_arrow_down</span>
        </el-button>
      </div>
      <div v-for="o in 4" :key="o" class="text item">
        {{'List item ' + o }}
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Card name</span>
        <el-button style="float: right; padding: 0" type="text">
          <span class="material-icons">keyboard_arrow_down</span>
        </el-button>
      </div>
      <div v-for="o in 4" :key="o" class="text item">
        {{'List item ' + o }}
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "ElementsList"
}
</script>

<style scoped>
.elementsList{
  flex:30;
  max-width: 400px;
  min-width: 200px;
  padding:10px;
  min-height: 100vh;
}
</style>