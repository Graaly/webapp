<template>
  <div id="q-app" :class="{'q-app-safari': (isIOs || isSafari)}">
    <router-view />
  </div>
</template>

<script>
import utils from 'src/includes/utils'

export default {
  name: "App",
  data() {
    return {
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari()
    }
  }
};
</script>

<style>
</style>
