<template>
  <div class="geolocation-layer centered" :class="withNavBar ? 'with-nav-bar' : 'without-nav-bar'" v-if="!isSupported || !isActive">
    <div class="enable-geolocation" v-if="!isActive && nbFails > 1">
      <p class="text-primary">{{ $t('label.PleaseActivateGeolocation') }}</p>
      <div v-if="nativeSettingsIsEnabled">
        <q-btn color="primary" @click="openLocationSettings">{{ $t('label.PressHere') }}</q-btn>
      </div>
      <div v-if="!nativeSettingsIsEnabled">
        <div v-if="isChrome">
          <p v-html="$t('label.HowToActivateGeolocationOnChrome')"></p>
        </div>
        <div v-if="!isChrome">
          <p v-html="$t('label.HowToActivateGeolocationOnIOs')"></p>
        </div>
        <p>
          {{ $t('label.OnceGeolocationEnabled') }}
          <router-link :to="$route.path + '?_=' + (new Date).getTime()">{{ $t('label.PressHere') }}</router-link>.
        </p>
      </div>
    </div>
    <div class="search-geolocation centered" :class="withNavBar ? 'with-nav-bar' : 'without-nav-bar'" v-if="!isActive && nbFails <= 1">
      <p><q-spinner-puff color="primary" size="25px" /></p>
      <p>{{ $t('label.LocationSearching') }}</p>
    </div>
    <div v-if="!isSupported" style="flex-grow: 1">
      {{ $t('label.GeolocationNotSupported') }}
    </div>
  </div>
</template>

<script>
export default {
  // name: 'ComponentName',
  props: {
    interval: Number, // refresh location interval, in ms
    maximumAge: { type: Number, default: 0 },
    withNavBar: { type: Boolean, default: false }
  },
  data () {
    return {
      locationWatcher: null,
      isSupported: true,
      isActive: false,
      nativeSettingsIsEnabled: true,
      nbFails: 0
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
    }
  },
  mounted() {
    if (!navigator || !navigator.geolocation) {
      return
    }

    try {
      this.locationWatcher = navigator.geolocation.watchPosition(this.watchLocationSuccess, this.watchLocationError, {
        enableHighAccuracy: true,
        timeout: this.interval,
        maximumAge: this.maximumAge
      })
    } catch (e) {
      console.log(e)
      this.isSupported = false
    }
  },
  beforeDestroy() {
    this.clearWatch()
  },
  methods: {
    
    /*
     * Handle location error
     * @param   {string}    err            Error string
     */
    watchLocationError(err) {
      console.warn('Could not get location from watchPosition()')
      console.log(err)
      this.isSupported = true
      this.nbFails++
      this.isActive = false
      this.$emit('error')
    },
    /*
     * Handle location tracking success
     * @param   {object}    position        Current device position
     */
    watchLocationSuccess(position) {
      this.isSupported = true
      this.isActive = true
      this.nbFails = 0
      this.$emit('success', position)
    },
    /*
     * Forces stop refreshing location
     */
    clearWatch() {
      navigator.geolocation.clearWatch(this.locationWatcher)
    },
    openLocationSettings () {
      if (window.cordova && window.cordova.plugins.settings) {
        window.cordova.plugins.settings.open("location", () => {
          this.nativeSettingsIsEnabled = true
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

.enable-geolocation {
  background: white; z-index: 40; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 1rem; height: 100% !important; flex-grow: 1;
}

.search-geolocation { width: 100%; height: 9vw !important; min-height: initial !important;  display: flex; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center; justify-content: center; background: orange; }
.search-geolocation p { display: flex; margin: 1vw; }

.search-geolocation.without-nav-bar { z-index: 7000; }
.search-geolocation.with-nav-bar { z-index: 60; }
  
</style>
