<template>

  <!------------------ SUPERIMPOSE IMAGE AND CAMERA STEP AREA ------------------------>

  <div class="image-over-flow" v-if="step.type == 'image-over-flow'">
    <!--<transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">-->
    <video ref="camera-stream-for-image-over-flow" v-show="cameraStreamEnabled" class="full-height full-width"></video>
    <!--</transition>-->
    <div>
      <div v-if="!takingSnapshot" style="position: absolute; bottom: 100px; right: 8px;z-index: 1990;">
        <div>
          <q-btn
            v-if="step.options && step.options.snapshotAllowed"
            round
            size="lg"
            class="text-white"
            :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
            :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
            icon="photo_camera"
            @click="prepareSnapshot()"
          />
        </div>
        <div class="q-pt-md">
          <q-btn
            round
            size="lg"
            class="text-white q-mr-sm"
            :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
            :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
            icon="flip_camera_ios"
            @click="switchCamera()"
          />
        </div>
      </div>
      <img id="snapshotImage" v-show="false" style="position: absolute; top: 0; left: 0; height: 100vh; width: 100vw; z-index: 1980;" />
<!--      <img id="snapshotImageIos" v-show="false" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1980" />-->
      <div>
        <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() !== '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
        <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() !== '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
      </div>
      <!-- background image -normal -->
      <div v-if="!step.options || (!step.options.fullWidthPicture && !step.options.redFilter && !step.options.fullHeightPicture)" class="image" ref="ImageOverFlowPicture" :style="'overflow: hidden; background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw; z-index: 1985;'" ></div>
      <!-- background image -fullwidth -->
      <img crossorigin="anonymous" v-if="step.options && step.options.fullWidthPicture && !step.options.redFilter" :src="getBackgroundImage()" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: 100vh; width: 100vw; z-index: 1985;" />
      <!-- background image -fullheight -->
      <img crossorigin="anonymous" v-if="step.options && !step.options.fullWidthPicture && step.options.fullHeightPicture  && !step.options.redFilter" :src="getBackgroundImage()" style="position: absolute; top: 0; bottom: 0; height: 100vh; width: auto; z-index: 1985; left: 50%; top: 50%; -webkit-transform: translateY(-50%) translateX(-50%);" />

      <!-- Red filter & alternate button for iOS -->
      <!--<div v-if="isIOs && imageOverFlow.snapshot === '' && step.options && step.options.redFilter" class="centered" style="background: transparent; position: absolute; bottom: 200px; width: 100%; z-index: 1980;">-->
      <img v-if="isIOs && imageOverFlow.snapshot !== ''" :src="imageOverFlow.snapshot" style="object-fit: cover; position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100vw; height: 100vh; z-index: 1970;" />
      <img v-if="((isIOs && imageOverFlow.snapshot !== '') || !isIOs) && step.options && step.options.redFilter" src="statics/images/background/red.png" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1975; mix-blend-mode: multiply; opacity: 0.8;" />
      <div v-if="isIOs && step.options && step.options.redFilter" class="centered" style="background: transparent; position: absolute; bottom: 200px; width: 100%; z-index: 1980;">
        <q-btn
          class="glossy large-button"
          :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''"
          :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
          @click="takeVideoSnapShot()">{{ $t('label.ApplyRedFilter') }}</q-btn>
        <q-btn v-if="imageOverFlow.snapshot !== ''" flat @click="cancelTakeVideoSnapShot()">{{ $t('label.Cancel') }}</q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Notification from 'src/boot/NotifyHelper'
import draw from 'src/includes/draw'
import snapshotDialogComponent from "./snapshotDialogComponent";
import utils from "src/includes/utils";

