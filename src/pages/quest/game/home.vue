<template>
  <div class="scroll" v-scroll="scrolling">
    <div class="fit" id="teaser">
      
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
      <div v-if="quest && quest.status" class="fit" :style="'background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat '" v-touch-swipe.horizontal="swipeMgmt">
        <div class="fit">
          <div class="text-center bottom-dark-banner">
            <div v-if="quest.status !== 'published'" class="bg-accent centered q-pa-sm">
              {{ $t('label.QuestDraftVersion') }}
            </div>
            <div class="title" @click="restartStory()">
              {{getLanguage() ? quest.title[getLanguage()] : $t('label.NoTitle') }} <q-icon name="help" />
              &nbsp;<img v-if="getLanguage() !== $store.state.user.language" class="image-and-text-aligned" :src="'statics/icons/game/flag-' + getLanguage() + '.png'" />
            </div>
            <p v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.name && quest.author.name.indexOf('Graaly') === -1">{{ $t('label.By') }} {{ quest.author.name }}</p>
            <p class="medium-icon q-pa-none q-ma-none">
              <span class="q-ml-sm q-mr-sm" v-show="!(isRunFinished || (isOwner && !isAdmin)) && quest.availablePoints && quest.availablePoints > 0">{{ quest.availablePoints }} <span style="font-size: 0.5em">{{ $t('label.pointsToWin') }}</span><!--<q-icon name="fas fa-trophy" />--></span>
              <span class="q-ml-sm q-mr-sm" v-show="!isOwner && isRunFinished && quest.availablePoints && quest.availablePoints > 0"><span style="font-size: 0.5em">{{ $t('label.YouAlreadyPlayedThisQuest') }}</span></span>
              <span class="q-ml-sm q-mr-sm" v-show="isOwner && !isAdmin && quest.availablePoints && quest.availablePoints > 0"><span style="font-size: 0.5em">{{ $t('label.YouAreQuestOwnerDesc') }}</span></span>
              <span class="q-ml-sm q-mr-sm" v-show="!(isRunFinished || (isOwner && !isAdmin)) && quest.reward && quest.reward > 0">{{ quest.reward }} <q-icon name="fas fa-bolt" /></span>
              <span class="q-ml-sm q-mr-sm" v-show="(isRunFinished || (isOwner && !isAdmin)) && quest.reward && quest.reward > 0">0 <q-icon name="fas fa-bolt" /></span>
            </p>
            <p v-if="quest.rating && quest.rating.rounded">
              <q-rating readonly v-model="quest.rating.rounded" color="white" :max="5" size="1.2rem" />
            </p> &nbsp;
            <div class="text-center">
              <p>
                
                <q-btn-dropdown v-if="shop.premiumQuest.priceCode === 'free' && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
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
                <q-btn v-if="shop.premiumQuest.priceCode === 'free' && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary">
                  <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
                  <span v-if="!continueQuest && isRunFinished">{{ $t('label.SolveAgainThisQuest') }}</span>
                  <span v-if="!continueQuest && !isRunFinished">{{ $t('label.SolveThisQuest') }}</span>
                </q-btn>
                <!--
                <button class="q-btn q-btn-item q-btn-rectange bg-primary" v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && !(isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary">
                  <span v-if="!continueQuest">{{ $t('label.SolveThisQuest') }}</span>
                  <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
                  <br /><span v-if="quest.price && quest.price > 0">{{ quest.price }} <q-icon name="fas fa-bolt" /></span>
                </button>
                -->
                <q-btn v-if="!isRunPlayable && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="buyCoins()" color="primary">{{ $t('label.BuyCoinsToPlay') }}</q-btn>
                <q-btn v-if="this.isUserTooFar && !quest.allowRemotePlay" disabled color="primary">{{ $t('label.GetCloserToStartingPoint') }} ({{ distance > 1000 ? (Math.round(distance / 1000)) + "km" : distance + "m" }})</q-btn>
                <q-btn v-if="shop.premiumQuest.priceCode !== 'free' && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay)" :disabled="!shop.premiumQuest.buyable" @click="buyQuest()" color="primary">{{ $t('label.Buy') }} ({{ shop.premiumQuest.priceValue }})</q-btn>
                <q-btn v-if="shop.premiumQuest.priceCode === 'notplayableonweb'" disabled color="primary">{{ $t('label.QuestPlayableOnMobile') }}</q-btn>
              </p>
            </div>
            <div class="full-width text-center">
              <q-btn flat :label="$t('label.BackToTheMap')" @click="backToTheMap()" />
              <q-btn v-if="isOwner || isAdmin" flat :label="$t('label.Modify')" @click="modifyQuest()" />
            </div>
          </div>
          <div class="fixed-bottom over-map fit" v-if="offline.show">
            <offlineLoader :quest="this.quest" :design="'prepare'" @end="offline.show = false"></offlineLoader>
          </div>
        </div>
      </div>
    </div>
    
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
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="fixed-bottom over-map" v-if="!geolocationIsSupported">
      <div class="centered bg-warning q-pa-sm">
        <q-spinner-puff class="on-left" /> {{ $t('label.WarningNoLocation') }}
      </div>
    </div>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map fit" v-if="quest && story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
    
  </div>
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import shop from 'components/shop'
import story from 'components/story'
import offlineLoader from 'components/offlineLoader'

import utils from 'src/includes/utils'
import Notification from 'boot/NotifyHelper'

export default {
  components: {
    shop,
    story,
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
      story: {
        step: null,
        data: null
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
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      continueQuest: false,
      distanceFromStart: 0,
      scrolled: false
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
          if (!this.isRunStarted && !this.isRunFinished) {
            utils.setTimeout(this.startStory, 4000)
          }
        }, () => {
          this.geolocationIsSupported = false
          utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
          if (!this.isRunStarted && !this.isRunFinished) {
            utils.setTimeout(this.startStory, 4000)
          }
        }, { timeout: 10000, maximumAge: 10000 });
      } else {
        this.geolocationIsSupported = false
        utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
        if (!this.isRunStarted && !this.isRunFinished) {
          utils.setTimeout(this.startStory, 4000)
        }
      }
    },
    /*
     * Start the story
     */
    async initQuest() {
      // get quest information
      await this.getQuest(this.$route.params.id)
      
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
     * Start the story
     */
    startStory() {
      if (this.story.step === null) {
        this.story.step = 1
        this.story.data = {
          level2: (this.quest.level === 1 ? 'grey' : 'red'),
          level3: (this.quest.level === 3 ? 'red' : 'grey'),
          startingPlace: this.quest.location ? this.quest.location.address : null,
          duration: this.quest.duration,
          isFar: (this.isUserTooFar && !this.quest.allowRemotePlay),
          isRunFinished: this.isRunFinished,
          isOwner: (typeof this.quest.author !== 'undefined' && this.quest.author._id === this.$store.state.user._id),
          description: (this.getLanguage() ? this.quest.description[this.getLanguage()] : ""),
          score: (this.isRunFinished || (this.isOwner && !this.isAdmin)) ? 0 : this.quest.availablePoints
        }
      }
    },
    restartStory() {
      this.story.step = null
      this.startStory()
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
            
            // display offline loader only if quest is free
            if (window.cordova) {
              if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId || this.quest.premiumPrice.androidId === 'free') {
                this.offline.show = true
              }
            }
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
console.log('initpay1')
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        return 'free'
      } 
