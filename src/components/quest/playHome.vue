<template>
  
  <div class="wrapper">
    <div class="warning" v-if="this.isRunFinished">
      <strong>{{ $t('message.YouAlreadyDidThisQuest') }}.</strong><br />
      {{ $t('message.YouCanResolveItAgain') }}.
    </div>
    
    <div v-if="geolocationIsSupported">
      <div class="row bottom-separator">
        <div class="col-3 padding-medium" v-if="typeof quest.picture !== 'undefined' && quest.picture !== null">
          <img :src="serverUrl + '/upload/quest/' + quest.picture" class="full-width" />
        </div>
      
        <div class="col desc padding-medium">
          <h1>{{ quest.title }}</h1>
          <p class="text-tertiary" v-if="typeof quest.author !== 'undefined'">{{ $t('message.Author') }} : {{ quest.author.name }}</p>
          <p v-if="quest.rating">
            <q-rating readonly :value="quest.rating.rounded" color="primary" :max="5" size="1.7rem" />
          </p>
          <p>{{ $t('message.nbPointsToWin', { nb: quest.availablePoints }) }}</p>
          <p v-if="quest.mainLanguage">{{ $t('message.Language') }}: <img class="image-and-text-aligned" :src="'/statics/icons/game/flag-' + quest.mainLanguage + '.png'" /></p>
          <p v-if="quest.level">{{ $t('message.Difficulty') }}: <img class="image-and-text-aligned" src="/statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 1 ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 3 ? 'red' : 'grey') + '.png'" /></p>
          <p v-if="quest.duration">{{ $t('message.Duration') }}: {{ quest.duration }} {{ $t('message.minutes') }}</p>
          <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">{{ $t('message.SolveThisQuest') }}</q-btn></p>
        </div>
      </div>
      <div class="padding-medium">
        <p v-html="quest.description"></p>
        <p v-if="quest.startingPlace">{{ $t('message.StartingPoint') }}: {{ quest.startingPlace }}</p>
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
import { QRating, Toast } from 'quasar'
import utils from 'src/includes/utils'

export default {
  components: {
    QRating
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
      // try to load 'in-progress' run for current quest & current user Id
      let run = await RunService.getOne({ userId: this.$store.state.user._id, questId: this.quest._id, status: 'in-progress' })
      
      if (typeof run === 'undefined') {
       
      } else {
        // an 'in-progress' run already exists for current player & current quest => jump to current run's step
        // TODO : add run.currentStepAnswerChecked (boolean) to check if step anwser has been already checked
        // otherwise a malicious player can use this feature to cumulate points on same step by quitting/rejoining a quest
        this.$store.dispatch('setCurrentRun', run)
        Toast.create("Vous avez déjà commencé cette enquête. Vous êtes redirigé là où vous en étiez.")
        return this.$router.push('/quest/play/' + this.quest._id + '/step/' + run.currentStep)
      }
      
      // check if a run has been already finished for this quest
      run = await RunService.getOne({ userId: this.$store.state.user._id, questId: this.quest._id, status: 'finished' })
      
      this.isRunFinished = (typeof run !== 'undefined')
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
