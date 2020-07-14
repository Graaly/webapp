<template>
  <div class="scroll background-dark">
    <div id="teaser">
      <!------------------ MAIN INFORMATION AREA ------------------------>
      
      <div v-if="(!quest || !quest.status) && !warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.Loading')}}
        <div class="q-pa-md">
          <q-btn @click="backToTheMap()" color="primary" class="glossy large-button">{{ $t('label.BackToTheMap') }}</q-btn>
        </div>
      </div>
      <div v-if="warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.QuestNeedNetwork')}}
        <div>
          <q-btn @click="initQuest()" color="primary" class="glossy large-button">{{ $t('label.ReloadQuest') }}</q-btn>
        </div>
      </div>
      <!-- =========================== PICTURE & AUTHOR ========================== -->
      <div v-if="quest && quest.status" class="relative-position" :style="'width: 100vw; height: 50vh; background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat '">
        <div class="q-py-sm q-px-md dark-banner fixed-top">
          <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        </div>
        <div class="q-py-sm dark-banner absolute-bottom">
          <q-item clickable v-ripple @click="openProfile(quest.authorUserId)">
            <q-item-section side>
              <q-avatar size="50px">
                <img v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.picture" :src="serverUrl + '/upload/profile/' + quest.author.picture" />
                <img v-if="typeof quest.author === 'undefined' || !quest.author || !quest.author.picture" src="statics/profiles/noprofile.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section style="padding-right: 84px">
              <q-item-label class="subtitle5" v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.name">{{ quest.author.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div v-if="quest && quest.status" class="q-pa-md quest-description text-white" style="padding-bottom: -50px;">
        <div class="float-right quest-score" v-if="quest.availablePoints && quest.availablePoints.maxPts && (!quest.customization || !quest.customization.removeScoring)" @click="showRewards">
          <img src="statics/images/icon/point.png" />
          <div class="absolute">
            +{{ quest.availablePoints.maxPts }}
          </div>
        </div>
        <div class="bg-warning q-pa-sm" v-if="warning.lowBattery">
          <q-icon name="battery_alert" /> {{ $t('label.WarningLowBattery') }}
        </div>
        <div class="bg-warning q-pa-sm" v-if="warning.tooMuchUsers">
          <q-icon name="warning" /> {{ $t('label.TooMuchUsersCurrently') }}
        </div>
        <div v-if="quest.status !== 'published'" class="bg-primary centered q-pa-sm q-mb-md">
          {{ $t('label.' + (quest.type === 'quest' ? 'QuestDraftVersion' : 'PageDraftVersion')) }}
        </div>
        <!-- =========================== TITLE ========================== -->
        <div class="text-h5">
          {{ quest.title === "" ?  $t('label.NoTitle') : quest.title }} 
          &nbsp;<img v-if="getLanguage() !== $store.state.user.language" class="image-and-text-aligned" :src="'statics/icons/game/flag-' + getLanguage() + '.png'" />
        </div>
        <!-- =========================== PROPERTIES ========================== -->
        <div class="row q-pt-md text-subtitle1 properties-bar">
          <div class="q-mr-lg">
            <img src="statics/images/icon/difficulty.svg" class="medium-icon" />{{ $t('label.Difficulty' + quest.level) }}
          </div>
          <div class="q-mr-lg">
            <img src="statics/images/icon/duration.svg" class="medium-icon" />
            <span v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</span>
            <span v-if="quest.duration && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</span>
          </div>
          <div v-if="quest.type === 'quest' && (!quest.customization || !quest.customization.removeScoring)" class="q-mr-lg">
            <span v-if="!quest.premiumPrice.tier && shop.premiumQuest.priceCode === 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span>{{ $t('label.Free') }}</span>
            </span>
            <span v-if="shop.premiumQuest.priceCode !== 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span>{{ shop.premiumQuest.priceValue === '0' ? '...' : shop.premiumQuest.priceValue }}</span>
            </span>
          </div>
          <div v-if="!quest.customization || !quest.customization.removeScoring">
            <q-rating v-if="quest.rating && quest.rating.rounded" readonly v-model="quest.rating.rounded" color="yellow-8" :max="5" size="0.8em" />
          </div>
        </div>
        <div v-if="quest.type === 'room' && quest.premiumPrice.manual">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        <div v-if="quest.premiumPrice.tier && quest.type === 'quest' && quest.premiumPrice.manual && shop.premiumQuest.priceCode === 'free'">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        
        <!-- =========================== LOCATION ========================== -->
        
        <div v-if="quest.location && quest.location.address" class="text-subtitle1 q-mt-sm quest-location">
          {{ quest.location.address }}
        </div>
        
        <!-- =========================== WARNING ========================== -->
        
        <div v-if="quest.warning" class="text-subtitle1 q-mt-sm quest-warning" @click="openWarningLink()">
          <q-icon color="secondary" name="warning" /> <u>{{ getTranslatedData(quest.warning) }}</u>
        </div>
        <div v-if="quest.playersNumber && quest.playersNumber > 1" class="text-subtitle1 q-mt-sm quest-warning">
          <q-icon color="secondary" name="group" /> {{ $t('label.YouNeedToBeXPlayers', {nb: quest.playersNumber}) }}
        </div>
        
        <!-- =========================== RANKING ========================== -->
        
        <div class="text-subtitle1 q-mt-sm quest-ranking">
          <a class="concertone" @click="$router.push('/user/ranking/ranking/' + quest.questId)">{{ $t('label.Ranking') }}</a>
        </div>
      </div>
      <div class="quest-home-button">
        <div class="text-center q-pt-md">
          <p>
            <!--<q-btn-dropdown class="glossy large-btn" v-if="!(quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier)) && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
              <q-list link>
                <q-item 
                  v-for="lang in getAllLanguages()" :key="lang.lang" 
                  v-show="lang.published" 
                  @click.native="playQuest(quest.questId, lang.lang)"
                >
                  <q-item-label>
                    <img style="vertical-align: middle; margin-left: 8px" :src="'statics/icons/game/flag-' + lang.lang + '.png'" />
                    {{ $t('language.' + lang.lang) }}
                  </q-item-label>
                </q-item>
              </q-list>
            </q-<btn-dropdown>-->
            <q-btn v-if="quest.type === 'quest' && !(quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier)) && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages()" @click="playQuest(quest.questId, getLanguage())" color="primary" class="glossy large-btn">
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <span v-if="!continueQuest && isRunFinished">{{ $t('label.SolveAgainThisQuest') }}</span>
              <span v-if="!continueQuest && !isRunFinished">{{ $t('label.SolveThisQuest') }}</span>
            </q-btn>
            <q-btn v-if="quest.type === 'room' && quest.readMoreLink && quest.readMoreLink !== ''" @click="openReadMoreLink" color="primary" class="glossy large-btn">
              <span>{{ $t('label.Book') }}</span>
            </q-btn>
            <!--
            <button class="q-btn q-btn-item q-btn-rectange bg-primary" v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && !(isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary">
              <span v-if="!continueQuest">{{ $t('label.SolveThisQuest') }}</span>
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <br /><span v-if="quest.price && quest.price > 0">{{ quest.price }} <q-icon name="fas fa-bolt" /></span>
            </button>
            -->
            <q-btn v-if="!isRunPlayable && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="buyCoins()" color="primary" class="glossy large-btn"><span>{{ $t('label.BuyCoinsToPlay') }}</span></q-btn>
            <q-btn v-if="this.isUserTooFar && !quest.allowRemotePlay" disabled color="primary" class="glossy large-btn"><span>{{ $t('label.GetCloserToStartingPoint') }} ({{ distance > 1000 ? (Math.round(distance / 1000)) + "km" : distance + "m" }})</span></q-btn>
            <q-btn v-if="quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier) && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="playQuest(quest.questId, getLanguage())" color="primary" class="glossy large-btn"><span>{{ $t('label.SolveThisQuest') }}</span></q-btn>
            <q-btn v-if="shop.premiumQuest.priceCode === 'notplayableonweb'" disabled color="primary" class="glossy large-btn"><span>{{ $t('label.QuestPlayableOnMobile') }}</span></q-btn>
          </p>
        </div>
      </div>
      <div class="q-pa-md">
        <div class="text-subtitle2" v-html="this.quest.description"></div>
        <div v-if="isUserTooFar && !quest.allowRemotePlay" class="q-pt-md">
          <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.QuestIsFarFromUser')" />
        </div>
      </div>
      <div v-if="isOwner || isAdmin" class="q-pa-md subtitle5 centered">
        <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.YouAreQuestOwnerDesc')" />
        &nbsp;<q-btn flat color="secondary" :label="$t('label.Modify')" @click="modifyQuest()" />
      </div>
      <div v-if="quest.type === 'room'" class="q-pa-md subtitle5">
        {{ $t('label.RoomDataWarning') }}
      </div>
    </div>
    
    <!------------------ LOADER AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="showPreloaderPopup">
        <div class="centered q-pa-lg title2 text-primary background-lighter">
          <div class="q-pa-lg text-uppercase">{{ $t('label.InProgressPreparation') }}</div>
          <img src="statics/images/animation/map.gif" class="full-width q-mb-lg" />
        </div>
        <div>
          <div class="q-pa-lg centered subtitle2">
            {{ $t('label.Warnings') }}
          </div>
          <div class="q-pa-md subtitle5">
            <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.GeneralWarning')" />
          </div>
          <div v-if="isRunFinished" class="q-pa-md subtitle5">
            <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.YouAlreadyDidThisQuest')" />
          </div>
        </div>
        <div class="centered" v-if="offline.show">
          <offlineLoader :quest="this.quest" :design="'prepare'" :lang="getLanguage()" @end="startQuest(quest.questId, getLanguage())"></offlineLoader>
        </div>
      </div>
    </transition>
    
    <!------------------ MULTIPLAYER AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="multiplayer.show">
        <div class="bottom-margin-for-keypad">
          <div class="q-pa-lg centered subtitle2">
            {{ $t('label.ThisIsAMultiplayerGame') }}
          </div>
          <div class="q-pa-md">
            <q-card class="my-card">
              <q-card-section class="bg-primary text-white centered text-uppercase">
                <div class="text-h6">{{ $t('label.JoinATeam') }}</div>
              </q-card-section>
              <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                <q-btn class="glossy large-button text-primary bg-white" @click="scanMultiplayerQRCode"><span>{{ $t('label.ScanTheLeaderQRCode') }}</span></q-btn>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="centered">
            -
            <span>{{ $t('label.Or') }}</span>
            -
          </div>
          
          <div class="q-pa-md">
            <q-card class="my-card">
              <q-card-section class="bg-primary text-white centered text-uppercase">
                <div class="text-h6">{{ $t('label.CreateATeam') }}</div>
              </q-card-section>
              <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                <div v-if="multiplayer.qrcode === ''" class="centered">
                  <q-input
                    dark
                    type="text"
                    :label="$t('label.TeamName')"
                    v-model="multiplayer.team"
                    bottom-slots
                    counter
                    maxlength="20"
                    />
                  <q-btn class="glossy large-button text-primary bg-white" @click="createTeam"><span>{{ $t('label.CreateTeam') }}</span></q-btn>
                </div>
                <div v-if="multiplayer.qrcode !== ''" class="centered">
                  <div>{{ $t('label.OtherPlayersMustScanThisQRCode') }}</div>
                  <div class="q-pa-md">
                    <img :src="serverUrl + '/upload/teams/' + multiplayer.qrcode + '.png'" />
                  </div>
                  <div><q-btn class="glossy large-button text-primary bg-white" @click="checkTeamAndStart"><span>{{ $t('label.MyTeamIsCompleteLetsGo') }}</span></q-btn></div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </transition>
    
    <!------------------ RANKING AREA ------------------------
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="ranking.show">
        <a class="float-right no-underline close-btn" color="grey" @click="ranking.show = false"><q-icon name="close" class="medium-icon" /></a>
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Ranking') }}</div>
        {{ $t('label.RankingIntro') }}
        <q-list>
          <q-item v-for="rank in ranking.items" :key="rank.position" >
            <q-item-section avatar>
              <img :src="'statics/icons/game/medal-' + rank.position + '.png'">
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ rank.name }}</q-item-label>
              <q-item-label caption>{{ rank.score}} {{ $t('label.points') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-avatar>
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                <img v-if="!rank.picture || rank.picture === ''" src="/statics/icons/game/profile-small.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section side v-if="!rank.isFriend" @click.native="addFriend(rank.id)">
              <q-icon name="person_add" color="primary" />
            </q-item-section>
            <q-item-section side v-if="rank.isFriend"></q-item-section>
          </q-item>
        </q-list>
        <div class="centered">
          <q-btn class="glossy large-button" color="primary" :label="$t('label.CloseQuestRanking')" @click="ranking.show = false" />
        </div>
      </div>
    </transition>-->
    
    <!--====================== SHOP PAGE =================================-->
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="shop.show">
        <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" /></a>
        <div class="q-pa-lg centered subtitle2">
          {{ $t('label.BuyThisQuest') }}
        </div>
        <div class="q-pa-md" v-if="quest.premiumPrice && quest.premiumPrice.tier">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.YouHaveReceivedAQrCodeFrom', {author: quest.author.name}) }}</div>
            </q-card-section>
            <q-card-section class="bg-primary subtitle5 q-pa-md centered">
              <q-btn class="glossy large-button text-primary bg-white" @click="scanTierPaymentQRCode"><span>{{ $t('label.ScanTheUniqueQRCode') }}</span></q-btn>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="centered" v-if="quest.premiumPrice && quest.premiumPrice.tier && quest.premiumPrice.active">
          -
          <span>{{ $t('label.Or') }}</span>
          -
        </div>
        
        <div class="q-pa-md" v-if="quest.premiumPrice && quest.premiumPrice.active">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.BuyInOneClick') }}</div>
            </q-card-section>
            <q-card-section class="bg-primary subtitle5 q-pa-md centered">
              <q-btn @click="buyQuest()" class="glossy large-button text-primary bg-white" v-if="quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier) && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay)" :disabled="!shop.premiumQuest.buyable"><span>{{ $t('label.Buy') }} ({{ shop.premiumQuest.priceValue === '0' ? '...' : shop.premiumQuest.priceValue }})</span></q-btn>
            </q-card-section>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat color="primary" @click="closeShop">{{ $t('label.Cancel') }}</q-btn>
        </div>
        <!--<shop></shop>-->
      </div>
    </transition>
    
    <!------------------ REWARDS POPUP ------------------------>
    
    <q-dialog v-model="showRewardsPopup">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.ScoreAndBadges') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
          <!--<div class="centered popup-over-header">
            <img src="statics/images/other/popup-rewards.svg" />
          </div>-->
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          {{ $t('label.OnThisEscapeGameYouCanWin') }}
          <ul>
            <li v-if="quest.availablePoints && quest.availablePoints.minPts && quest.availablePoints.maxPts">{{ $t('label.ScoreRange', {min: quest.availablePoints.minPts, max: quest.availablePoints.maxPts}) }}</li>
            <li v-if="quest.rewardPicture && quest.rewardPicture !== ''">{{ $t('label.OneBadge') }}</li>
          </ul>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="fixed-bottom over-map" v-if="!geolocationIsSupported">
      <div class="centered bg-warning q-pa-sm">
        <q-spinner-puff class="on-left" /> {{ $t('label.WarningNoLocation') }}
      </div>
    </div>
    
  </div>
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import shop from 'components/shop'
import offlineLoader from 'components/offlineLoader'

//import Vue from 'vue'
import utils from 'src/includes/utils'
import Notification from 'boot/NotifyHelper'

export default {
  components: {
    shop,
    offlineLoader
  },
  data () {
    return {
      quest: {},
      ranking: {
        show: false,
        items: []
      },
      playStep: 0,
      shop: {
        show: false,
        premiumQuest: {
          priceCode: 'free',
          priceValue: '0',
          buyable: false
        }
      },
      offline: {
        active: false,
        show: false
      },
      warning: {
        questNotLoaded: false,
        lowBattery: false,
        tooMuchUsers: false
      },
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      isRunStarted: false,
      isRunPlayable: true,
      isOwner: false,
      isAdmin: false,
      showRewardsPopup: false,
      showPreloaderPopup: false,
      multiplayer: {
        show: false,
        team: '',
        qrcode: ''
      },
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      continueQuest: false,
      distanceFromStart: 0,
      isHybrid: window.cordova
    }
  },
  async mounted() {
    utils.clearAllRunningProcesses()

    // check if battery is enough charged to play
    window.addEventListener("batterystatus", this.checkBattery, false);

    await this.initQuest()
    
    // reset user history
    this.$store.state.history = {items: [], index: 0}
  },
  methods: {
    /*
     * Sort based on the score
     */
    checkUserIsCloseFromStartingPoint() {
      //check if location tracking is turned on
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          //compare quest starting point with user localisation (1km distance)
          if (this.quest.location && this.quest.location.coordinates && this.quest.location.coordinates.length > 1 && position.coords && position.coords.latitude) {
            this.distance = Math.round(utils.distanceInKmBetweenEarthCoordinates(this.quest.location.coordinates[1], this.quest.location.coordinates[0], position.coords.latitude, position.coords.longitude) * 1000) // meters
            if (this.distance > 50) {
              this.isUserTooFar = true
            }
          }
          // check again in 15 seconds
          utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 15000)
          this.geolocationIsSupported = true
        }, () => {
          this.geolocationIsSupported = false
          utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
        }, { timeout: 10000, maximumAge: 10000 });
      } else {
        this.geolocationIsSupported = false
        utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
      }
    },
    /*
     * Init quest data
     */
    async initQuest() {
      // get quest information
      await this.getQuest(this.$route.params.id)
      
      // Fix EMA on 18/12/2019 - products in store remains if I open several paying quests
      if (window.cordova && this.quest.premiumPrice && this.quest.premiumPrice.androidId && store.products.length > 0) {
        this.$router.go(0)
      }
      
      this.checkUserIsCloseFromStartingPoint()
          
      // check user access rights
      if (this.$store.state.user.isAdmin) {
        this.isAdmin = true
      }
      // check if the user is one of the authors of the quest
      if (this.quest.editorsUserId) {
        for (var i = 0; i < this.quest.editorsUserId.length; i++) {
          if (this.quest.editorsUserId[i] === this.$store.state.user._id) {
            this.isOwner = true
          }
        }
      } else {
        if (this.$store.state.user._id === this.quest.authorUserId) {
          this.isOwner = true
        }
      }
      
      // if the user is the author => force network play
      if (this.offline.active && (this.isOwner || this.isAdmin)) {
        await this.getQuest(this.quest.questId, true)
      }
      
      // get user runs for this quest
      await this.getRun()
      
      // check if user can play this quest
      await this.checkUserCanPlay()
      
      // check if user must pay to play this quest
      await this.initPay()
      
      // get rankings this quest
      //await this.getRanking()
      
      // check number of simultaneous users
      await this.checkSimultaneousPlayers()
    },
    /*
     * Get a quest information
     * @param   {string}    id                    Quest ID
     * @param   {Boolean}   forceNetworkLoading   Force the quest to be loading from graaly server
     */
    async getQuest(id, forceNetworkLoading) {
      // check if the quest data are not already saved on device
      let isQuestOfflineLoaded = await QuestService.isCached(id)
//forceNetworkLoading = true
      if (!isQuestOfflineLoaded || forceNetworkLoading) {
        this.offline.active = false
        // get the last version accessible by user depending on user access
        let response = await QuestService.getLastById(id)
        if (response && response.data && response.status === 200) {
          this.quest = response.data
          if (typeof this.quest.authorUserId !== 'undefined') {
            response = await AuthService.getAccount(this.quest.authorUserId)
            if (response && response.data) {
              this.$set(this.quest, 'author', response.data)
            }
            this.quest.description = utils.replaceBreakByBR(this.quest.description)
          }
        } else {
          this.$q.dialog({
            dark: true,
            title: this.$t('label.TechnicalProblem'),
            message: this.$t('label.TechnicalProblemNetworkIssue'),
            ok: this.$t('label.BackToMap')
          }).onOk(() => {
            this.backToTheMap()
          })
          throw new Error("Could not load quest with questId = '" + id + "'")
        }
      } else {
        this.offline.active = true
        // get quest data from device storage
        const quest = await utils.readFile(id, 'quest_' + id + '.json')

        if (!quest) {
          if (forceNetworkLoading) {
            this.warning.questNotLoaded = true
          } else {
            var questLoadingStatus = await this.getQuest(id, true)
            return questLoadingStatus
          }
        } else {
          this.quest = JSON.parse(quest)

          const pictureUrl = await utils.readBinaryFile(id, this.quest.picture)
          if (pictureUrl) {
            this.quest.picture = pictureUrl
          } else {
            this.quest.picture = '_default-quest-picture.png'
          }
        }
      }
      return true
    },
    /*
     * Get the connected user information about previous runs for this quest
     */
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest.questId)
      //var currentRun = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep) {
            this.isRunStarted = true
            //currentRun = runs.data[i]._id
          }
        }
        if (this.isRunStarted) {
          /*var self = this
          // propose to continue quest on last step played (only if not the creator of the quest)
          //if (!this.isOwner) {
            this.$q.dialog({
              title: this.$t('label.ContinueThisStep'),
              message: this.$t('label.YouAlreadyStartThisQuest'),
              ok: this.$t('label.Restart'),
              cancel: this.$t('label.Continue')
            }).onOk(() => {
              self.cancelRun(currentRun)
            }).onCancel(() => {
              self.continueQuest = true
              self.startQuest(self.quest.questId, self.$route.params.lang)
            })
          //}*/
          this.continueQuest = true
          if (!this.isOwner) {            
            this.startQuest(this.quest.questId, this.$route.params.lang)
          }
        }
      } else {
        // check if an offline run is already started
        let checkIfRunIsAlreadyStarted = await QuestService.isCached(this.quest.questId)   

        if (checkIfRunIsAlreadyStarted) {
          this.continueQuest = true
        }
      }
    },
    /*
     * Get number of simultaneous users
     */
    async checkSimultaneousPlayers() {
      if (this.quest.limitNumberOfPlayer) {
        const nbOfPlayers = await RunService.checkNumberOfPlayers(this.quest.questId)
        if (nbOfPlayers && nbOfPlayers.data && parseInt(nbOfPlayers.data, 10) >= this.quest.limitNumberOfPlayer) {
          this.warning.tooMuchUsers = true
        }
      }
      
      // remove run offline data
      await utils.writeInFile(this.quest.questId, 'run_' + this.quest.questId + '.json', JSON.stringify({}), false)
    },
    /*
     * Check battery level
     */
    checkBattery(status) {
      if (status.level < 50) {
        this.warning.lowBattery = true
      } else {
        this.warning.lowBattery = false
      }
    },
    /*
     * Check if user can play this quest
     */
    async checkUserCanPlay() {
      if (this.isRunStarted || this.isRunFinished) {
        return true
      }
      if (this.quest.price > this.$store.state.user.coins && !this.isAdmin && !this.isOwner) {
        this.isRunPlayable = false
        return false
      }
      return true
    },
    /*
     * Check if user must pay to play this quest
     */
    async initPay() {
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        return 'free'
      } 
      // if game is free
      if (!this.quest.premiumPrice.active) {
        return 'free'
      }
      // admin and owners do not pay
      /*if (this.isAdmin || this.isOwner) {
        return 'free'
      }*/
      // if game is already started or played, do not pay
      if (this.isRunStarted || this.isRunFinished) {
        return 'free'
      }
      // init Store pay
      //if (!window.store) {
      if (!window.cordova) {
        Notification(this.$t('label.YouMustPlayThisKindOfQuestOnAMobileDevice'), 'error')
        this.shop.premiumQuest.priceCode = 'notplayableonweb'
        return
      }
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
        return
      }
      // check if player has already paied
      const isPayed = await QuestService.hasPayed(this.quest.questId)
      if (isPayed && isPayed.data && isPayed.data.status && isPayed.data.status === 'paied') {
        this.shop.premiumQuest.priceCode = 'free'
        return "free"
      }
      this.shop.premiumQuest.priceCode = this.quest.premiumPrice.androidId
      //var _this = this
      
      store.register({
        id: this.quest.premiumPrice.androidId,
        alias: this.quest.premiumPrice.androidId,
        type: store.CONSUMABLE
      })

      store.error(function(error) {
        Notification(error.message + '(code: ' + error.code + ')', 'error')
      })

      store.when(this.quest.premiumPrice.androidId).updated(this.displayPrice)

      store.when(this.quest.premiumPrice.androidId).approved(function(product) {
        product.verify()
      });

      store.when(this.quest.premiumPrice.androidId).verified(async(product) => {
        // save the product purchase
        const purchaseStatus = await this.savePurchase(product)

        if (purchaseStatus) {
          product.finish()
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });

      store.refresh()
    },
    displayPrice(product) {
      // check if product is orderable
      this.shop.premiumQuest.priceValue = product.price
      if (product.canPurchase) {
        this.shop.premiumQuest.buyable = true
      }
    },
    /*
     * Save a purchase
     */
    async savePurchase (product) {
      const purchaseStatus = await QuestService.purchasePremium(this.quest.questId, product)
      
      if (purchaseStatus && purchaseStatus.data && purchaseStatus.data.status && purchaseStatus.data.status === 'ok') {
        // activate play button
        this.playStep = 1
        this.playQuest(this.quest.questId, this.$route.params.lang)
        //this.shop.premiumQuest.priceCode = 'free'
        return true
      }
      return false
    },
    /*
     * Buy the quest
     */
    async buyQuest () {
      store.order(this.quest.premiumPrice.androidId)
    },
    /*
     * Compute the price of the quest
     *
    async getPrice() {
      if (!this.quest || !this.quest.premiumPrice || !this.quest.premiumPrice.prices) {
        return this.$t('label.Error')
      }
      if (this.$store.state.user.language && this.quest.premiumPrice.prices[this.$store.state.user.language]) {
        return this.quest.premiumPrice.prices[this.$store.state.user.language]
      } else if (this.quest.premiumPrice.prices[quest.mainLanguage] && this.quest.premiumPrice.prices[quest.mainLanguage] !== '') {
        return this.quest.premiumPrice.prices[quest.mainLanguage]
      } else {
        return this.$t('label.Error')
      }
    },*/
    /*
     * Add a new friend
     */
    async addFriend(friendId) {
      this.$q.loading.show()
      var newFriend = await UserService.addFriend(friendId)
      this.$q.loading.hide()
      
      // hide add friend button for user concerned
      if (newFriend) {
        for (var i = 0; i < this.ranking.items.length; i++) {
          if (this.ranking.items[i].id === friendId) {
            this.ranking.items[i].isFriend = true
          }
        }
      }
    },
    /*
     * Sort based on the score
     */
    compareScore(a, b) {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
    },
    /*
     * Get the default language for this quest
     * @param   {object}    quest            quest data
     */
    getLanguage(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages
      if (this.isOwner || this.isAdmin) {
        publishedLanguages = quest.languages
      } else {
        publishedLanguages = quest.languages.filter(language => language.published)
      }
      if (publishedLanguages && publishedLanguages.length > 0) {
        // check if the user language is set => default language
        var defaultLanguage = ''
        for (var i = 0; i < publishedLanguages.length; i++) {
          if (publishedLanguages[i].lang === this.$store.state.user.language) {
            defaultLanguage = this.$store.state.user.language
          }
        }
        if (defaultLanguage === '' && publishedLanguages.length > 0) {
          defaultLanguage = publishedLanguages[0].lang
        }
      } else if (quest.languages.length > 0) {
        defaultLanguage = quest.languages[0].lang
      }
      return defaultLanguage
    },
    /*
     * Return data translated based on default language
     * @param   {object}    data            object containing translated data
     */
    getTranslatedData(data) {
      let lang = this.getLanguage()
      if (data[lang]) {
        return data[lang]
      } else {
        this.quest.warning = null
        return ""
      }
    },
    /*
     * Open the warning link
     */
    openWarningLink() {
      if (this.quest && this.quest.warning && this.quest.warning.link) {
        utils.openExternalLink(this.quest.warning.link)
      }
    },
    /*
     * Get all the published language for this quest
     * @param   {object}    quest            quest data
     */
    getAllLanguages(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest || !quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages = quest.languages.filter(language => language.published)
      
      // when testing, no language published => Provide one
      if (publishedLanguages && publishedLanguages.length === 0 && quest.languages.length > 0) {
        publishedLanguages.push(quest.languages[0])
      }
      
      return publishedLanguages
    },
    /*
     * Launch a quest with default language
     * @param   {Object}    obj         Swipe object
     *
    swipeMgmt(obj) {
      if (obj.direction === 'right') {
        this.backToTheMap()
      }
      if (obj.direction === 'left') {
        const languages = this.getAllLanguages(this.quest)
        const lang = languages[0].lang
        this.playQuest(this.quest.questId, lang)
      }
    },
    /*
     * Launch a quest
     * @param   {String}    questId            ID of the quest
     * @param   {String}    lang               lang of the quest
     */
    playQuest(questId, lang) {
      if (this.playStep === 0 && this.quest.premiumPrice && (this.quest.premiumPrice.tier || this.quest.premiumPrice.active) && !this.isAdmin && !this.isOwner) {
        this.shop.show = true
      } else if (this.playStep <= 1 && this.quest.playersNumber > 1 && !this.continueQuest) {
        this.shop.show = false
        this.multiplayer.show = true
      } else {
        this.shop.show = false
        this.multiplayer.show = false
        this.showPreloaderPopup = true
        if (this.isHybrid) {
          this.offline.show = true
        } else {
  console.log("Issue *****")
          var _this = this
          setTimeout(function() { _this.startQuest(questId, lang) }, 7000)
        }
      }
    },
    /*
     * Open a user profile
     */
    openProfile(id) {
      this.$router.push('/profile/' + id)
    },
    /*
     * Scan a QR Code to join a team
     */
    scanMultiplayerQRCode() {
      var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              if (result.text.indexOf('team_') === -1) {
                Notification(_this.$t('label.ThisIsNotATeamQRCodeValid'), 'error')
              } else {
                _this.checkTeamCode(result.text)
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
     * Scan a QR Code to buy a quest using tier QR code
     */
    scanTierPaymentQRCode() {
      var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              _this.checkTierPaymentCode(result.text)
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
     * Check a team code
     */
    async checkTeamCode(code) {
      let res = await RunService.addTeamPlayer(code)
      if (res.status === 200) {
        this.playStep = 2
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        Notification(this.$t('label.ErrorMessageForNewTeamMember'), 'error')
      }
    },
    /*
     * Check a tier payment code
     */
    async checkTierPaymentCode(code) {
      let res = await QuestService.useTierPaymentCode(this.quest.questId, code)
      if (res.status === 200) {
        this.playStep = 1
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        Notification(this.$t('label.TechnicalIssueOrCodeAlreadyUsed'), 'error')
      }
    },
    /*
     * Create a team
     */
    async createTeam() {
      if (this.multiplayer.team && this.multiplayer.team !== '') {
        let res = await RunService.init(this.quest.questId, this.quest.version, this.$route.params.lang, this.isUserTooFar, this.multiplayer.team)
        if (res.status === 200 && res.data && res.data._id) {
          //Vue.set(this.multiplayer, qrcode, res.data._id)
          this.multiplayer.runId = res.data._id
          this.multiplayer.qrcode = res.data._id
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      } else {
        Notification(this.$t('label.PleaseEnterYourTeamName'), 'error')
      }
    },
    /*
     * Check that team is ready
     */
    async checkTeamAndStart() {
      let res = await RunService.checkTeamIsReady(this.multiplayer.runId)
      if (res.status === 200) {
        this.playStep = 2
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        if (res.data && res.data.members && res.data.members.length > 0) {
          let members = res.data.members.join(', ')
          Notification(this.$t('label.YouNeedMoreMembersToPlay', {nb: this.quest.playersNumber, members: members}), 'warning')
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    
    /*
     * Open booking link
     */
    openReadMoreLink() {
      //window.open(this.quest.readMoreLink)
      utils.openExternalLink(this.quest.readMoreLink)
    },
    startQuest(questId, lang) {
      this.$router.push('/quest/play/' + questId + '/version/' + this.quest.version + '/step/0/' + lang + '?remoteplay=' + this.isUserTooFar)
    },
    /*
     * Show rewards for this quest
     */
    showRewards () {
      this.showRewardsPopup = true
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.back()
    },
    /*
     * Manage back to the map button
     */
    modifyQuest () {
      this.$router.push('/quest/builder/' + this.quest.questId)
    },
    /*
     * Open shop
     *
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
     * get background image
     */
    getBackgroundImage () {
      if (this.quest.picture && this.quest.picture[0] === '_') {
        return 'statics/images/quest/' + this.quest.picture
      } else if (this.quest.picture && this.quest.picture.indexOf('blob:') !== -1) {
        return this.quest.picture
      } else if (this.quest.picture) {
        return this.serverUrl + '/upload/quest/' + this.quest.picture
      } else {
        return 'statics/images/quest/default-quest-picture.png'
      }
    }
  }
}
</script>
