<template>
  <q-dialog v-model="geolocation.takeMobileVertically">
    <div class="bg-black centered q-pa-md">
      <img
        style="width: 100%"
        src="statics/icons/game/take-mobile-vertically.gif"
      />
      <span class="text-white">{{ $t("label.TakeMobileVertically") }}</span>
    </div>
  </q-dialog>
</template>

<script>
import utils from "src/includes/utils";

export default {
  props: ["geolocation"],
  methods: {
    /*
     * Show the user that he needs to take his mobile vertically (popup)
     */
    askUserToHandleMobileVertically() {
      this.geolocation.takeMobileVertically = true;
      utils.setTimeout(this.closeHandleMobileVertically, 5000);
    },
    /*
     * Hide the popup the user that he needs to take his mobile vertically
     */
    closeHandleMobileVertically() {
      this.geolocation.takeMobileVertically = false;
    }
  }
};
</script>

<style>
</style>