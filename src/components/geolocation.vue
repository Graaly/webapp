<template>
  <div class="geolocation-layer" v-if="!isSupported || !isActive">
    <div v-if="!isActive && (nbFails >= 2)"> 
      <q-page-sticky position="top-right" style="z-index: 15000;" :offset="[18, 18]">
        <q-btn color="primary" round icon="location_off" style="font-size: 15px;" class="flashing" @click="showHelp = true" />
      </q-page-sticky>
    </div>  
      
    <!------------------ HELP POPUP ------------------------>
    
    <q-dialog v-model="showHelp">
      <q-card>
        <q-card-section class="popup-header centered">
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          {{ $t('label.LocationSearching') }}
          <div v-if="askUserToEnableGeolocation">
            <div class="q-pa-md subtitle6">
              {{ $t('label.CouldNotRetrieveYourPosition') }}
            </div>
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
          </div>
          <div class="geolocation-not-supported" v-if="!isSupported" style="flex-grow: 1">
            {{ $t('label.GeolocationNotSupported') }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import utils from 'src/includes/utils'

export default {
  // name: 'ComponentName',
  props: {
    maximumAge: { type: Number, default: 0 }
  },
  data () {
    return {
      isSupported: true,
      isActive: false,
      nativeSettingsIsEnabled: (window.cordova && window.cordova.plugins.settings),
      userDeniedGeolocation: false,
      timeoutBetweenFailedAttempts: 5000,
      nbFails: 0,
      disabled: false,
      alreadyWorked: false,
      showHelp: false,
      method: utils.isIOS() ? 'getCurrentPosition' : 'watchPosition',
      //method: 'watchPosition', // not working perfectly for ios
      // specific to method 'watchPosition'
      geolocationWatchId: null,
      // specific to method 'getCurrentPosition' (not currently used)
      timeoutIds: [],
      positionHistory: []
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
    askUserToEnableGeolocation() { 
      return (this.nbFails >= 2 && !this.alreadyWorked) || this.userDeniedGeolocation 
    }
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
      // kill tracking if running
      this.stopTracking()
      // MPA 2022-07-08 tried here to use Cordova plugin cordova.plugins.permissions to check if player has allowed
      // Graaly to retrieve his location, however this is not compatible enough across various Android devices.
      // For example, a Samsung Galaxy S8 with geolocation enabled will still trigger the "permission denied" behavior 🤯.
      // I've tried with checkPermission() method on cordova.plugins.permissions.ACCESS_FINE_LOCATION permission.
      if (this.method === 'watchPosition') {
        this.isActive = true
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
      console.warn('Could not get location', err)
      // avoids to run this method asynchronously (can happen even after component is set to disabled !)
      if (this.disabled) {
        return
      }
      
      this.isSupported = true
      this.isActive = false
      this.nbFails++
      if (!window.cordova) {
        // corresponding to PositionError.PERMISSION_DENIED. works only for webapp mode.
        this.userDeniedGeolocation = (err.code === 1) 
      }
      this.$emit('error', !this.alreadyWorked)
      
      // still attempt to retrieve user position even if it failed
      /*if (this.method === 'watchPosition') {
        this.stopTracking()
      }*/
      
      if (this.method === 'getCurrentPosition') {
        // IMPORTANT : do not use utils.setTimeout => Not working for an unknown reason 
        let timeoutId = setTimeout(this.startTracking, this.timeoutBetweenFailedAttempts)
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
      
      //const computedPosition = this.computeRelevantPosition(position)

      this.$emit('success', {
        coords: {
          accuracy: (position.coords && position.coords.accuracy) ? position.coords.accuracy : 10,
          altitude: position.coords ? position.coords.altitude : null,
          speed: position.coords ? position.coords.speed : null,
          //latitude: computedPosition.latitude,
          //longitude: computedPosition.longitude
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      })

      if (this.method === 'getCurrentPosition') {
        let timeoutId = setTimeout(this.startTracking, 1000)
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
      }
      if (this.timeoutIds.length > 0) {
        for (let timeoutId of this.timeoutIds) {
          clearTimeout(timeoutId)
        }
        this.timeoutIds = []
      }
    },
    // MPA 2021-06-28 disabled since inaccurate positions are now ignored + it may add lag to position update
    /*computeRelevantPosition (position) {
      if (position && position.coords) {
        // add position in history
        if (this.positionHistory.length >= 5) {
          this.positionHistory.splice(0, 1)
        }
        this.positionHistory.push({latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy})
        
        const historyLength = this.positionHistory.length
        var latDenum = 0
        var lngDenum = 0
        var latWeighted = 0
        var lngWeighted = 0
        var latWeightValue = 0
        var lngWeightValue = 0
        for (var i = 0; i < historyLength; i++) {
          latWeightValue = 1 / (this.positionHistory[i].latitude * (historyLength - i))
          lngWeightValue = 1 / (this.positionHistory[i].longitude * (historyLength - i))
          latWeighted += this.positionHistory[i].latitude * latWeightValue
          lngWeighted += this.positionHistory[i].longitude * lngWeightValue
          latDenum += latWeightValue
          lngDenum += lngWeightValue
        }
        return {latitude: latWeighted / latDenum, longitude: lngWeighted / lngDenum}
      } else {
        return position
      }
    },*/
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

/*.enable-geolocation, .geolocation-not-supported {*/
.geolocation-not-supported {
  background: white; z-index: 40; display: flex; align-items: left; justify-content: center; flex-direction: column; padding: 1rem; height: 100% !important; flex-grow: 1;
}

</style>
