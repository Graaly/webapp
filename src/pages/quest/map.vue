<template>
  <div class="column" ref="div-column">
    
    <!------------------ MAP AREA ------------------------>
    
    <div class="row" ref="map" v-if="geolocationIsSupported">
      
      <gmap-map
        :center="mapCenter"
        :zoom="11"
        map-type-id="roadmap"
        class="map"
        ref="map"
        :options="{disableDefaultUI:true}"
        @center_changed="updateCenter($event)"
        @dragend="dragEnd($event)"
      >
        <gmap-marker v-for="(quest, index) in questList" :key="quest._id" :position="{ lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }" :icon="quest.status === 'played' ? questMarkerPlayed : questMarker"
          @click="openQuestSummary(quest, index)" />
        
        <gmap-info-window :options="infoWindow.options" :position="infoWindow.location" :opened="infoWindow.isOpen" @closeclick="infoWindow.isOpen=false">
          <div class="infoWindow">
            <p class="title">{{ currentQuest ? currentQuest.title : '' }}</p>
            <p>{{ $t('label.Difficulty') }} : {{ $t('label.' + (currentQuest ? getQuestLevelName(currentQuest.level) : getQuestLevelName(2))) }}</p>
            <q-btn @click="$router.push('/quest/play/' + (currentQuest ? currentQuest._id : ''))" color="primary">{{ $t('label.Play') }}</q-btn>
          </div>
        </gmap-info-window>
      </gmap-map>
    </div>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="row enable-geolocation" v-if="!geolocationIsSupported">
      <div class="col-12">
        <h5>{{ $t('label.PleaseActivateGeolocation') }}</h5>
        <div v-if="isChrome">
          <p v-html="$t('label.HowToActivateGeolocationOnChrome')"></p>
          <p>
            {{ $t('message.OnceGeolocationEnabled') }}
            <!-- see https://github.com/vuejs/vue-router/issues/296 -->
            <router-link :to="$route.path + '?_=' + (new Date).getTime()">{{ $t('message.PressHere') }}</router-link>.
          </p>
        </div>
      </div>
    </div>
    
    <!------------------ SCORE AREA ------------------------>
    
    <div class="score-box">
      <div class="q-pa-md">{{ $store.state.user.score }} <img src="statics/icons/game/trophy-small.png" /></div>
    </div>  
    
    <!------------------ MENU AREA ------------------------>
    
    <div class="menu-background"></div>
    <div class="menu row">
      <div class="col centered" @click="openSuccessPage()">
        <img src="statics/icons/game/menu-quest.png" />
      </div>
      <div class="col centered" @click="openSearchOptions()">
        <img src="statics/icons/game/menu-main.png" />
      </div>
      <div class="col centered" @click="openProfilePage()">
        <div class="mid-avatar">
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
          <div v-if="!$store.state.user.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
        </div>
      </div>
    </div>   
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import questLevels from 'data/questLevels.json'
import utils from 'src/includes/utils'

