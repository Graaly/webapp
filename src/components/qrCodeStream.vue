<template>
  <div class="q-pa-md">
    <div class="q-pa-lg absolute-bottom-left" style="padding-bottom: 100px">
      <q-btn
        round
        class="q-mr-md"
        size="1rem"
        color="primary"
        :icon="isLight ? 'flashlight_off' : 'flashlight_on'"
        @click="toggleLight"
      />
      <q-btn
        round
        size="1rem"
        color="primary"
        icon="cameraswitch"
        @click="changeCamera"
      />
    </div>
    <div class="text-center absolute-bottom" style="bottom: 50px">
    </div>
  </div>
</template>

<script>
import Notification from "../boot/NotifyHelper";

export default {
  name: "qrCodeStream",
  data() {
    return {
      result: "",
      isLight: false,
      timeOutId: null,
      usedCamera: 0
    }
  },
  methods: {
    isDone(err, status) {
      if (err) {
        console.log(err)
      }
      if (status.authorized) {
        QRScanner.scan(this.displayResult)
      } else {
        Notification(this.$t('qrCode.unauthorized'), 'error');
      }
    },
    toggleLight() {
      QRScanner.getStatus(status => {
        if (status.canEnableLight) {
          if (status.lightEnabled) {
            QRScanner.disableLight(() => { this.isLight = false })
          } else {
            QRScanner.enableLight(() => { this.isLight = true })
          }
        }
      })
    },
    changeCamera() {
      if (this.usedCamera === 0) {
        this.usedCamera = 1
      } else {
        this.usedCamera = 0
      }
      QRScanner.useCamera(this.usedCamera);
    },
    displayResult(err, scanResult) {
      if (err) {
        Notification(this.$t('qrCode.scanError'), 'error');
      } else {
        this.result = scanResult
        this.$emit('QrCodeResult', this.result)
        this.timeOutId = setTimeout(() => {
          QRScanner.scan(this.displayResult)
        }, 4000)
      }
    }
  },
  mounted() {
    document.body.style.background = "transparent"
    QRScanner.prepare(this.isDone)
  },
  beforeDestroy() {
    document.body.style.background = "#323232"
    QRScanner.destroy()
    if (this.timeOutId !== null) {
     clearTimeout(this.timeOutId)
    }
  }
}
</script>

<style scoped>

</style>
