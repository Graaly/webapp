<template>
  <q-dialog v-model="showPhoneAnimation">
    <div class="bg-black centered q-pa-md">
      <img
        style="width: 100%"
        src="statics/icons/game/take-mobile-vertically.gif"
      />
      <span class="text-white">{{ $t("label.TakeMobileVertically") }}</span>
      <!--<div class="centered">
        <q-btn color="primary" @click="closeHandleMobileVertically()"><span>{{ $t('label.Close') }}</span></q-btn>
      </div>-->
    </div>
  </q-dialog>
</template>

<script>
import utils from "src/includes/utils"

export default {
  props: ["show"],
  watch: { 
    show: async function(newVal, oldVal) {
      if (newVal === true || newVal === 'true') {
        utils.setTimeout(this.closeHandleMobileVertically, 5000)
        this.showPhoneAnimation = true
      }
    }
  },
  data() {
    return {
      showPhoneAnimation: false
    }
  },
  methods: {
    /*
     * Hide the popup the user that he needs to take his mobile vertically
     */
    closeHandleMobileVertically() {
      this.showPhoneAnimation = false
    }
  }
};
</script>
