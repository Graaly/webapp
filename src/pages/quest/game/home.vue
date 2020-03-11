<template>
  <div class="scroll background-dark">
    <div id="teaser">
      <!------------------ MAIN INFORMATION AREA ------------------------>
      
      <div v-if="(!quest || !quest.status) && !warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.Loading')}}
        <div>
          <q-btn @click="backToTheMap()" color="primary">{{ $t('label.BackToTheMap') }}</q-btn>
        </div>
      </div>
      <div v-if="warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.QuestNeedNetwork')}}
        <div>
          <q-btn @click="initQuest()" color="primary">{{ $t('label.ReloadQuest') }}</q-btn>
        </div>
      </div>
      <!-- =========================== PICTURE & AUTHOR ========================== -->
      <div v-if="quest && quest.status" class="relative-position" :style="'width: 100vw; height: 50vh; background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat '" v-touch-swipe.horizontal="swipeMgmt">
        <div class="q-py-sm dark-banner fixed-top">
          <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        </div>
        <div class="q-py-sm dark-banner absolute-bottom">
          <q-item clickable v-ripple>
            <q-item-section side>
              <q-avatar size="50px">
                <img v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.picture" :src="serverUrl + '/upload/profile/' + quest.author.picture" />
                <img v-if="typeof quest.author === 'undefined' || !quest.author || !quest.author.picture" src="statics/profiles/noprofile.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="subtitle5" v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.name">{{ quest.author.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div class="q-pa-md quest-description text-white" style="padding-bottom: -50px;">
        <div class="float-right quest-score" v-if="quest.availablePoints && quest.availablePoints.maxPts && (!quest.customization || !quest.customization.removeScoring)" @click="showRewards">
          <img src="statics/images/icon/point.png" />
          <div class="absolute">
            +{{ quest.availablePoints.maxPts }}
          </div>
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
            <img src="statics/images/icon/cost.svg" class="medium-icon" />
            <span v-if="shop.premiumQuest.priceCode === 'free' && quest.type === 'quest'">{{ $t('label.Free') }}</span>
            <span v-if="shop.premiumQuest.priceCode !== 'free' && quest.type === 'quest'">{{ shop.premiumQuest.priceValue === '0' ? '...' : shop.premiumQuest.priceValue }}</span>
          </div>
          <div v-if="!quest.customization || !quest.customization.removeScoring">
            <q-rating v-if="quest.rating && quest.rating.rounded" readonly v-model="quest.rating.rounded" color="secondary" :max="5" size="0.8em" />
          </div>
        </div>
        <div v-if="quest.type === 'room' && quest.premiumPrice.manual">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span v-if="quest.type === 'room' && quest.premiumPrice.manual">{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        <!-- =========================== LOCATION ========================== -->
        <div v-if="quest.location && quest.location.address" class="text-subtitle1 q-pt-sm quest-location">
          {{ quest.location.address }}
        </div>
      </div>
      <div class="quest-home-button">
        <div class="text-center q-pt-md">
          <p>
            <q-btn-dropdown class="glossy large-btn" v-if="shop.premiumQuest.priceCode === 'free' && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
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
            </q-btn-dropdown>
            <q-btn v-if="quest.type === 'quest' && shop.premiumQuest.priceCode === 'free' && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary" class="glossy large-btn">
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <span v-if="!continueQuest && isRunFinished">{{ $t('label.SolveAgainThisQuest') }}</span>
              <span v-if="!continueQuest && !isRunFinished">{{ $t('label.SolveThisQuest') }}</span>
            </q-btn>
            <q-btn v-if="quest.type === 'room' && quest.readMoreLink && quest.readMoreLink !== ''" @click="openReadMoreLink" color="primary" class="glossy large-btn">
              {{ $t('label.Book') }}
            </q-btn>
            <!--
            <button class="q-btn q-btn-item q-btn-rectange bg-primary" v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && !(isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary">
              <span v-if="!continueQuest">{{ $t('label.SolveThisQuest') }}</span>
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <br /><span v-if="quest.price && quest.price > 0">{{ quest.price }} <q-icon name="fas fa-bolt" /></span>
            </button>
            -->
            <q-btn v-if="!isRunPlayable && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="buyCoins()" color="primary" class="glossy large-btn">{{ $t('label.BuyCoinsToPlay') }}</q-btn>
            <q-btn v-if="this.isUserTooFar && !quest.allowRemotePlay" disabled color="primary" class="glossy large-btn">{{ $t('label.GetCloserToStartingPoint') }} ({{ distance > 1000 ? (Math.round(distance / 1000)) + "km" : distance + "m" }})</q-btn>
            <q-btn v-if="shop.premiumQuest.priceCode !== 'free' && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay)" :disabled="!shop.premiumQuest.buyable" @click="buyQuest()" color="primary" class="glossy large-btn">{{ $t('label.Buy') }} ({{ shop.premiumQuest.priceValue === '0' ? '...' : shop.premiumQuest.priceValue }})</q-btn>
            <q-btn v-if="shop.premiumQuest.priceCode === 'notplayableonweb'" disabled color="primary" class="glossy large-btn">{{ $t('label.QuestPlayableOnMobile') }}</q-btn>
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
          <div class="text-grey1">{{ $t('label.Loading') }}</div>
          <offlineLoader :quest="this.quest" :design="'prepare'" @end="offline.show = false"></offlineLoader>
        </div>
      </div>
    </transition>
    
    <!------------------ RANKING AREA ------------------------>
    
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
              <q-item-label caption>{{ rank.score}} {{ $t('label.points') }}<!--<q-icon name="fas fa-trophy" />--></q-item-label>
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
          <q-btn color="primary" :label="$t('label.CloseQuestRanking')" @click="ranking.show = false" />
        </div>
      </div>
    </transition>
    
    <!--====================== SHOP PAGE =================================-->
    
    <q-dialog v-model="shop.show">
      <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
      <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Shop') }}</div>
      <shop></shop>
    </q-dialog>
    
    <!------------------ REWARDS POPUP ------------------------>
    
    <q-dialog v-model="showRewardsPopup">
      <q-card>
        <q-card-section class="popup-header popup-header-big centered">
          {{ $t('label.ScoreAndBadges') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
          <div class="centered popup-over-header">
            <img src="statics/images/other/popup-rewards.svg" />
          </div>
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
        questNotLoaded: false
      },
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      isRunStarted: false,
      isRunPlayable: true,
      isOwner: false,
      isAdmin: false,
      showRewardsPopup: false,
      showPreloaderPopup: false,
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      continueQuest: false,
      distanceFromStart: 0,
      isHybrid: window.cordova
    }
  },
  async mounted() {
    utils.clearAllRunningProcesses()
    
    await this.initQuest()
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
      await this.getRanking()
    },
    /*
     * Get a quest information
     * @param   {string}    id                    Quest ID
     * @param   {Boolean}   forceNetworkLoading   Force the quest to be loading from graaly server
     */
    async getQuest(id, forceNetworkLoading) {
      // check if the quest data are not already saved on device
      let isQuestOfflineLoaded = await QuestService.isCached(id)

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
      var currentRun = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep) {
            this.isRunStarted = true
            currentRun = runs.data[i]._id
          }
        }
        if (this.isRunStarted) {
          var self = this
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
              this.continueQuest = true
            })
          //}
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
     * Cancel a run
     */
    async cancelRun(runId) {
      await RunService.endRun(runId, null, this.quest.questId, this.quest.version, this.quest.mainLanguage)
      // remove run offline data
      await utils.writeInFile(this.quest.questId, 'run_' + this.quest.questId + '.json', JSON.stringify({}), false)
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
      if (this.isAdmin || this.isOwner) {
        return 'free'
      }
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
        this.shop.premiumQuest.priceCode = 'free'
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
     * Get the ranking for this quest
     */
    async getRanking() {
      // do not show ranking for discovery quest
      if (this.quest.questId !== '5b7303ec4efbcd1f8cb101c6') {
        var scores = await RunService.listPlayersForThisQuest(this.quest.questId)
      
        if (scores && scores.data && scores.data.length > 0) {
          this.ranking.items = scores.data
          this.ranking.items.sort(this.compareScore)
          // compute position
          for (var i = 0; i < this.ranking.items.length; i++) {
            if (i === 0 || this.ranking.items[i].score !== this.ranking.items[i - 1].score) {
              this.ranking.items[i].position = i + 1
            } else {
              this.ranking.items[i].position = this.ranking.items[i - 1].position
            }
          }
          utils.setTimeout(this.showRanking, 3000)
        }
      }
    },
    /*
     * Get the ranking for this quest
     */
    async showRanking() {
      this.ranking.show = true
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
      var publishedLanguages = quest.languages.filter(language => language.published)
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
     */
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
      this.showPreloaderPopup = true
      if (this.isHybrid) {
        this.offline.show = true
      } else {
        var _this = this
        setTimeout(function() { _this.startQuest(questId, lang) }, 7000)
      }      
    },
    /*
     * Open booking link
     */
    openReadMoreLink() {
      window.open(this.quest.readMoreLink)
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
      this.$router.push('/map')
    },
    /*
     * Manage back to the map button
     */
    modifyQuest () {
      this.$router.push('/quest/builder/' + this.quest.questId)
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
