<template>
  <div class="geolocation-layer" v-if="!isSupported || !isActive">
    <div v-if="!isActive" class="search-geolocation fixed-bottom"> 
      <div class="centered q-pa-md">
        <q-spinner-puff color="primary" size="25px" /> &nbsp;{{ $t('label.LocationSearching') }}
      </div>
      <div v-if="askUserToEnableGeolocation">
        <div class="q-pa-md subtitle6">
          {{ $t('label.CouldNotRetrieveYourPosition') }}
        </div>
        <q-expansion-item
          expand-separator
          :label="$t('label.ReadMore')"
        >
          <div class="q-pa-md subtitle6">
            {{ $t('label.PossibleReasons') }}
            <ul>
              <li>{{ $t('label.ClosedEnvironment') }}</li>
              <li>
                {{ $t('label.GeolocationDisabled') }}
                <span v-if="nativeSettingsIsEnabled"><br /><q-btn color="primary" @click="openLocationSettings">{{ $t('label.OpenLocationSettings') }}</q-btn></span>
              </li>
            </ul>
            <div v-if="!nativeSettingsIsEnabled">
              <div v-if="isChrome">
                <p v-html="$t('label.HowToActivateGeolocationOnChrome')"></p>
              </div>
              <div v-if="!isChrome">
                <p v-html="$t('label.HowToActivateGeolocationOnIOs')"></p>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>
    </div>
    <div class="geolocation-not-supported" v-if="!isSupported" style="flex-grow: 1">
      {{ $t('label.GeolocationNotSupported') }}
    </div>
  </div>
</template>

<script>

import utils from 'src/includes/utils'

