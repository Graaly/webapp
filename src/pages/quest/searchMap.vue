<template>
  <div class="column" ref="div-column">
    
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
          @click="onQuestClick(quest, index)" />
        
        <gmap-info-window :options="infoWindow.options" :position="infoWindow.location" :opened="infoWindow.isOpen" @closeclick="infoWindow.isOpen=false">
          <div class="infoWindow">
            <h1>{{ currentQuest ? currentQuest.title : '' }}</h1>
            <p>{{ $t('message.Difficulty') }} : {{ $t('message.' + (currentQuest ? getQuestLevelName(currentQuest.level) : getQuestLevelName(2))) }}</p>
            <q-btn @click="$router.push('/quest/play/' + (currentQuest ? currentQuest._id : ''))" color="tertiary">{{ $t('message.Play') }}</q-btn>
          </div>
        </gmap-info-window>
        
      </gmap-map>

    </div>
    
    <div class="row enable-geolocation" v-if="!geolocationIsSupported">
      <div class="col-12">
        <h5>{{ $t('message.PleaseActivateGeolocation') }}</h5>
        <div v-if="isChrome">
          <p v-html="$t('message.HowToActivateGeolocationOnChrome')"></p>
          <p>
            {{ $t('message.OnceGeolocationEnabled') }}
            <!-- see https://github.com/vuejs/vue-router/issues/296 -->
            <router-link :to="$route.path + '?_=' + (new Date).getTime()">{{ $t('message.PressHere') }}</router-link>.
          </p>
        </div>
      </div>
    </div>
    
    <div class="team-box" @click="$router.push('/team/' + team.profile._id + '/members')">
      <div class="badge">
        <img :src="serverUrl + '/statics/badges/' + team.profile.badge" />
      </div>
      
      <div class="desc">
        <p><h1>{{ team.profile.name }}</h1></p>
        <p class="subtitle">{{ $t('message.successfulQuests', { nb: team.profile.statistics.nbQuestsSuccessful }) }}</p>
        <p class="subtitle">{{ $t('message.createdQuests', { nb: team.profile.statistics.nbQuestsCreated }) }}</p>
      </div>
      
      
      <div class="score-box">
        <div class="score">
          {{ team.profile.score.total }}
        </div>
      </div>
    </div>
    <div class="row-auto" style="height: 36px; overflow: hidden;">
      <q-btn class="full-width" @click="$router.push('/quest/create')" color="primary" icon="fas fa-magic">{{ $t('message.CreateAQuestAndWinPoints') }}</q-btn>
    </div>
    
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import AuthService from 'services/AuthService'
import TeamService from 'services/TeamService'

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
        scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 15, y: 30}
      },
      questMarkerPlayed: {
        url: 'statics/icons/game/pointer-inactive.png',
        size: {width: 40, height: 40, f: 'px', b: 'px'},
        scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 15, y: 30}
      },
      team: {
        profile: {
          statistics: {}, 
          score: {}
        },
        news: {
          limit: 20,
          skip: 0,
          items: []
        }
      },
      user: {name: "--", picture: "", id: ""},
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
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('message.Map'))
    
    this.getAccountInformations()
    
    // display add to home screen for apple device
    addToHomescreen()
   
    this.findLocation()
  },
  methods: {
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
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId) {
        if (this.user.status === "new") {
          this.$router.push('/intro')
        } else {
          this.getTeam(this.user.team.currentId)
        }
      } else {
        this.$router.push('/intro')
      }
    },
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific sore
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    onQuestClick(quest, idx) {
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
    
    async getQuests() {
      let response = await QuestService.listNearest(this.mapCenter)
      this.questList = response.data
    },
    
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
    }
  }
}
</script>

<style scoped>
#main-view { padding: 0rem; }

.infoWindow {
  text-align: center;
  padding: 3px;
}

.column { display: flex; flex-flow: column nowrap; align-items: stretch;}

.column .row { flex: 1; }
.column .row, .column .row-auto { width: 100%; }

.map {
  width: 100%; 
  height: 100%; 
}

.enable-geolocation { padding: 1rem; }
</style>