export default {
  name: "SuperImposeImageCameraStep",
  props: ["quest", "step", "customization", "runId"],
  data () {
    return {
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      cameraStreamEnabled: false,
      imageCapture: null,
      cameraUsed: 'user',
      iOSCameraUsed: '',
      takingSnapshot: false,
      isHybrid: window.cordova,
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari(),
      imageOverFlow: {
        snapshot: ""
      },
      backGroundImg: null
    }
  },
  methods: {
    switchCamera() {
      if (this.cameraUsed === 'environment') {
        this.cameraUsed = 'user'
      } else {
        this.cameraUsed = 'environment'
      }
      if (this.isIOs && CameraPreview) {
        CameraPreview.switchCamera()
      } else {
        this.clearAllCameraStreams()
        this.launchVideoStreamForAndroid('camera-stream-for-image-over-flow', true)
      }
    },
    async prepareSnapshot() {
      this.$q.loading.show()
      setTimeout(() => { this.$q.loading.hide() }, 5000)
      
      this.takingSnapshot = true
      // if red filter, do not hide buttons
      if (!(this.isIOs && this.step.options && this.step.options.redFilter)) {
        this.$emit('hideButtons')
      }
      let image = document.getElementById('snapshotImage')
      let now = new Date()
      let nowAsStr = now.toISOString().substring(0, 19).replace(':', '-')
      let snapshotFilename = `snapshot-${nowAsStr}.jpg`
      // GET USER IMAGE FROM CAMERA
      try {
        const vw = this.getScreenWidth()
        const vh = this.getScreenHeight()
        // IOS USE CameraPreview Cordova Plugin
        if (this.isIOs && CameraPreview) {
          CameraPreview.takePicture({quality: 85}, base64PictureData => {
            const imageSrcData = 'data:image/jpeg;base64,' +base64PictureData
            //let image = document.getElementById('snapshotImageIos')
            image.src = imageSrcData
          });
        // SAFARI USE Canvas option
        } else if (this.isSafari) {
          let tempCameraStream = this.$refs['camera-stream-for-image-over-flow']
          let canvasStream = document.createElement('canvas')
          canvasStream.width = tempCameraStream.videoWidth
          canvasStream.height = tempCameraStream.videoHeight
          let streamContext = canvasStream.getContext('2d')
          streamContext.drawImage(tempCameraStream, 0, 0, tempCameraStream.videoWidth, tempCameraStream.videoHeight)
          // Generate Blob
          canvasStream.toBlob(blob => {
            image.src = URL.createObjectURL(blob)
          }, 'image/png')
        // ANDROID AND WEBAPP USE imageCapture from navigator.mediaDevices.getUserMedia
        } else {
          // generate a snapshot of the video flow
          let blob = await this.imageCapture.takePhoto()
          image.src = URL.createObjectURL(blob)
        }

        // CREATE A MIX WITH IMAGE OVERLAY
        image.onload = async () => {
          // build image with camera capture + overlay in a canvas
          let c = document.createElement('canvas')
          let context = c.getContext('2d')
          c.height = vh
          c.width = vw
          c.style.display = 'none'
          // fit image to canvas, center horizontally & vertically & keep aspect ratio (like CSS 'cover')
          draw.drawImageProp(context, image)
          //let imgOverflow = this.$refs['imageOverflowForCapture']
          if (this.getBackgroundImage() != null) {
            let imgOverflow = new Image()

            imgOverflow.onload = async () => {
              try { // Added by EMA when no picture added, it breaks
                draw.drawImageProp(context, imgOverflow)
              } catch (e) {
                console.log("picture missing")
              }
              // CREATE A BLOB OBJECT FROM CANVAS
              let finalBlob
              finalBlob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg'))

              // OPEN DIALOG WITH OPTIONS
              this.takingSnapshot = false
              this.$q.loading.hide()

              if (this.isHybrid) {
                this.openDialog(true, finalBlob, snapshotFilename, c)
              } else { // WEBAPP
                this.openDialog(false, finalBlob, snapshotFilename, c)
              }
            }
            
            //if (this.isSafari || this.isIOs) {
            //  imgOverflow.crossOrigin = 'Anonymous'
            //  imgOverflow.src = this.getBackgroundImage() + "?t=" + Math.floor(Math.random() * 10000)
            //} else {
              imgOverflow.crossOrigin = 'anonymous'
              imgOverflow.src = this.getBackgroundImage()
            //}
          } else {
            let finalBlob
            finalBlob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg'))
            this.takingSnapshot = false
            this.$q.loading.hide()
            if (this.isHybrid) {
              this.openDialog(true, finalBlob, snapshotFilename, c)
            } else { // WEBAPP
              this.openDialog(false, finalBlob, snapshotFilename, c)
            }
          }

        }
      } catch (err) {
        Notification(this.$t('label.SnapshotTakenIssue'), 'error');
        console.error(err)
        console.log(err.stack)
        this.$q.loading.hide()
        this.$emit('showButtons')
      }
    },
    openDialog(isHybrid, blob, fileName, canvas) {
      this.$q.dialog({
        component: snapshotDialogComponent,
        parent: this,
        // props forwarded to component
        snapshotFilename: fileName,
        blob: blob,
        isHybrid: isHybrid,
        quest: this.quest,
        step: this.step,
        runId: this.runId,
        color: (this.customization && this.customization.color && this.customization.color !== '') ? this.customization.color : 'primary'
      }).onCancel(async () => {
        this.$emit('showButtons')
        this.cancelTakeVideoSnapShot()
        canvas.remove()
      })
    },
    takeVideoSnapShot() {
      CameraPreview.takePicture({ quality: 85 }, base64PictureData => {
        this.imageOverFlow.snapshot = 'data:image/jpeg;base64,' + base64PictureData
        //setTimeout(() => { this.cancelTakeVideoSnapShot() }, 5000)
      })
    },
    cancelTakeVideoSnapShot() {
      this.imageOverFlow.snapshot = ""
    },
    launchVideoStreamForAndroid(container, initCapture, facingMode = this.cameraUsed) {
      let cameraStream = this.$refs[container]
      navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode }, audio: false })
        .then((stream) => {
          // Hacks for Safari iOS
          cameraStream.setAttribute("muted", true)
          cameraStream.setAttribute("playsinline", true)

          cameraStream.srcObject = stream
          cameraStream.play()
          this.$store.dispatch('addMediaStream', stream)
          this.cameraStreamEnabled = true

          if (initCapture) {
            // init video capturing
            const track = stream.getVideoTracks()[0];
            this.imageCapture = new ImageCapture(track);
          }
        })
        .catch((err) => {
          // TODO friendly behavior/message for user
          console.warn("No camera stream available")
          console.log(err)
        });
      return cameraStream
    },
    async launchVideoStreamForIphone() {
      let options = {
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.screen.height,
        camera: this.iOSCameraUsed ? this.iOSCameraUsed : CameraPreview.CAMERA_DIRECTION.FRONT,
        toBack: true,
        tapPhoto: true,
        tapFocus: false,
        previewDrag: false,
        storeToFile: false,
        disableExifHeaderStripping: false
      }
      this.$q.loading.show()
      setTimeout(async() => {
        await CameraPreview.startCamera(options, () => {
          setTimeout(() => { this.$q.loading.hide() }, 1000)
          this.cameraStreamEnabled = true
        }, () => {
          setTimeout(() => { this.$q.loading.hide() }, 1000)
        })
      }, 2000)
      //CameraPreview.setColorEffect("redfilter")
      //CameraPreview.show()
    },
    clearAllCameraStreams() {
      if (this.isIOs && CameraPreview) {
        CameraPreview.stopCamera(() => { console.log('CAMERA STOP') })
      } else {
        this.$store.dispatch('clearMediaStreams')
      }
      this.cameraStreamEnabled = false
    },
    //
    // Maybe Use a Step Service for All This
    //
    getTranslatedText() {
      let defaultText = ""
      if (this.step.type === 'new-item') {
        defaultText = this.$t('label.YouHaveWinANewItem')
      }
      let translation = this.step.text ? this.step.text : defaultText

      // replace variables
      let date = new Date()
      translation = translation.replace('%id%', this.$store.state.user.id)
      translation = translation.replace('%name%', this.$store.state.user.name)
      translation = translation.replace('%date%', (date.getMonth() + 1) + '.' + date.getFullYear())

      return translation
    },
    getScreenWidth() {
      let vw = window.innerWidth
      return vw
    },
    getScreenHeight() {
      const vh = window.innerHeight
      return vh
    },
    getBackgroundImage () {
      if (!this.step.backgroundImage) {
        return null
      }
      let backgroundImage = this.step.backgroundImage[this.lang] ? this.step.backgroundImage[this.lang] : this.step.backgroundImage[this.quest.mainLanguage]
      if (backgroundImage && backgroundImage[0] === "_") {
        return 'statics/images/quest/' + backgroundImage
      } else if (backgroundImage && backgroundImage.indexOf('blob:') !== -1) {
        return backgroundImage
      } else {
        if (backgroundImage != null) {
          return this.uploadUrl + '/upload/quest/' + this.step.questId + '/step/background/' + backgroundImage
        } else {
          return null
        }
      }
    }
  },
  created() {

  },
  async mounted() {
    if (this.isIOs && CameraPreview) {
      if (this.step.options.cameraUsed && this.step.options.cameraUsed == 'environment') {
        this.iOSCameraUsed = CameraPreview.CAMERA_DIRECTION.BACK
      } else {
        this.iOSCameraUsed = CameraPreview.CAMERA_DIRECTION.FRONT
      }
      await this.launchVideoStreamForIphone()
    } else {
      if (this.step.options.cameraUsed && this.step.options.cameraUsed == 'environment') {
        this.cameraUsed = 'environment'
      } else {
        this.cameraUsed = 'user'
      }
      await this.launchVideoStreamForAndroid('camera-stream-for-image-over-flow', true)
    }
    // FIX BUG TAINTED CANVAS AND CROSS ANONYMOUS WITH S3
    let backGroundImg = new Image()
    backGroundImg.crossOrigin = 'anonymous'
    backGroundImg.src = this.getBackgroundImage()
    let _this = this
    backGroundImg.onload = function() {
      _this.$refs['ImageOverFlowPicture'].style.backgroundImage = "url(" + this.src + ")"
    }
  },
  beforeDestroy() {
    this.clearAllCameraStreams()
  }
}
</script>

<style scoped>
  .image-over-flow { background: transparent; padding: 0px!important; }
  .image-over-flow video { position: absolute; top: 0; left: 0; bottom: 0; right: 0; object-fit: cover; z-index: 0; }
  .image-over-flow .text { z-index: 5000; position: relative; } /* positioning is required to have z-index working */
  .image-over-flow .image { z-index: 50; position: relative; } /* positioning is required to have z-index working */
</style>
