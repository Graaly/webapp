<template>
  <div class="scroll background-dark">
    <div class="teaser">
      
      <!--====================== MAIN QUEST =================================-->
      
      <mainQuest v-if="!offline.active" :quest="bestQuest"></mainQuest>
      
      <!--====================== OFFLINE QUESTS =================================-->
      
      <div class="q-pt-lg" v-if="offline.active">
        <div class="q-pa-md no-internet-connection">
          <q-icon name="cloud_off" />
          <p>{{ $t('label.NoInternetConnection') }}</p>
        </div>
        <div v-if="!questList.length" class="q-pa-md">{{ $t('label.YouAreOfflineNoQuestsAvailable') }}</div>
        <div v-if="questList.length">
          <mainQuest :quest="questList[0]"></mainQuest>
          
          <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork">
            <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
          </div>
          
          <titleBar :title="{text: $t('label.CachedQuests'), type: 'key'}"></titleBar>

          <questsList format="small" :quests="questList"></questsList>
        </div>
      </div>
      
      <!--====================== WARNINGS =================================-->
      
      <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork">
          <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
        </div>
      <div v-if="warnings.noNetwork || warnings.noServerReponse">
        <div class="centered bg-warning q-pa-sm" v-if="!warnings.noNetwork && warnings.noServerReponse">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
      </div>
      
      <!--====================== INVITATION QUEST =================================-->
      
      <div v-if="!offline.active && invitationQuests && invitationQuests.length > 0">
        <titleBar :title="{text: $t('label.Invitations'), type: 'key'}"></titleBar>

        <questsList format="small" :quests="invitationQuests"></questsList>
      </div>
      
      <!--====================== QR CODE BUTTON =================================-->
      
      <div class="q-px-md q-pt-lg" v-if="isHybrid && !offline.active">
        <div class="image-button" @click="startScanQRCode" style="background-image: url(statics/images/icon/scan-button.png)">
          {{ $t('label.ScanQRCode') }}
        </div>
      </div>
      
      <!--====================== OTHER QUEST =================================-->
      
      <div v-if="!offline.active">
        <titleBar :title="{text: $t('label.AroundYou'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMoreAroundYou"></titleBar>

        <div v-if="!nearestQuests || nearestQuests.length > 0">
          <questsList format="small" :quests="nearestQuests"></questsList>
        </div>
        <div v-if="nearestQuests && nearestQuests.length === 0">
          <div class="centered q-pa-md">
            {{ $t('label.NoQuestAroundYou') }}
            <div> 
              <a class="small" @click="suggestQuest.show = true">{{ $t('label.SuggestANewQuest') }}</a>
            </div>
          </div>
        </div>
      </div>
      
      <!--====================== CREATE PROFILE BUTTON =================================-->
      
      <div class="q-px-md q-pt-lg" v-if="!offline.active && (!this.$store.state.user.name || this.$store.state.user.name === '' || this.$store.state.user.email === 'providersignin' || !this.$store.state.user.location || !this.$store.state.user.location.postalCode || this.$store.state.user.location.postalCode === '' || !this.$store.state.user.location.country || this.$store.state.user.location.country === '')">
        <div class="image-button" @click="openUpdateProfilePage" style="background-image: url(statics/images/icon/profile-button.png)">
          {{ $t('label.WeNeedMoreInformationAboutYou') }}
        </div>
      </div>
      
      <!--====================== QUEST CREATED BY GRAALY =================================--
      
      <titleBar :title="{text: $t('label.CreatedByGraaly'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMore"></titleBar>
      
      <!--====================== QUEST PLAYED OR CREATED BY GRAALY =================================-->
      
      <div v-if="!offline.active && (!friendQuests || friendQuests.length > 0)">
        <titleBar format="small" :title="{text: $t('label.FriendsQuests'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMoreFriendsGames"></titleBar>
        
        <questsList format="small" :quests="friendQuests"></questsList>
      </div>
      
      <!--====================== CREATORS =================================-->
      
      <div v-if="!offline.active && (!users || users.length > 0)">
        <titleBar :title="{text: $t('label.Designers'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreAllCreators"></titleBar>
        
        <usersList format="scroll" :users="users"></usersList>
      </div>
      
      <!--====================== CREATE QUEST BUTTON =================================-->
      
      <div v-if="!offline.active" class="q-ma-md relative-position creator-button" @click="buildQuest">
        <img src="statics/images/other/creator.jpg" class="full-width" />
        <div class="bg-accent subtitle2 q-pa-md full-width" style="bottom: 0px; position: absolute; line-height: 0.8em;">
          <div class="float-right"><img src="statics/images/icon/puzzle-big.svg" style="width: 32px" /></div>
          <span>Devenir créateur ?</span>
        </div>
      </div>
      
      <!--====================== MAP BUTTON =================================-->
      
      <div class="q-px-md q-py-lg" v-if="!offline.active">
        <div class="image-button" @click="openMap" style="background-image: url(statics/images/icon/locator-button.png)">
          {{ $t('label.OpenTheMap') }}
        </div>
      </div>
      
      <!--====================== HEADER =================================-->
      
      <div class="fixed-top">
        <div class="home-header row no-wrap" :class="{'disabled': offline.active}">
          <img src="statics/images/logo/logo-header.png" class="logo" />
          <q-space />
          <img v-if="$store.state.user.isAdmin" src="statics/images/icon/tools.png" class="header-button q-mr-md" @click="openAdminPage" />
          <img src="statics/images/icon/search.svg" class="header-button q-mr-md" @click="openSearch" />
          <img :src="'statics/images/icon/level' + $store.state.user.level + '.svg'" class="header-button q-mr-md" @click="openRanking" />
          <q-avatar @click="openProfile()">
            <img :src="getProfileImage()" />
          </q-avatar>
        </div>
      </div>
      
      <!------------------ GEOLOCATION COMPONENT ------------------------>
      
      <geolocation v-if="!offline.active" ref="geolocation-component" @success="onLocationSuccess($event)" @error="onLocationError()" />
      
      <!--====================== SHOP PAGE =================================-->
      <!--
      <q-dialog maximized v-model="shop.show" class="over-map">
        <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.Shop') }}</h1>
        <shop @close="closeShop"></shop>
      </q-dialog>
      -->
      <!--====================== RANKING PAGE =================================-->
      
      <q-dialog maximized v-model="ranking.show" class="over-map">
        <q-card>
          <q-card-section class="row items-center">
            <h1 class="size-3 q-pl-md">{{ $t('label.YourRanking') }}</h1>
            <q-space />
            <q-btn icon="close" flat round dense />
          </q-card-section>
          <q-card-section class="centered bg-warning q-pa-sm" v-if="warnings.rankingMissing" @click="getRanking">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item-label header>{{ $t("label.Level") }}</q-item-label>
              <q-item multiline>
                <q-item-section avatar><q-icon name="trending_up" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('label.MyLevel') }}: {{ $store.state.user.level }} ({{ $store.state.user.score}} {{ $t('label.points') }})</q-item-label>
                  <q-linear-progress class="q-my-sm" rounded :value="profile.level.progress" color="primary" style="height: 18px;" />
                  <q-item-label caption>{{ $t('label.ReachScoreOf', {score: profile.level.max}) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-list v-if="$store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings">
              <q-item-label header>{{ $t("label.Rankings") }}</q-item-label>
              <q-item>
                <q-item-section avatar><q-icon name="public" color="primary" /></q-item-section>
                <q-item-label>
                  {{ $t('label.YourWorldRanking') }} : 
                  <span v-if="$store.state.user.statistics.rankings.world">{{ $store.state.user.statistics.rankings.world }}</span>
                  <span v-if="!$store.state.user.statistics.rankings.world">{{ $t('label.AvailableTomorrow') }}</span>
                </q-item-label>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="home" color="primary" /></q-item-section>
                <q-item-label>
                  {{ $t('label.YourCityRanking') }} :
                  <span v-if="$store.state.user.statistics.rankings.town">{{ $store.state.user.statistics.rankings.town }}</span>
                  <span v-if="!$store.state.user.statistics.rankings.town">{{ $t('label.AvailableTomorrow') }}</span>
                  </q-item-label>
              </q-item>
            </q-list>
            <div v-if="success.ranking && success.ranking.length > 0">
              <h1 class="size-3 q-pl-md">{{ $t('label.Rewards') }}</h1>
              <q-list v-for="(item, index) in success.ranking" :key="index">
                <q-item-label header>{{ item.city }}</q-item-label>
                <q-item style="flex-wrap: wrap">
                  <img v-for="(reward, index2) in item.rewards" :class="{'reward': true, 'disabled': !reward.won}" :key="index2" :src="serverUrl + '/upload/quest/' + reward.image" />
                </q-item>
              </q-list>
              {{ $t("label.PlayAllQuestsInACityToWin") }}
            </div>
          </q-card-section>
          <q-card-section v-if="!($store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings) && !(success.ranking && success.ranking.length > 0)">
            {{ $t("label.NoRankingYet") }}
          </q-card-section>
        </q-card>
      </q-dialog>
      
      <!--====================== BOTTOM BAR =================================-->
      
      <div class="fixed-bottom over-map" v-if="!offline.active">
        <div v-if="offline.show">
          <offlineLoader :quest="offline.quest" :design="'download'" @end="questLoadedInCache()"></offlineLoader>
        </div>
      </div>
      
      <!--====================== SUGGEST A QUEST =================================-->
      
      <q-dialog maximized v-model="suggestQuest.show" class="over-map bg-white">
        <suggest @close="suggestQuest.show = false"></suggest>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import UserService from 'services/UserService'

import geolocation from 'components/geolocation'
//import newfriend from 'components/newfriend'
import shop from 'components/shop'
import suggest from 'components/quest/suggest'
import titleBar from 'components/titleBar'
import mainQuest from 'components/quest/mainQuest'
import questsList from 'components/quest/questsList'
import usersList from 'components/user/usersList'
//import offlineLoader from 'components/offlineLoader'

import utils from 'src/includes/utils'
//import { required, email } from 'vuelidate/lib/validators'
//import checkPhone from 'boot/CheckPhone'
import { QSpinnerDots, QInfiniteScroll } from 'quasar'

import Notification from 'boot/NotifyHelper'
import LevelCompute from 'boot/LevelCompute'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    geolocation,
    //newfriend,
    shop,
    suggest,
    //offlineLoader,
    mainQuest,
    titleBar,
    questsList,
    usersList
  },
  data () {
    return {
      bestQuest: null,
      nearestQuests: null,
      invitationQuests: null,
      friendQuests: null,
      users: null,
      search: {
        quests: [],
        text: ''
      },
      user: {
        position: null,
        positionType: null,
        proposeAQuest: true
      },
      shop: {
        show: false,
        inAppPurchase: {
          activated: window.store
        }
      },
      currentQuestIndex: null,
      currentQuest: null,
      searchText: '',
      questList: [],
      serverUrl: process.env.SERVER_URL,
      //showSuccess: false,
      //showProfile: false,
      showSearch: false,
      //showBottomMenu: false,
      warnings: {
        noLocation: false,
        noNetwork: false,
        noServerReponse: false,
        rankingMissing: false,
        score: false,
        questButton: false,
        networkButton: false,
        mainButton: false
      },
      success: {
        ranking: []
      },
      profile: {
        level: {},
        organization: {},
        progress: 0.1,
        /*form: {
          name: "--", 
          picture: "", 
          email: "", 
          phone: "",
          zipCode: "", 
          country: "", 
          oldPassword: "", 
          newPassword: "", 
          language: "en"
        },
        countries: [],*/
        userCanChangeEmail: true,
        userCanChangePhone: true,
        userCanChangePassword: true
      },
      offline: {
        available: window.cordova,
        show: false,
        active: false,
        quest: null
      },
      ranking: {
        show: false
      },
      //languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      isMounted: false,
      isHybrid: window.cordova,
      isQuestsLoaded: false,
      suggestQuest: {
        show: false
      },
      innerWidth: window.innerWidth,
      //questsTab: "built",
      //profileTab: "news",
      //friendsTab: "friendbuilt",
      //invitations: [],
      QuestService // to have getBackgroundImage() method available in template
    }
  },
  created () {
    document.addEventListener("backbutton", this.trackCallBackFunction, false);
  },
  mounted() {
    if (!this.$store || !this.$store.state || !this.$store.state.user || !this.$store.state.user.name) {
      this.backToLogin()
    } else {
      this.initPage()

      this.$nextTick(() => {
        this.isMounted = true
      })
    }
    // hide status bar on Android
    if (this.isHybrid && cordova.platformId === 'android') {
      StatusBar.hide()
    }
  },
  methods: {
    async initPage () {
      // check if profile is complete
      this.checkIfProfileIsComplete()
      // clear all running process
      utils.clearAllRunningProcesses()
      // check if user has network
      await this.checkNetwork()
      // check if user has received invitations to private quests
      //this.checkInvitations()
      // get current level of user
      this.profile.level = LevelCompute(this.$store.state.user.score)
      // get quest succeeded by friends
      await this.getFriendQuests()
    },
    /*
     * Check if user profile is enough completed to have Graaly work
     */
    checkIfProfileIsComplete() {
      if (this.$store.state.user.story.step === 18 && (!this.$store.state.user.name || this.$store.state.user.name === '' || 
        this.$store.state.user.email === 'providersignin' || 
        //!this.$store.state.user.sex || this.$store.state.user.sex === '' || 
        //!this.$store.state.user.age || this.$store.state.user.age === '' || 
        !this.$store.state.user.location || 
        !this.$store.state.user.location.postalCode || this.$store.state.user.location.postalCode === '' || 
        !this.$store.state.user.location.country || this.$store.state.user.location.country === '')) {
        this.openUpdateProfilePage()
      }
    },
    openUpdateProfilePage() {
      this.$router.push('/user/updateprofile')
    },
    async onLocationSuccess(position) {
      //let positionNeedsUpdate = (this.user.position === null || this.questList.length === 0)
      this.$set(this.user, 'position', position.coords)
      
      // reload quests if quests are not loaded or are based on user default position
      if ((this.isQuestsLoaded === false || this.user.positionType === 'defaultProfilePosition') && !this.offline.active) {
        await this.loadQuests()
      }
      if (this.users === null) {
        await this.getCreators()
      }
      this.user.positionType = "userCurrentLocation"
    },
    /*
    * start the scanner for hybrid app
    */
    async startScanQRCode() {
      var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              if (result.text.indexOf('_score') === -1) {
                _this.playQuest(result.text)
              } else {
                _this.checkCode(result.text)
              }
            }
          },
          function (error) {
            console.log("Scanning failed: " + error)
          },
          {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: false, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: "", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        )
      }
    },
    /*
     * Check if the quest code is valid
     * @param   {String}  code            QR Code value
     */
    async checkCode(code) {
      let checkStatus = await QuestService.checkQRCode(code, this.$t('label.shortLang'))
      if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
        if (code.indexOf('_score') === -1) {
          this.$router.push('/quest/play/' + code)
        } else {
          this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
        }
      } else {
        Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
      }
    },
    /*
     * start the story
     *
    startStory() {
      if (this.$store.state.user.story) {
        if (this.$store.state.user.story.step === 0) {
          this.story.step = 0
        }
        if (this.$store.state.user.story.step === 10) {
          this.warnings.score = true
          this.story.data = {
            score: this.$store.state.user.score
          }
          this.story.step = 10
        }
      }
    },
    /*
     * Quest the quests that are 
     *
    getClosestQuestUnplayed() {
      var distance = 300 // 200 meters
      var questSelected = null
      // get the closest quest
      for (var i = 0; i < this.questList.length; i++) {
        // get only the quest unplayed (and which the user is not the owner)
        if (this.questList[i].authorUserId !== this.$store.state.user._id && this.questList[i].status !== 'played' && this.questList[i].type === 'quest') {
          // compute the min distance
          let newDistance = 111320 * Math.sqrt(Math.pow(Math.abs(this.user.position.longitude - this.questList[i].location.coordinates[0]), 2) + Math.pow(Math.abs(this.user.position.latitude - this.questList[i].location.coordinates[1]), 2))
          if (newDistance < distance) {
            distance = newDistance
            questSelected = this.questList[i]
          }
        }
      }
      return questSelected
    },
    /*
     * Check network
     */
    async checkNetwork() {
      // TODO on hybrid, maybe use events "offline" and "online" to get realtime network status
      // see https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/#offline
      const previousOfflineValue = this.offline.active
      const isNetworkAvailable = utils.isNetworkAvailable()
      this.warnings.noNetwork = !isNetworkAvailable
      this.offline.active = !isNetworkAvailable
      if (previousOfflineValue !== this.offline.active) {
        this.questList = []
        await this.loadQuests()
        this.questList[0].description = 'CachedQuests'
      }
      
      utils.setTimeout(this.checkNetwork, 5000)
    },
    
    /*
     * Open the summary box on quest click on the map
     * @param   {object}    quest           quest data
     * @param   {string}    idx             uniq index
     *
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
        }
      }
    },
    /*
     * Open the summary box for the discovery quest
     *
    openDiscoveryQuestSummary() {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: this.user.position.longitude, lat: this.user.position.latitude }
      this.map.infoWindow.location = questCoordinates
      infoWindow.isOpen = true
    },
    /*
     * reload the map
     */
    async loadQuests() {
      this.warnings.noServerReponse = false
      await this.getQuests()
    },
    /*
     * Get the list of quests near the location of the user
     */
    async getQuests() {
      this.isQuestsLoaded = null // to prevent multiple call of reload map if onNewUserPosition is called too often
      this.showBottomMenu = false
      if (!this.offline.active) {
        if (this.user.position === null) {
          Notification(this.$t('label.LocationSearching'), 'warning')
          this.isQuestsLoaded = false
          return
        }
        
        let response = await QuestService.listHomeQuests({ lng: this.user.position.longitude, lat: this.user.position.latitude })
        
        if (!response || !response.data) {
          Notification(this.$t('label.TechnicalIssue'), 'error')
          this.isQuestsLoaded = false
          return
        }
        this.isQuestsLoaded = true
        
        if (!response.data.message || response.data.message !== 'No quest') {
          if (response.data.best) {
            this.bestQuest = response.data.best
          }
          if (response.data.nearests) {
            this.nearestQuests = response.data.nearests
          } else {
            this.nearestQuests = []
          }
          if (response.data.invitations) {
            this.invitationQuests = response.data.invitations
          }
        }
        
        /*if ((this.$store.state.user.story.step === 16 ||  this.$store.state.user.story.step >= 23) && this.user.proposeAQuest) {
          // Alert if the user is very close to a quest
          var closestQuest = this.getClosestQuestUnplayed()

          if (closestQuest !== null) {
            this.story.data = {
              questId: closestQuest.questId,
              quest: this.getQuestTitle(closestQuest, false)
            }
            this.story.step = 16
          } else {
            this.story.data = null
          }
          
          // avoid the notification to appear when user filter on quests
          this.user.proposeAQuest = false
        }*/
      } else {
        // check if quests are available offline
        const offlineQuestsFile = await utils.readFile('', 'quests.json')
        
        if (offlineQuestsFile) {
          const offlineQuestsData = JSON.parse(offlineQuestsFile)
          if (offlineQuestsData && offlineQuestsData.list) {
            var tempQuestList = offlineQuestsData.list
            
            if (tempQuestList.length > 0) {
              // get pictures
              for (var i = 0; i < tempQuestList.length; i++) {
                var pictureUrl = await utils.readBinaryFile(tempQuestList[i].questId, tempQuestList[i].picture)
                if (pictureUrl) {
                  tempQuestList[i].picture = pictureUrl
                } else {
                  tempQuestList[i].picture = '_default-quest-picture.png'
                }
              }
              this.questList = tempQuestList
              
              this.offline.active = true
            } else {
              // if no quest available in quests.json
              this.warnings.noServerReponse = true
              this.isQuestsLoaded = false
            }
          }
        } else {
          // if quests.json is not accessable
          this.warnings.noServerReponse = true
          this.isQuestsLoaded = false
        }
      }
    },
    /*
     * Get the list of the quests succeeded by friends
     */
    async getFriendQuests() {      
      const response = await QuestService.listFriendQuests()
      
      this.friendQuests = []
      
      if (response && response.data) {
        for (var i = 0; i < response.data.length; i++) {
          this.friendQuests.push({
            questId: response.data[i].questId,
            picture: response.data[i].questData.picture,
            title: response.data[i].questData.title,
            location: {
              town: response.data[i].questData.town
            },
            userPicture: response.data[i].userData.picture,
            userName: response.data[i].userData.name,
            playStatus: response.data[i].status ? response.data[i].status : 'succeeded',
            points: response.data[i].stars
          })
        }
      }
    },
    /*
     * Get the list of creators near the location of the user
     */
    async getCreators() {      
      let response = await UserService.listSuggestions({ lng: this.user.position.longitude, lat: this.user.position.latitude }, 10)
      
      if (!response || !response.data) {
        Notification(this.$t('label.TechnicalIssue'), 'error')
        return
      }
      
      if (!response.data.message || response.data.message !== 'No users') {
        this.users = response.data
      }
    },
     /*
     * Get user invitation to private quests
     *
    async checkInvitations() {
      let response = await QuestService.getInvitations()

      if (response && response.data) {
        this.invitations = response.data
      }
    },
    
    /*
     * Get current user ranking data
     */
    async getRanking() {
      this.warnings.rankingMissing = false
      this.$q.loading.show()
      let response = await UserService.getRanking()
      this.$q.loading.hide()
      if (response && response.data) {
        this.success.ranking = response.data
      } else {
        this.warnings.rankingMissing = true
      }
    },
       
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
    },
    openAdminPage() {
      if (!this.offline.active) {
        this.$router.push('/admin')
      }
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
     * Display title based on language
     * @param   {object}    quest            quest data
     * @param   {Boolean}   showLanguage     define if the map is displayed if the quest is not translated in the user language
     */
    getQuestTitle(quest, showLanguage) {
      if (!quest || !quest.title) {
        return this.$t('label.NoTitle')
      }
      return quest.title
    },
    /*
     * Back to the login page
     */
    backToLogin() {
      this.$router.push('/user/login')
    },
    /*
     * Open shop
     */
    buyCoins () {
      this.shop.show = true
    },
    /*
     * Close shop
     */
    closeShop () {
      this.shop.show = false
    },
    /*
     * Open new friends page
     */
    openAddFriendsModal () {
      this.friends.new.show = true
    },
    /*
     * Close new friends page
     */
    async closeAddFriends () {
      this.friends.new.show = false
      // reload friend list
      await this.loadFriends()
    },
    /*
     * Reset the friends' activity list
     */
    async updateFriendsActivity() {
      this.friends.news.skip = 0
      this.friends.news.items = []
      this.friends.news.items.length = 0
    },
    /*
     * Restart tutorial
     *
    async restartTutorial () {
      await UserService.nextStoryStep(0)
      this.$store.state.user.story.step = 0
      this.backToMap()
      
      await this.initPage()
    },
    /*
     * Prevent mobile player to use back button here
     */
    trackCallBackFunction() {
      return false
    },
    async onLocationError(ret) {
      // if user default location is set, use it
      if (this.$store.state.user.location &&
        this.$store.state.user.location.geometry &&
        this.$store.state.user.location.geometry.coordinates &&
        this.$store.state.user.location.geometry.coordinates[0] !== 0 &&
        this.user.position === null
      ) {
        this.$set(this.user, 'position', {longitude: this.$store.state.user.location.geometry.coordinates[0], latitude: this.$store.state.user.location.geometry.coordinates[1]})

        if (this.isQuestsLoaded === false && !this.offline.active) {
          await this.loadQuests()
        }
        if (this.users === null) {
          await this.getCreators()
        }
        this.user.positionType = 'defaultProfilePosition'
      } else {
        this.user.position = null
      }
    },
    /*
     * Launch a quest
     */
    playQuest(questId) {
      this.$router.push('/quest/play/' + questId)
    },
    buildQuest() {
      if (this.userIsConnected()) {
        this.$router.push('/quest/create/welcome')
      } else {
        var _this = this; // workaround for closure scope quirks
      
        this.$q.dialog({
          message: this.$t('label.DoYouWantToCreateAnAccount'),
          ok: true,
          cancel: true
        }).onOk(async () => {
          _this.openUpdateProfilePage()
        })
      }
    },
    userIsConnected() {
      if (this.$store.state.user.name === '-') {
        return false
      } else {
        return true
      }
    },
    /*
     * Modify a quest
     */
    modifyQuest(questId) {
      this.$router.push('/quest/builder/' + questId)
    },
    /*
     * Read more links
     */
    readMore() {
      Notification(this.$t('label.QuestDownloadFinished'), 'positive')
    },
    /*
     * Read more quests around you
     */
    readMoreAroundYou() {
      this.$router.push('/search/quest/around')
    },
    /*
     * Read more quests of friends
     */
    readMoreFriendsGames() {
      this.$router.push('/search/quest/friends')
    },
    /*
     * List all friends
     */
    readMoreAllCreators() {
      this.$router.push('/user/' + this.$store.state.user.id + '/friends')
    },
    /*
     * Open a user profile
     */
    openProfile(id) {
      if (!this.offline.active) {
        if (!id) {
          id = this.$store.state.user.id
        }
        this.$router.push('/profile/' + id)
      }
    },
    /*
     * Open search page
     */
    openSearch() {
      if (!this.offline.active) {
        this.$router.push('/search/quest/around')
      }
    },
    /*
     * Open ranking page
     */
    openRanking() {
      if (!this.offline.active) {
        this.$router.push('/user/ranking/level/all')
      }
    },
    /*
     * Open map page
     */
    openMap() {
      if (!this.offline.active) {
        this.$router.push('/map')
      }
    },
    /*
     * get profile image
     */
    getProfileImage () {
      const user = this.$store.state.user
      if (user.picture && user.picture.indexOf('http') !== -1) {
        return user.picture
      } else if (user.picture) {
        return this.serverUrl + '/upload/profile/' + user.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    }
  }/*,
  validations: {
    profile: {
      form: {
        email: { required, email },
        name: { required },
        country: { required },
        zipCode: { required },
        phone: { checkPhone }
      }
    }
  }*/
}
</script>

<style>
.q-item-label > p { padding: 0; margin: 0; }

.no-internet-connection {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}
.no-internet-connection .q-icon {
  font-size: 3rem;
  margin-right: 1rem;
}
.no-internet-connection p {
  font-size: 1.5rem;
  margin: 0;
}
.tab-content-80 {
  overflow: auto;
  height: 100%;
  height: -webkit-calc(100% - 80px);
  height: -moz-calc(100% - 80px);
  height: calc(100% - 80px);
  padding-bottom: 130px;
}
.tab-content-180 {
  overflow: auto;
  height: 100%;
  height: -webkit-calc(100% - 180px);
  height: -moz-calc(100% - 180px);
  height: calc(100% - 180px);
  padding-bottom: 130px;
}
</style>
