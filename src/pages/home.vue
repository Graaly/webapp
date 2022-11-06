<template>
  <div class="wrapper" :class="showNonHybridQRReader ? 'bg-transparent' : 'background-home'">

<!--    ====================== QR CODE READER ON WEBAPP =================================-->

    <div class="home q-pa-md">
    <div class="teaser" v-if="!showNonHybridQRReader">

      <!--====================== MAIN QUEST =================================-->

      <q-carousel
        v-if="!offline.active && bestQuest"
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        :control-color="slide % 2 ? 'secondary' : slide % 3 ? 'accent' : 'primary'"
        swipeable
        animated
        navigation
        infinite
        height="400px"
        :autoplay="autoplay"
        @mouseenter="autoplay = false"
        @mouseleave="autoplay = true"
        class="bg-transparent q-pa-none q-mb-lg carousel"
      >
        <q-carousel-slide v-for="(quest, index) in bestQuest" :key="index" :name="index" class="column no-wrap flex-center q-pa-none">
          <quest-card  :quest="quest" :color="index % 2 ? 'secondary' : index % 3 ? 'accent' : 'primary'" :direction="index % 2 ? 'right' : 'left'" class="q-mb-xl"/>
        </q-carousel-slide>
      </q-carousel>
      <div v-else style="max-width: 100%" class="q-pb-lg">
        <q-skeleton height="250px" square bordered />
        <div class="row items-start no-wrap q-mt-sm">
          <div class="col q-pl-sm">
            <q-skeleton type="text" square width="30%" />
            <q-skeleton type="text" square height="12px" />
            <q-skeleton type="text" square height="12px" width="75%" />
          </div>
        </div>
      </div>
      <!--====================== OFFLINE QUESTS =================================-->

      <div class="q-pt-lg" v-if="offline.active">
        <div class="q-pa-md no-internet-connection text-white">
          <q-icon name="cloud_off" />
          <p>{{ $t('label.NoInternetConnection') }}</p>
        </div>
        <div v-if="!questList.length" class="q-pa-md text-white">{{ $t('label.YouAreOfflineNoQuestsAvailable') }}</div>
        <div v-if="questList.length">
          <quest-card  :quest="questList[0]" color="primary" direction="left" class="q-mb-xl"/>

          <div class="centered bg-warning q-pa-sm text-white" v-if="warnings.noNetwork">
            <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
          </div>
          <quest-list
            :quests="questList"
            :title="$t('label.CachedQuests')"
            icon="cloud_off"
            color="#757575"
          />
        </div>
      </div>

      <!--====================== WARNINGS =================================-->

      <div class="centered bg-warning q-px-sm q-py-md" v-if="warnings.noNetwork">
        <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
      </div>
      <!--   Todo: MANQUE LE CLICK   -->
      <div v-if="warnings.noNetwork || warnings.noServerReponse">
        <div class="centered bg-warning q-px-sm q-py-md" v-if="!warnings.noNetwork && warnings.noServerReponse">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
      </div>
      <!--====================== INVITATION QUEST =================================-->

      <div v-if="!offline.active && invitationQuests && invitationQuests.length > 0">
        <quest-list
          :quests="invitationQuests"
          :title="$t('label.Invitations')"
          icon="send_time_extension"
          color="primary"
        />
      </div>

       <!--====================== AROUND QUEST =================================-->

      <div v-if="!offline.active">
        <quest-list
          :quests="nearestQuests"
          :title="$t('label.AroundYou')"
          icon="explore"
          readMore
          v-on:readMore="readMoreAroundYou"
          color="accent"
          around
        />
      </div>

      <!--====================== ON TOP QUEST =================================-->

      <div v-if="!offline.active">
        <quest-list
          :quests="onTopQuests"
          :title="$t('label.OnTopGames')"
          icon="grade"
          color="secondary"
        />
      </div>

      <!--====================== EXTRA QUEST =================================-->

      <div v-if="!offline.active && extraQuests && extraQuests.items && extraQuests.items.length > 0">
        <quest-list
          :quests="extraQuests.items"
          :title="$t('label.shortLang')"
          icon="auto_awesome"
          color="accent"
        />
      </div>

      <!--====================== CREATE PROFILE BUTTON =================================-->

      <text-btn-square
        v-if="!offline.active && (!this.$store.state.user.name || this.$store.state.user.name === '' || this.$store.state.user.email === 'providersignin' || !this.$store.state.user.location || !this.$store.state.user.location.postalCode || this.$store.state.user.location.postalCode === '' || !this.$store.state.user.location.country || this.$store.state.user.location.country === '')"
        class="q-mb-xl"
        outlined
        @click.native="openUpdateProfilePage()"
        :title="$t('label.WeNeedMoreInformationAboutYou')"
        color="accent"
        icon="face"
      />

      <!--====================== QUEST PLAYED OR CREATED BY GRAALY =================================-->

      <div v-if="!offline.active && (!friendQuests || friendQuests.length > 0)">
        <quest-list
          :quests="friendQuests"
          :title="$t('label.FriendsQuests')"
          icon="group"
          color="secondary"
        />
      </div>

      <!--====================== CREATORS =================================-->

      <div v-if="!offline.active && (!users || users.length > 0)">
        <creator-list
          :creators="users"
          v-on:readMore="readMoreAllCreators"
          color="primary"
          title
          horizontal
        />
      </div>

      <!--====================== CREATE QUEST BUTTON =================================-->

        <text-btn-square
          v-if="!offline.active"
          class="q-mb-xl"
          @click.native="buildQuest()"
          :title="$t('label.StartCreation')"
          color="accent"
          icon="extension"
        />
      </div>

      <!--====================== MAP BUTTON =================================-->

      <text-btn-square
        v-if="!offline.active"
        class="q-mb-xl"
        @click.native="openMap()"
        :title="$t('label.OpenTheMap')"
        color="secondary"
        outlined
        icon="public"
      />

      <!------------------ GEOLOCATION COMPONENT ------------------------>

      <geolocation v-if="!offline.active" ref="geolocation-component" @success="onLocationSuccess($event)" @error="onLocationError()" />

    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import UserService from 'services/UserService'