export default {
  data () {
    return {
      mapCenter: { lat: 0, lng: 0 },
      mapCenterTmp: { lat: 0, lng: 0 },
      infoWindow: {
        content: '',
        location: { lat: 0, lng: 0 },
        isOpen: false,
        options: { pixelOffset: { width: 0, height: -35 } }
      },
      currentQuestIndex: null,
      currentQuest: null,
      // for smooth 'panTo()' transition between marker clicks
      pan: {
        path: [],
        queue: [],
        steps: 20,
        duration: 700 // in milliseconds
      },
      geolocationIsSupported: (navigator && navigator.geolocation),
      searchText: '',
      questList: [],
      questMarker: {
        url: 'statics/icons/game/pointer-active.png',
        size: {width: 40, height: 40, f: 'px', b: 'px'},
        scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 20, y: 40}
      },
      questMarkerPlayed: {
        url: 'statics/icons/game/pointer-inactive.png',
        size: {width: 40, height: 40, f: 'px', b: 'px'},
        scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 20, y: 40}
      },
      serverUrl: process.env.SERVER_URL
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
    this.findLocation()
  },
  methods: {
    /*
     * Get user location
     */
    findLocation() {
      var self = this
      if (this.$data.geolocationIsSupported) {
        // getCurrentPosition() is not always reliable (timeouts/fails frequently)
        // see https://stackoverflow.com/q/3397585/488666
        this.$q.loading.show()
        navigator.geolocation.getCurrentPosition((position) => {
          this.$data.mapCenter = {lat: position.coords.latitude, lng: position.coords.longitude}
          // TODO maybe here save current position in 'state' for later use in case of failure
          self.getQuests()
          this.$q.loading.hide()
        }, () => {
          console.error('geolocation failed')
          self.geolocationIsSupported = false
          this.$q.loading.hide()
          // try again in 10s
          setTimeout(self.findLocation, 10000)
          // TODO maybe here recall position stored in 'state'
        }, 
        { 
          timeout: 5000, 
          maximumAge: 10000 
        });
      }
    },
    
    /*
     * Open the summary box on quest click on the map
     * @param   {object}    quest           quest data
     * @param   {string}    idx             uniq index
     */
    openQuestSummary(quest, idx) {
      let infoWindow = this.infoWindow
      let questCoordinates = { lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }
      this.infoWindow.location = questCoordinates
      
      //check if its the same marker that was selected if yes toggle
      if (this.currentQuestIndex === idx) {
        infoWindow.isOpen = !infoWindow.isOpen
      }
      //if different marker, set infowindow to open and reset current marker index
      else {
        this.currentQuestIndex = idx
        this.currentQuest = this.questList[idx]
        infoWindow.isOpen = true
        // center map on last clicked quest
        this.panTo(questCoordinates)
      }
    },
     /*
     * Get the list of quests near the location of the user
     */
    async getQuests() {
      let response = await QuestService.listNearest(this.mapCenter)
      this.questList = response.data
    },
    
    /*
     * Get the level of each quest in the map
     */
    getQuestLevelName(id) {
      let level = utils.getById(questLevels, id)
      return level === null ? '' : level.name
    },
    
    // ------------- Map manipulation functions ----------------
    
    // from https://stackoverflow.com/a/33339155/488666
    panTo (position) {
      let panPath = this.pan.path
      let panQueue = this.pan.queue
      let panSteps = this.pan.steps
      if (panPath.length > 0) {
        // We are already panning...queue this up for next move
        panQueue.push(position)
      } else {
        // easeIn animation computation: see https://stackoverflow.com/a/11808697/488666
        panPath.push("LAZY SYNCRONIZED LOCK")  // make length non-zero - 'release' this before calling setTimeout
        var curLat = this.mapCenter.lat
        var curLng = this.mapCenter.lng
        var dLat = (position.lat - curLat)
        var dLng = (position.lng - curLng)
        
        for (var i = 1; i <= panSteps; i++) {
          let elapsed = this.pan.duration * (i / panSteps);
          let newLat = this.easeOutQuad(elapsed, curLat, dLat, this.pan.duration);
          let newLng = this.easeOutQuad(elapsed, curLng, dLng, this.pan.duration);
          panPath.push({ lat: newLat, lng: newLng })
        }
        panPath.push(position)
        panPath.shift() // LAZY SYNCRONIZED LOCK
        
        setTimeout(this.doPan, this.pan.duration / this.pan.steps)
      }
    },

    doPan () {
      var next = this.pan.path.shift();
        
      if (next != null) {
        // Continue our current pan action
        this.mapCenter = next;
        setTimeout(this.doPan, this.pan.duration / this.pan.steps);
      } else {
        // We are finished with this pan - check if there are any queue'd up locations to pan to 
        var queued = this.pan.queue.shift();
        if (queued != null) {
          this.panTo(queued);
        }
      }
    },
    
    updateCenter (ev) {
      let newLat = ev.lat();
      let newLng = ev.lng();
      if (this.mapCenter.lat !== newLat || this.mapCenter.lng !== newLng) {
        this.mapCenterTmp = { lng: newLng, lat: newLat }
      }
    },
    
    dragEnd(ev) {
      // mapCenter is not automatically updated by <gmap-map>
      // new center coordinates are not available in event data
      // => use mapCenterTmp values saved by 'update_center' event
      this.mapCenter = this.mapCenterTmp
    },
    
    // https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    // t: current time, b: beginning value, c: change in value, d: duration
    easeOutQuad: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    
    /*
     * Open the search menu
     */
    openSearchOptions() {
      this.$q.actionSheet({
        title: 'Article Actions',

        // specify ONLY IF you want grid mode:
        grid: true,

        actions: [
          {
            label: 'Delete',

            // Optional
            color: 'negative',

            // Choose one of the following two:
            icon: 'delete', // specify ONLY IF using icon
            avatar: 'assets/some-avatar.png', // specify ONLY IF using avatar

            // optional; what to do when user chooses this action;
            // Can also be handled later by using the returned Promise
            // and identifying the action from "action" param
            handler () {
              console.log('Deleted Article')
            }
          }
        ]
      })
    },
    /*
     * Open the success page
     */
    openSuccessPage() {
      this.$router.push('/user/me/success')
    },
    /*
     * Open the profile page
     */
    openProfilePage() {
      this.$router.push('/user/profile')
    } 
  }
}
</script>
