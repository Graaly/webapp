<template>
  <div class="play">
    
    <div class="centered bg-warning q-pa-sm" v-if="warnings.stepDataMissing" @click="initData()">
      <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
    </div>
    <stepPlay :step="step" :runId="run._id" :itemUsed="selectedItem" :reload="loadStepData" :lang="lang" @played="trackStepPlayed" @success="trackStepSuccess" @fail="trackStepFail" @pass="trackStepPass"></stepPlay>
      
    <!------------------ INVENTORY PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
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
    
    <q-layout-footer v-model="footer.show" class="step-menu">
      <q-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-progress>
      <q-tabs v-model="footer.tabSelected">
        <q-tab slot="title" name="info" icon="menu" @click="openInfo()" />
        <q-tab slot="title" name="inventory" icon="work" @click="openInventory()" :disable="!inventory.show" />
        <q-tab slot="title" :class="{'flashing': hint.suggest}" name="hint" icon="lightbulb outline" :disable="!hint.show" @click="askForHint()"/>
        <q-tab slot="title" name="previous" icon="arrow_back" @click="previousStep()" />
        <q-tab slot="title" :class="{'flashing': canMoveNextStep}" name="next" icon="arrow_forward" :disable="!canMoveNextStep && !canPass" @click="nextStep()" />
      </q-tabs>
    </q-layout-footer>
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
      step: {
        nextNumber: 2
      },
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
      
      // for step type 'use-item'
      selectedItem: null
    }
  },
  mounted () {
    utils.clearAllRunningProcesses()
    this.initData()
  },
  methods: {
    /*
     * Init step data
     */
    async initData () {
      // TODO: to avoid cheating for questions with text/image answers, do not load the 'right answer' info on front app, instead make a server call to check it, when player has already selected his answer and clicked on "check answer"
      var step = await this.getStep()
      // redirect to latest step run if user can not access this step
      if (step.redirect) {
        return this.$router.push('/quest/play/' + this.quest.id + '/step/' + step.redirect + '/' + this.$route.params.lang)
      }
      
      // get quest information
      await this.getQuest(this.quest.id)
      // get quest number to compute progression
      await this.countStepsNumber(this.quest.id)
      
      // no more available step => we reached end of quest
      if (typeof step === 'undefined' || step === 'OK') {
        // if user is owner of the quest, redirect to toolbox
        if (this.$store.state.user.isAdmin) {
          return this.$router.push('/admin/validate/' + this.quest.id)
        } else if (this.$store.state.user._id === this.info.quest.authorUserId) {
          return this.$router.push('/quest/settings/' + this.quest.id)
        } else {
          return this.$router.push('/quest/' + this.quest.id + '/end')
        }
      }
      
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest.id)
      var maxStepComplete = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep > maxStepComplete) {
            this.run = runs.data[i]
            maxStepComplete = runs.data[i].currentStep
          }
        }
      }
      // get current score
      this.info.score = this.run.tempScore
      
      if (maxStepComplete === 0) {
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
      }
            
      this.step = step
      this.step.id = step._id
      
      // display hint
      if (this.isHintAvailable()) {
        this.hint.show = true
      }
      
      // TODO : manage non continuous path quests
      this.step.nextNumber = this.step.number + 1
      
      // check if story needs to start
      await this.startStory()
      
      // load component data
      this.loadStepData = true
    },
    /*
     * Get the step data
     */
    async getStep () {
      this.warnings.stepDataMissing = false
      const response = await StepService.getByNumber(this.quest.id, this.$route.params.stepNumber)
      if (response && response.data) {
        return response.data
      } else {
        this.warnings.stepDataMissing = true
        return false
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
    async trackStepPlayed () {
      this.canMoveNextStep = true
      this.hint.suggest = false
      this.hint.show = false
      this.inventory.show = false
      this.footer.tabSelected = 'next'
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
        if (this.step.nextNumber === "no next step") {
          this.$router.push('/quest/' + this.quest.id + '/end')
        } else {
          this.$router.push('/quest/play/' + this.quest.id + '/step/' + this.step.nextNumber + '/' + this.$route.params.lang);
        }
      } else if (this.canPass) {
        this.$q.dialog({
          message: this.$t('label.ConfirmPass'),
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).then(async () => {
          await RunService.passCurrentStep(this.run._id)
          // TODO: manage if pass failed
          this.$router.push('/quest/play/' + this.quest.id + '/step/' + this.step.nextNumber + '/' + this.$route.params.lang);
        }).catch(() => {})
      }
    },
    /*
     * Return to previous step
     */
    async previousStep() {
      if (this.step.number && this.step.number > 1) {
        this.$router.push('/quest/play/' + this.quest.id + '/step/' + (this.step.number - 1) + '/' + this.$route.params.lang)
      } else {
        this.$router.push('/quest/play/' + this.quest.id)
      }
    },
    /*
     * Ask for a hint
     */
    async askForHint() {
      if (!this.isHintAvailable()) {
        return
      }
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
      var response = await StepService.listWonObjects(this.quest.id, this.step._id)
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
      this.info.stepsNumber = response || 1
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
        utils.setTimeout(this.alertOnHint, 12000)
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
  
  #main-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; /*padding-bottom: 8rem;*/ }
  #main-view > div > div { height: inherit; min-height: inherit; /*padding: 1rem;*/ display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  
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
  
  .inventory-btn { position: fixed; bottom: 0.7rem; left: 0.7rem; z-index: 1; }
  .inventory-btn img { width: 100%; height: 100%; border-radius: 50%; }
  
</style>
