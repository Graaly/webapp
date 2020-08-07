<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import AppStoreratingService from "services/AppStoreratingService";

export default {
  name: "App",
  beforeCreate() {
    AppStoreratingService.initLaunhCounter();
  }
};
</script>

<style>
</style>