import AppStoreRatingService from 'services/AppStoreRatingService'

import geolocation from 'components/geolocation'
import homeMenu from "../components/user/UI/homeMenu";
import questCard from "../components/user/UI/questCard";
import questList from "../components/user/questList";
import creatorList from "../components/user/creatorList";
import iconBtnSquare from "../components/user/UI/iconBtnSquare";
import textBtnSquare from "../components/user/UI/textBtnSquare";
import createProfilDialog from "../components/user/Dialog/createProfilDialog";

import utils from 'src/includes/utils'
import { QSpinnerDots, QInfiniteScroll } from 'quasar'

import Notification from 'boot/NotifyHelper'
import LevelCompute from 'boot/LevelCompute'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    geolocation,
    //offlineLoader,
    homeMenu,
    questCard,
    questList,
    creatorList,
    iconBtnSquare,
    textBtnSquare
  },
  data () {
    return {
      bestQuest: null,
      nearestQuests: null,
      invitationQuests: null,
      onTopQuests: null,
      extraQuests: null,
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
      uploadUrl: process.env.UPLOAD_URL,
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
      mainQuestListFormat: 'big',
      isHybrid: window.cordova,
      showNonHybridQRReader: false,
      isQuestsLoaded: false,
      suggestQuest: {
        show: false
      },
      innerWidth: window.innerWidth,
      //Carousel
      slide: 0,
      autoplay: true,
      createProfilDialog: false,
      //questsTab: "built",
      //profileTab: "news",
      //friendsTab: "friendbuilt",
      //invitations: [],
      QuestService // to have getBackgroundImage() method available in template
    }
  },
  created () {
    document.addEventListener("backbutton", this.trackCallBackFunction, false);
    document.body.style.background = "#323232"
  },
  mounted() {
    if (!this.$store || !this.$store.state || !this.$store.state.user || !this.$store.state.user.name) {
      this.backToLogin();
    } else {
      if (this.$q && this.$q.platform && this.$q.platform.is && this.$q.platform.is.desktop) {
        this.mainQuestListFormat = 'small'
      }
      if (window.cordova) {
        AppStoreRatingService.initLocalStorage();
        //test for the review
        //AppStoreRatingService.resetAlreadyAsked();
        var questsFinished = this.$store.state.user.statistics.nbQuestsSuccessful;
        if (questsFinished >= 1 && AppStoreRatingService.hasAlreadyHavePopup() === "false") {
          console.log("the user has done at least one quest");
          AppStoreRatingService.launchpopup();
        }
      }
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
      this.$set(this.user, 'position', position.coords)

      // reload quests if quests are not loaded or are based on user default position
      if ((this.isQuestsLoaded === false || this.user.positionType === 'defaultProfilePosition') && !this.offline.active) {
        await this.loadQuests()
      }
      if (this.users === null) {
        await this.getCreators()
      }
      this.user.positionType = "userCurrentLocation"
      this.$refs['geolocation-component'].stopTracking()
    },
    /*
    * start the scanner for hybrid app
    */
    /*startScanQRCode() {
        this.showNonHybridQRReader = true
    },*/
    /*closeQRCodeReader () {
      this.showNonHybridQRReader = false
    },*/
    /*
     * Check if the quest code is valid
     * @param   {String}  code            QR Code value
     */
    /*async checkCode(code) {
      code = utils.removeUnusedUrl(code)
      let checkStatus = await QuestService.checkQRCode(code, this.$t('label.shortLang'))
      if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
        this.closeQRCodeReader()
        if (code.indexOf('_score') === -1) {
          if (checkStatus.data.questId) {
            this.playQuest(checkStatus.data.questId)
          } else {
            this.playQuest(code)
          }
        } else {
          this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
        }
      } else {
        Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
      }
    },*/
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
          if (response.data.topQuests) {
            this.onTopQuests = response.data.topQuests
          } else {
            this.onTopQuests = []
          }
          if (response.data.invitations) {
            this.invitationQuests = response.data.invitations
          }
          if (response.data.extra) {
            this.extraQuests = response.data.extra
          }
        }
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
                var pictureUrl = await utils.readBinaryFile(tempQuestList[i].questId, tempQuestList[i].picture[this.$t('label.shortLang')])
                if (pictureUrl) {
                  tempQuestList[i].picture = pictureUrl
                } else {
                  tempQuestList[i].picture = '_default-quest-picture.jpg'
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
     * Get current user ranking data
     */
    // async getRanking() {
    //   this.warnings.rankingMissing = false
    //   this.$q.loading.show()
    //   let response = await UserService.getRanking()
    //   this.$q.loading.hide()
    //   if (response && response.data) {
    //     this.success.ranking = response.data
    //   } else {
    //     this.warnings.rankingMissing = true
    //   }
    // },
    /* MPA 2021-01-28 seems not used
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
    },*/
    /*openAdminPage() {
      if (!this.offline.active) {
        this.$router.push('/admin')
      }
    },*/
    /*
     * Open How to popup
     * MPA 2021-01-28 seems not used
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
    // getQuestTitle(quest, showLanguage) {
    //   if (!quest || !quest.title) {
    //     return this.$t('label.NoTitle')
    //   }
    //   return quest.title
    // },
    /*
     * Back to the login page
     */
    backToLogin() {
      this.$router.push('/user/login')
    },
    /*
     * Open shop
     * MPA 2021-01-28 seems not used
    buyCoins () {
      this.shop.show = true
    },
    /*
     * Close shop
     * MPA 2021-01-28 seems not used
    closeShop () {
      this.shop.show = false
    },
    /*
     * Open new friends page
     * MPA 2021-01-28 seems not used
    openAddFriendsModal () {
      this.friends.new.show = true
    },
    /*
     * Close new friends page
     * MPA 2021-01-28 seems not used
    async closeAddFriends () {
      this.friends.new.show = false
      // reload friend list
      await this.loadFriends()
    },
    /*
     * Reset the friends' activity list
     * MPA 2021-01-28 seems not used
    async updateFriendsActivity() {
      this.friends.news.skip = 0
      this.friends.news.items = []
      this.friends.news.items.length = 0
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
      }

      if (this.user.position !== null && !this.offline.active) {
        if (this.isQuestsLoaded === false) {
          await this.loadQuests()
        }
        if (this.users === null) {
          await this.getCreators()
        }
        this.user.positionType = 'defaultProfilePosition'

        this.$refs['geolocation-component'].stopTracking()
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
        this.$q.dialog({
          component: createProfilDialog,
          parent: this
        }).onOk(() => {
          this.openUpdateProfilePage()
        })
        //var _this = this; // workaround for closure scope quirks

        /*this.$q.dialog({
          dark: true,
          message: this.$t('label.DoYouWantToCreateAnAccount'),
          ok: true,
          cancel: true
        }).onOk(async () => {
          _this.openUpdateProfilePage()
        })*/
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
    /*modifyQuest(questId) {
      this.$router.push('/quest/builder/' + questId)
    },*/
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
    /*openProfile(id) {
      if (!this.offline.active) {
        if (!id) {
          id = this.$store.state.user.id
        }
        this.$router.push('/profile/' + id)
      }
    },*/
    /*
     * Open search page
     */
    /*openSearch() {
      if (!this.offline.active) {
        this.$router.push('/search/quest/around')
      }
    },*/
    /*
     * Open ranking page
     */
    /*openRanking() {
      if (!this.offline.active) {
        this.$router.push('/user/ranking/level/all')
      }
    },*/
    /*
     * Open map page
     */
    openMap() {
      if (!this.offline.active) {
        this.$router.push('/map')
      }
    },
    /*goToHome() {
      console.log('Go Home')
    },*/
    /*
     * get profile image
     */
    /*getProfileImage () {
      const user = this.$store.state.user
      if (user.picture && user.picture.indexOf('http') !== -1) {
        return user.picture
      } else if (user.picture) {
        return this.uploadUrl + '/upload/profile/' + user.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    }*/
  }
}
</script>

<style lang="scss">
.background-home {
  background-image: url('../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.home{
  max-width: 450px;
  margin: 0 auto;
}

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
.q-carousel__navigation{
  bottom: -10px;
  padding: 0;
}

</style>
