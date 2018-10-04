<template>
  <div class="scroll" v-scroll="scrolling">
    <div class="fit" id="teaser" v-if="geolocationIsSupported">
      
      <!------------------ MAIN INFORMATION AREA ------------------------>
      
      <div class="fit" :style="'background: url(' + ((quest.picture && quest.picture[0] === '_') ? 'statics/images/quest/' + quest.picture : serverUrl + '/upload/quest/' + quest.picture) + ' ) center center / cover no-repeat '" v-touch-swipe.horizontal="swipeMgmt">
        <div class="fit">
          <div class="text-center bottom-dark-banner">
            <p class="title">
              {{getLanguage() ? quest.title[getLanguage()] : $t('label.NoTitle') }}
              <img v-if="getLanguage() !== $store.state.user.language" class="image-and-text-aligned" :src="'statics/icons/game/flag-' + getLanguage() + '.png'" />
            </p>
            <p class="medium-icon q-pa-none q-ma-none">
              <span class="q-ml-sm q-mr-sm" v-show="!(isRunFinished || (isOwner && !isAdmin)) && quest.availablePoints && quest.availablePoints > 0">{{ quest.availablePoints }} <q-icon name="fas fa-trophy" /></span>
              <span class="q-ml-sm q-mr-sm" v-show="(isRunFinished || (isOwner && !isAdmin)) && quest.availablePoints && quest.availablePoints > 0">0 <q-icon name="fas fa-trophy" /></span>
              <span class="q-ml-sm q-mr-sm" v-show="!(isRunFinished || (isOwner && !isAdmin)) && quest.reward && quest.reward > 0">{{ quest.reward }} <q-icon name="fas fa-coins" /></span>
              <span class="q-ml-sm q-mr-sm" v-show="(isRunFinished || (isOwner && !isAdmin)) && quest.reward && quest.reward > 0">0 <q-icon name="fas fa-coins" /></span>
            </p>
            <p v-if="quest.rating">
              <q-rating readonly :value="quest.rating && quest.rating.rounded" color="white" :max="5" size="1.2rem" />
            </p> &nbsp;
            <div class="text-center">
              <p>
                <q-btn v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && (isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest._id, getLanguage())" color="primary">{{ $t('label.SolveThisQuest') }}</q-btn>
                <q-btn-dropdown v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
                  <q-list link>
                    <q-item 
                      v-for="lang in getAllLanguages()" :key="lang.lang" 
                      v-show="lang.published" 
                      @click.native="playQuest(quest._id, lang.lang)"
                    >
                      <q-item-main>
                        <q-item-tile label>
                          <img class="image-and-text-aligned" :src="'statics/icons/game/flag-' + lang.lang + '.png'" />
                          {{ $t('language.' + lang.lang) }}
                        </q-item-tile>
                      </q-item-main>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                <button class="q-btn q-btn-item q-btn-rectange bg-primary" v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && !(isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest._id, getLanguage())" color="primary">
                  {{ $t('label.SolveThisQuest') }}<br />
                  <span v-if="quest.price && quest.price > 0">{{ quest.price }} <q-icon name="fas fa-coins" /></span>
                </button>
                <q-btn v-if="!isRunPlayable && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="buyCoins()" color="primary">{{ $t('label.BuyCoinsToPlay') }}</q-btn>
                <q-btn v-if="this.isUserTooFar && !quest.allowRemotePlay" disabled color="primary">{{ $t('label.GetCloserToStartingPoint') }}</q-btn>
              </p>
            </div>
            <div class="full-width text-center">
              <q-btn flat :label="$t('label.BackToTheMap')" @click="backToTheMap()" />
              <span  v-if="!scrolled"><q-btn flat icon="arrow_downward" :label="$t('label.ScrollForMoreDetails')" @click="scrollToDetail()" /></span>
              
            </div>
          </div>
        </div>
      </div>
      
      <!------------------ DETAILS AREA ------------------------>
      
      <div id="detail" class="q-pa-md q-pb-xxxl">
        <q-alert type="warning" class="q-mb-md" v-if="this.isRunFinished">
          {{ $t('label.YouAlreadyDidThisQuest') }}<br />
          {{ $t('label.YouCanResolveItAgain') }}
        </q-alert>
        <q-alert type="warning" class="q-mb-md" v-if="!this.isRunFinished">
          {{ $t('label.GeneralWarning') }}
        </q-alert>
        <q-alert type="warning" class="q-mb-md" v-if="this.isUserTooFar && quest.allowRemotePlay">
          {{ $t('label.QuestIsFarFromUser') }}<br />
          {{ $t('label.QuestIsFarFromUserDesc') }}
        </q-alert>
        <q-alert type="warning" class="q-mb-md" v-if="typeof quest.author !== 'undefined' && quest.author._id === $store.state.user._id">
          {{ $t('label.YouAreQuestOwnerDesc') }}
        </q-alert>
        <p v-if="typeof quest.author !== 'undefined' && quest.author.name"><strong>{{ $t('label.Author') }}:</strong> {{ quest.author.name }}</span>
        <p v-if="quest.level"><strong>{{ $t('label.Difficulty') }}:</strong> <img class="image-and-text-aligned" src="statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'statics/icons/game/magnifying-' + (quest.level === 1 ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'statics/icons/game/magnifying-' + (quest.level === 3 ? 'red' : 'grey') + '.png'" /></p>
        <p v-if="quest.duration"><strong>{{ $t('label.Duration') }}:</strong> {{ quest.duration }} {{ $t('label.minutes') }}</p>
        <p v-if="quest.startingPlace"><strong>{{ $t('label.StartingPoint') }}:</strong> {{ quest.startingPlace }}</p>
        <p>{{getLanguage() ? quest.description[getLanguage()] : "" }}</p>
      </div>
    </div>
    
    <!------------------ RANKING AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="ranking.show">
        <a class="float-right no-underline" color="grey" @click="ranking.show = false"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.Ranking') }}</h1>
        <q-list>
          <q-item v-for="rank in ranking.items" :key="rank.position" >
            <q-item-side>
              <q-item-tile avatar>
                <img :src="'statics/icons/game/medal-' + rank.position + '.png'">
              </q-item-tile>
            </q-item-side>
            <q-item-main>
              <q-item-tile label>{{ rank.name }} ({{ rank.score}} <q-icon name="fas fa-trophy" />)</q-item-tile>
            </q-item-main>
            <q-item-side right>
              <q-item-tile avatar>
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                <img v-if="!rank.picture || rank.picture === ''" src="/statics/icons/game/profile-small.png" />
              </q-item-tile>
            </q-item-side>
            <q-item-side right v-if="!rank.isFriend" @click.native="addFriend(rank.id)">
              <q-item-tile icon="person_add" color="primary" />
            </q-item-side>
            <q-item-side right v-if="rank.isFriend"></q-item-side>
          </q-item>
        </q-list>
      </div>
    </transition>
    
    <!--====================== SHOP PAGE =================================-->
    
    <q-modal v-model="shop.show">
      <a class="float-right no-underline q-pa-md" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
      <h1 class="size-3 q-pl-md">{{ $t('label.Shop') }}</h1>
      <shop></shop>
    </q-modal>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="row enable-geolocation" v-if="!geolocationIsSupported">
      <div class="col-12">
        <h5>{{ $t('label.PleaseActivateGeolocation') }}</h5>
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
    
  </div>
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import shop from 'components/shop'