console.log('initpay2')
      // if game is free
      if (!this.quest.premiumPrice.active) {
        return 'free'
      }
console.log('initpay3')
      // admin and owners do not pay
      if (this.isAdmin || this.isOwner) {
        return 'free'
      }
console.log('initpay4')
      // if game is already started or played, do not pay
      if (this.isRunStarted || this.isRunFinished) {
        return 'free'
      }
console.log('initpay5')
      // init Store pay
      if (!window.store) {
        Notification(this.$t('label.YouMustPlayThisKindOfQuestOnAMobileDevice'), 'error')
        this.shop.premiumQuest.priceCode = 'notplayableonweb'
        return
      }
console.log('initpay6')
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
        return
      }
      
      // check if player has already paied
      const isPayed = await QuestService.hasPayed(this.quest.questId)
      if (isPayed && isPayed.data && isPayed.data.status && isPayed.data.status === 'paied') {
        this.shop.premiumQuest.priceCode = 'free'
        if (window.cordova) {
          this.offline.show = true
        }
        return "free"
      }
console.log('initpay7')
      this.shop.premiumQuest.priceCode = this.quest.premiumPrice.androidId
      var _this = this
console.log('initpay8')
      store.register({
        id: this.quest.premiumPrice.androidId,
        alias: this.quest.premiumPrice.androidId,
        type: store.CONSUMABLE
      })
console.log('initpay9')
      store.error(function(error) {
        Notification(error.message + '(code: ' + error.code + ')', 'error')
      })
console.log('initpay10')
      store.when(this.quest.premiumPrice.androidId).updated(function(product) {
console.log('initpay11')
        // check if product is orderable
        _this.shop.premiumQuest.priceValue = product.price
        if (product.canPurchase) {
console.log('initpay12')
          _this.shop.premiumQuest.buyable = true
        }
      });
console.log('initpay13')
      store.when(this.quest.premiumPrice.androidId).approved(function(product) {
console.log('initpay14')
        product.verify()
      });
console.log('initpay15')
      store.when(this.quest.premiumPrice.androidId).verified(async(product) => {
console.log('initpay16')
        // save the product purchase
        const purchaseStatus = await this.savePurchase(product)
console.log('initpay17')
        if (purchaseStatus) {
console.log('initpay18')
          product.finish()
        } else {
console.log('initpay19')
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });
console.log('initpay20')
      store.refresh();
console.log('initpay21')
    },
    /*
     * Save a purchase
     */
    async savePurchase (product) {
console.log(product)
      const purchaseStatus = await QuestService.purchasePremium(this.quest.questId, product)
      
      if (purchaseStatus && purchaseStatus.data && purchaseStatus.data.status && purchaseStatus.data.status === 'ok') {
        // download quest for offline mode
        if (window.cordova) {
          this.offline.show = true
        }
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
console.log('buyquest')
      store.order(this.quest.premiumPrice.androidId)
console.log('buyquest2')
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
      this.$router.push('/quest/play/' + questId + '/version/' + this.quest.version + '/step/0/' + lang + '?remoteplay=' + this.isUserTooFar)
    },
    /*
     * Follow scroll position
     * @param   {Number}    position             scroll position
     */
    scrolling (position) {
      if (position > 40) {
        this.scrolled = true
      } else {
        this.scrolled = false
      }
    },
    /*
    scrollToDetail () {
      let el = document.getElementById('detail')
      let target = getScrollTarget(el)
      let offset = el.offsetTop
      let duration = 1000
      setScrollPosition(target, offset, duration)
    },*/
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
