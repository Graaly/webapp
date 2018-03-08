<template>
  
  <div class="wrapper">
    <div class="warning" v-if="this.isRunFinished">
      <strong>{{ $t('message.YouAlreadyDidThisQuest') }}.</strong><br />
      {{ $t('message.YouCanResolveItAgain') }}.
    </div>
    
    <div class="row bottom-separator">
      <div class="col-3 padding-medium" v-if="typeof quest.picture !== 'undefined' && quest.picture !== null">
        <img :src="serverUrl + '/upload/quest/' + quest.picture" class="full-width" />
      </div>
      
      <div class="col desc padding-medium">
        <h1>{{ quest.title }}</h1>
        <p class="text-tertiary" v-if="typeof quest.author !== 'undefined'">{{ $t('message.Author') }} : {{ quest.author.name }}</p>
        <p v-if="quest.rating">
          <q-rating readonly :value="Math.round(quest.rating)" color="primary" :max="5" size="1.7rem" />
        </p>
        <p>{{ $t('message.nbPointsToWin', { nb: quest.availablePoints }) }}</p>
        <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">{{ $t('message.SolveThisQuest') }}</q-btn></p>
      </div>
    </div>
    <div class="padding-medium">
      <p>{{ quest.description }}</p>
      <p>{{ $t('message.Language') }}: {{ quest.mainLanguage }}</p>
      <p v-if="quest.startingPlace">{{ $t('message.StartingPoint') }}: {{ quest.startingPlace }}</p>
      <p>{{ $t('message.Difficulty') }}: {{ getQuestLevelName(quest.level) }}</p>
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
      isRunFinished: false
    }
  },
  async mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('message.SolveAQuest'))
    
    await this.getQuest(this.$route.params.id)
    
    await this.getRun()
  },
  methods: {
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.quest = response.data
      if (typeof this.quest.authorUserId !== 'undefined') {
        response = await AuthService.getAccount(this.quest.authorUserId)
        this.$set(this.quest, 'author', response.data)
      }
    },
    async getRun() {
      // load run for current quest & current user Id
      let run = await RunService.getOne({ userId: this.$store.state.user._id, questId: this.quest._id })
      
      if (typeof run === 'undefined') {
        // first run for current player & current quest
        let res = await RunService.save({
          userId: this.$store.state.user._id,
          questId: this.quest._id,
          status: 'in-progress',
          currentStep: 1,
          score: 0,
          dateCreated: new Date(),
          dateUpdated: null,
          questData: {
            picture: this.quest.picture,
            title: this.quest.title, 
            zipCode: "",
            town: ""
          }
        })
        
        if (res.status === 201) {
          this.$store.dispatch('setCurrentRun', res.data)
        }
      } else if (run.status === 'in-progress') {
        // an 'in-progress' run already exists for current player & current quest => jump to current run's step
        // TODO : add run.currentStepAnswerChecked (boolean) to check if step anwser has been already checked
        // otherwise a malicious player can use this feature to cumulate points on same step by quitting/rejoining a quest
        this.$store.dispatch('setCurrentRun', run)
        Toast.create("Vous avez déjà commencé cette enquête. Vous êtes redirigé là où vous en étiez.")
        return this.$router.push('/quest/play/' + this.quest._id + '/step/' + run.currentStep)
      } else {
        // run is already finished
        this.isRunFinished = true
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
