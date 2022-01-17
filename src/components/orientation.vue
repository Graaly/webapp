<template>
  <div>
  </div>
</template>

<script>

import utils from 'src/includes/utils'

export default {
  props: {
    disabled: { type: Boolean, default: false }
  },
  data () {
    return {
      status: 'stopped',
      sensor: {
        start: () => {},
        stop: () => {},
        onreading: () => {},
        onerror: () => {}
      },
      deviceHasGyroscope: null,
      gyroscopeDetectionCounter: 0,
      initialBearingAngle: null,
      noSensorFound: false,
      isHybrid: window.cordova,
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari()
    }
  },
  watch: {
    disabled: function (newVal, oldVal) {
      if (newVal === true && this.status === 'started') {
        this.stopSensor()
      } else if (newVal === false && this.status === 'stopped') {
        this.startSensor()
      }
    }
  },
  mounted() {
    // $nextTick() required to ensure that Cordova plugins are ready
    this.$nextTick(() => {
      this.startSensor()
    })
  },
  beforeDestroy() {
    this.stopSensor()
  },
  methods: {
    /**
     * Handle orientation sensor error
     * @param   {Object}    event    Error event
     */
    absoluteOrientationSensorError(event) {
      console.error('Could not get orientation', event.error)
      this.stopSensor()
      this.$emit('error', event.error)
    },
    /**
     * Handle new orientation event (with gyroscope)
     * Emits event "success" with sensor object having property quaternion
     */
    absoluteOrientationSensorSuccess() {
      this.$emit('success', this.sensor)
    },
    /**
     * Handle new orientation event (without gyroscope)
     * Emits event "success" with event containing alpha, beta, gamma values
     */
    handleDeviceOrientationEvent(event) {
      this.$emit('success', event)
    },
    /**
     * Start listening to orientation changes, depending on platform & available sensors
     */
    async startSensor() {
      if (this.disabled || this.status === 'started') {
        return
      }

      await this.detectGyroscope()

      // Android without gyroscope: use only 'deviceorientationabsolute' event
      if (this.isHybrid && !this.isIOs && !this.isSafari && !this.deviceHasGyroscope) {
        window.addEventListener("deviceorientationabsolute", this.handleDeviceOrientationEvent, true)
      } else {
        // Required to make camera orientation follow device orientation
        // It is different from 'deviceorientationabsolute' listener whose values are not
        // reliable when device is held vertically
        try {
          if ("AbsoluteOrientationSensor" in window) {
            // Android
            this.sensor = new AbsoluteOrientationSensor({ frequency: 30 })
            this.sensor.onerror = this.absoluteOrientationSensorError
            this.sensor.onreading = this.absoluteOrientationSensorSuccess
            this.sensor.start()
          } else if (this.isSafari) {
            console.log("IS SAFARI")
            // WEB APP IOS
            if (typeof (DeviceMotionEvent) === "undefined") {
              this.noSensorFound = true
              return
            }
            this.sensor = {
              stop: this.stopAlternateAbsoluteOrientationSensor
            }
            window.addEventListener('deviceorientation', this.eventAlternateAbsoluteOrientationSensor, false)
          } else {
            // iOS
            this.sensor = {
              stop: this.stopAlternateAbsoluteOrientationSensor
            }

            // ask user to access to his device orientation
            let requestPermissionResult = await utils.requestDeviceOrientationPermission()
            if (requestPermissionResult !== 'granted') {
              Notification(this.$t('label.PleaseAcceptDeviceOrientationPermissionRequest'), 'error')
              return
            }
            window.addEventListener('deviceorientation', this.eventAlternateAbsoluteOrientationSensor, false)
          }
        } catch (error) {
          console.error(error)
        }
      }

      // reaching this point without error/return means that
      // orientation events detection is active
      this.status = 'started'
    },
    stopSensor() {
      if (this.status === 'started') {
        if (this.deviceHasGyroscope) {
          this.sensor.stop()
        } else {
          window.removeEventListener("deviceorientationabsolute", this.handleDeviceOrientationEvent, true)
        }
        this.status = 'stopped'
      }
    },
    /**
     * handles deviceorientation event on iOS
     */
    eventAlternateAbsoluteOrientationSensor(e) {
      if (this.initialBearingAngle === null && e.webkitCompassHeading !== 0) {
        this.initialBearingAngle = (-e.webkitCompassHeading - e.alpha + 720) % 360
      }

      const alpha = e.webkitCompassHeading != null ? (this.initialBearingAngle + e.alpha) % 360 : e.alpha
      const beta     = e.beta
      const gamma    = e.gamma
      const degtorad = Math.PI / 180

      var _x = beta  ? beta  * degtorad : 0 // beta value
      var _y = gamma ? gamma * degtorad : 0 // gamma value
      var _z = alpha ? alpha * degtorad : 0 // alpha value
      var cX = Math.cos(_x/2)
      var cY = Math.cos(_y/2)
      var cZ = Math.cos(_z/2)
      var sX = Math.sin(_x/2)
      var sY = Math.sin(_y/2)
      var sZ = Math.sin(_z/2)

      // ZXY quaternion construction.
      var w = cX * cY * cZ - sX * sY * sZ
      var x = sX * cY * cZ - cX * sY * sZ
      var y = cX * sY * cZ + sX * cY * sZ
      var z = cX * cY * sZ + sX * sY * cZ

      this.sensor.quaternion = [ x, y, z, w ]

      this.absoluteOrientationSensorSuccess() // same process as Android
    },
    stopAlternateAbsoluteOrientationSensor() {
      window.removeEventListener('deviceorientation', this.eventAlternateAbsoluteOrientationSensor, false)
    },
    /**
     * detects if device has a gyroscope
     * updates this.deviceHasGyroscope property
     */
    async detectGyroscope() {
      // iOS Hack : all iphones have gyroscope
      if (this.isIOs || this.isSafari) {
        this.deviceHasGyroscope = true
      } else {
        // start devicemotion sensor (allows to detect gyroscope)
        window.addEventListener("devicemotion", this.handleMotionEventToDetectGyroscope, true)
        await this.waitForGyroscopeDetection()
      }
    },
    /**
     * Checks that property this.deviceHasGyroscope is either set to true or false
     * Otherwise, tries again until it becomes not null
     * @returns a promise
     */
    async waitForGyroscopeDetection () {
      let self = this
      return new Promise((resolve, reject) => {
        if (this.deviceHasGyroscope !== null) {
          this.gyroscopeDetectionCounter = 0
          resolve()
        } else {
          if (this.gyroscopeDetectionCounter > 40) {
            resolve()
          } else {
            this.gyroscopeDetectionCounter++
            utils.setTimeout(async () => {
              await self.waitForGyroscopeDetection()
              resolve()
            }, 250)
          }
        }
      })
    },
    /**
     * handle motion event (to detect if device has gyroscope)
     */
    handleMotionEventToDetectGyroscope (event) {
      // detect if device has gyroscope
      // inspired from https://stackoverflow.com/a/33843234/488666
      if (this.deviceHasGyroscope === null && !this.isIOs) {
        this.deviceHasGyroscope = ("rotationRate" in event && "alpha" in event.rotationRate && event.rotationRate.alpha !== null)

        window.removeEventListener('devicemotion', this.handleMotionEvent, true)
      }
    }
  }
}
</script>
