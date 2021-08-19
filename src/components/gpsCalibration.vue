<template>
  <q-dialog v-model="geolocationshowCalibration">
    <div class="bg-black centered q-pa-md">
      <img style="width: 100%; max-width: 500px;" src="statics/icons/game/wave-phone.gif" />
      <div class="text-white">
        {{ $t("label.WaveThePhoneForGPSPrecision") }}
      </div>
    </div>
  </q-dialog>
</template>

<script>
export default {
  data: function () {
    return {
      geolocationshowCalibration: false
    };
  },
  methods: {
    /*
     * Open GPS calibration popup
     */
    askUserToCalibrateGPS(steptype) {
      this.geolocationshowCalibration = true;
      setTimeout(() => {
        this.closeGPSCalibration(steptype);
      }, 5500);
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
      } else {
        this.$emit("end");
      }
    }
  }
};
</script>

<style>
</style>