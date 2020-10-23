<template>
  <q-dialog v-model="geolocation.showCalibration">
    <div class="bg-black centered q-pa-md">
      <img style="width: 100%" src="statics/icons/game/wave-phone.gif" />
      <span class="text-white">{{
        $t("label.WaveThePhoneForGPSPrecision")
      }}</span>
    </div>
  </q-dialog>
</template>

<script>
import utils from "src/includes/utils";

export default {
  props: ["geolocation", "step"],
  methods: {
    /*
     * Open GPS calibration popup
     */
    askUserToCalibrateGPS() {
      if (this.step.options && this.step.options.showHelp) {
        this.geolocation.showCalibration = true;
        utils.setTimeout(this.closeGPSCalibration, 7000);
      }
    },
    /*
     * Close GPS calibration popup
     */
    closeGPSCalibration() {
      this.geolocation.showCalibration = false;
      if (this.step.type === "locate-item-ar") {
        this.$emit("endvertical");
      }
    }
  }
};
</script>

<style>
</style>