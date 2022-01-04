<template>
  <div class="q-pa-md" :class="isHybrid ? '' : 'full-height'">
    <!-- WEB APP VERSION -->
    <div v-if="!isHybrid">
      <qrcode-stream @decode="onDecode" :camera="camera" @init="onInit" :torch="torchActive" class="q-mb-md">
        <div v-show="showScanConfirmation" class="scan-confirmation">
          <q-spinner
            color="primary"
            size="5em"
            :thickness="2"
          />
        </div>
        <q-btn v-if="start && (isIOs || isSafari)" class="absolute-center" :label="$t('label.startScan')" color="primary" icon="qr_code_scanner" @click="start = !start"/>
      </qrcode-stream>
      <q-btn
        round
        class="q-mr-md"
        size="1rem"
        color="accent"
        :icon="isLight ? 'flashlight_off' : 'flashlight_on'"
        @click="torchActive = !torchActive"
        :disable="torchNotSupported"
      />
      <q-btn
        round
        size="1rem"
        color="accent"
        icon="cameraswitch"
        @click="switchCamera"
      />
    </div>
    <!-- MOBILE VERSION -->
    <div v-else>
      <div class="q-pa-lg absolute-bottom-left" style="padding-bottom: 100px">
        <q-btn
          round
          class="q-mr-md"
          size="1rem"
          color="primary"
          :icon="isLight ? 'flashlight_off' : 'flashlight_on'"
          :disable="torchNotSupported"
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
  </div>
</template>

<script>
import Notification from "../boot/NotifyHelper"
import { QrcodeStream } from "vue-qrcode-reader"
import utils from "../includes/utils"

export default {
  name: "qrCodeStream",
  components: { QrcodeStream },
  data() {
    return {
      result: "",
      isLight: false,
      timeOutId: null,
      usedCamera: 0,
      isHybrid: null,
      camera: 'rear',
      noRearCamera: false,
      noFrontCamera: false,
      torchActive: false,
      torchNotSupported: false,
      showScanConfirmation: false,
      //IOS START BUG
      start: false,
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari()
    }
  },
  created() {
    this.isHybrid = window.cordova
  },
  methods: {
    // HYBRID METHOD
    /* CallBack to Prepare Method, check if the status is authorized to use Device Camera */
    isDone(err, status) {
      if (err) {
        console.log(err)
      }
      this.usedCamera = status.currentCamera
      if (status.authorized) {
        setTimeout(this.scan, 500)
      } else {
        Notification(this.$t('qrCode.unauthorized'), 'error')
      }
    },
    /* Scan Method */
    scan() {
      QRScanner.scan(this.displayResult)
    },
    /* Enable or Disable Light feature */
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
    /* Change Device Camera */
    changeCamera() {
      if (this.usedCamera === 0) {
        this.usedCamera = 1
        this.torchNotSupported = true
      } else {
        this.usedCamera = 0
        QRScanner.getStatus(status => {
            if (status.canEnableLight) {
              this.torchNotSupported = false
            }
        })
      }
      QRScanner.useCamera(this.usedCamera)
    },
    /* Check the code and emit result to parent, every 4 seconds */
    displayResult(err, scanResult) {
      if (err) {
        Notification(this.$t('qrCode.scanError'), 'error')
      } else {
        this.result = scanResult
        this.$emit('QrCodeResult', this.result)
        this.timeOutId = setTimeout(this.scan, 4000)
      }
    },
    // WEBAPP METHOD WITH BUG IN IOS AND SAFARI
    /* Decode the QrCode and emit the result to parent */
    async onDecode (code) {
      this.result = await code
      let temp = this.camera
      this.pause()
      await this.timeout(1000)
      await this.$emit('QrCodeResult', this.result)
      await this.timeout(1000)
      this.unpause(temp)
    },
    unpause (temp) {
      this.camera = temp
    },
    pause () {
      this.camera = 'off'
    },
    timeout (ms) {
      return new Promise(resolve => {
        window.setTimeout(resolve, ms)
      })
    },
    /* Switch front and back Camera */
    async switchCamera () {
      switch (this.camera) {
        case 'front':
          this.camera = 'rear'
          break
        case 'rear':
          this.camera = 'front'
          break
      }
    },
    /* onInit Method  */
    async onInit () {
      this.torchNotSupported = true
      this.start = this.camera !== 'off'
      this.showScanConfirmation = this.camera === "off"
    },
    prepareScanner() {
      document.body.style.backgroundColor = 'transparent'
      document.body.style.background = 'transparent'
      QRScanner.prepare(this.isDone)
    }
  },
  async mounted() {
    if (this.isHybrid) {
      QRScanner.destroy()
      setTimeout(this.prepareScanner, 1000)
    }
  },
  beforeDestroy() {
    if (this.isHybrid) {
      document.body.style.backgroundColor = '#323232'
      QRScanner.destroy()
      if (this.timeOutId !== null) {
        clearTimeout(this.timeOutId)
      }
    }
  }
}
</script>

<style scoped>
.scan-confirmation {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100%;

  background-color: rgba(0, 0, 0, .5);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
</style>
