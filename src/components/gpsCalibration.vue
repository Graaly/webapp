<template>
  <q-dialog v-if="geolocationshowCalibration === true">
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
  props: ["geolocationshowCalibration"],
  /*data: function() {
    return {
      geolocationshowCalibration: false
    }
  },*/
  methods: {
    /*
     * Open GPS calibration popup
     */
    askUserToCalibrateGPS(steptype) {
      this.geolocationshowCalibration = true;
      utils.setTimeout(this.closeGPSCalibration(steptype), 7000);
    },
    /*
     * Close GPS calibration popup
     */
    closeGPSCalibration(steptype) {
      this.geolocationshowCalibration = false;
      if (
        steptype !== null &&
        steptype !== undefined &&
        steptype === "locate-item-ar"
      ) {
        this.$emit("endvertical");
      }
    }
  }
};
</script>

<style>
</style>