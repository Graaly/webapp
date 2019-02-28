<template>
  <div>
    
    <div class="centered bg-warning q-pa-sm" v-if="warnings.stepDataMissing" @click="initData()">
      <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
    </div>
    <stepPlay :step="step" :runId="run._id" :itemUsed="selectedItem" :reload="loadStepData" :lang="lang" @played="trackStepPlayed" @success="trackStepSuccess" @fail="trackStepFail" @pass="trackStepPass"></stepPlay>
      
    <!------------------ INVENTORY PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div>
        <div class="inventory panel-bottom q-pa-md" v-show="inventory.isOpened">
          <h1>{{ $t('label.Inventory') }}</h1>
          <div class="centered bg-warning q-pa-sm" v-if="warnings.inventoryMissing" @click="fillInventory()">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <p v-if="inventory.items.length > 0 && !warnings.inventoryMissing">{{ $t('label.InventoryUsage') }}</p>
          <p v-if="inventory.items.length === 0">{{ $t('label.noItemInInventory') }}</p>
          <div class="inventory-items">
            <div v-for="(item, key) in inventory.items" :key="key" @click="selectItem(item)">
              <img :src="(item.picture.indexOf('statics/') > -1 ? item.picture : serverUrl + '/upload/quest/' + quest.id + '/step/new-item/' + item.picture)" />
              <p>{{ item.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!------------------ INFO PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div v-show="info.isOpened">
        <div class="centered bg-warning q-pa-sm" v-if="warnings.questDataMissing" @click="getQuest(quest.id)">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
        <div v-if="!warnings.questDataMissing" class="panel-bottom no-padding" :style="'background: url(' + ((info.quest.picture && info.quest.picture[0] === '_') ? 'statics/images/quest/' + info.quest.picture : serverUrl + '/upload/quest/' + info.quest.picture) + ' ) center center / cover no-repeat '">
          <div class="text-center bottom-dark-banner q-pb-xl">
            <p class="title">{{ (info.quest && info.quest.title) ? info.quest.title[lang] : $t('label.NoTitle') }}</p>
            <!--<q-progress :percentage="this.step.number * 100 / info.stepsNumber" stripe animate height="30px" color="primary"></q-progress>-->
            <p class="q-pa-md score-text" v-show="info">{{ $t('label.CurrentScore') }}: {{ info.score }} <!--<q-icon color="white" name="fas fa-trophy" />--></p>
            <p>
              <q-btn color="primary" @click="backToMap">{{ $t('label.LeaveQuest') }}</q-btn>
            </p>
            <p class="q-pb-xl">
              <q-btn color="secondary" @click="openInfo">{{ $t('label.BackToQuest') }}</q-btn>
            </p>
            <p class="q-pb-lg">
            </p>
          </div>
        </div>
      </div>
    </transition>
    
    <!--====================== HINT =================================-->
    
    <div class="fixed-bottom over-map" v-if="hint.isOpened">
      <story step="hint" :data="{hint: hint.label[lang]}" @next="askForHint()"></story>
    </div>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
      
    <!------------------ FOOTER AREA ------------------------>
    
    <div v-show="footer.show" class="step-menu fixed-bottom">
      <!--<q-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-progress>-->
      <div class="row">
        <div class="col centered q-pb-md">
          <q-btn round size="lg" color="primary" icon="menu" :class="{'bg-secondary': info.isOpened}" @click="openInfo()" />
        </div>
        <div class="col centered q-pb-md">
          <q-btn round size="lg" color="primary" icon="work" :class="{'bg-secondary': inventory.isOpened}" @click="openInventory()" v-show="inventory.show" />
        </div>
        <div class="col centered q-pb-md">
          <q-btn round size="lg" color="primary" icon="lightbulb outline" :class="{'flashing': hint.suggest, 'bg-secondary': hint.isOpened}" @click="askForHint()" v-show="hint.show" />
        </div>
        <div class="col centered q-pb-md">
          <q-btn round size="lg" color="primary" icon="arrow_back" v-show="previousStepId !== ''" @click="previousStep()" />
        </div>
        <div class="col centered q-pb-md">
          <q-btn round size="lg" color="primary" icon="arrow_forward" :class="{'flashing': canMoveNextStep}" v-show="canMoveNextStep || canPass" @click="nextStep()" />
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
//import simi from 'src/includes/simi' // for image similarity
import RunService from 'services/RunService'
import StepService from 'services/StepService'
import QuestService from 'services/QuestService'
//import colorsForCode from 'data/colorsForCode.json'
//import questItems from 'data/questItems.json'
import stepPlay from 'components/quest/game/stepPlay'
import Notification from 'plugins/NotifyHelper'
import story from 'components/story'
import utils from 'src/includes/utils'

import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})

