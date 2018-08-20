<template>
  <div v-touch-swipe.horizontal="swipeMgmt" class="play">
    
    <stepPlay :step="step" :runId="run._id" :itemUsed="selectedItem" :reload="loadStepData" @played="trackStepPlayed" @success="trackStepSuccess" @fail="trackStepFail" @pass="trackStepPass"></stepPlay>
      
    <!------------------ INVENTORY PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="inventory panel-bottom q-pa-md" v-show="inventory.isOpened">
        <h1>{{ $t('label.Inventory') }}</h1>
        <p v-if="inventory.items.length > 0">{{ $t('label.InventoryUsage') }}</p>
        <p v-if="inventory.items.length === 0">{{ $t('label.noItemInInventory') }}</p>
        <div class="inventory-items">
          <div v-for="(item, key) in inventory.items" :key="key" @click="selectItem(item)">
            <img :src="serverUrl + '/upload/quest/' + quest.id + '/step/new-item/' + item.picture" />
            <p>{{ item.title}}</p>
          </div>
        </div>
      </div>
    </transition>
    
    <!------------------ INFO PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div v-show="info.isOpened">
        <div class="panel-bottom no-padding" :style="'background: url(' + serverUrl + '/upload/quest/' + info.quest.picture + ' ) center center / cover no-repeat '">
          <div class="text-center bottom-dark-banner q-pb-xl">
            <p class="title">{{ (info.quest && info.quest.title) ? info.quest.title[lang] : $t('label.NoTitle') }}</p>
            <q-progress :percentage="this.step.number * 100 / info.stepsNumber" stripe animate height="30px" color="primary"></q-progress>
            <p class="q-pa-md score-text">{{ info.score }} <q-icon color="white" name="fas fa-trophy" /></p>
            <q-btn class="q-mb-xl" color="primary" @click="backToMap">{{ $t('label.LeaveQuest') }}</q-btn>
          </div>
        </div>
      </div>
    </transition>
    
    <!------------------ HINT PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="hint panel-bottom q-pa-md" v-show="hint.isOpened">
        <h1>{{ $t('label.Hint') }}</h1>
        <p v-if="hint.label === ''">{{ $t('label.NoHintForThisStep') }}</p>
        <p v-if="hint.label !== ''">{{ hint.label }}</p>
        <q-btn class="q-mb-xl" color="primary" @click="askForHint()">{{ $t('label.Close') }}</q-btn>
      </div>
    </transition>
      
    <!------------------ FOOTER AREA ------------------------>
    
    <q-layout-footer v-model="footer.show" class="step-menu">
      <q-tabs v-model="footer.tabSelected">
        <q-tab slot="title" name="inventory" icon="work" @click="openInventory()" />
        <q-tab slot="title" name="previous" icon="arrow_back" @click="previousStep()" />
        <q-tab slot="title" name="info" icon="info" @click="openInfo()" />
        <q-tab slot="title" name="next" icon="arrow_forward" :disable="!canMoveNextStep && !canPass" @click="nextStep()" />
        <q-tab slot="title" name="hint" icon="lightbulb outline" :disable="!isHintAvailable()" @click="askForHint()"/>
      </q-tabs>
    </q-layout-footer>
  </div>
  
</template>

<script>
//import simi from 'src/includes/simi' // for image similarity
//import utils from 'src/includes/utils'
import RunService from 'services/RunService'
import StepService from 'services/StepService'
import QuestService from 'services/QuestService'
//import colorsForCode from 'data/colorsForCode.json'
//import questItems from 'data/questItems.json'
import stepPlay from 'components/quest/game/stepPlay'
import Notification from 'plugins/NotifyHelper'

import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})

