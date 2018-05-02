<template>
  
  <div class="scroll" id="scroller" style="max-height:100%;">
    <div class="fit" id="teaser" v-if="geolocationIsSupported">
      <div class="fit" :style="'background: url(' + serverUrl + '/upload/quest/' + quest.picture + ' ) center center / cover no-repeat '">
        <div style="height: 85%">
          <div class="text-center top-area">
            <div class="title-area">
              <h1 class="text-primary">{{ quest.title }}</h1>
              <p>
                <span v-if="typeof quest.author !== 'undefined'">{{ quest.author.name }}</span>
              </p>
              <p>
                <span v-if="quest.rating">
                  <q-rating readonly :value="quest.rating && quest.rating.rounded" color="primary" :max="5" size="1.7rem" />
                </span>
              </p>
              <div class="warning" v-if="this.isRunFinished">
                <strong>{{ $t('message.YouAlreadyDidThisQuest') }}</strong><br />
                {{ $t('message.YouCanResolveItAgain') }}
              </div>
              <div class="warning" v-if="this.isUserTooFar">
                <strong>{{ $t('message.QuestIsFarFromUser') }}</strong><br />
                {{ $t('message.QuestIsFarFromUserDesc') }}
              </div>
              <p>
                <span>{{ $t('message.nbPointsToWin', { nb: quest.availablePoints }) }}</span>
                &nbsp;
                <span v-if="quest.mainLanguage"><img class="image-and-text-aligned" :src="'/statics/icons/game/flag-' + quest.mainLanguage + '.png'" /></span>
              </p>
            </div>
          </div>
          <div class="text-center">
            <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">{{ $t('message.SolveThisQuest') }}</q-btn></p>
          </div>
        </div>
        <div class="full-width text-center">
          <q-icon class="text-primary big-icon" name="expand_more" @click="moveDown()" />
        </div>
      </div>
      <div class="padding-medium" id="bottom-part">
        <p v-if="quest.level">{{ $t('message.Difficulty') }}: <img class="image-and-text-aligned" src="/statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 1 ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 3 ? 'red' : 'grey') + '.png'" /></p>
        <p v-if="quest.duration">{{ $t('message.Duration') }}: {{ quest.duration }} {{ $t('message.minutes') }}</p>
        <p v-if="quest.startingPlace">{{ $t('message.StartingPoint') }}: {{ quest.startingPlace }}</p>
        <p style="margin-bottom: 40px" v-html="quest.description"></p>
        <p class="text-center"><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">{{ $t('message.SolveThisQuest') }}</q-btn></p>
      </div>
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
  </div>
  
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import questLevels from 'data/questLevels.json'
import { QRating, QParallax, Dialog } from 'quasar'
import utils from 'src/includes/utils'

export default {
  components: {
    QRating,
    QParallax
  },
  data () {
    return {
      quest: {},
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false
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
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('message.SolveAQuest'))
    
    await this.getQuest(this.$route.params.id)
    
    await this.getRun()
    
    //check if location tracking is turned on
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
    }
  },
  methods: {
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.quest = response.data
      if (typeof this.quest.authorUserId !== 'undefined') {
        response = await AuthService.getAccount(this.quest.authorUserId)
        this.$set(this.quest, 'author', response.data)
        this.quest.description = utils.replaceBreakByBR(this.quest.description)
      }
    },
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest._id)
      var maxStepComplete = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep > maxStepComplete) {
            this.$store.dispatch('setCurrentRun', runs.data[i])
            maxStepComplete = runs.data[i].currentStep
          }
        }
        if (maxStepComplete > 0) {
          var self = this
          Dialog.create({
            title: this.$t('message.ContinueThisStep'),
            message: this.$t('message.YouAlreadyStartThisQuest'),
            buttons: [
              {
                label: this.$t('message.Restart'),
                handler () {
                  return self.$router.push('/quest/play/' + self.quest._id + '/step/1')
                }
              },
              {
                label: this.$t('message.Continue'),
                handler () {
                  return self.$router.push('/quest/play/' + self.quest._id + '/step/' + maxStepComplete)
                }
              }
            ]
          })
        }
      }
    },
    moveDown() {
      var mainView = document.getElementById('main-view')
      var height = parseInt(mainView.style.height, 10)
      document.getElementById('main-view').scrollTop = height
    },
    
    // TODO make this more generic (basic model methods over 'webapp simple JSON files')
    // e.g. import JSONModels from 'utils/json-models'; questLevels = JSONModels('questLevels'); questLevels.getById(123)
    // see https://stackoverflow.com/questions/29923879/pass-options-to-es6-module-imports
    getQuestLevelName(id) {
      let level = utils.getById(questLevels, id)
      return level === null ? '' : level.name
    }
  }
}
</script>

<style scoped>
  .warning { padding: 1rem; font-size: 1.1rem; text-align: justify; background: #ec4; border-bottom: 1px solid #990; margin-bottom: 0.6rem; }
  .title-area { opacity: .8;background-color: #fff;border-radius: .5rem;padding: 20px;margin: 0;box-shadow: 0 0 0.1rem 0.1rem #fff; height: 100%; }
  .top-area { min-height: 50%;padding: 40px 30px; }
</style>
