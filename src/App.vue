<template>
  <div id="app" style="height: 100%">

    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
  html body{
    height: 100%;
  }
  html{
    height: 100%;
  }
  .time .mu-text-field-hint{
    line-height: 30px;
    text-align: left;
  }
  .time .mu-text-field{
    width: 100%;
    min-height: 30px;
  }
  .time .mu-text-field-input{
    display: inline;
  }
</style>