export default {
  components: {
    stepPlay
  },
  data () {
    return {
      footer: {
        show: true,
        tabSelected: 'none'
      },
      inventory: {
        isOpened: false,
        items: []
      },
      hint: {
        isOpened: false,
        label: ""
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
      lang: this.$route.params.lang,
      loadStepData: false,
      run: {},
      isRunFinished: false,
      canMoveNextStep: false,
      canPass: false,
      //cameraStreamEnabled: false,
      serverUrl: process.env.SERVER_URL,
      nbTry: 0,
      controlsAreDisplayed: false,
      
      // for step 'choose'
      answerType: 'text', // 'text' or 'image'
      
      // for steps type 'code-keypad' & 'code-color'
      playerCode: [],
      keypad: [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["*", "0", "#"]
      ],
      
      // for step type 'image-recognition'
      photoComparisonThreshold: 70,
      photoTaken: false,
      
      // for step type 'geoloc'
      geolocation: {
        distance: null,
        direction: null,
        // location
        locationWatcher: null,
        watchLocationInterval: 2000, // ms
        // direction
        currentBearing: null, // current direction compared to north
        rawDirection: null,
        alpha: null
      },
      
      // for step type 'write-text'
      writetext: {
        playerAnswer: null
      },
      
      // for step type 'jigsaw puzzle'
      puzzle: {
        pieces: [],
        picture: '/statics/icons/game/medal.png',
        dragSrcEl: null
      },
      
      // for step type 'use-item'
      selectedItem: null,
      
      // for step type 'find-item'
      itemAdded: null
    }
  },
  mounted () {
    // TODO: to avoid cheating for questions with text/image answers, do not load the 'right answer' info on front app, instead make a server call to check it, when player has already selected his answer and clicked on "check answer"
    this.getStep().then(async (step) => {
      // redirect to latest step run if user can not access this step
      if (step.redirect) {
        return this.$router.push('/quest/play/' + this.quest.id + '/step/' + step.redirect)
      }
    
      // no more available step => we reached end of quest
      if (typeof step === 'undefined' || step === 'OK') {
        // if user is owner of the quest, redirect to toolbox
        await this.getQuest(this.quest.id)
        if (this.$store.state.user._id === this.info.quest.authorUserId) {
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
        // no 'in-progress' run => create run for current player & current quest
        let res = await RunService.init(this.quest.id, this.$route.params.lang)
        if (res.status === 200 && res.data && res.data._id) {
          this.run = res.data
        }
      }
            
      this.step = step
      this.step.id = step._id
      
      // TODO : manage non continuous path quests
      this.step.nextNumber = this.step.number + 1
      
      // load component data
      this.loadStepData = true
    }).catch((err) => {
      Notification(this.$t('label.ErrorStandardMessage'), 'error')
      console.log(err)
    })
  },
  methods: {
    /*
     * Get the step data
     */
    async getStep () {
      return StepService.getByNumber(this.quest.id, this.$route.params.stepNumber, this.$route.params.lang)
    },
    /*
     * Track step success
     */
    async trackStepSuccess (score) {
      // add step score to general score
      this.info.score += score
    },
    /*
     * Track step played
     */
    async trackStepPlayed () {
      this.canMoveNextStep = true
      this.footer.tabSelected = 'next'
    },
    /*
     * Track step passing
     */
    async trackStepPass () {
      this.canPass = true
    },
    /*
     * Track step fail
     */
    async trackStepFail () {
      console.log("fail")
    },
    /*
     * Launch a quest with default language
     * @param   {Object}    obj         Swipe object
     */
    swipeMgmt(obj) {
      if (obj.direction === 'right') {
        this.previousStep()
      }
      if (obj.direction === 'left') {
        if (this.canMoveNextStep) {
          this.nextStep()
        }
      }
    },
    /*
     * Move to next step
     */
    async nextStep() {
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
          this.$router.push('/quest/play/' + this.quest.id + '/step/' + this.step.nextNumber + '/' + this.$route.params.lang);
        })
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
        this.$q.dialog({
          message: this.$t('label.ConfirmHint'),
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).then(async () => {
          let hintLabel = await RunService.getHint(this.run._id, this.step._id)

          if (hintLabel && hintLabel.hint) {
            this.hint.label = hintLabel.hint
            this.closeAllPanels()
            this.hint.isOpened = true
            this.footer.tabSelected = 'hint'
          }
        })
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
      // load items won on previous steps
      this.inventory.items = await StepService.listWonObjects(this.quest.id, this.step._id, this.$route.params.lang)
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
        await this.getQuest(this.quest.id)
        await this.countStepsNumber(this.quest.id, this.lang)
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
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.info.quest = response.data
    },
    /*
     * count number of steps in a quest
     * @param   {string}    id             Quest ID
     * @param   {string}    lang           Language f the quest
     */
    async countStepsNumber(id, lang) {
      let response = await StepService.countForAQuest(id, lang)
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
      return (this.step && this.step.hint && this.step.hint !== '')
    }
  }
}
</script>

<style scoped>
  
  .inventory-items div { float: left; margin-right: 15px; width: 100px; height: 175px; overflow: hidden; text-align: center;}
  .inventory-items div img { width: 100px; height: 100px; }

  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  #main-view > div > div { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  
  #main-view div.info,
  #main-view div.new-item,
  #main-view div.geolocation {
    padding-bottom: 1rem;
  }
  #main-view div.find-item,
  #main-view div.use-item {
    padding-bottom: 3rem;
  }
  
  .step-menu .q-tabs-normal .q-tab-icon, .step-menu .q-tabs-normal .q-tab-label {
    opacity: 0.9 !important;
  }
  .step-menu .disabled, .step-menu [disabled] {
    opacity: 0 !important;
  }
  .step-menu {
    position: fixed !important;
  }
 
  .text,
  .answers-text .q-btn {
    opacity: 0.9;
    background-color: #fff;
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin: 0;
    box-shadow: 0px 0px 0.1rem 0.1rem #fff;
  }
  .text { white-space: pre-wrap; }
  
  #controls {
    display: none
  }
  
  .play .buttons-bottom {
    position: fixed;
    bottom: 50px;
  }
    
  .q-btn, audio, .video video { box-shadow: 0px 0.1rem 0.4rem 0.2rem rgba(20, 20, 20, 0.6); }
  
  .q-btn { margin-top: 1rem; }
  
  /* info specific */
  
  audio { opacity: 0.9; }
  
  .video { flex-grow: 1; display: flex; align-items: center; }
  
  /* text/image choice specific */
  
  .answers-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; padding: 0 1rem; }
  .answers-text .q-btn { margin: 0.75rem; font-weight: bold; font-size: 1.2rem; text-transform: none; }
  
  .answers-images { flex-grow: 1; text-align: center; display: flex; flex-flow: column nowrap; justify-content: center; }
  
  .images-block { display: flex; flex-flow: row wrap; justify-content: center; align-items: center; }
  .images-block > div { border-radius: 1rem; padding: 0.5rem; position: relative; width: 45%;}
  .images-block img { width: 100%; border-radius: 0.5rem; }
  
  /* keypad specific (code) */
  
  .typed-code { text-align: center; margin: 1rem auto; }
  .typed-code table { border-collapse: collapse; background-color: rgba(255, 255, 255, 0.6); }
  .typed-code td { width: 2rem; height: 3rem; border: 1px solid black; vertical-align: middle; text-align: center; line-height: 3rem; }
  .typed-code td.typed { font-weight: bold; font-size: 1.7rem; }
  
  .keypad { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; text-align: center; }
  .keypad .q-btn { margin: 0.5rem; width: 15%; height: 15%; font-weight: bold; font-size: 1.7rem; }
  
  /* color code specific */
  
  .code-color .color-bubbles { margin-top: 5rem; flex-grow: 1; display: flex; flex-flow: row nowrap; justify-content: center; }
  .code-color .color-bubbles div { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; margin: 0.3rem; transition: background-color 0.3s; }
  
  /* image code specific */
  .code-image td { width: 20% }
  .code-image td img { width: 100% }
  .code-image td .q-icon { font-size: 2em }

  /* image recognition specific */
  
  .image-recognition .photo { flex-grow: 1; overflow-y: hidden; margin-top: 1rem; display: flex; flex-flow: column nowrap; justify-content: center; padding: 0.5rem; margin: -0.5rem; } /* negative margin required to have image shadow visible on sides */
  .image-recognition .photo img, 
  .image-recognition .photo > video { width: 100%; border-radius: 0.5rem; }
  
  /* geolocation specific */
  
  .geolocation video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  .geolocation .direction-helper { flex-grow: 1; display: flex; flex-flow: column nowrap; }
  .geolocation .direction-helper canvas { width: 10rem; height: 10rem; margin: auto; margin-bottom: 0; }
  .geolocation .text { margin-bottom: 0.5rem; }
  
  /* jigsaw puzzle specific */
  
  #pieces { padding: 0; margin: 0; width: 100%; background: #777; border: 1px solid #777; display: block; }
  #pieces .piece { display: inline-block; margin: 0; box-shadow: inset 0 0 3px #000; text-align: center; cursor: move; background-repeat: none; }
  #pieces .piece.over { border: 2px dashed #000; }
  
  /* write-text specific */
  
  .answer-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
  .answer-text input { opacity: 0.7; font-size: 1.5em; font-weight: bold; height: 1.5em; background-color: #fff; border-radius: 0.5rem; box-shadow: 0px 0px 0.1rem 0.1rem #fff;}
    
  /* new-item specific */
  
  .new-item .item { text-align: center; }
  .new-item .item p { font-size: 2rem; }
  
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
  
  .disabled, [disabled] {
    opacity: 0.9 !important;
  }
  
  .actions > div { display: flex; flex-flow: row nowrap; }
  .actions > div > .q-btn { flex-grow: 1; }
  .actions > div > .q-btn:not(:first-child) { flex-grow: 1; margin-left: 1rem; }
  
  .resultMessage, .fixed-bottom.actions { padding: 1rem; }
  .resultMessage .text { text-align: center; font-weight: bold; }
  
  .inventory-btn { position: fixed; bottom: 0.7rem; left: 0.7rem; z-index: 1; }
  .inventory-btn img { width: 100%; height: 100%; border-radius: 50%; }
  
</style>