export default {
  components: {
    stepPlay,
    story
  },
  data () {
    return this.initialState()
  },
  mounted () {
    utils.clearAllRunningProcesses()
    this.initData()
  },
  methods: {
    initialState () {
      return {
        footer: {
          show: true,
          tabSelected: 'none'
        },
        inventory: {
          isOpened: false,
          items: [],
          show: true
        },
        hint: {
          isOpened: false,
          label: "",
          suggest: false,
          show: false
        },
        info: {
          isOpened: false,
          score: 0,
          quest: {}
        },
        quest: {
          id: this.$route.params.questId
        },
        step: {},
        story: {
          step: null,
          data: null
        },
        loadStepData: false,
        run: {},
        isRunFinished: false,
        canMoveNextStep: false,
        canPass: false,
        remotePlay: false,
        //cameraStreamEnabled: false,
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        controlsAreDisplayed: false,
        lang: this.$route.params.lang,
        warnings: {
          inventoryMissing: false,
          questDataMissing: false,
          stepDataMissing: false
        },
        previousStepId: '',
        
        // for step type 'use-item'
        selectedItem: null
      }
    },
    resetData () {
      const defaultVars = this.initialState()
      this.inventory = defaultVars.inventory
      this.hint = defaultVars.hint
      this.step = defaultVars.step
      this.canMoveNextStep = defaultVars.canMoveNextStep
      this.canPass = defaultVars.canPass
      this.nbTry = defaultVars.nbTry
      this.warnings = defaultVars.warnings
      this.selectedItem = defaultVars.selectItem
      this.loadStepData = defaultVars.loadStepData
    },
    /*
     * Init step data
     */
    async initData () {
      this.loadStepData = false
      // get current run or create it
      await this.getRun()
   
      // get current step
      await this.getStep()

      // get quest information
      await this.getQuest(this.quest.id)
      
      // get quest number to compute progression
      //await this.countStepsNumber(this.quest.id)

      // display hint
      if (this.isHintAvailable()) {
        utils.setTimeout(this.alertOnHint, 12000)
        this.hint.show = true
      }
      
      // check if story needs to start
      await this.startStory()
      
      // load component data
      this.loadStepData = true
    },
    /*
     * Get the current run or create it
     */
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest.id)
      var currentChapter = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress') {
            this.run = runs.data[i]
            currentChapter = runs.data[i].currentChapter
          }
        }
      }
      
      if (currentChapter === 0) {
        var remotePlay = this.$route.query.hasOwnProperty('remoteplay') ? this.$route.query.remoteplay : false
        // no 'in-progress' run => create run for current player & current quest
        let res = await RunService.init(this.quest.id, this.$route.params.lang, remotePlay)
        if (res.status === 200 && res.data && res.data._id) {
          this.run = res.data
        } else {
          this.$q.dialog({
            title: this.$t('label.TechnicalProblem'),
            message: this.$t('label.TechnicalProblemNetworkIssue')
          }).then(() => {
            this.$router.push('/quest/play/' + this.quest.id)
          })
        }
        // set current score
        this.info.score = 0
      } else {
        // get current score
        this.info.score = this.run.tempScore
      }
    },
    /*
     * Get the step data
     */
    async getStep () {
      this.warnings.stepDataMissing = false   
      // if no stepId given, load the next one
      var stepId

      if (this.$route.params.stepId && this.$route.params.stepId !== '0' && this.$route.params.stepId.indexOf('success_') === -1 && this.$route.params.stepId.indexOf('pass_') === -1) {
        stepId = this.$route.params.stepId
      } else {
        const response = await RunService.getNextStep(this.run._id)
        if (response && response.data) {
          // check if a step is triggered
          if (response.data.next) {
            // if quest is finished
            if (response.data.next === 'end') {
              // if user is owner of the quest, redirect to toolbox
              if (this.$store.state.user.isAdmin) {
                return this.$router.push('/admin/validate/' + this.quest.id)
              } else if (this.$store.state.user._id === this.info.quest.authorUserId) {
                return this.$router.push('/quest/settings/' + this.quest.id)
              } else {
                return this.$router.push('/quest/' + this.quest.id + '/end')
              }
            } else {
              stepId = response.data.next
            }
          } else {
            // if no step is triggered, display the markers sensor
            this.step = {
              id: "sensor"
            }
            return false
          }
        } else {
          this.warnings.stepDataMissing = true
          return false
        }
      }

      const response2 = await StepService.getById(stepId)
      if (response2 && response2.data) {
        this.step = response2.data
        this.step.id = this.step._id
        // get previous button redirect
        this.getPreviousStep()
      } else {
        this.warnings.stepDataMissing = true
        return false
      }
    },
    /*
     * Get the previous step ID
     */
    getPreviousStep () {
      if (this.step.conditions && this.step.conditions.length > 0) {
        for (var i = 0; i < this.step.conditions.length; i++) {
          if (this.step.conditions[i].indexOf('stepDone') !== -1) {
            var stepId = this.step.conditions[i].replace('stepDone_', '')
            this.previousStepId = stepId
            
            return stepId
          }
        }
      }
    },
    /*
     * Track step success
     */
    async trackStepSuccess (score) {
      // add step score to general score
      this.info.score += score
      // hide hint
      this.hideHint()
    },
    /*
     * Track step played
     */
    async trackStepPlayed (returnData) {
      if (this.step.id === 'sensor') {
        await this.getMarkerStep(returnData)
      } else {
        this.canMoveNextStep = true
        this.hint.suggest = false
        this.hint.show = false
        this.inventory.show = false
        this.footer.tabSelected = 'next'
      }
    },
    /*
     * Track step passing
     */
    async trackStepPass () {
      // Not possible to pass for the mini games
      //if (this.info.quest.type === 'quest') {
      this.canPass = true
      //}
    },
    /*
     * Track step fail
     */
    async trackStepFail () {
      this.hideHint()
    },
    /*
     * Track step fail
     */
    async getMarkerStep (answer) {
      var response = await RunService.getMarkerNextStep(this.run._id, answer)
      if (response && response.data) {
        // check if a step is triggered
        if (response.data.next) {
          // if quest is finished
          if (response.data.next === 'end') {
            // if user is owner of the quest, redirect to toolbox
            if (this.$store.state.user.isAdmin) {
              return this.$router.push('/admin/validate/' + this.quest.id)
            } else if (this.$store.state.user._id === this.info.quest.authorUserId) {
              return this.$router.push('/quest/settings/' + this.quest.id)
            } else {
              return this.$router.push('/quest/' + this.quest.id + '/end')
            }
          } else {
            this.$router.push('/quest/play/' + this.quest.id + '/step/' + response.data.next + '/' + this.$route.params.lang)
            //this.stopMarkersSensors()
          }
        } else {
          Notification(this.$t('label.NothingOccurs'), 'info')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    hideHint() {
      this.step.hint = {}
    },
    /*
     * Move to next step
     */
    async nextStep() {
      // reload step to remove notifications
      this.loadStepData = false
      
      if (this.canMoveNextStep) {
        /*utils.clearAllRunningProcesses()
        this.resetData()
        await this.initData()
        */
        this.$router.push('/quest/play/' + this.quest.id + '/step/success_' + this.step.id + '/' + this.$route.params.lang)
      } else if (this.canPass) {
        this.$q.dialog({
          message: this.$t('label.ConfirmPass'),
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).then(async () => {
          await RunService.passStep(this.run._id, this.step.id)
          // TODO: manage if pass failed
          this.$router.push('/quest/play/' + this.quest.id + '/step/pass_' + this.step.id + '/' + this.$route.params.lang)
        }).catch(() => {})
      }
    },
    /*
     * Return to previous step
     */
    async previousStep() {
      if (this.previousStepId !== '') {
        this.$router.push('/quest/play/' + this.quest.id + '/step/' + this.previousStepId + '/' + this.$route.params.lang)
      }
    },
    /*
     * Ask for a hint
     */
    async askForHint() {
      if (!this.isHintAvailable()) {
        return
      }
      // stop suggesting hint if opened
      this.hint.suggest = false
      if (this.hint.isOpened) {
        this.closeAllPanels()
      } else {
        // display confirmation box only if no infinite hints bonus
        if (this.$store.state.user.bonus && this.$store.state.user.bonus.name && this.$store.state.user.bonus.name === 'infinitehint') {
          await this.getHint()
        } else {
          this.$q.dialog({
            message: this.$t('label.ConfirmHint'),
            ok: this.$t('label.Ok'),
            cancel: this.$t('label.Cancel')
          }).then(async () => {
            await this.getHint()
          })
        }
      }
    },
    /*
     * Get the hint and display
     */
    async getHint() {
      let hintLabel = await RunService.getHint(this.run._id, this.step._id)

      if (hintLabel && hintLabel.hint) {
        this.hint.label = hintLabel.hint
        this.closeAllPanels()
        this.hint.isOpened = true
        this.footer.tabSelected = 'hint'
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    closeAllPanels() {
      this.inventory.isOpened = false
      this.info.isOpened = false
      this.hint.isOpened = false
      this.footer.tabSelected = 'none'
    },
    /*
     * Fill the inventory with objects won by the user
     */
    async fillInventory() {
      this.warnings.inventoryMissing = false
      // load items won on previous steps
      this.$q.loading.show()
      var response = await RunService.listWonObjects(this.quest.id, this.run._id)
      if (response && response.data) {
        this.inventory.items = response.data
      } else {
        this.warnings.inventoryMissing = true
      }
      
      this.$q.loading.hide()
    },
    /*
     * Open the inventory
     */
    async openInventory() {
      // check if the items are already loaded
      if (this.inventory.items.length === 0) {
        await this.fillInventory()
      }
      if (this.inventory.isOpened) {
        this.closeAllPanels()
      } else {
        this.closeAllPanels()
        this.inventory.isOpened = true
        this.footer.tabSelected = 'inventory'
      }
    },
    /*
     * Open the info box
     */
    async openInfo() {
      if (this.info.isOpened) {
        this.closeAllPanels()
      } else {
        this.closeAllPanels()
        this.info.isOpened = true
        this.footer.tabSelected = 'info'
      }
    },
    /*
     * Back to the map
     */
    async backToMap() {
      return this.$router.push('/map')
    },
    /*
     * Start the story step
     */
    async startStory() {
      if (this.info.quest.type === 'discovery') {
        if (this.step.number === 1) {
          this.story.step = 4
        }
        if (this.step.number === 2) {
          this.story.step = 5
        }
        /*if (this.step.number === 3) {
          this.story.step = 6
        }*/
        if (this.step.number === 5) {
          this.story.step = 7
        }
        if (this.step.number === 7) {
          this.story.step = 8
        }
      }
    },
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    async getQuest(id) {
      this.warnings.questDataMissing = false
      let response = await QuestService.getById(id)
      if (response && response.data) {
        this.info.quest = response.data
      } else {
        this.warnings.questDataMissing = true
      }
    },
    /*
     * count number of steps in a quest
     * @param   {string}    id             Quest ID
     */
    async countStepsNumber(id) {
      let response = await StepService.countForAQuest(id)
      this.info.stepsNumber = (response && response.data && response.data.count) ? response.data.count : 1
    },
    /*
     * Select an item in the inventory
     * @param   {object}    item            Item selected
     */
    selectItem(item) {
      if (this.step.type !== 'use-item') {
        Notification(this.$t('label.YouCanNotUseAnItemInThisStep'), 'warning')
        return
      }
      this.selectedItem = item
      this.closeAllPanels()
    },
    isHintAvailable() {
      if (this.step && this.step.hint && this.step.hint[this.lang] && this.step.hint[this.lang] !== '') {
        return true
      } else {
        return false
      }
    },
    alertOnHint() {
      this.hint.suggest = true
    }
  }
}
</script>

<style scoped>

  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > #play-view { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; }
  #main-view > #play-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  
  #controls {
    display: none
  }
      
  .q-btn, audio, .video video { box-shadow: 0px 0.1rem 0.4rem 0.2rem rgba(20, 20, 20, 0.6); }
  
  .q-btn { margin-top: 1rem; }
  
  /* right/wrong styles */
  
  .right, .q-btn.right { color: #0a0; background-color: #cfc; box-shadow: 0px 0px 0.3rem 0.3rem #9f9; }
  .wrong, .q-btn.wrong { color: #c22; background-color: #fcc; box-shadow: 0px 0px 0.3rem 0.3rem #f99; }
  .images-block > div.right,
  .images-block > div.wrong {
    box-shadow: none; background-color: transparent;
  }
  .images-block > div .q-btn {
    margin: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    visibility: hidden;
  }
  .images-block > div .q-btn.right,
  .images-block > div .q-btn.wrong {
    visibility: visible;
  }
  
  .actions > div { display: flex; flex-flow: row nowrap; }
  .actions > div > .q-btn { flex-grow: 1; }
  .actions > div > .q-btn:not(:first-child) { flex-grow: 1; margin-left: 1rem; }
  
</style>