import utils from 'src/includes/utils'
import { scroll } from 'quasar'
const { getScrollTarget, setScrollPosition } = scroll

export default {
  components: {
    shop
  },
  data () {
    return {
      quest: {},
      ranking: {
        show: false,
        items: []
      },
      shop: {
        show: false
      },
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      isRunStarted: false,
      isRunPlayable: true,
      isOwner: false,
      isAdmin: false,
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      scrolled: false
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
  async mounted() {
    // get quest information
    await this.getQuest(this.$route.params.id)
        
    // check user access rights
    if (this.$store.state.user.isAdmin) {
      this.isAdmin = true
    }
    if (this.$store.state.user._id === this.quest.authorUserId) {
      this.isOwner = true
    }
    
    // get user runs for this quest
    await this.getRun()
    
    // check if user can play this quest
    await this.checkUserCanPlay()
    
    // get rankings this quest
    await this.getRanking()
    
    this.checkUserIsCloseFromStartingPoint()
    /*/check if location tracking is turned on
    if (this.$data.geolocationIsSupported) {
      navigator.geolocation.getCurrentPosition((position) => {
        //compare quest starting point with user localisation (1km distance)
        if (this.quest.location && this.quest.location.coordinates && this.quest.location.coordinates.length > 1 && position.coords && position.coords.latitude) {
          if ((Math.abs(position.coords.latitude - this.quest.location.coordinates[0]) > 0.009) || (Math.abs(position.coords.longitude - this.quest.location.coordinates[1]) > 0.013)) {
            this.isUserTooFar = true
          }
        }
      }, () => {
        console.error('geolocation failed')
        this.geolocationIsSupported = false
      }, { timeout: 10000, maximumAge: 10000 });
    }*/
  },
  methods: {
    /*
     * Sort based on the score
     */
    checkUserIsCloseFromStartingPoint() {
      //check if location tracking is turned on
      if (this.$data.geolocationIsSupported) {
        navigator.geolocation.getCurrentPosition((position) => {
          //compare quest starting point with user localisation (1km distance)
          if (this.quest.location && this.quest.location.coordinates && this.quest.location.coordinates.length > 1 && position.coords && position.coords.latitude) {
            if ((Math.abs(position.coords.latitude - this.quest.location.coordinates[0]) > 0.009) || (Math.abs(position.coords.longitude - this.quest.location.coordinates[1]) > 0.013)) {
              this.isUserTooFar = true
              // check again in 15 seconds
              setTimeout(this.checkUserIsCloseFromStartingPoint, 15000)
            }
          }
        }, () => {
          console.error('geolocation failed')
          this.geolocationIsSupported = false
        }, { timeout: 10000, maximumAge: 10000 });
      }
    },
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.quest = response.data
      if (typeof this.quest.authorUserId !== 'undefined') {
        response = await AuthService.getAccount(this.quest.authorUserId)
        this.$set(this.quest, 'author', response.data)
        this.quest.description = utils.replaceBreakByBR(this.quest.description)
      }
    },
    /*
     * Get the connected user information about previous runs for this quest
     */
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest._id)
      var maxStepComplete = 0
      var lang = 'en'
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep > maxStepComplete) {
            maxStepComplete = runs.data[i].currentStep
            lang = runs.data[i].language
          }
        }
        if (maxStepComplete > 0) {
          this.isRunStarted = true
          var self = this
          // propose to continue quest on last step played (only if not the creator of the quest)
          if (!this.isOwner) {
            this.$q.dialog({
              title: this.$t('label.ContinueThisStep'),
              message: this.$t('label.YouAlreadyStartThisQuest'),
              ok: this.$t('label.Continue'),
              cancel: this.$t('label.Restart')
            }).then(() => {
              return self.$router.push('/quest/play/' + self.quest._id + '/step/' + maxStepComplete + '/' + lang)
            })
          }
        }
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
     * Add a new friend
     */
    async addFriend(friendId) {
      var newFriend = await UserService.addFriend(friendId)
      
      // hide add friend button for user concerned
      console.log(newFriend)
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
      var scores = await RunService.listPlayersForThisQuest(this.quest._id)
      
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
        setTimeout(this.showRanking, 3000)
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
        this.playQuest(this.quest._id, lang)
      }
    },
    /*
     * Launch a quest
     * @param   {String}    questId            ID of the quest
     * @param   {String}    lang               lang of the quest
     */
    playQuest(questId, lang) {
      this.$router.push('/quest/play/' + questId + '/step/1/' + lang + '?remoteplay=' + this.isUserTooFar)
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
    scrollToDetail () {
      let el = document.getElementById('detail')
      let target = getScrollTarget(el)
      let offset = el.offsetTop
      let duration = 1000
      setScrollPosition(target, offset, duration)
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.push('/map')
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
    }
  }
}
</script>
