<template>
  <div class="column" ref="div-column">
    
    <!--====================== MAP PAGE =================================-->
    
    <div class="row fullscreen" ref="map" v-if="user.position !== null">
      
      <gmap-map
        v-if="isMounted"
        :center="map.center"
        :zoom="map.zoom"
        map-type-id="roadmap"
        class="map"
        ref="mapRef"
        :options="{disableDefaultUI:true}"
        @center_changed="updateCenter($event)"
        @dragend="dragEnd($event)"
        @click="closeInfoWindows()"
      >
        <!-- quest markers -->
        <gmap-marker v-for="(quest, index) in questList" :key="quest._id" :position="{ lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }" :icon="setMapIcon(quest)" @click="openQuestSummary(quest, index)" ref="questMarkers" />
        <!-- user markers -->
        <gmap-marker v-if="map.loaded" :position="{ lng: user.position.longitude, lat: user.position.latitude }" :icon="setMapIcon()" @click="openDiscoveryQuest()" />
        <!-- markers tooltips -->
        <gmap-info-window :options="map.infoWindow.options" :position="map.infoWindow.location" :opened="map.infoWindow.isOpen" @closeclick="map.infoWindow.isOpen=false">
          <div class="infoWindow">
            <p class="title" v-html="getQuestTitle(currentQuest, true)"></p>
            <p class="subtitle">
              <span v-if="currentQuest && currentQuest.level === 1">{{ $t('label.Easy') }}</span>
              <span v-if="currentQuest && currentQuest.level === 2">{{ $t('label.Normal') }}</span>
              <span v-if="currentQuest && currentQuest.level === 3">{{ $t('label.Hard') }}</span>
              <span v-if="currentQuest && currentQuest.level" class="text-blue-grey-2"> | </span>
              <span v-if="currentQuest && currentQuest.duration">{{ currentQuest.duration }} {{ $t('label.min') }}</span>
              <span v-if="currentQuest && currentQuest.duration" class="text-blue-grey-2"> | </span>
            </p>
            <p v-if="currentQuest && currentQuest.displayPrice">
              {{ currentQuest.displayPrice }}
            </p>
            <q-btn @click="playQuest(currentQuest ? currentQuest.questId : '')" color="primary" class="glossy normal-button">{{ $t('label.Play') }}</q-btn>
          </div>
        </gmap-info-window>
      </gmap-map>
    </div>
    
    <!------------------ GEOLOCATION COMPONENT ------------------------>
    
    <geolocation ref="geolocation-component" @success="onNewUserPosition($event)" @error="onUserPositionError()" />
      
    <!--====================== HEADER =================================-->
    
    <div class="q-py-sm q-px-md dark-banner fixed-top over-map">
      <q-btn flat icon="arrow_back" @click="backToHome" />
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'

import geolocation from 'components/geolocation'

import { gmapApi } from 'vue2-google-maps'

import utils from 'src/includes/utils'

