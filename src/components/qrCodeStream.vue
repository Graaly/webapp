<template>
  <div class="" :class="isHybrid ? 'q-pa-md' : 'full-height'">
    <!-- WEB APP VERSION -->
    <div v-if="!isHybrid" :class="!isLoaded ? 'bg-center' : ''">
      <qrcode-stream @decode="onDecode" :camera="camera" @init="onInit" :torch="torchActive" class="camera-not-hybrid">
        <div v-show="showScanConfirmation" class="scan-confirmation">
          <q-spinner
            color="primary"
            size="5em"
            :thickness="2"
          />
        </div>
        <div class="absolute-center" style="width: 90vw; max-width: 300px">
          <text-btn-square
            v-if="start && (isIOs || isSafari)"
            @click.native="start = !start"
            :loading="!isLoaded"
            :disable="!isLoaded"
            :title="isLoaded ? 'Démarrer le scanner' : 'loading'"
            :color="(!color || color === 'primary' || color === '') ? 'primary' : color"
            :icon="!isLoaded ? '' : 'qr_code_scanner'"
          />
        </div>
      </qrcode-stream>
      <div class="absolute-top q-mx-lg" style="top: 25px">
        <div class="code-btn" style="max-width: 800px; margin: 0 auto">
          <div class="flex justify-end">
            <icon-btn-square class="q-mr-lg" @click.native="!torchNotSupported ? torchActive = !torchActive : ''" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" :icon="isLight ? 'flashlight_off' : 'flashlight_on'" :disable="torchNotSupported"/>
            <icon-btn-square @click.native="switchCamera" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" icon="cameraswitch"/>
          </div>
<!--          <icon-btn-square @click.native="closeQRCodeReader()" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" icon="close" fill rotation/>-->
        </div>
      </div>

    </div>
    <!-- MOBILE VERSION -->
    <div v-else>
      <div class="absolute-bottom q-mr-lg" :style="menu ? 'bottom: 100px;' : 'bottom: 25px;'">
        <div class="code-btn flex justify-between">
          <div>
            <icon-btn-square class="q-ml-lg" @click.native="toggleLight" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" :icon="isLight ? 'flashlight_off' : 'flashlight_on'" :disable="torchNotSupported"/>
            <icon-btn-square @click.native="changeCamera" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" icon="cameraswitch"/>
          </div>
          <icon-btn-square @click.native="closeQRCodeReader()" :color="(!color || color === 'primary' || color === '') ? 'primary' : color" icon="close" fill rotation/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import iconBtnSquare from "./user/UI/iconBtnSquare";
import textBtnSquare from "./user/UI/textBtnSquare";

import Notification from "../boot/NotifyHelper"
import { QrcodeStream } from "vue-qrcode-reader"
import utils from "../includes/utils"

export default {
  name: "qrCodeStream",
  components: { QrcodeStream, iconBtnSquare, textBtnSquare },
  props: {
    color: String,
    menu: {
      type: Boolean,
      default: false
    }
  },
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
      torchNotSupported: true,
      showScanConfirmation: false,
      //IOS START BUG
      start: false,
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari(),
      isLoaded: false
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
      this.isLoaded = false
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
    async onInit (cam) {
      this.start = this.camera !== 'off'
      await cam;
      this.torchNotSupported = true
      this.showScanConfirmation = this.camera === "off"
      this.isLoaded = true;
    },
    prepareScanner() {
      document.body.style.backgroundColor = 'transparent'
      document.body.style.background = 'transparent'
      QRScanner.prepare(this.isDone)
    },
    closeQRCodeReader() {
      this.$emit('CloseQRCodeReader')
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
    } else {
      this.camera = 'off'
    }
  }
}
</script>

<style scoped lang="scss">
.camera-not-hybrid{
  height: 100vh;
}
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
.bg-center {
  background-image: url('../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
