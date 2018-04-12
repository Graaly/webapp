<template>
  
  <div class="wrapper">
    <div v-if="geolocationIsSupported">
      <div class="fixed-bottom full-width text-center">
        <q-icon class="text-primary big-icon" name="expand_more" />
      </div>
      <div class="window-height play-home">
        <q-parallax :src="serverUrl + '/upload/quest/' + quest.picture" :height="500" v-if="typeof quest.picture !== 'undefined' && quest.picture !== null">
          <div slot="loading">Loading...</div>
          <h1 class="text-primary">{{ quest.title }}</h1>
          <p>
            <span v-if="typeof quest.author !== 'undefined'">{{ quest.author.name }}</span>
          </p>
          <p>
            <span v-if="quest.rating">
              <q-rating readonly :value="quest.rating.rounded" color="primary" :max="5" size="1.7rem" />
            </span>
          </p>
          <div class="warning" v-if="this.isRunFinished">
            <strong>{{ $t('message.YouAlreadyDidThisQuest') }}.</strong><br />
            {{ $t('message.YouCanResolveItAgain') }}.
          </div>
        </q-parallax>
        <div class="q-mt-md text-center" style="margin-top: 30px">
          <p>
            <span>{{ $t('message.nbPointsToWin', { nb: quest.availablePoints }) }}</span>
            &nbsp;
            <span v-if="quest.mainLanguage"><img class="image-and-text-aligned" :src="'/statics/icons/game/flag-' + quest.mainLanguage + '.png'" /></span>
          </p>
          <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">{{ $t('message.SolveThisQuest') }}</q-btn></p>
        </div>
      </div>
      <div class="padding-medium">
        <p v-if="quest.level">{{ $t('message.Difficulty') }}: <img class="image-and-text-aligned" src="/statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 1 ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 3 ? 'red' : 'grey') + '.png'" /></p>
        <p v-if="quest.duration">{{ $t('message.Duration') }}: {{ quest.duration }} {{ $t('message.minutes') }}</p>
        <p v-if="quest.startingPlace">{{ $t('message.StartingPoint') }}: {{ quest.startingPlace }}</p>
        <p style="margin-bottom: 40px" v-html="quest.description"></p>
      </div>
    </div>
    <div class="row" v-if="!geolocationIsSupported">
      <div class="col-12 text-center">
        <h5>{{ $t('message.PleaseActivateGeolocation') }}</h5>
        <p><a @click="">{{ $t('message.KnowHowToActivateGeolocation') }}</a></p>
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
      geolocationIsSupported: navigator.geolocation
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
</style>
