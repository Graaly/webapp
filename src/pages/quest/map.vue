<template>
  <div class="column" ref="div-column">
    
    <!------------------ SUCCESS PAGE ------------------------>
    
    <q-layout-drawer side="left" v-model="showSuccess">
    
      <!------------------ HEADER AREA ------------------------>
        
      <div class="header row">
        <div class="col-4 q-pl-md q-pt-sm">
          <img src="statics/icons/game/cup-medium-white.png" />
        </div>
        <div class="col">
          <p>
            {{ $t('label.YourScore') }}: {{ $store.state.user.score }}
          </p>
          <p>
            {{ $t('label.YourRevenues') }}: {{ $store.state.user.score }}
          </p>
        </div>
      </div>
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs>
        <q-tab slot="title" name="built" icon="message" :label="$t('label.QuestsCreated')" default />
        <q-tab slot="title" name="played" icon="fingerprint" :label="$t('label.QuestsSuccessful')" />
      
        <!------------------ LIST OF QUESTS BUILT TAB ------------------------>
        
        <q-tab-pane name="built">
          <!------------------ ADD A QUEST BUTTON AREA ------------------------>
            
          <q-btn link class="full-width" @click="$router.push('/quest/create/welcome')" color="primary">{{ $t('label.CreateANewQuest') }}</q-btn>
          
          <!------------------ LIST OF QUESTS BUILT AREA ------------------------>
          
          <q-list highlight>
            <q-item v-for="quest in success.quests.built" :key="quest._id" @click.native="$router.push((profile.me ? '/quest/edit/' + quest._id : '/quest/play/' + quest._id))">
              <q-item-side v-if="quest.picture" :avatar="serverUrl + '/upload/quest/' + quest.picture" />
              <q-item-side v-if="!quest.picture" :avatar="'/statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ quest.title }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" /> -
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                  {{ $t('label.Unpublished') }}
                </q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-if="success.quests.built.length === 0">
              <q-item-main>
                <q-item-tile label>{{ $t('label.NoQuestCreated') }}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        
        <!------------------ LIST OF QUESTS PLAYED TAB ------------------------>
        
        <q-tab-pane name="played">
          <q-list highlight>
          <q-item v-if="success.quests.played && success.quests.played.length > 0" v-for="quest in success.quests.played" :key="quest._id" @click.native="$router.push('/quest/play/'+quest.questId)">
            <q-item-side v-if="quest.questData && quest.questData.picture" :avatar="serverUrl + '/upload/quest/' + quest.questData.picture" />
            <q-item-side v-if="!quest.questData || !quest.questData.picture" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ quest.questData.title }}</q-item-tile>
              <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && !quest.score">
                {{ $t('label.PlayedOn') }} {{quest.dateCreated | formatDate}}
              </q-item-tile>
              <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                {{ $t('label.Succeeded') }} {{quest.dateCreated | formatDate}}
              </q-item-tile>
              <q-item-tile sublabel v-if="!quest.dateCreated">
                {{ $t('label.Succeeded') }}
              </q-item-tile>
              <q-item-tile sublabel v-if="quest.status == 'in-progress'">
                {{ $t('label.ContinueThisQuest') }}
              </q-item-tile>
            </q-item-main>
            <q-item-side right class="score">
              {{ quest.score }}
            </q-item-side>
          </q-item>
          <q-item v-if="success.quests.played.length === 0">
            <q-item-main>
              <q-item-tile label>{{ $t('label.NoQuestPlayed') }}</q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
        </q-tab-pane>
      </q-tabs>

      <!------------------ MENU AREA ------------------------>
      
      <div class="menu-background"></div>
      <div class="menu row">
        <div class="q-pr-xl col align-right" @click="backToMap()">
          <q-btn @click="backToMap()" rounded color="primary" size="xl" :label="$t('label.BackToMap')" icon-right="arrow_forward" />
        </div>
      </div>  
      
    </q-layout-drawer>
    
    <!------------------ PROFILE PANEL ------------------------>
    
    <q-layout-drawer side="right" v-model="showProfile">
    
      <!------------------ HEADER AREA ------------------------>
        
      <div class="header row">
        <div class="col-4">
          <div class="big-avatar">
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
            <div v-if="!$store.state.user.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
            <label for="picturefile">{{ $t('label.Edit') }}</label>
          <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
          </div>
        </div>
        <div class="col">
          <div class="title">{{ $store.state.user.name }}</div>
          <q-btn :label="$t('label.SignOut')" icon="power_settings_new" @click="Disconnect()" flat />
        </div>
      </div>
      
      <!------------------ LEVEL AREA ------------------------>
      
      <div class="q-pa-md">
        <p class="centered">{{ $t('label.MyLevel') }} : {{ $store.state.user.level }}</p>
        <q-progress :percentage="profile.level.progress" stripe animate height="30px" color="primary"></q-progress>
        {{ $t('label.ReachScoreOf', {score: profile.level.max}) }} <a @click="openHowTo()">{{ $t('label.HowTo') }}</a>
      </div>
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs>
        <q-tab slot="title" name="profile" icon="face" :label="$t('label.MyProfile')" />
        <q-tab slot="title" name="friends" icon="supervised_user_circle" :label="$t('label.Friends')" />
        <q-tab slot="title" name="news" icon="notifications" :label="$t('label.News')" default />
      
        <!------------------ PROFILE TAB ------------------------>
        
        <q-tab-pane name="profile">
          <form @submit.prevent="submitProfileChanges()">
            <q-field icon="account circle" :label="$t('label.EditYourInformations')" class="padding-medium">
              <q-field :error="profile.form.name.$error">
                <q-input v-model="profile.form.name" :stack-label="$t('label.YourName')" placeholder="John Doe" @blur="profile.form.name.$touch"  />
                <div class="q-field-bottom" v-if="profile.form.name.$error">
                  <div class="q-field-error" v-if="!profile.form.name.required">{{ $t('label.PleaseEnterYourName') }}</div>
                </div>
              </q-field>
              <q-field :error="profile.form.email.$error" v-if="profile.userCanChangeEmail">
                <q-input v-model="profile.form.email" :stack-label="$t('label.YourEmail')" :placeholder="$t('label.emailExample')" @blur="profile.form.email.$touch" />
                <div class="q-field-bottom" v-if="profile.form.email.$error">
                  <div class="q-field-error" v-if="!profile.form.email.required">{{ $t('label.PleaseEnterYourEmailAddress') }}</div>
                  <div class="q-field-error" v-if="!profile.form.email.email">{{ $t('label.PleaseEnterAValidEmailAddress') }}</div>
                </div>
              </q-field>
              <q-field :error="profile.form.country.$error">
                <q-select :stack-label="$t('label.YourCountry')" v-model="profile.form.country" :options="profile.countries" />
                <div class="q-field-bottom" v-if="profile.form.country.$error">
                   <div class="q-field-error" v-if="!profile.form.country.required">{{ $t('label.PleaseSelectYourCountry') }}</div>
                </div>
              </q-field>
              <q-field :error="profile.form.zipCode.$error">
                <q-input v-model="profile.form.zipCode" :stack-label="$t('label.YourZipCode')" placeholder="38500"  />
                <div class="q-field-bottom" v-if="profile.form.zipCode.$error">
                  <div class="q-field-error" v-if="!profile.form.zipCode.required">{{ $t('label.PleaseEnterYourZipCode') }}</div>
                </div>
              </q-field> 
              <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
            </q-field>
            <q-field icon="lock" :label="$t('label.ChangeYourPassword')" class="padding-medium" v-if="profile.userCanChangePassword">
              <q-field>
                <q-input type="password" v-model="profile.form.oldPassword" :stack-label="$t('label.CurrentPassword')" />
              </q-field>
              <q-field>
                <q-input type="password" v-model="profile.form.newPassword" :stack-label="$t('label.NewPassword')" />
              </q-field>
              <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
            </q-field>
          </form>
        </q-tab-pane>
        
        <!------------------ FRIENDS TAB ------------------------>
        
        <q-tab-pane name="friends">
          
        </q-tab-pane>
        
        <!------------------ NEWS TAB ------------------------>
        
        <q-tab-pane name="news">
        </q-tab-pane>
        
      </q-tabs>
      
      <!------------------ MENU AREA ------------------------>
      
      <div class="menu-background"></div>
      <div class="menu row">
        <div class="col q-pl-xl" @click="backToMap()">
          <q-btn @click="backToMap()" rounded color="primary" size="xl" :label="$t('label.BackToMap')" icon="arrow_back" />
        </div>
      </div> 
    </q-layout-drawer>
    
    <!------------------ MAP PAGE ------------------------>
    
    <div class="row" ref="map" v-if="geolocationIsSupported">
      
      <gmap-map
        :center="map.center"
        :zoom="11"
        map-type-id="roadmap"
        class="map"
        ref="map"
        :options="{disableDefaultUI:true}"
        @center_changed="updateCenter($event)"
        @dragend="dragEnd($event)"
      >
        <gmap-marker v-for="(quest, index) in questList" :key="quest._id" :position="{ lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }" :icon="quest.status === 'played' ? map.marker.played : map.marker.quest"
          @click="openQuestSummary(quest, index)" />
        
        <gmap-info-window :options="map.infoWindow.options" :position="map.infoWindow.location" :opened="map.infoWindow.isOpen" @closeclick="map.infoWindow.isOpen=false">
          <div class="infoWindow">
            <p class="title">{{ currentQuest ? currentQuest.title : '' }}</p>
            <p>{{ $t('label.Difficulty') }} : {{ $t('label.' + (currentQuest ? getQuestLevelName(currentQuest.level) : getQuestLevelName(2))) }}</p>
            <q-btn @click="$router.push('/quest/play/' + (currentQuest ? currentQuest._id : ''))" color="primary">{{ $t('label.Play') }}</q-btn>
          </div>
        </gmap-info-window>
      </gmap-map>
    </div>
    
    <!------------------ SEARCH AREA PAGE ------------------------>
    
    <q-modal v-model="showSearch">
      <div class="column" ref="div-column">
        <div class="row q-pa-md">
          <q-search 
            v-model="search.text" 
            @input="findQuests()" 
            :after="[
              {
                icon: 'close',
                handler () {
                  closeSearch()
                }
              }
            ]"
          />
        </div>
        <div class="row">
          <q-list highlight>
            <q-item v-for="item in search.quests" :key="item._id">
              <q-card inline class="q-ma-sm">
                <q-card-media class="preview" overlay-position="top">
                  <img :src="serverUrl + '/upload/quest/' + item.picture" />

                  <q-card-title slot="overlay" @click.native="$router.push('/quest/play/' + item._id)">
                    {{ item.title }}
                    <q-rating slot="subtitle" v-if="item.rating" v-model="item.rating" color="primary" :max="5" />
                    <span slot="right" class="row items-center text-white" v-if="item.distance && item.distance > 0 && item.distance <= 99">
                      <q-icon color="white" name="place" /> {{ item.distance }} {{ $t('label.km') }}
                    </span>
                    <span slot="right" class="row items-center text-white" v-if="item.distance === 0">
                      <q-icon color="white" name="place" /> <1 {{ $t('label.km') }}
                    </span>
                    <span slot="right" class="row items-center text-white" v-if="item.distance > 99">
                      <q-icon color="white" name="place" /> >99 {{ $t('label.km') }}
                    </span>
                  </q-card-title>
                </q-card-media>
              </q-card>
            </q-item>
          </q-list>
          <q-item v-show='search.quests.length == 0' @click.native="$router.push('/quest/create')">
            <q-item-side>
              <q-icon name="explore" size="2rem" />
            </q-item-side>
            <q-item-main>
              <q-item-tile label>{{ $t('label.NoQuestForThisSearch') }}</q-item-tile>
              <q-item-tile sublabel>
                <a @click="$router.push('/quest/create')">{{ $t('label.WhyDontYouCreateAQuest') }}</a>
              </q-item-tile>
            </q-item-main>
          </q-item>
          
        </div>
        
      </div>
    </q-modal>
    
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
      <div class="q-pa-md score-text">{{ $store.state.user.score }} <img src="statics/icons/game/trophy-small.png" /></div>
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
import AuthService from 'services/AuthService'
import utils from 'src/includes/utils'