export default {
  components: {
    geolocation
  },
  data () {
    return {
      map: {
        filter: 'all',
        zoom: 14,
        center: { lat: 0, lng: 0 },
        centerTmp: { lat: 0, lng: 0 },
        // for smooth 'panTo()' transition between marker clicks
        pan: {
          path: [],
          queue: [],
          steps: 20,
          duration: 700 // in milliseconds
        },
        infoWindow: {
          content: '',
          location: { lat: 0, lng: 0 },
          isOpen: false,
          options: { pixelOffset: { width: 0, height: -47 } }
        },
        loaded: false
      },
      user: {
        position: null
      },
      currentQuestIndex: null,
      currentQuest: null,
      questList: [],
      serverUrl: process.env.SERVER_URL,
      isMounted: false,
      isHybrid: window.cordova,
      loadingMap: true
    }
  },
  computed: {
    google: gmapApi
  },
  created () {
    document.addEventListener("backbutton", this.trackCallBackFunction, false);
  },
  mounted() {
    this.initPage()
    this.$nextTick(() => {
      this.isMounted = true
    })
  },
  methods: {
    async initPage () {
      // clear all running process
      utils.clearAllRunningProcesses()
    },
    async onNewUserPosition(position) {
      //let positionNeedsUpdate = (this.user.position === null || this.questList.length === 0)
      this.$set(this.user, 'position', position.coords)
      //if (positionNeedsUpdate) {
      if (this.map.loaded === false) {
        await this.reloadMap()
      }
    },
    centerOnUserPosition() {
      this.showBottomMenu = false
      if (this.user.position === null) {
        Notification(this.$t('label.LocationSearching'), 'warning')
        return
      }
      this.CenterMapOnPosition(this.user.position.latitude, this.user.position.longitude)
      this.map.zoom = 15
    },
    CenterMapOnPosition(lat, lng) {
      this.$data.map.center = {lat: lat, lng: lng}
    },
    /*
     * Open the summary box on quest click on the map
     * @param   {object}    quest           quest data
     * @param   {string}    idx             uniq index
     */
    openQuestSummary(quest, idx) {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }
      this.map.infoWindow.location = questCoordinates
      
      if (!(this.currentQuestIndex === idx && infoWindow.isOpen)) {
        // bounce marker animation
        let markerObject = this.$refs.questMarkers[idx].$markerObject
        markerObject.setAnimation(google.maps.Animation.BOUNCE)
        utils.setTimeout(() => { markerObject.setAnimation(null) }, 700) // found at https://stackoverflow.com/a/18411125/488666
      }
      
      //check if its the same marker that was selected if yes toggle
      if (this.currentQuestIndex === idx) {
        infoWindow.isOpen = !infoWindow.isOpen
      }
      //if different marker, set infowindow to open and reset current marker index
      else {
        this.currentQuestIndex = idx
        this.currentQuest = this.questList[idx]
        this.currentQuest.displayPrice = ''
        infoWindow.isOpen = true
        // center map on last clicked quest
        this.panTo(questCoordinates)
      }
      
      // get Quest price from store
      if (!quest.premiumPrice || !quest.premiumPrice.androidId || quest.premiumPrice.androidId === 'free') {
        this.currentQuest.displayPrice = this.$t('label.Free')
      } else {
        if (!window.store) {
          this.currentQuest.displayPrice = this.$t('label.QuestPlayableOnMobile')
        } else {
          // updated EMA => Connection to store to get prices impact prices display in home.vue page
          let prices = {
            'premiumprice1': "0,99 €",
            'premiumprice2': "1,99 €",
            'premiumprice3': "2,99 €",
            'premiumprice5': "4,99 €",
            'premiumprice10': "9,99 €",
            'premiumprice20': "19,99 €"
          }
          this.currentQuest.displayPrice = prices[quest.premiumPrice.androidId]
          /*store.register({
            id: quest.premiumPrice.androidId,
            alias: quest.premiumPrice.androidId,
            type: store.CONSUMABLE
          })
          var _this = this
console.log(quest.premiumPrice.androidId)
          store.when(quest.premiumPrice.androidId).updated(function(product) {
            _this.currentQuest.displayPrice = product.price
          })
          
          store.refresh()*/
        }
      }
    },
    /*
     * reload the map
     */
    async reloadMap() {
      this.map.loaded = null // to prevent multiple call of reload map if onNewUserPosition is called too often
      this.$q.loading.show()
      // get quests only if tutorial is advanced
      await this.getQuests()
      // close info windows (if already opened by discovery quest)
      this.closeInfoWindows()

      if (this.$refs.mapRef) {
        // adjust zoom / pan to nearest quests, or current user location
        if (this.questList.length > 0) {
          // fix found on https://teunohooijer.com/tag/vue2-google-maps/ to use google library
          this.$refs.mapRef.$mapPromise.then((map) => {
            const bounds = new google.maps.LatLngBounds()
            for (let q of this.questList) {
              bounds.extend({ lng: q.location.coordinates[0], lat: q.location.coordinates[1] })
            }
            // add user position
            bounds.extend({ lng: this.user.position.longitude, lat: this.user.position.latitude })
            map.fitBounds(bounds)
          });
        } else {
          this.centerOnUserPosition()
        }
        this.map.loaded = true
      } else {
        // on ios simulators, this.$refs.mapRef does not exists
        this.centerOnUserPosition()
        this.map.loaded = true
      }
      this.loadingMap = false
      this.$q.loading.hide()
    },
     /*
     * Get the list of quests near the location of the user
     */
    async getQuests(type) {
      this.showBottomMenu = false
      
      if (this.user.position === null) {
        Notification(this.$t('label.LocationSearching'), 'warning')
        return
      }
      
      if (!type) {
        this.map.filter = 'all'
      } else {
        this.map.filter = type
      }
      
      this.$q.loading.show()
      let response = await QuestService.listAllForCountry()
      this.$q.loading.hide()
      
      if (!response || !response.data) {
        Notification(this.$t('label.TechnicalIssue'), 'error')
        return
      }
      
      if (!response.data.message || response.data.message !== 'No quest') {
        this.questList = response.data
      }
      
      // if no quest, enlarge to all quests
      if (this.questList.length === 0 && this.map.filter !== 'world') {
        return this.getQuests('world')
      }     
    },
    /*
     * Get the level of each quest in the map
     */
    getQuestLevelName(id) {
      let level = utils.getById(questLevels, id)
      return level === null ? '' : level.name
    },
    
    // ------------- Map manipulation functions ----------------
    
    // from https://stackoverflow.com/a/3817835/488666
    panTo (position) {      
      // do not name <gmap-map> reference as 'map', otherwise $mapObject becomes undefined (!)
      this.$refs.mapRef.$mapObject.panTo(position)
    },
    
    updateCenter (ev) {
      let newLat = ev.lat();
      let newLng = ev.lng();
      if (this.map.center.lat !== newLat || this.map.center.lng !== newLng) {
        this.map.centerTmp = { lng: newLng, lat: newLat }
      }
    },
    
    dragEnd(ev) {
      // mapCenter is not automatically updated by <gmap-map>
      // new center coordinates are not available in event data
      // => use mapCenterTmp values saved by 'update_center' event
      this.map.center = this.map.centerTmp
    },
    closeInfoWindows() {
      this.map.infoWindow.isOpen = false
    },
    
    /*
     * Display title based on language
     * @param   {object}    quest            quest data
     * @param   {Boolean}   showLanguage     define if the map is displayed if the quest is not translated in the user language
     */
    getQuestTitle(quest, showLanguage) {
      if (!quest || !quest.title) {
        return this.$t('label.NoTitle')
      }
      if (this.$store.state.user.language && quest.title[this.$store.state.user.language]) {
        return quest.title[this.$store.state.user.language]
      } else if (quest.title[quest.mainLanguage] && quest.title[quest.mainLanguage] !== '') {
        return quest.title[quest.mainLanguage] + (showLanguage ? ' <img class="image-and-text-aligned" src="statics/icons/game/flag-' + Object.keys(quest.title)[0] + '.png" />' : '')
      } else {
        return this.$t('label.NoTitle')
      }
    },
    
    setMapIcon(quest) {
      /*let marker = {
        url: 'statics/icons/game/pointer-done-undefined.png',
        size: {width: 64, height: 64, f: 'px', b: 'px'},
        scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 20, y: 40}
      }
      if (quest) {
        if (quest.authorUserId === this.$store.state.user._id) {
          marker.url = 'statics/icons/game/pointer-mine-' + quest.category + '.png'
        } else {
          if (quest.status !== 'played') {
            if (quest.type === 'quest') {
              marker.url = 'statics/icons/game/pointer-done-' + quest.category + '.png'
            } else {
              marker.url = 'statics/icons/game/pointer-' + quest.editorMode + '-' + quest.category + '.png'
            }
          }
        }
        return marker
      } else {*/
        return {
          url: 'statics/images/icon/place.svg',
          size: {width: 60, height: 60, f: 'px', b: 'px'},
          scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
          origin: {x: 0, y: 0},
          anchor: {x: 15, y: 15}
        }
      //}
    },
    /*
     * Prevent mobile player to use back button here
     */
    trackCallBackFunction() {
      return false
    },
    onUserPositionError(ret) {
      // reset position only if localization never worked, else keep current location
      if (ret) {
        this.user.position = null
      }
    },
    /*
     * Launch a quest
     */
    playQuest(questId) {
      this.$router.push('/quest/play/' + questId)
    },
    
    /*
     * back to home page
     */
    backToHome() {
      this.$router.push('/home')
    }
  }
}
</script>

<style>

</style>