export default {
  // name: 'ComponentName',
  props: {
    maximumAge: { type: Number, default: 0 },
    withNavBar: { type: Boolean, default: false }
  },
  data () {
    return {
      isSupported: true,
      isActive: false,
      nativeSettingsIsEnabled: (window.cordova && window.cordova.plugins.settings),
      userDeniedGeolocation: false,
      timeoutBetweenFailedAttempts: 10000,
      nbFails: 0,
      disabled: false,
      alreadyWorked: false,
      method: utils.isIOS() ? 'getCurrentPosition' : 'watchPosition',
      // specific to method 'watchPosition'
      geolocationWatchId: null,
      // specific to method 'getCurrentPosition' (not currently used)
      timeoutIds: []
    }
  },
  watch: {
    disabled: function (newVal, oldVal) {
      if (newVal === true) {
        this.stopTracking()
      } else {
        this.startTracking()
      }
    }
  },
  computed: {
    // from https://stackoverflow.com/a/13348618/488666
    // adapted because my Android Chrome User Agent contains 'OPR'!
    // (Mozilla/5.0 (Linux; Android 8.0.0; ASUS_Z012D Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36)
    isChrome() {
      let isChromium = window.chrome,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        //isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");
      if (isIOSChrome) {
        return true;
      } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        //isOpera === false &&
        isIEedge === false
      ) {
        return true;
      } else {
        return false;
      }
    },
    askUserToEnableGeolocation() { return (this.nbFails >= 1 && !this.alreadyWorked) || this.userDeniedGeolocation }
  },
  mounted() {
    if (!navigator || !navigator.geolocation) {
      this.isSupported = false
      return
    }
    
    this.startTracking()
  },
  beforeDestroy() {
    this.stopTracking()
  },
  methods: {
    startTracking() {
      if (this.disabled) {
        return
      }

      if (this.method === 'watchPosition') {
        this.geolocationWatchId = navigator.geolocation.watchPosition(this.locationSuccess, this.locationError, {
          enableHighAccuracy: true,
          timeout: this.timeoutBetweenFailedAttempts,
          maximumAge: this.maximumAge
        })
      } else {
        navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, {
          enableHighAccuracy: true,
          timeout: this.timeoutBetweenFailedAttempts, // fixed timeout of 5s for first attempt => better chances to avoid timeout error
          maximumAge: this.maximumAge
        })
      }
    },
    /*
     * Handle location error
     * @param   {string}    err            Error string
     */
    locationError(err) {
      console.log('*** locationError', err)
      // avoids to run this method asynchronously (can happen even after component is set to disabled !)
      if (this.disabled) {
        return
      }
      
      console.warn('Could not get location')
      console.log(err)
      this.isSupported = true
      this.isActive = false
      this.nbFails++
      this.userDeniedGeolocation = (err.code === 1) // corresponding to PositionError.PERMISSION_DENIED. works only for webapp mode.
      this.$emit('error', !this.alreadyWorked)
      
      if (this.method === 'watchPosition') {
        this.stopTracking()
      }
      
      let timeoutId = utils.setTimeout(this.startTracking, this.timeoutBetweenFailedAttempts)
      
      if (this.method === 'getCurrentPosition') {
        this.timeoutIds.push(timeoutId)
      }
    },
    /*
     * Handle location tracking success
     * method 'watchPosition' calls locationSuccess() each time a position change has been detected
     * method 'getCurrentPosition' calls locationSuccess() only once when location has been detected
     * @param   {object}    position        Current device position
     */
    locationSuccess(position) {
      // avoids to run this method asynchronously (can happen even after component is set to disabled !)
      if (this.disabled) {
        return
      }

      this.isSupported = true
      this.alreadyWorked = true
      this.isActive = true
      this.nbFails = 0
      this.userDeniedGeolocation = false

      this.$emit('success', position)

      if (this.method === 'getCurrentPosition') {
        let timeoutId = utils.setTimeout(this.startTracking, 1000)
        this.timeoutIds.push(timeoutId)
      }
    },
    /*
     * Forces stop refreshing location
     */
    stopTracking() {
      if (this.method === 'watchPosition') {
        if (this.geolocationWatchId !== null) {
          navigator.geolocation.clearWatch(this.geolocationWatchId)
          this.geolocationWatchId = null
        }
      } else {
        if (this.timeoutIds.length > 0) {
          for (let timeoutId of this.timeoutIds) {
            clearTimeout(timeoutId)
          }
          this.timeoutIds = []
        }
      }
    },
    openLocationSettings () {
      if (window.cordova && window.cordova.plugins.settings) {
        window.cordova.plugins.settings.open("location", () => {
          this.nativeSettingsIsEnabled = true
          this.userDeniedGeolocation = false
          this.nbFails = 0
        },
        function () {
          console.warn('failed to open settings')
          this.nativeSettingsIsEnabled = false
        });
      } else {
        console.warn('openNativeSettings is not active!')
        this.nativeSettingsIsEnabled = false
      }
    }
  }
}
</script>

<style scoped>

.geolocation-layer { position: absolute; top: 0; left: 0; right: 0; display: flex; flex-direction: column; height: initial !important; min-height: initial !important; }

.geolocation-layer.without-nav-bar { bottom: 0; }
.geolocation-layer.with-nav-bar { bottom: 14vw; }
.geolocation-layer.disabled { display: none !important; }

.enable-geolocation, .geolocation-not-supported {
  background: white; z-index: 40; display: flex; align-items: left; justify-content: center; flex-direction: column; padding: 1rem; height: 100% !important; flex-grow: 1;
}

.enable-geolocation .text-primary { font-weight: bold; }
.enable-geolocation p { text-align: justify; margin: 0.5rem; }
.enable-geolocation li { text-align: justify; margin: 0.5rem; }
.enable-geolocation ul { margin: 0 1rem; padding: 0 }

/*.search-geolocation { position: absolute; width: 100%; height: 10vw !important; min-height: initial !important;  display: flex; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center; justify-content: center; background: orange; }*/
.search-geolocation { width: 100%; min-height: 50px;  background: orange;}

.search-geolocation.without-nav-bar { z-index: 7000; bottom: 0; }
.search-geolocation.with-nav-bar { z-index: 60; bottom: 4vw; }

</style>