import Notification from 'plugins/NotifyHelper'
import LevelCompute from 'plugins/LevelCompute'

import questLevels from 'data/questLevels.json'
import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'

export default {
  data () {
    return {
      map: {
        filter: 'all',
        center: { lat: 0, lng: 0 },
        centerTmp: { lat: 0, lng: 0 },
        // for smooth 'panTo()' transition between marker clicks
        pan: {
          path: [],
          queue: [],
          steps: 20,
          duration: 700 // in milliseconds
        },
        marker: {
          quest: {
            url: 'statics/icons/game/pointer-active.png',
            size: {width: 40, height: 40, f: 'px', b: 'px'},
            scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
            origin: {x: 0, y: 0},
            anchor: {x: 20, y: 40}
          },
          played: {
            url: 'statics/icons/game/pointer-inactive.png',
            size: {width: 40, height: 40, f: 'px', b: 'px'},
            scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
            origin: {x: 0, y: 0},
            anchor: {x: 20, y: 40}
          }
        },
        infoWindow: {
          content: '',
          location: { lat: 0, lng: 0 },
          isOpen: false,
          options: { pixelOffset: { width: 0, height: -35 } }
        }
      },
      search: {
        quests: [],
        text: ''
      },
      user: {
        position: {
          latitude: 0,
          longitude: 0
        }
      },
      currentQuestIndex: null,
      currentQuest: null,
      geolocationIsSupported: (navigator && navigator.geolocation),
      searchText: '',
      questList: [],
      serverUrl: process.env.SERVER_URL,
      showSuccess: false,
      showProfile: false,
      showSearch: false,
      success: {
        quests: {
          played: [],
          built: []
        }
      },
      profile: {
        level: {},
        progress: 10,
        form: {name: "--", picture: "", email: "", zipCode: "", country: "", oldPassword: "", newPassword: ""},
        countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
        userCanChangeEmail: true,
        userCanChangePassword: true
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
          this.user.position.latitude = position.coords.latitude
          this.user.position.longitude = position.coords.longitude
          
          this.CenterMapOnPosition(this.user.position.latitude, this.user.position.longitude)
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
    async getQuests(type) {
      if (!type) {
        this.map.filter = 'all'
      } else {
        this.map.filter = type
      }
      let response = await QuestService.listNearest(this.map.center, this.map.filter)
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
      let panPath = this.map.pan.path
      let panQueue = this.map.pan.queue
      let panSteps = this.map.pan.steps
      if (panPath.length > 0) {
        // We are already panning...queue this up for next move
        panQueue.push(position)
      } else {
        // easeIn animation computation: see https://stackoverflow.com/a/11808697/488666
        panPath.push("LAZY SYNCRONIZED LOCK")  // make length non-zero - 'release' this before calling setTimeout
        var curLat = this.map.center.lat
        var curLng = this.map.center.lng
        var dLat = (position.lat - curLat)
        var dLng = (position.lng - curLng)
        
        for (var i = 1; i <= panSteps; i++) {
          let elapsed = this.map.pan.duration * (i / panSteps);
          let newLat = this.easeOutQuad(elapsed, curLat, dLat, this.map.pan.duration);
          let newLng = this.easeOutQuad(elapsed, curLng, dLng, this.map.pan.duration);
          panPath.push({ lat: newLat, lng: newLng })
        }
        panPath.push(position)
        panPath.shift() // LAZY SYNCRONIZED LOCK
        
        setTimeout(this.doPan, this.map.pan.duration / this.map.pan.steps)
      }
    },

    doPan () {
      var next = this.map.pan.path.shift();
        
      if (next != null) {
        // Continue our current pan action
        this.map.center = next;
        setTimeout(this.doPan, this.map.pan.duration / this.map.pan.steps);
      } else {
        // We are finished with this pan - check if there are any queue'd up locations to pan to 
        var queued = this.map.pan.queue.shift();
        if (queued != null) {
          this.panTo(queued);
        }
      }
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
    
    // https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    // t: current time, b: beginning value, c: change in value, d: duration
    easeOutQuad: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    
    /*
     * Open the search menu
     */
    openSearchOptions() {
      if (this.showSuccess) {
        this.showSuccess = false
      } else if (this.showProfile) {
        this.showProfile = false
      } else {
        this.$q.actionSheet({
          grid: false,
          actions: [
            {
              label: this.$t('label.CenterOnYourPosition'),
              icon: 'gps_fixed',
              color: 'primary',
              handler: () => {
                this.findLocation()
              }
            },
            {
              label: this.$t('label.BuildAQuestHere'),
              icon: 'add_location',
              color: 'primary',
              handler: () => {
                this.$router.push('/quest/create')
              }
            },
            {}, // separator
            {
              label: this.map.filter === 'best' ? this.$t('label.DisplayAllQuests') : this.$t('label.BestQuests'),
              icon: this.map.filter === 'best' ? 'place' : 'favorite',
              color: 'primary',
              handler: () => {
                if (this.map.filter === 'best') {
                  this.getQuests('all')
                } else {
                  this.getQuests('best')
                }
              }
            },
            {
              label: this.map.filter === 'easy' ? this.$t('label.DisplayAllQuests') : this.$t('label.OnlyEasy'),
              icon: this.map.filter === 'easy' ? 'place' : 'child_care',
              color: 'primary',
              handler: () => {
                if (this.map.filter === 'easy') {
                  this.getQuests('all')
                } else {
                  this.getQuests('easy')
                }
              }
            },
            {
              label: this.$t('label.SearchForAQuest'),
              icon: 'search',
              color: 'primary',
              handler: () => {
                this.openSearch()
              }
            }
          ],
          dismiss: {
            label: 'Cancel',
            handler: () => {
              this.$q.notify('Cancelled...')
            }
          }
        })
      }
    },
    /*
     * Open the success page
     */
    openSuccessPage() {
      //this.$refs.layout.toggleLeft()
      if (!this.showSuccess) {
        this.listCreatedQuests(this.$store.state.user._id)
      }
      this.showSuccess = !this.showSuccess
      //this.$router.push('/user/me/success')
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async listCreatedQuests(id) {
      let response = await QuestService.ListCreatedByAUser(id)
      this.success.quests.built = response.data
    },
    /*
     * Get the list of the quests played by the user
     * @param   {string}    id            ID of the user
     */
    async listPlayedQuests(id) {
      let response = await QuestService.ListPlayedByAUser(id)
      this.success.quests.played = response.data
    },
    /*
     * Open the profile page
     */
    openProfilePage() {
      this.showProfile = !this.showProfile
      this.profile.level = LevelCompute(this.$store.state.user.score)
      this.getProfileChangeData(this.$store.state.user._id)
      //this.$router.push('/user/profile')
    },
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getProfileChangeData(id) {
      this.profile.form = {
        name: this.$store.state.user.name,
        email: this.$store.state.user.email,
        picture: this.$store.state.user.picture,
        zipCode: this.$store.state.user.location.postalCode,
        country: this.$store.state.user.location.country
      }
      
      // check if user can change his email
      if (this.$store.state.user.provider && this.$store.state.user.provider.name !== 'graaly') {
        this.profile.userCanChangeEmail = false
        this.profile.userCanChangePassword = false
      }
    },
    /*
     * Submit account changes
     */
    async submitProfileChanges() {      
      if (!this.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.form.name,
          email: this.form.email,
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          zipCode: this.form.zipCode,
          country: this.form.country,
          language: "fr"
        }
        let modificationStatus = await AuthService.modifyAccount(modifications)
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(modificationStatus.data.message, 'warning')
        } else {
          Notification(this.$t('label.AccountModifiedLong'), 'positive')
        }
      }
    },
    /*
     * upload a profile image
     */
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      // MP 2018-02-12 should not be necessary because picture info is now updated in user session data
      // remove the commented lines below after a while if no problem occurs with user picture "refreshing" when a new picture is uploaded
      /*var reader = new FileReader()
      reader.onload = (e) => {
        this.form.picture = e.target.result;
      };*/
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      }
    },
    /*
     * Disconnection
     */
    Disconnect() {
      this.$router.push('/user/logout')
    },
    /*
     * Open How to popup
     */
    openHowTo() {
      this.$q.dialog({
        //title: 'Positioned',
        message: 'to complete',
        position: 'top'
      })
    },
    /*
     * Back to the map
     */
    backToMap() {
      this.showProfile = false
      this.showSuccess = false
    },
    /*
     * Show search page
     */
    openSearch() {
      this.showSearch = true
    },
    /*
     * Hide search page
     */
    closeSearch() {
      this.showSearch = false
    },
    /*
     * Search for quests
     */
    async findQuests() {
      try {
        if (this.search.text.length > 3) {
          // show loading animation
          this.$q.loading.show()

          // Get quests for the search
          var userPosition = this.user.position
          let response = await QuestService.find(this.search.text, userPosition)
          this.search.quests = response.data
         
          // compute distance
          if (this.geolocationIsSupported) {
            this.search.quests = this.search.quests.map(function(quest) {
              const R = 6378.137
              let dLat = quest.location.coordinates[1] * Math.PI / 180 - userPosition.latitude * Math.PI / 180
              let dLon = quest.location.coordinates[0] * Math.PI / 180 - userPosition.longitude * Math.PI / 180
              let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userPosition.latitude * Math.PI / 180) * Math.cos(quest.location.coordinates[1] * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
              let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
              quest.distance = Math.floor(R * c)

              return quest
            });
          }
        }
        this.$q.loading.hide()
      } catch (e) {
        this.$q.loading.hide()
      }
    }
  }
}
</script>
