<template>
  <div class="reduce-window-size-desktop">
    <div class="centered full-height bg-primary q-pa-sm" style="margin: auto;" v-if="warnings.questDataMissing || warnings.stepDataMissing || warnings.runDataMissing" @click="initData()">
      <q-card class="my-card">
        <q-card-section>
          <div class="centered q-pt-lg">
            <q-spinner-radio
              color="primary"
              size="2em"
            />
          </div>
          <div class="centered q-py-lg">{{ $t('label.NetwordkErrorReloadPage') }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="bg-accent text-white q-pa-md" v-if="warnings.isNetworkLow">{{ $t('label.WarningLowNetwork') }}</div>
    <div v-if="startDate.enabled" class="centered q-pa-lg">
      <img :src="getLogoImage()" v-if="info.quest.customization && info.quest.customization.logo && info.quest.customization.logo !== ''" />
      <img src="statics/icons/app-logo/icon-96x96.png" v-if="!info.quest.customization || !info.quest.customization.logo || info.quest.customization.logo === ''" />
      <div class="text-h6">{{ $t('label.ThisStepIsAvailableIn') }}</div>
      <div class="text-h5">{{ $t('label.TimeRemainingHoursMin', {day: startDate.remainingDays, hour: startDate.remainingHours, min: startDate.remainingMinutes, sec: startDate.remainingSeconds}) }}</div>
    </div>

    <!------------------ AUDIO ------------------------>

    <audio
      v-if="info && info.audio !== '' && info.audio !== null"
      id="background-music"
      autoplay loop>
      <source :src="info.audio" type="audio/mpeg">
    </audio>

    <!------------------ HEADER AREA ------------------------>
    <div :class="{'fit': (step.type !== 'image-over-flow')}"><!-- Keep this div for iphone, for red filter display -->

      <stepPlay
        :step="step"
        :runId="runId"
        :inventory="inventory"
        :itemUsed="selectedItem"
        :reload="loadStepData"
        :lang="lang"
        :customization="info.quest.customization ? info.quest.customization : {color: 'primary'}"
        :answer="offline.answer"
        :player="player"
        :timer="countDownTime"
        :quest="info.quest"
        :offline="offline.active"
        @played="trackStepPlayed"
        @success="trackStepSuccess"
        @fail="trackStepFail"
        @pass="trackStepPass"
        @closeAllPanels="closeAllPanels"
        @forceMoveNext="nextStep(true)"
        @suggestNext="alertOnNext"
        @hideButtons="hideFooterButtons"
        @showButtons="showFooterButtons"
        @msg="trackMessage">
      </stepPlay>
    </div>

    <!------------------ STARS PAGE AREA ------------------------>

    <transition name="slideInBottom">
      <div v-show="inventory.isOpened" class="bg-graaly-blue-dark text-white inventory panel-bottom">
        <div class="q-pa-md">
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'fr'">Vous avez {{starCounter}} étoile(s)</div>
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'en'">You have {{starCounter}} star(s)</div>
          <div class="centered">
            <img style="margin-top: 50px; width: 90%; max-width: 1000px;" :src="'statics/customers/conseil-europe/images/stars/star' + starCounter + '.png'" />
          </div>
        </div>
      </div>
    </transition>
    <q-dialog maximized v-model="inventory.detail.isOpened">
      <div class="bg-white centered limit-size-desktop">
        <img v-if="inventory.detail.zoom === 1" style="width: 100%" :src="inventory.detail.url">
        <div v-if="inventory.detail.zoom === 2" style="width: 100%; height: 100vw; overflow-x: scroll; overflow-y: scroll;">
          <img style="width: 200%" :src="inventory.detail.url">
        </div>
        <div v-if="inventory.detail.zoom === 4" style="width: 100%; height: 100vw; overflow-x: scroll; overflow-y: scroll;">
          <img style="width: 400%" :src="inventory.detail.url">
        </div>
        <div class="q-pa-md">{{ inventory.detail.title }}</div>
        <!--<div class="q-pa-md text-grey">{{ $t('label.YouCanNotUseAnItemInThisStep') }}</div>-->
        <q-btn class="glossy normal-button" color="primary" @click="closeInventoryDetail()"><div>{{ $t('label.Close') }}</div></q-btn>
        <div>
          <q-btn-group outline>
            <q-btn flat :label="$t('label.Zoom')"/>
            <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 1) }" label="x1" @click="inventoryZoom(1)" />
            <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 2) }" label="x2" @click="inventoryZoom(2)" />
            <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 4) }" label="x4" @click="inventoryZoom(4)" />
          </q-btn-group>
        </div>
      </div>
    </q-dialog>

    <!------------------ CHAT PAGE AREA ------------------------>
    <!--
    <transition name="slideInBottom">
      <div v-show="chat.isOpened" class="bg-graaly-blue-dark text-white inventory panel-bottom">
        <div class="q-pa-md">
          <a class="float-right no-underline" color="grey" @click="chat.isOpened = false"><q-icon name="close" class="subtitle3" /></a>
          <chat :questId="questId" :isOpened="chat.isOpened"></chat>
        </div>
      </div>
    </transition>
    -->

    <!------------------ INFO PAGE AREA ------------------------>

    <transition name="slideInBottom">
      <div v-show="info.isOpened" class="bg-graaly-blue-dark text-white inventory panel-bottom">
        <div class="q-pa-md">
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'fr'">Recommencer le  jeu dans une autre langue</div>
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'en'">Restart the game with other language</div>
          <table border="0" width="100%">
            <tr>
              <td align="center" v-if="$t('label.shortLang') === 'en'" @click="changeLanguage('fr')"><img src="statics/customers/conseil-europe/images/flags/fr.png" /></td>
              <td align="center" v-if="$t('label.shortLang') === 'fr'" @click="changeLanguage('en')"><img src="statics/customers/conseil-europe/images/flags/en.png" /></td>
            </tr>
          </table>
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'fr'">Comment jouer ?</div>
          <div class="subtitle-3" v-if="$t('label.shortLang') === 'en'">How to play?</div>
          <table border="0" width="100%">
            <tr>
              <td style="padding-right: 10px;">
                <q-btn
                  round
                  size="lg"
                  class="bg-primary"
                  icon="arrow_forward"
                />
              </td>
              <td>{{ $t('label.HelpStepMessageNextMessage') }}</td>
            </tr>
            <tr>
              <td>
                <q-btn
                  round
                  size="lg"
                  :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
                  :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}"
                  icon="arrow_back"
                />
              </td>
              <td>{{ $t('label.HelpStepMessagePreviousMessage') }}</td>
            </tr>
            <tr>
              <td>
                <q-btn
                  round
                  size="lg"
                  :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
                  :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}"
                  icon="star"
                />
              </td>
              <td v-if="$t('label.shortLang') === 'fr'">L'étoile vous permet de savoir le nombre d'étoiles gagnées</td>
              <td v-if="$t('label.shortLang') === 'en'">The star gives you the number of stars won</td>
            </tr>
            <tr>
              <td>
                <q-btn
                  round
                  size="lg"
                  :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
                  :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}"
                  icon="lightbulb"
                />
              </td>
              <td v-if="$t('label.shortLang') === 'fr'">L'ampoule vous permet d'obtenir des indices</td>
              <td v-if="$t('label.shortLang') === 'en'">The lightbulb gives you hints</td>
            </tr>
          </table>
          <div class="centered q-pt-lg">
            <q-btn
              v-if="info.quest && info.quest.playersNumber && info.quest.playersNumber < 2" class="glossy large-button"
              :color="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? '' : 'primary'"
              :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
              @click="restartGame">
              <span>
                {{ $t('label.RestartQuest') }}
              </span>
            </q-btn>
          </div>
        </div>
      </div>
    </transition>

    <!--====================== HINT =================================-->

    <div class="mobile-fit over-map" :class="'font-' + info.quest.customization.font" v-if="hint.isOpened">
      <story step="hint" :data="{hint: hint.label, character: (info.quest.customization && info.quest.customization.character && info.quest.customization.character !== '') ? (info.quest.customization.character.indexOf('blob:') === -1 ? serverUrl + '/upload/quest/' + info.quest.customization.character : info.quest.customization.character) : '3'}" @next="askForHint()"></story>
    </div>

    <!--====================== STORY =================================-->

    <div class="mobile-fit over-map" :class="'font-' + info.quest.customization.font" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>

    <!--====================== COUNTDOWN MESSAGE =================================-->

    <div v-show="countDownTime.enabled" class="fadein-message" style="font-size: 48px;"><q-icon color="white" name="timer" /> {{ $t('label.ItRemainsMinutes', {time: countDownTime.remainingMinutes}) }}</div>

    <!--====================== FEEDBACK =================================-->

    <q-dialog v-model="feedback.isOpened">
      <div class="bg-white q-pa-md reduce-window-size-desktop">
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.FeedbackTitle') }}</div>
        {{ $t('label.FeedbackIntroduction') }}
        <form @submit.prevent="sendFeedback">
          <q-input
              v-model="feedback.message"
              type="textarea"
              :label="$t('label.Feedback')"
              :max-height="100"
              :min-rows="4"
              class="full-width"
            />
        </form>
        <div class="q-pa-md q-gutter-sm centered">
          <q-btn color="primary" class="glossy large-button" @click="sendFeedback">{{ $t('label.Send') }}</q-btn>
          <div class="q-pt-md">
            <a class="dark" @click="hideFeedback">{{ $t('label.Cancel') }}</a>
          </div>
        </div>
      </div>
    </q-dialog>

    <!------------------ FOOTER AREA ------------------------>

    <div v-show="footer.show" class="step-menu step-menu-fixed fixed-bottom">
      <!--<q-linear-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-linear-progress>-->
      <div class="row white-buttons" :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}" :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''">
        <div class="col centered">
          <div class="q-py-sm">
            <q-btn
              flat
              size="lg"
              :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
              icon="settings"
              :class="{'text-secondary': info.isOpened}"
              @click="openInfo()"
            >
              <q-badge v-if="this.$store.state.chatNotification > 0" color="accent" rounded floating>{{ this.$store.state.chatNotification }}</q-badge>
            </q-btn>
          </div>
        </div>
        <div class="col centered q-py-sm">
          <q-btn
            flat
            size="lg"
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            icon="star"
            :class="{'flashing': inventory.suggest, 'text-secondary': inventory.isOpened}"
            @click="openInventory()"
          />
        </div>
        <div class="col centered q-py-sm">
          <q-btn
            flat
            size="lg"
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            :class="{'flashing': hint.suggest, 'bg-secondary': (hint.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')), 'bg-primary': (!hint.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === ''))}"
            @click="askForHint()"
            v-show="hint.show"
          >
            <q-avatar size="40px">
              <img src="statics/customers/conseil-europe/images/lightbulb.png">
              <q-badge v-if="this.step && this.step.hint" color="secondary" floating>{{ this.hint.remainingNumber }}</q-badge>
            </q-avatar>
          </q-btn>
        </div>
        <div class="col centered q-py-sm">
          <q-btn
            flat
            size="lg"
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}"
            :disable="$store.state.history.index === 0"
            icon="arrow_back"
            v-show="previousStepId !== ''"
            @click="previousStep()"
          />
        </div>
        <div class="col centered q-py-sm">
          <q-btn
            flat
            size="lg"
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            :class="{'flashing': next.suggest, 'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}"
            icon="arrow_forward"
            v-show="step.id && (next.enabled || next.canPass)"
            @click="nextStep()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// specific for COE
import AuthService from 'services/AuthService'

import RunService from 'services/RunService'
import StepService from 'services/StepService'
import QuestService from 'services/QuestService'
import UserService from 'services/UserService'
import chat from "components/chat";
//import colorsForCode from 'data/colorsForCode.json'
//import questItems from 'data/questItems.json'
import stepPlay from 'components/quest/game/stepPlay'
import Notification from 'boot/NotifyHelper'
import story from 'components/story'
import utils from 'src/includes/utils'

//import GMMS from 'services/GameMasterMonitoringService_mqtt'

import { Notify } from 'quasar'

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
    story,
    chat,
    Notify
  },
  data () {
    return this.initialState()
  },
  mounted () {
    utils.clearAllRunningProcesses()
    this.initData()
    this.keepScreenAwake()
    // hide status bar on Android
    if (this.isHybrid && cordova.platformId === 'android') {
      StatusBar.show()
    }
    //GMMS.Connect(this.questId)
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
          suggest: false,
          items: [],
          show: true,
          detail: {
            isOpened: false,
            url: '',
            zoom: 1
          }
        },
        hint: {
          isOpened: false,
          label: "",
          suggest: false,
          show: false,
          used: false,
          number: 0,
          remainingNumber: 0
        },
        info: {
          isOpened: false,
          score: 0,
          quest: {},
          audio: ''
        },
        chat: {
          isOpened: false
        },
        next: {
          suggest: false,
          enabled: false,
          canPass: false
        },
        sound: {
          status: 'play',
          tempMute: false
        },
        questId: this.$route.params.questId,
        questVersion: this.$route.params.version,
        step: {},
        navigatingToStepId: null, // to handle network interruption in online mode
        story: {
          step: null,
          data: null
        },
        loadStepData: false,
        run: { currentChapter: 0 },
        runId: 0,
        player: 'P1',
        isMultiplayer: false,
        isRunFinished: false,
        remotePlay: false,
        dataSharedWithPartner: false,
        //cameraStreamEnabled: false,
        isHybrid: window.cordova,
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        controlsAreDisplayed: false,
        lang: this.$route.params.lang,
        offline: {
          active: true,
          answer: null,
          steps: []
        },
        warnings: {
          inventoryMissing: false,
          questDataMissing: false,
          stepDataMissing: false,
          runDataMissing: false,
          isNetworkLow: false
        },
        feedback: {
          isOpened: false,
          message: ""
        },
        startDate: {
          enabled: false,
          remainingHours: '-',
          remainingMinutes: '-',
          remainingSeconds: '-',
          remainingDays: '-'
        },
        previousStepId: '',
        isIOs: utils.isIOS(),
        // timer
        countDownTime: {
          remaining: 0
        },
        // for step type 'use-item'
        selectedItem: null,

        starCounter: 0
      }
    },
    resetData () {
      const defaultVars = this.initialState()
      this.inventory = defaultVars.inventory
      this.hint = defaultVars.hint
      this.step = defaultVars.step
      this.next = defaultVars.next
      this.nbTry = defaultVars.nbTry
      this.warnings = defaultVars.warnings
      this.selectedItem = defaultVars.selectedItem
      this.loadStepData = defaultVars.loadStepData
      //this.countDownTime = defaultVars.countDownTime
      this.startDate = defaultVars.startDate
      this.footer = defaultVars.footer
      //this.offline = defaultVars.offline // offline info must not be reset between steps
    },
    /*
     * Init step data
     */
    async initData () {
      this.$q.loading.show()
      try {
        this.info.quest = await QuestService.getByIdForStep(this.questId, 999, this.lang)
      } catch (err) {
console.log("QUEST DATA MISSING")
        console.error(err)
        this.$q.loading.hide()
        this.warnings.questDataMissing = true
        this.reloadPageInAWhile()
        return
      }
      
      this.isMultiplayer = this.info.quest.playersNumber && this.info.quest.playersNumber > 1
            
      this.initOfflineMode()
      
      // Start audio
      this.getAudioSound()

      this.startFullScreen()

      this.loadStepData = false

      // get current run or create it
      //await this.getRun() // on sync mode to load step while run is checked
      await this.getRun()

      // get Player number
      this.player = await this.getPlayer()

      // get current step
      await this.getStep()

      // send stepId to parent if in a frame
      this.sendStepIdToParent()

      // send once on start
      /*if (this.info.quest.customization.chatEnabled) {
        this.sendDataToGameMaster()
      }*/

      // manage history
      this.updateHistory()

      // start countdown
      this.startCountDown()

      // check if user already played the step
      this.checkIfAlreadyPlayed()

      // fill inventory at loading when necessary
      if (this.step.type === 'use-item') {
        await this.fillInventory()
      }

      this.$q.loading.hide()

      // get quest number to compute progression
      //await this.countStepsNumber(this.quest.questId)

      // display hint
      if (this.isHintAvailable()) {
        utils.setTimeout(this.alertOnHint, 12000)
        this.hint.show = true
      }

      // next button blink if user did not succeed after 3 minutes
      utils.setTimeout(this.alertOnNext, 180000)

      // check if story needs to start
      //await this.startStory()

      // load component data
      this.loadStepData = true

      // get stars number
      this.starCounter = this.getStarsNumber()
    },
    /*sendDataToGameMaster() {
      GMMS.Send(this.run.questId, {
        'lastPing': Date.now(),
        'quest': {
          'id': this.run.questId
        },
        'player': {
          'id': this.run.userId[0],
          'name': this.run.userData.name
        },
        'step': {
          'id': this.step.id,
          'title': this.step.title
        },
        'run': {
          'id': this.run._id,
          'currentStep': this.run.currentStep,
          'currentChapter': this.run.currentChapter,
          'score': this.run.score,
          'status': this.run.status,
          'answers': this.run.answers,
          'conditions': this.run.conditionsDone,
          'createdAt': Date.parse(this.run.dateCreated),
          'version': this.run.version
        },
        'position': {
          'lat': Math.random() + 5.7167, // TODO
          'lng': Math.random() + 45.1667 // TODO
        },
        'device': this.$q.platform.is,
        'graaly': process.env.VERSION
      })
      utils.setTimeout(this.sendDataToGameMaster, 15000)
    },*/
    /*
    * Open the chat box
    */
    /*async openChat() {
      if (this.chat.isOpened) {
        this.closeAllPanels()
      } else {
        this.closeAllPanels()
        this.chat.isOpened = true
        this.footer.tabSelected = 'info'
      }
      this.$store.commit('setChatNotification', 0)
    },*/
    /**
     * Move to a step
     * @param {String} forceStepId optional - Id of step to load
     */
    async moveToStep(forceStepId) {
      // keeping stepId info is required when network is interrupted & quest is played in online mode
      this.navigatingToStepId = forceStepId
      
      utils.clearAllRunningProcesses()
      this.resetData()
      this.$q.loading.show()

      this.loadStepData = false

      // get current run or create it
      await this.getRun()

      // get Player number
      this.player = await this.getPlayer()

      // get current step
      await this.getStep(forceStepId)

      // send stepId to parent if in a frame
      this.sendStepIdToParent()

      // manage history
      this.updateHistory()

      // manage audio
      this.manageAudio()

      // check if user already played the step
      this.checkIfAlreadyPlayed()

      // fill inventory at loading when necessary
      if (this.step.type === 'use-item') {
        await this.fillInventory()
      }

      this.$q.loading.hide()

      // display hint
      if (this.isHintAvailable()) {
        utils.setTimeout(this.alertOnHint, 12000)
        this.hint.show = true
      }

      // next button blink if user did not succeed after 3 minutes
      utils.setTimeout(this.alertOnNext, 180000)

      // load component data
      this.loadStepData = true

      this.starCounter = this.getStarsNumber()
    },
    /*
     * Get the current run or create it
     *
     * The process try to get the run from server, but if not accessable or older than the offline version,
     * the offline run is used
     */
    async getRun() {
      this.warnings.runDataMissing = false

      var remotePlay = this.$route.query.hasOwnProperty('remoteplay') ? this.$route.query.remoteplay : false
      var dataSharedWithPartner = (this.$route.query.hasOwnProperty('sharepartner') && this.$route.query.sharepartner === 'true')
      let offlineRun

      // check if a run is created on offline mode
      const isRunOfflineLoaded = await this.checkIfRunIsAlreadyLoaded(this.questId)
      if (isRunOfflineLoaded) {
        // read the run
        offlineRun = await this.loadOfflineRun(this.questId)
      }
      
      if (!this.offline.active || this.run.currentChapter === 0) {
        // List all run for this quest for current user
        var runs = await RunService.listForAQuest(this.questId)
        
        // check if run is accessable from server
        if (runs && runs.data) {
          for (var i = 0; i < runs.data.length; i++) {
            if (runs.data[i] && runs.data[i].status && runs.data[i].status === 'finished') {
              this.isRunFinished = true
            }
            if (runs.data[i] && runs.data[i].status && runs.data[i].status === 'in-progress') {
              this.run = runs.data[i]
              this.runId = this.run._id

              // update the offline run or the online depending on the last updated
              if (isRunOfflineLoaded) {
                if (offlineRun.dateUpdated > this.run.dateUpdated) {
                  const tempId = this.run._id
                  this.run = offlineRun
                  // fix when id is not set
                  if (!this.run._id) {
                    this.run._id = tempId
                    this.runId = tempId
                  }
                  if (!this.run.questId) {
                    this.run.questId = this.questId
                    this.run.version = this.questVersion
                  }
                  // save run changes in DB
                  await RunService.updateFromOffline(this.run)
                } else {
                  // the answers are the offline one
                  this.run.answers = offlineRun.answers

                  await this.updateOfflineRun(this.questId)
                }
              }
            }
          }

          // init the run on the server
          if (this.run.currentChapter === 0) {
            // no 'in-progress' run => create run for current player & current quest
            let res = await RunService.init(this.questId, this.questVersion, this.$route.params.lang, remotePlay, null, dataSharedWithPartner)
            if (res && res.status === 200 && res.data && res.data._id) {
              if (isRunOfflineLoaded) {
                // if a offline run already exists
                this.run = offlineRun

                this.run._id = res.data._id
                this.runId = this.run._id
                if (!this.run.questId) {
                  this.run.questId = this.questId
                  this.run.version = this.questVersion
                }
                await RunService.updateFromOffline(this.run)
              } else {
                this.run = res.data
                this.runId = this.run._id
              }
            } else {
              this.warnings.runDataMissing = true
              this.reloadPageInAWhile()
            }
            // set current score
            this.info.score = 0
          } else {
            // get current score
            this.info.score = this.run.tempScore
          }
        } else {
          this.warnings.runDataMissing = true
          this.reloadPageInAWhile()
          return false
        }
      } else if (!this.isHybrid) {
        // if no online and on webapp
        this.warnings.runDataMissing = true
        this.reloadPageInAWhile()
      } else {
        // read offline run
        if (isRunOfflineLoaded) {
          if (offlineRun) {
            this.run = offlineRun
            if (this.run._id) {
              this.runId = this.run._id
            }
            // get current score
            this.info.score = this.run.tempScore
            // attempt to save run changes in DB (not blocking => no "await")
            RunService.updateFromOffline(this.run)
          }
        } else {
          // if first step => init run
          await this.updateOfflineRun(this.questId)
        }
      }
    },
    /*
    * Get the player number
    */
    async getPlayer () {
      if (this.run.team && this.run.team.members) {
        for (var i = 0; i < this.run.team.members.length; i++) {
          if (this.run.team.members[i]._id === this.$store.state.user._id) {
            return this.run.team.members[i].player
          }
        }
      }
      return 'P1'
    },
    /**
     * Get the step data
     * @param    {String}    forceStepId    optional - Id of a specific step to load
     */
    async getStep (forceStepId) {
      let stepId, response
      
      if (this.warnings.questDataMissing || this.warnings.runDataMissing) {
        return false
      }
      
      this.warnings.stepDataMissing = false
      
      // --- load step Id ---

      if (typeof forceStepId !== 'undefined') {
        stepId = forceStepId
      } else if (!this.offline.active) {
        response = await RunService.getNextStep(this.questId, this.player)

        if (response && response.data && response.status === 200) {
          // check if a step is triggered
          if (response.data.next) {
            if (response.data.next === 'locationMarker') {
              // QR Code scanner
              this.step = {
                id: "sensor"
              }
              return false
            } else if (response.data.next === 'geolocation') {
              // GPS sensor
              this.step = {
                id: "gpssensor",
                locations: response.data.extra.locations,
                steps: response.data.extra.geosteps,
                questId: this.questId,
                version: this.questVersion
              }
              return false
            } else {
              stepId = response.data.next
            }
            // check if history must be remove
            if (response.data.extra && response.data.extra === 'removehistory') {
              this.removeHistory()
            }
          } else {
            // display waiting screen
            if (this.isMultiplayer) {
              this.showWaitingPage()
            }
            this.getPreviousStep()
            return false
          }
        } else if (response && response.data && response.data.message === "app_quest_data_is_obsolete") {
          this.$q.dialog({
            title: this.$t('label.QuestUpdated'),
            message: this.$t('label.PleaseRestartQuest')
          }).onOk(() => {
            this.$router.push('/quest/play/' + this.questId)
          })
        } else {
          this.$q.dialog({
            title: this.$t('label.TechnicalProblem')
          }).onOk(() => {
            this.$router.push('/quest/play/' + this.questId)
          })
        }
      } else {
        // use offline content
        const stepIdResponse = await this.getNextOfflineStep(this.questId, null, this.player)

        if (!stepIdResponse || !stepIdResponse.id) {
          // if no step is triggered, display the waiting screen
          if (this.isMultiplayer) {
            this.showWaitingPage()
          }
          this.getPreviousStep()
          return false
        } else {
          stepId = stepIdResponse.id
        }
        if (stepId === 'locationMarker') {
          // QR Code scanner step
          this.step = {
            id: "sensor"
          }
          return false
        }
        if (stepId === 'geolocation') {
          // Gps location sensor step
          this.step = {
            id: "gpssensor",
            locations: stepIdResponse.extra.locations,
            steps: stepIdResponse.extra.geosteps,
            questId: this.questId,
            version: this.questVersion
          }
          return false
        }
      }

      if (stepId === 'end') {
        return this.$router.push('/quest/' + this.questId + '/end')
      }

      // --- load step data & media ---

      if (!this.offline.active) {
        const response2 = await StepService.getById(stepId, this.questVersion, this.lang)
        if (response2 && response2.data && response2.status === 200) {
          if (response2.data.message && response2.data.message === 'Step not yet available') {
            this.showStepBlockedMessage(response2.data.startDate)
          } else {
            this.step = response2.data
            this.step.id = this.step.stepId
            // get previous button redirect
            this.getPreviousStep()
            if (this.step.hint) {
              this.hint.remainingNumber = this.step.hint.length
            }
            return true
          }
        } else {
console.log("STEP DATA MISSING")
          this.warnings.stepDataMissing = true
          this.reloadPageInAWhile()
          return false
        }
      } else {
        // get quest data from device storage
        const step = await utils.readFile(this.questId, 'step_' + stepId + '.json')
        if (!step) {
          this.$q.dialog({
            title: this.$t('label.TechnicalProblem')
          }).onOk(() => {
            this.$router.push('/quest/play/' + this.questId)
          })
        } else {
          let tempStep = JSON.parse(step)

          if (tempStep.hint) {
            this.hint.remainingNumber = tempStep.hint.length
          }

          const stepAccess = this.offlineCheckAccess(tempStep)
          if (stepAccess && stepAccess.message) {
            if (stepAccessMessage === 'Step not yet available') {
              this.showStepBlockedMessage(stepAccess.startDate)
            }
          }

          // get offline media
          if (tempStep.backgroundImage && tempStep.backgroundImage[this.lang]) {
            const pictureUrl = await utils.readBinaryFile(this.questId, tempStep.backgroundImage[this.lang])
            if (pictureUrl) {
              tempStep.backgroundImage[this.lang] = pictureUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.videoStream && tempStep.videoStream[this.lang] && tempStep.videoStream[this.lang] !== '') {
            const videoUrl = await utils.readBinaryFile(this.questId, tempStep.videoStream[this.lang])
            if (videoUrl) {
              tempStep.videoStream[this.lang] = videoUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.audioStream) {
            let mainLang = this.info.quest.mainLanguage
            if (tempStep.audioStream[this.lang] && tempStep.audioStream[this.lang] !== '') {
              const audioUrl = await utils.readBinaryFile(this.questId, tempStep.audioStream[this.lang])
              if (audioUrl) {
                tempStep.audioStream[this.lang] = audioUrl
              } else {
                this.warnings.stepDataMissing = true
              }
            } else if (this.lang !== mainLang && tempStep.audioStream[mainLang] && tempStep.audioStream[mainLang] !== '') {
              // no audio available in current language => try to load audio for main language if different from current language
              const audioUrl = await utils.readBinaryFile(this.questId, tempStep.audioStream[mainLang])
              if (audioUrl) {
                tempStep.audioStream[mainLang] = audioUrl
              } else {
                this.warnings.stepDataMissing = true
              }
            }
          }
          if (tempStep.type === 'choose' && tempStep.options) {
            for (var k = 0; k < tempStep.options.items.length; k++) {
              if (tempStep.options.items[k].imagePath) {
                var chooseImageUrl = await utils.readBinaryFile(this.questId, tempStep.options.items[k].imagePath)
                if (chooseImageUrl) {
                  tempStep.options.items[k].imagePath = chooseImageUrl
                } else {
                  this.warnings.stepDataMissing = true
                }
              }
            }
          }
          if (tempStep.type === 'memory' && tempStep.options && tempStep.options.items) {
            for (k = 0; k < tempStep.options.items.length; k++) {
              if (tempStep.options.items[k].imagePath) {
                var memoryCardUrl = await utils.readBinaryFile(this.questId, tempStep.options.items[k].imagePath)
                if (memoryCardUrl) {
                  tempStep.options.items[k].imagePath = memoryCardUrl
                } else {
                  this.warnings.stepDataMissing = true
                }
              }
            }
          }
          if (tempStep.type === 'code-image' && tempStep.options && tempStep.options.images) {
            for (k = 0; k < tempStep.options.images.length; k++) {
              if (tempStep.options.images[k].imagePath) {
                var codeImageUrl = await utils.readBinaryFile(this.questId, tempStep.options.images[k].imagePath)
                if (codeImageUrl) {
                  tempStep.options.images[k].imagePath = codeImageUrl
                } else {
                  this.warnings.stepDataMissing = true
                }
              }
            }
          }
          if (tempStep.type === 'jigsaw-puzzle' && tempStep.options && tempStep.options.picture && tempStep.options.picture[this.lang] && tempStep.options.picture[this.lang] !== '') {
            const jigsawPictureUrl = await utils.readBinaryFile(this.questId, tempStep.options.picture[this.lang])
            if (jigsawPictureUrl) {
              tempStep.options.picture[this.lang] = jigsawPictureUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.type === 'new-item' && tempStep.options && tempStep.options.picture && tempStep.options.picture !== '') {
            let itemImageUrl
            // check if a translated picture is proposed
            if (tempStep.options.pictures && tempStep.options.pictures[this.lang] && tempStep.options.pictures[this.lang] !== '') {
              itemImageUrl = await utils.readBinaryFile(this.questId, tempStep.options.pictures[this.lang])
            } else {
              itemImageUrl = await utils.readBinaryFile(this.questId, tempStep.options.picture)
            }
            if (itemImageUrl) {
              tempStep.options.picture = itemImageUrl
              if (tempStep.options.hasOwnProperty('pictures') && tempStep.options.pictures[this.lang]) {
                tempStep.options.pictures[this.lang] = itemImageUrl
              }
            }
          }
          if (tempStep.type === 'character' && tempStep.options && tempStep.options.character && tempStep.options.character !== '' && tempStep.options.character !== 'usequestcharacter') {
            const characterPictureUrl = await utils.readBinaryFile(this.questId, tempStep.options.character)
            if (characterPictureUrl) {
              tempStep.options.character = characterPictureUrl
            }
          }
          if ((tempStep.type === 'find-item' || tempStep.type === 'use-item') && tempStep.options && tempStep.options.altFile && tempStep.options.altFile !== '') {
            const altPictureUrl = await utils.readBinaryFile(this.questId, tempStep.options.altFile)
            if (altPictureUrl) {
              tempStep.options.altFile = altPictureUrl
            }
          }
          this.step = tempStep
          this.step.id = this.step.stepId
          // get previous button redirect
          this.getPreviousStep()

          // get answer
          this.offline.answer = this.step.answers

          return true
        }
      }
    },
    /*
     * Send stepId to parent frame
     */
    sendStepIdToParent () {
      try {
        if (window.self !== window.top) {
          document.domain = "graaly.com"
          parent.document.getElementById("stepid").value = this.step.id
        }
      } catch (e) {
        console.log(e)
      }
    },
    /*
     * Show waiting page
     */
    showWaitingPage () {
      this.step = {
        id: "waiting"
      }
      //this.footer.show = false
      this.next.enabled = false
      this.next.canPass = false
      setTimeout(async () => {
        this.moveToStep()
      }
      , 15000);
    },
    /*
     * Check if the user has already played the step
     */
    checkIfAlreadyPlayed() {
      const conditions = this.run.conditionsDone
      if (conditions && typeof this.step.stepId !== 'undefined' && conditions.indexOf('stepDone_' + this.step.stepId) !== -1) {
        this.next.canPass = true
      }
    },
    /*
     * update history
     */
    updateHistory() {
      if (!this.$store.state.history || !this.$store.state.history.items) {
        this.removeHistory()
      }
      //this.$store.state.history.index++
      if (this.$store.state.history.items.indexOf(this.step.stepId) === -1 && this.step.stepId) {
        this.$store.state.history.items.push(this.step.stepId)
      }
    },
    removeHistory() {
      this.$store.state.history = {items: [], index: 0}
    },
    /*
     * Get the previous step ID
     */
    getPreviousStep () {
      // only for steps with conditions
      if ((this.step.conditions && this.step.conditions.length > 0) || this.step.id === 'waiting') {
        this.previousStepId = 'ok'
        /*for (var i = 0; i < this.step.conditions.length; i++) {
          if (this.step.conditions[i].indexOf('stepDone') !== -1) {
            var stepId = this.step.conditions[i].replace('stepDone_', '')
            this.previousStepId = stepId

            return stepId
          }
        }*/
      }
    },
    /*
     * Start the countdown
     */
    startCountDown () {
      if (this.info.quest.countDownTime && this.info.quest.countDownTime.enabled) {
        // compute minutes remaining based on start & duration
        const timeSpent = utils.getDurationFromNow(this.run.dateCreated)
        const remainingDuration = this.info.quest.duration - timeSpent.m
        if (remainingDuration > 0) {
          this.countDownTime.enabled = true
          this.countDownTime.remainingMinutes = remainingDuration
          this.countDownTime.remaining = remainingDuration / this.info.quest.duration
          setTimeout(this.startCountDown, 60000)
        } else {
          if (this.info.quest.countDownTime.stopGame) {
            return this.$router.push('/quest/' + this.questId + '/end')
          }
        }
      }
    },
    /*
     * Track step success
     */
    async trackStepSuccess (score, offline, showResult, answer) {
      if (showResult) {
        // add step score to general score
        this.info.score += score
      }

      // hide hint
      if (this.step.type !== 'image-over-flow' && this.step.type !== 'binocular') {
        this.hideHint()
      }

      // save offline run
      await this.saveOfflineAnswer(true, false, false)

      // move to next step if right answer not displayed
      if (this.step.displayRightAnswer === false && (!this.step.options.rightAnswerMessage || this.step.options.rightAnswerMessage === "")) {
        this.nextStep()
      }
    },
    /*
     * Track step played
     */
    async trackStepPlayed (returnData, offline) {
      if (this.step.id === 'sensor') {
        await this.getMarkerStep(returnData)
      } else if (this.step.id === 'gpssensor') {
        await this.getNextGPSStep()
      } else if (this.step.id === 'waiting') {
        await this.getMarkerStep(returnData)
      } else {
        this.next.enabled = true
        if (this.step.type !== 'image-over-flow' && this.step.type !== 'binocular') {
          this.next.suggest = true
          this.hint.show = false
          this.hint.suggest = false
        }
        this.inventory.show = false
        this.footer.tabSelected = 'next'
      }
    },
    /*
     * Track step passing
     */
    async trackStepPass () {
      if ((!this.step.canPass && this.step.canPass !== false) || this.step.canPass === true) {
        this.next.canPass = true
      }
    },
    /*
     * Track step fail
     */
    async trackStepFail (offline, showResult, answer) {
      this.hideHint()

      // save offline run
      await this.saveOfflineAnswer(false, answer, false)

      // move to next step if right answer not displayed
      if (this.step.displayRightAnswer === false && (!this.step.options.wrongAnswerMessage || this.step.options.wrongAnswerMessage === "")) {
        this.nextStep()
      }
    },
    /*
     * Track message sent
     */
    async trackMessage (message) {
      if (message === 'suggestInventory') {
        this.inventory.suggest = true
      } else if (message === 'suggestNext') {
        this.next.suggest = true
      }
    },
    /*
     * Track step fail
     */
    async getMarkerStep (answer) {
      var next
      var response
      // get the next step after the marker
      if (!this.offline.active) {
        response = await RunService.getMarkerNextStep(this.questId, answer, this.player)
      }

      if (response && response.data) {
        // check if a step is triggered
        if (response.data.next) {
          next = response.data.next
        } else {
          Notification(this.$t('label.NothingOccurs'), 'info')
        }
      } else {
        // try to find step offline
        let response = await this.getNextOfflineStep(this.questId, answer, this.player)
        if (response) {
          next = response.id
        }
      }

      if (next) {
        // if quest is finished
        if (next === 'end') {
          // if user is owner of the quest, redirect to toolbox
          if (this.$store.state.user.isAdmin) {
            return this.$router.push('/admin/validate/' + this.questId)
          } else if (this.$store.state.user._id === this.info.quest.authorUserId) {
            return this.$router.push('/quest/builder/' + this.questId)
          } else {
            return this.$router.push('/quest/' + this.questId + '/end')
          }
        } else {
          //this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + next + '/' + this.$route.params.lang)
          this.moveToStep(next)
        }
      }
    },
    /*
     * Get next step when a GPS step is found in advanced mode
     */
    async getNextGPSStep () {
      var next
      var response
      // get the next step after the marker
      if (!this.offline.active) {
        response = await RunService.getNextStep(this.questId, this.player)
      }

      if (response && response.data) {
        // check if a step is triggered
        if (response.data.next) {
          next = response.data.next
        } else {
          Notification(this.$t('label.NothingOccurs'), 'info')
        }
      } else {
        // try to find step offline
        let response = await this.getNextOfflineStep(this.questId, null, this.player)
        if (response) {
          next = response.id
        }
      }

      if (next) {
        // if quest is finished
        if (next === 'end') {
          // if user is owner of the quest, redirect to toolbox
          if (this.$store.state.user.isAdmin) {
            return this.$router.push('/admin/validate/' + this.questId)
          } else if (this.$store.state.user._id === this.info.quest.authorUserId) {
            return this.$router.push('/quest/builder/' + this.questId)
          } else {
            return this.$router.push('/quest/' + this.questId + '/end')
          }
        } else {
          //this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + next + '/' + this.$route.params.lang)
          this.moveToStep(next)
        }
      }
    },
    hideHint() {
      this.step.hint = {}
    },
    /*
     * get background image
     */
    getBackgroundImage () {
      let picture
      if (this.info.quest.picture) {
        if (this.info.quest.picture[this.lang]) {
          picture = this.info.quest.picture[this.lang]
        } else if (this.info.quest.picture[this.info.quest.mainLanguage]) {
          picture = this.info.quest.picture[this.info.quest.mainLanguage]
        }
      }
      if (picture && picture[0] === '_') {
        return 'statics/images/quest/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.serverUrl + '/upload/quest/' + picture
      } else {
        return 'statics/images/quest/default-quest-picture.jpg'
      }
    },
    /*
     * get logo image
     */
    getLogoImage () {
      if (this.info.quest.customization && this.info.quest.customization.logo && this.info.quest.customization.logo.indexOf('blob:') !== -1) {
        return this.info.quest.customization.logo
      } else {
        return this.serverUrl + '/upload/quest/' + this.info.quest.customization.logo
      }
    },
    /*
     * get audio sound
     */
    getAudioSound () {
      let mainLang = this.info.quest.mainLanguage
      let finalLang = this.lang
      let hasAudioForCurrentLang = (this.info.quest.customization && this.info.quest.customization.audio && this.info.quest.customization.audio[this.lang] && this.info.quest.customization.audio[this.lang] !== '')
      let hasAudioForMainLang = (this.info.quest.customization && this.info.quest.customization.audio && this.info.quest.customization.audio[mainLang] && this.info.quest.customization.audio[mainLang] !== '')

      if (hasAudioForCurrentLang || hasAudioForMainLang) { // some audio is available
        if (!hasAudioForCurrentLang && hasAudioForMainLang && mainLang !== this.lang) { // no audio in current lang ? take main lang audio
          finalLang = mainLang
        }
        if (this.info.quest.customization.audio[finalLang].indexOf('blob:') !== -1) {
          this.info.audio = this.info.quest.customization.audio[finalLang]
        } else {
          this.info.audio = this.serverUrl + '/upload/quest/' + this.info.quest.customization.audio[finalLang]
        }
      } else {
        this.info.audio = null
      }
    },
    /*
     * Move to next step
     */
    async nextStep(force) {
      if (!this.step || !this.step.id) {
        return false
      }
      this.$store.state.history.index++
      // if moving in history
      if (this.$store.state.history.items && this.$store.state.history.index < this.$store.state.history.items.length) {
        await this.moveToStep(this.$store.state.history.items[this.$store.state.history.index])
        //this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + this.$store.state.history.items[this.$store.state.history.index] + '/' + this.$route.params.lang)
        return
      }
      // reload step to remove notifications
      this.loadStepData = false
      if (this.next.enabled) {
        await this.moveToNextStep('success')
      } else if (this.next.canPass) {
        if (force) {
          await this.passStep()
        } else {
          let confirmPass = (this.$t('label.shortLang') === 'fr' ? "Êtes-vous sûr de passer ? S'il y a une étoile à gagner, vous ne la gagnerez pas !": "Are you sure you will pass? If there is a star to be won, you won't win it!")
          this.$q.dialog({
            dark: true,
            message: confirmPass,
            ok: this.$t('label.Ok'),
            cancel: this.$t('label.Cancel')
          }).onOk(async () => {
            await this.passStep()
          }).onCancel(() => {})
        }
      }
    },
    async passStep() {
      if (!this.offline.active) {
        await RunService.passStep(this.runId, this.step.id, this.player)
      }

      await this.passOfflineStep(this.step.id)

      // TODO: manage if pass failed
      await this.moveToNextStep('pass')
    },
    /*
     * Move to next step
     */
    async moveToNextStep(type) {
      // sync offline run
      await this.saveOfflineRun(this.questId, this.run, false)
      //hide button
      this.next.enabled = false
      this.next.suggest = false
      this.next.canPass = false

      // force camera flow to hide
      if (this.step.type === 'locate-item-ar' || this.step.type === 'image-over-flow') {
        if (this.isIOs) {
          CameraPreview.stopCamera()
          CameraPreview.stopCamera() // calling twice is needed
        }
      }

      //this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + type + '_' + this.step.stepId + '_' + utils.randomId() + '/' + this.$route.params.lang)
      this.moveToStep()
    },
    /*
     * Return to previous step
     */
    async previousStep() {
      let previousOK = true
      this.$store.state.history.index--
      if (this.$store.state.history.index < 0) {
        this.$store.state.history.index = 0
        previousOK = false
      } else if (this.$store.state.history.items && this.$store.state.history.index > this.$store.state.history.items.length) {
        this.$store.state.history.index = this.$store.state.history.items.length
      }
      if (previousOK) {
        //this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + this.$store.state.history.items[this.$store.state.history.index] + '/' + this.$route.params.lang)
        await this.moveToStep(this.$store.state.history.items[this.$store.state.history.index])
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
          await this.getHint()
        }
      }
    },
    /*
     * Get the hint and display
     */
    async getHint() {
      var hintLabel
      if (!this.offline.active) {
        hintLabel = await RunService.getHint(this.runId, this.step.stepId, this.run.version)
      }

      if (hintLabel && hintLabel.hint) {
        // online hint
        this.hint.label = hintLabel.hint
      } else {
        // offline hint
        this.hint.label = this.step.hint[this.hint.number]
      }
      // update hint number, used for offline
      if (this.step.hint && this.hint.number < this.step.hint.length - 1) {
        this.hint.number++
      } else {
        this.hint.number = 0
      }
      this.hint.used = true
      this.closeAllPanels()
      this.hint.isOpened = true
      this.footer.tabSelected = 'hint'
      if (this.hint.remainingNumber >0) {
        this.hint.remainingNumber--
      }
    },
    closeAllPanels() {
      this.inventory.isOpened = false
      this.info.isOpened = false
      this.hint.isOpened = false
      this.footer.tabSelected = 'none'
      //this.chat.isOpened = false
    },
    hideFooterButtons() {
      this.footer.show = false
    },
    showFooterButtons() {
      this.footer.show = true
    },
    keepScreenAwake() {
      if (window.cordova) {
        window.plugins.insomnia.keepAwake()
      }
    },
    /*
     * Fill the inventory with objects won by the user
     */
    async fillInventory() {
      this.warnings.inventoryMissing = false
      // load items won on previous steps
      var response
      if (!this.offline.active) {
        response = await RunService.listWonObjects(this.questId, this.runId)
      }

      if (response && response.data) {
        this.inventory.items.length = 0
        for (var i = 0; i < response.data.length; i++) {
          this.inventory.items.push({
            picture: (response.data[i].pictures && response.data[i].pictures[this.lang]) ? response.data[i].pictures[this.lang] : response.data[i].picture,
            title: response.data[i].title
          })
          if (response.data[i].titles) {
            this.inventory.items[i].titles = response.data[i].titles
          }
        }
        // to have it compliant with offline mode :
        //this.inventory.items.originalPicture = this.inventory.items.picture
      } else {
        let offlineInventory = await this.listWonObjects()
        if (offlineInventory) {
          this.inventory.items = offlineInventory
        } else {
          this.warnings.inventoryMissing = true
        }
      }
    },
    /*
     * Open the inventory
     */
    async openInventory() {
      // check if the items are already loaded
      if (this.inventory.items && this.inventory.items.length === 0) {
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
      // if menu is disabled for the game
      if (this.info.quest.customization && this.info.quest.customization.hideMenu) {
        return false
      }
      if (this.info.isOpened) {
        this.closeAllPanels()
        //this.footer.show = true
      } else {
        this.closeAllPanels()
        this.info.isOpened = true
        //this.footer.show = false
        //this.footer.tabSelected = 'info'
      }
    },
    /*
     * Back to the map
     */
    async backToMap() {
      return this.$router.push('/home')
    },
    /*
     * Restart the game
     */
    async restartGame() {
      var self = this
      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureToRestartThisQuest'),
        ok: this.$t('label.Restart'),
        cancel: this.$t('label.Cancel')
      }).onOk(() => {
        self.cancelRun()
      }).onCancel(() => {
        // do nothing
      })
    },
    /*
     * Cancel a run
     */
    async cancelRun() {
      await RunService.endRun(this.runId, null, this.questId, this.questVersion, this.info.quest.mainLanguage)
      // remove run offline data
      await utils.removeDirectory(this.questId)
      await this.removeQuestFromOfflineList(this.questId)

      // return to the home
      this.$router.push('/quest/play/' + this.questId)
    },
    /*
     * Add the quest in the offline quests list
     */
    async removeQuestFromOfflineList(questId) {
      // check if quests file exists
      const isQuestOfflineListExisting = await utils.checkIfFileExists('', 'quests.json')
      var quests

      if (isQuestOfflineListExisting) {
        const questFileContent = await utils.readFile('', 'quests.json')

        quests = JSON.parse(questFileContent)

        // check if quest is already existing in file
        var questPosition = -1
        for (var i = 0; i < quests.list.length; i++) {
          if (quests.list[i].questId === questId) {
            questPosition = i
          }
        }

        if (questPosition !== -1) {
          quests.list.splice(questPosition, 1)
        }

        // save quests list
        await utils.writeInFile('', 'quests.json', JSON.stringify(quests), true)
      }
    },
    /*
     * Display the message that the step is blocked
     */
    async showStepBlockedMessage(date) {
      this.startDate.enabled = true
      this.startDate.date = date
      utils.setTimeout(this.computeRemainingTime, 1000)
    },
    /*
     * Display the remaining time before step is playable
     */
    async computeRemainingTime() {
      const today = new Date()
      const startDate = new Date(this.startDate.date.substr(0, 4), (this.startDate.date.substr(5, 2) - 1), this.startDate.date.substr(8, 2), 0, 0, 0)

      var diff = (startDate - today.getTime()) / 1000
      if (diff < 0) {
        await this.initData()
        return
      }
      this.startDate.remainingDays = Math.floor(diff / 86400)
      this.startDate.remainingHours = Math.floor((diff - this.startDate.remainingDays * 86400) / 3600)
      this.startDate.remainingMinutes = Math.floor((diff - this.startDate.remainingDays * 86400 - this.startDate.remainingHours * 3600) / 60)
      this.startDate.remainingSeconds = Math.floor(diff % 60)

      utils.setTimeout(this.computeRemainingTime, 1000)
    },
    /*
     * Select an item in the inventory
     * @param   {object}    item            Item selected
     */
    selectItem(item) {
      this.inventory.detail.zoom = 1
      if (this.step.type !== 'use-item') {
        this.inventory.detail.isOpened = true
        if (item.pictures && item.pictures[this.lang] && item.pictures[this.lang] !== '') {
          this.inventory.detail.url = ((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.picture : this.serverUrl + '/upload/quest/' + this.questId + '/step/new-item/' + item.picture)
        } else {
          this.inventory.detail.url = (item.picture.indexOf('statics/') > -1 ? item.picture : this.serverUrl + '/upload/quest/' + this.questId + '/step/new-item/' + item.picture)
        }
        if (item.titles && item.titles[this.lang] && item.titles[this.lang] !== '') {
          this.inventory.detail.title = item.titles[this.lang]
        } else {
          this.inventory.detail.title = item.title
        }
      } else {
        this.selectedItem = item
        this.closeAllPanels()
      }
    },
    closeInventoryDetail() {
      this.inventory.detail.isOpened = false
    },
    inventoryZoom(zoomLevel) {
      Vue.set(this.inventory.detail, 'zoom', zoomLevel)
      this.$forceUpdate()
    },
    /*
     * Show the feedback box
     */
    showFeedback() {
      this.feedback.isOpened = true
    },
    /*
     * Show the feedback box
     */
    hideFeedback() {
      this.feedback.isOpened = false
    },
    /*
     * Send a feedback
     */
    async sendFeedback() {
      let sendStatus = await UserService.sendFeedback(this.feedback.message, {questId: this.questId, stepId: this.step.stepId})
      if (sendStatus) {
        Notification(this.$t('label.YourMessageHasBeenSent'), 'info')
        this.feedback.isOpened = false
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    isHintAvailable() {
      if (this.step && this.step.hint && this.step.hint !== '' && this.step.hint.length > 0) {
        return true
      } else {
        return false
      }
    },
    alertOnHint() {
      this.hint.suggest = true
    },
    alertOnNext() {
      this.next.suggest = true
    },
    // ============================================ OFFLINE MANAGEMENT ========================
    /*
     * Check if Step is already saved in file
     */
    async checkIfStepIsAlreadyLoaded(id) {
      if (!window.cordova) {
        return false
      }

      const isStepOfflineFileExisting = await utils.checkIfFileExists(this.questId, 'step_' + id + '.json')

      if (isStepOfflineFileExisting) {
        return true
      } else {
        return false
      }
    },
    /*
     * Check if run is already saved in file
     */
    async checkIfRunIsAlreadyLoaded(id) {
      if (!window.cordova) {
        return false
      }

      const isRunOfflineFileExisting = await utils.checkIfFileExists(this.questId, 'run_' + id + '.json')

      if (isRunOfflineFileExisting) {
        return true
      } else {
        return false
      }
    },
    /*
     * Load the run from offline file
     */
    async loadOfflineRun(questId) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      const run = await utils.readFile(this.questId, 'run_' + questId + '.json')

      if (!run) {
        return false
      } else {
        return JSON.parse(run)
      }
    },
    /*
     * init the run offline file
     */
    async updateOfflineRun(questId) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      if (this.run && this.run.questId) {
        // init the offline file with the server one
      } else {
        this.run = {
          _id: this.runId,
          userId: this.$store.state.user._id,
          questId: questId,
          version: this.questVersion,
          status: 'in-progress',
          currentStep: 0,
          currentChapter: 0,
          conditionsDone: ['start'],
          tempScore: 0,
          tempReward: 0,
          score: 0,
          stars: 0,
          reward: 0,
          remotePlay: this.remotePlay,
          dataSharedWithPartner: this.dataSharedWithPartner,
          dateCreated: new Date(),
          dateUpdated: new Date(),
          answers: [],
          questData: {
            picture: this.info.quest.picture,
            thumb: this.info.quest.thumb || 'default-quest-thumb.png',
            title: this.info.quest.title,
            type: this.info.quest.type,
            zipcode: this.info.quest.location.zipcode,
            town: this.info.quest.location.town,
            country: this.info.quest.location.country
          },
          language: this.lang,
          userData: {
            name: this.$store.state.user.name,
            picture: this.$store.state.user.picture,
            location: this.$store.state.user.location
          },
          history: [],
          historyIndex: 0
        }
      }
      await this.saveOfflineRun(questId, this.run, false)
    },
    /*
     * save the offline answer for a run
     */
    async saveOfflineAnswer(success, answer, updateRunDate) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      // check if user has already played this step in current run
      var stepAlreadyPlayed = await this.checkIfStepIsAlreadyPlayedInRun(this.step.stepId, this.player)

      // add conditions
      var conditions = this.run.conditionsDone

      var ended = false
      var score = 0
      var stepStatus
      //var removedStatus

      if (success) {
        // if answer is not displayed => player must be able to play again the step and the step before
        /*if (this.step.displayRightAnswer === false) {
          removedStatus = await this.removeConditionsUntilLastMarker(conditions, this.step.stepId, this.run.version)
          if (removedStatus.found) {
            conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, false, this.player)
          } else {
            conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, true, this.player)
          }
        } else {*/
          conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, true, this.player)
        /*}*/
        ended = true

        if (this.hint.used || this.nbTry > 1) {
          score = this.step.points / 2
        } else {
          score = this.step.points
        }
        stepStatus = 'success'
      } else {
        ended = true
        stepStatus = 'fail'
        /*if (this.step.displayRightAnswer === false) {
          removedStatus = await this.removeConditionsUntilLastMarker(conditions, this.step.stepId, this.run.version)
          if (removedStatus.found) {
            conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, false, this.player)
          } else {
            conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, true, this.player)
          }
        } else {*/
          conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, true, this.player)
        /*}*/
      }

      // compute nb points
      answer = {stepId: this.step.stepId, stepNumber: this.step.number, nbTry: 1, ended: ended, score: score, reward: 0, status: stepStatus, useHint: false, date: new Date(), online: false}
      // add new item in inventory
      if (this.step.type === 'new-item') {
        if (this.run.inventory) {
          this.run.inventory.push(this.step.answers)
        } else {
          this.run.inventory = [this.step.answers]
        }
        if (conditions.indexOf('objectWon_' + this.step.stepId) === -1) {
          conditions.push('objectWon_' + this.step.stepId)
        }
      }

      if (!stepAlreadyPlayed) {
        // save answer
        var update = false
        if (this.run.answers && this.run.answers.length > 1) {
          for (var i = 0; i < this.run.answers.length; i++) {
            if (this.run.answers[i] && this.run.answers[i].stepId && this.run.answers[i].stepId !== null && this.run.answers[i].stepId === this.step.stepId) {
              update = true
              answer.nbTry = this.run.answers[i].nbTry + 1
              answer.useHint = this.run.answers[i].useHint
              this.run.answers[i] = answer
            }
          }
        }
        if (!update) {
          if (!this.run.answers) {
            this.run.answers = []
          }
          this.run.answers.push(answer)
        }
      }

      // update conditions done
      this.run.conditionsDone = conditions

      let updateAnswer = await this.saveOfflineRun(this.questId, this.run, updateRunDate)

      if (updateAnswer) {
        return true
      }
      return false
    },
    /*
     * init the run offline file
     */
    async passOfflineStep(stepId) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      this.run.conditionsDone = this.updateConditions(this.run.conditionsDone, stepId, false, this.step.type, true, this.player)
      //this.run.conditionsDone.push('stepFail_' + stepId)
      await this.saveOfflineRun(this.questId, this.run, true)
    },
    /*
     * Check if user has access to the step
     */
    async offlineCheckAccess(step) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      if (step && step.startDate && step.startDate.enabled && step.startDate.date) {
        // check if step is available today
        const today = new Date()
        const startDate = Date.UTC(step.startDate.date.substr(0, 4), step.startDate.date.substr(5, 2), step.startDate.date.substr(8, 2), 0, 0, 0)

        if (today < startDate) {
          return {message: "Step not yet available", date: step.startDate.date}
        }
      }
      return true
    },
    /*
     * Save current run offline
     */
    async saveOfflineRun(questId, run, updateDate) {
      // offline mode not activated for multiplayer
      if (this.isMultiplayer) {
        return false
      }
      if (updateDate) {
        run.dateUpdated = new Date()
      }

      let status = await utils.writeInFile(this.questId, 'run_' + questId + '.json', JSON.stringify(run), true)

      if (status) {
        return true
      } else {
        return false
      }
    },
    /**
     * Get the next offline step
     * /!\ WARNING /!\ copied & adapted from server side file controller/run.js to handle online mode
     */
    async getNextOfflineStep(questId, markerCode, player, extra) {
      //var steps = []
      let conditionsDone = this.run.conditionsDone

      if (!player) {
        player = 'P1'
      }

      // check if user is currently navigating in quest history
      await this.updateOfflineRun(questId)

      if (this.run.history && this.run.historyIndex < this.run.history.length) {
        this.run.historyIndex++
        await this.saveOfflineRun(questId, this.run, true)
        return {id: this.run.history[this.run.historyIndex - 1], extra: extra}
      }

      // read all steps
      if (this.info.quest.steps && this.offline.steps.length < 1) {
        for (var i = 0; i < this.info.quest.steps.length; i++) {
          let step = await utils.readFile(questId, 'step_' + this.info.quest.steps[i] + '.json')
          this.offline.steps.push(JSON.parse(step))
        }
      }

      // get current chapter
      var chapter = this.run.currentChapter
      if (!chapter) {
        if (this.info.quest.chapters && this.info.quest.chapters.length > 0) {
          chapter = this.info.quest.chapters[0]
        } else {
          return false
        }
      }

      if (markerCode) {
        // list the marker steps for the chapter
        // TODO: get only the locate-marker for answers = marker
        var markersSteps = await this.listSpecificTypeForAChapter(this.offline.steps, chapter, 'locate-marker')
        var stepsThatFit = []
        if (markersSteps && markersSteps.length > 0) {
          markerStepListFor:
          for (i = 0; i < markersSteps.length; i++) {
            // check if marker is not the good one
            if (markerCode && markersSteps[i].answers !== markerCode) {
              continue markerStepListFor
            }

            // check if the step is not already done
            if (this.run.conditionsDone && this.run.conditionsDone.indexOf('stepDone_' + markersSteps[i].stepId) === -1) {
              if (markersSteps[i].conditions && markersSteps[i].conditions.length > 0) {
                for (var j = 0; j < markersSteps[i].conditions.length; j++) {
                  // if one of the conditions of the step i not ok, continue with next step
                  if (this.run.conditionsDone.indexOf(markersSteps[i].conditions[j]) === -1) {
                    continue markerStepListFor
                  }
                }
                stepsThatFit.push({id: markersSteps[i].stepId, nbConditions: markersSteps[i].conditions.length})
              } else {
                stepsThatFit.push({id: markersSteps[i].stepId, nbConditions: 0})
              }
            }
          }
        }

        // if no condition fit, stop the process
        if (stepsThatFit.length === 0) {
          return {id: "", extra: extra}
        }
        // for all markers that fit, use the one with the more condition met
        var maxNbConditions = 0
        var stepId
        for (i = 0; i < stepsThatFit.length; i++) {
          if (stepsThatFit[i].nbConditions >= maxNbConditions) {
            stepId = stepsThatFit[i].id
            maxNbConditions = stepsThatFit[i].nbConditions
          }
        }
        if (this.info.quest.editorMode === 'simple') {
          // add points if basic quest mode (not in escape game mode)
          await this.saveOfflineAnswer('success', false, true)
        } else {
          // set the marker step as done to pass to next step
          conditionsDone.push('stepDone_' + stepId.toString())
          conditionsDone.push('stepDone' + this.player + '_' + stepId.toString())

          // update run
          this.run.conditionDone = conditionsDone
          this.run.currentStep = stepId
        }
      }

      // list the steps for the chapter
      var stepsofChapter = await this.listForAChapter(this.offline.steps, chapter, player)
      var locationMarkerFound = false
      var geolocationFound = false

      // Count counter value
      let counter = 0
      for (let i = 0; i < conditionsDone.length; i++) {
        if (conditionsDone[i].indexOf("counterIncrement_") !== -1) {
          counter++
        }
      }

      if (stepsofChapter && stepsofChapter.length > 0) {
        stepListFor:
        for (i = 0; i < stepsofChapter.length; i++) {
          // check if the step is not already done
          if (conditionsDone && conditionsDone.indexOf('stepDone' + player + '_' + stepsofChapter[i].stepId) === -1) {
            if (stepsofChapter[i].conditions && stepsofChapter[i].conditions.length > 0) {
              for (j = 0; j < stepsofChapter[i].conditions.length; j++) {
                // check if counter condition
                if (stepsofChapter[i].conditions[j].indexOf('countergreater_') === -1 && stepsofChapter[i].conditions[j].indexOf('counterlower_') === -1) {
                  // if one of the conditions of the step i not ok, continue with next step
                  if (conditionsDone.indexOf(stepsofChapter[i].conditions[j]) === -1) {
                    continue stepListFor
                  }
                } else {
                  // if counter lower than countergreater value
                  if (stepsofChapter[i].conditions[j].indexOf('countergreater_') !== -1) {
                    const lowerCounter = parseInt(stepsofChapter[i].conditions[j].replace('countergreater_', ''), 10)
                    if (counter <= lowerCounter) {
                      continue stepListFor
                    }
                  }
                  // if counter greater than counterlower value
                  if (stepsofChapter[i].conditions[j].indexOf('counterlower_') !== -1) {
                    const upperCounter = parseInt(stepsofChapter[i].conditions[j].replace('counterlower_', ''), 10)
                    if (counter >= upperCounter) {
                      continue stepListFor
                    }
                  }
                }
              }
            }
            // if the geoloc is not requested, do not treat geoloc step
            if (stepsofChapter[i].type === 'geolocation') {
              // if advanced mode => do not treat this step
              if (this.info.quest && this.info.quest.editorMode === 'advanced') {
                geolocationFound = true
                if (!extra) {
                  extra = {}
                }
                if (!extra.geosteps) {
                  extra.geosteps = []
                }
                extra.geosteps.push(stepsofChapter[i].stepId)
                if (stepsofChapter[i].options && stepsofChapter[i].options.locations && stepsofChapter[i].options.locations.length > 0) {
                  if (!extra.locations) {
                    extra.locations = []
                  }
                  extra.locations.push({lat: stepsofChapter[i].options.locations[0].lat, lng: stepsofChapter[i].options.locations[0].lng, distance: stepsofChapter[i].options.distance})
                }
                continue stepListFor
              }
            }
            // if the marker is not requested, do not treat marker step
            if (stepsofChapter[i].type === 'locate-marker') {
              // if advanced mode => do not treat this step
              if (this.info.quest && this.info.quest.editorMode === 'advanced') {
                locationMarkerFound = true
                if (!extra) {
                  extra = {}
                }
                if (!extra.steps) {
                  extra.steps = []
                }
                extra.steps.push(stepsofChapter[i].stepId)
                continue stepListFor
              }
            }

            // treat case of the increment counter
            if (stepsofChapter[i].type === 'increment-counter') {
              // save condition done
              conditionsDone.push('counterIncrement_' + stepsofChapter[i].stepId.toString())
              conditionsDone.push('stepDone_' + stepsofChapter[i].stepId.toString())
              conditionsDone.push('stepDone' + player + '_' + stepsofChapter[i].stepId.toString())
              this.run.conditionDone = conditionsDone
              counter++

              // find if a step is triggered by counter value
              let nextStepId = await this.findStepForCounterValueOffline(this.offline.steps, questId, this.run.version, counter)

              // if no step triggered, call getnextstep again
              if (!nextStepId) {
                const secondStepProcess1 = await this.getNextOfflineStep(questId, user, markerCode, player, extra)
                nextStepId = secondStepProcess1.id
                extra = secondStepProcess1.extra
              }
              return {id: nextStepId, extra: extra}
            }

            //if (!locationMarkerFound && !geolocationFound) {
            // if step is end of chapter
            if (stepsofChapter[i].type === 'end-chapter') {
              if (stepsofChapter[i].options && stepsofChapter[i].options.resetHistory) {
                this.removeHistory()
              }
              let nextStepId

              if (stepsofChapter[i].options && stepsofChapter[i].options.resetChapterProgression) {
                this.removeAllConditionsOfAChapter(this.offline.steps, conditionsDone, stepsofChapter[i].chapterId)
              } else {
                nextStepId = await this.moveToNextChapter()
              }
              if (nextStepId !== 'end') {
                // get next step by running the process again for new chapter
                let response = await this.getNextOfflineStep(questId, markerCode, player, extra)
                nextStepId = response.id
              }
              //await this.addStepToHistory(nextStepId)
              return {id: nextStepId, extra: extra}
            } else { // if (markerCode || stepsofChapter[i].type !== 'locate-marker') { // if locate marker, do not start the step until user flash the marker
              // return step if no condition or all conditions met
              let nextStepId = stepsofChapter[i].stepId
              //await this.addStepToHistory(nextStepId)
              return {id: nextStepId, extra: extra}
            }
            //}
          }
        }
      }

      // if no next step, check if the type of the quest is simple => end quest
      if (this.info.quest && this.info.quest.editorMode === 'simple' && !locationMarkerFound) {
        let nextStepId = await this.moveToNextChapter()
        if (nextStepId !== 'end') {
          // get next step by running the process again for new chapter
          let response = await this.getNextOfflineStep(questId, markerCode, player, extra)
          nextStepId = response.id
          //await this.addStepToHistory(nextStepId)
        }
        return {id: nextStepId, extra: extra}
      }
      // if location marker step found in advance mode, return information
      if (locationMarkerFound && !geolocationFound && this.info.quest && this.info.quest.editorMode === 'advanced') {
        //if (extra.steps.length === 1) {
        //  return extra.steps[0]
        //} else {
          return {id: "locationMarker", extra: extra}
        //}
      }
      // if geolocation step found in advance mode, return information
      if (geolocationFound && this.info.quest && this.info.quest.editorMode === 'advanced') {
        if (extra.geosteps.length === 1) {
          return {id: extra.geosteps[0], extra: ""}
        } else {
          return {id: "geolocation", extra: extra}
        }
      }

      // Treat RANDOM conditions, IF NO OTHER CONDITION MATCH
      if (this.info.quest.editorMode === 'advanced' && stepsofChapter && stepsofChapter.length > 0) {
        let randomIds = []
        for (let i = 0; i < stepsofChapter.length; i++) {
          // check if the step is not already done by player AND IS A RANDOM STEP
          if (stepsofChapter[i].conditions.length > 0 && stepsofChapter[i].conditions[0].indexOf('stepRandom_') !== -1 && conditionsDone && conditionsDone.indexOf('stepDone' + player + '_' + stepsofChapter[i].stepId) === -1) {
            // check if step concerned is done
            if (stepsofChapter[i].conditions.length > 0) {
              // Get the stepID this step is depending on
              let fatherStep = stepsofChapter[i].conditions[0].replace('stepRandom_', '')
              if (conditionsDone.indexOf('stepDone' + player + '_' + fatherStep) !== -1) {
                randomIds.push(stepsofChapter[i].stepId)
              }
            }
          }
        }
        if (randomIds.length > 0) {
          return {id: randomIds[Math.floor(Math.random()*randomIds.length)], extra: extra}
        }
      }

      return {id: "", extra: extra}
    },
    /*
     * Return only steps of a chapter with a specific type
     */
    async listSpecificTypeForAChapter(steps, chapter, type) {
      var specificSteps = []
      if (steps) {
        for (var i = 0; i < steps.length; i++) {
          if (steps[i].chapterId.toString() === chapter.toString() && steps[i].type.toString() === type.toString()) {
            specificSteps.push(steps[i])
          }
        }
      }
      return specificSteps
    },
    /*
     * Return only steps of a chapter
     * @param {Array}   steps     Array of all the steps of the game
     * @param {String}  chapter   Id of the current chapter
     * @param {String}  player    Player concerned ('All', 'P1', ...). Default = 'All'
     */
    async listForAChapter(steps, chapter, player) {
      var specificSteps = []
      if (steps) {
        for (var i = 0; i < steps.length; i++) {
          if (steps[i].chapterId === chapter && (steps[i].player === 'All' || steps[i].player === player || !player)) {
            specificSteps.push(steps[i])
          }
        }
      }
      return specificSteps
    },
    /*
     * Return objects of the quest
     */
    async listWonObjects() {
      var results = []
      // get the steps with a won object
      if (this.run.conditionsDone && this.run.conditionsDone.length > 0) {
        for (var i = 0; i < this.run.conditionsDone.length; i++) {
          if (this.run.conditionsDone[i].indexOf('objectWon_') !== -1) {
            var stepWithObjectId = this.run.conditionsDone[i].replace('objectWon_', '')
            // get the object name and picture
            var step = await utils.readFile(this.questId, 'step_' + stepWithObjectId + '.json')
            if (step) {
              var stepData = JSON.parse(step)
              if (stepData.options && stepData.options.picture && stepData.options.title) {
                // get picture
                var pictureUrl
                if (stepData.options.picture.indexOf('statics') === -1) {
                  if (stepData.options.pictures && stepData.options.pictures[this.lang] && stepData.options.pictures[this.lang] !== '') {
                    pictureUrl = await utils.readBinaryFile(this.questId, stepData.options.pictures[this.lang])
                  } else {
                    pictureUrl = await utils.readBinaryFile(this.questId, stepData.options.picture)
                  }
                } else {
                  pictureUrl = stepData.options.picture
                }
                results.push({step: stepWithObjectId, picture: pictureUrl, originalPicture: stepData.options.picture, title: stepData.options.title, pictures: stepData.options.pictures, titles: stepData.options.titles})
              }
            }
          }
        }
      }
      return results
    },
    /*
     * Check if a step is already played in the run
     */
    async checkIfStepIsAlreadyPlayedInRun(stepId, player) {
      if (this.run && this.run.conditionsDone &&  this.run.conditionsDone.length > 0) {
        if (this.run.conditionsDone.indexOf('stepDone' + player + '_' + stepId) !== -1) {
          return true
        }
      }
      return false
    },
    async findStepForCounterValueOffline(steps, questId, version, counter) {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].conditions.indexOf("counter_" + counter) !== -1) {
          return steps[i].stepId
        }
      }

      return false
    },
    /*
     * Update the run conditions done
     *
     * WARNING : this function is a duplicate for server function "updateConditions" of run.js controller
     */
    updateConditions(currentConditions, stepId, isSuccess, stepType, addStepDone, player) {
      if (!stepId) {
        return currentConditions
      }
      if (typeof currentConditions === 'undefined') {
        currentConditions = []
      }
      if (currentConditions.indexOf('stepDone_' + stepId) === -1 && addStepDone) {
        currentConditions.push('stepDone_' + stepId)
      }
      if (currentConditions.indexOf('stepDone' + player + '_' + stepId) === -1 && addStepDone) {
        currentConditions.push('stepDone' + player + '_' + stepId)
      }
      /*
      if (currentConditions.indexOf('stepSuccess_' + stepId) !== -1) {
        let position = currentConditions.indexOf('stepSuccess_' + stepId)
        currentConditions.splice(position, 1)
        if (currentConditions.indexOf('stepSuccess' + player + '_' + stepId) !== -1) {
          position = currentConditions.indexOf('stepSuccess' + player + '_' + stepId)
          currentConditions.splice(position, 1)
        }
      }
      if (currentConditions.indexOf('stepFail_' + stepId) !== -1) {
        let position = currentConditions.indexOf('stepFail_' + stepId)
        currentConditions.splice(position, 1)
        if (currentConditions.indexOf('stepFail' + player + '_' + stepId) !== -1) {
          position = currentConditions.indexOf('stepFail' + player + '_' + stepId)
          currentConditions.splice(position, 1)
        }
      }*/
      const stepsWithoutSuccessTrigger = ['info-text', 'info-video', 'new-item', 'character', 'help', 'end-chapter']
      // assign success or fail status
      if (stepsWithoutSuccessTrigger.indexOf(stepType) === -1) {
        if (currentConditions.indexOf('stepFail_' + stepId) === -1 && currentConditions.indexOf('stepSuccess_' + stepId) === -1) {
          if (isSuccess) {
            currentConditions.push('stepSuccess_' + stepId)
            currentConditions.push('stepSuccess' + player + '_' + stepId)
          } else {
            currentConditions.push('stepFail_' + stepId)
            currentConditions.push('stepFail' + player + '_' + stepId)
          }
        }
      }
      return currentConditions
    },
    /*
     * Remove a step from conditions Done
     * @param   {Array}     currentConditions Current conditions array
     * @param   {String}    stepId            ID of the step
     */
    removeStepFromConditions (currentConditions, stepId) {
      if (!currentConditions) {
        return currentConditions
      }
      var itemsToRemove = []
      for (var i = 0; i < currentConditions.length; i++) {
        if (currentConditions[i].indexOf('_' + stepId) !== -1) {
          itemsToRemove.push(i)
        }
      }

      for (i = itemsToRemove.length - 1; i >= 0; i--) {
        currentConditions.splice(itemsToRemove[i], 1)
      }

      return currentConditions
    },
    /*
     * If bad answer remove previous conditions done until marker
     * @param   {Array}     currentConditions Current conditions array
     * @param   {String}    stepId          ID of the step
     */
    async removeConditionsUntilLastMarker(currentConditions, stepId, version) {
      var stepsToReset = [stepId]
      var inc = 0
      // get the list of previous steps
      stepsLoop:
      while (inc < 7) {
        // get step data
        var stepData
        var step = await utils.readFile(this.questId, 'step_' + stepId + '.json')
        if (step) {
          stepData = JSON.parse(step)
        }
        // if locate-marker => exit the while
        if (stepData.type === 'locate-marker') {
          break stepsLoop
        }
        // get next step to treat = previous step of the current step
        var stepFound = false
        if (stepData.conditions && stepData.conditions.length > 0) {
          for (var i = 0; i < stepData.conditions.length; i++) {
            if (stepData.conditions[i].indexOf('stepDone_') !== -1) {
              stepId = stepData.conditions[i].replace('stepDone_', '')
              stepsToReset.push(stepId)
              stepFound = true
            }
          }
        }
        // if the step is not found => exit without removing conditions
        if (!stepFound) {
          return {found: false, updatedCondition: currentConditions}
        }
        if (inc === 6) {
          return {found: false, updatedCondition: currentConditions}
        }
        inc++
      }

      // reset steps to have the user plays again until he find the right answer
      for (i = 0; i < stepsToReset.length; i++) {
        currentConditions = this.removeStepFromConditions(currentConditions, stepsToReset[i])
      }

      return {found: true, updatedCondition: currentConditions}
    },
    /*
     * If bad answer remove previous conditions done until marker
     * @param   {Array}     steps             All steps
     * @param   {Array}     currentConditions Current conditions array
     * @param   {String}    chapterId          ID of the chapter
     */
    async removeAllConditionsOfAChapter(steps, currentConditions, chapterId) {
      const stepsofChapter = await this.listForAChapter(steps, chapterId)
      if (stepsofChapter && stepsofChapter.length > 0) {
        for (i = 0; i < stepsofChapter.length; i++) {
          currentConditions = this.removeStepFromConditions(currentConditions, stepsofChapter[i].stepId)
        }
      }
      this.run.conditionsDone = currentConditions
    },
    /*
     * Move to the next chapter
     */
    async moveToNextChapter() {
      var nextChapter = 0
      if (this.info.quest.chapters && this.info.quest.chapters.length > 0) {
        if (this.run.currentChapter && this.run.currentChapter !== 0) {
          for (var i = 0; i < this.info.quest.chapters.length; i++) {
            if (this.info.quest.chapters[i] === this.run.currentChapter) {
              if (i < this.info.quest.chapters.length - 1) {
                nextChapter = this.info.quest.chapters[i + 1]
              } else {
                nextChapter = "end"
              }
            }
          }
        } else {
          nextChapter = this.info.quest.chapters[0]
        }
      }

      this.run.currentChapter = nextChapter
      return nextChapter
    },
    /*
     * cut sound
     */
    cutSound () {
      var audio = document.getElementById("background-music")
      if (audio) {
        if (this.sound && this.sound.status && this.sound.status === 'play') {
          audio.pause()
          this.sound.status = 'pause'
        } else {
          audio.play()
          this.sound.status = 'play'
          this.sound.tempMute = false
        }
      }
    },
    /*
     * cut audio for video or step with audio
     */
    manageAudio () {
      // audio available for current step ? (either for current language or main quest language)
      let hasAudioForCurrentStep = this.step.audioStream && ((this.step.audioStream[this.lang] && this.step.audioStream[this.lang] !== '') || (this.step.audioStream[this.info.quest.mainLanguage] && this.step.audioStream[this.info.quest.mainLanguage] !== ''))

      if (this.step.type === 'info-video' || hasAudioForCurrentStep) {
        this.cutSound()
        this.sound.tempMute = true
      } else if (this.sound.tempMute) {
        this.cutSound()
      }
    },
    swithFullscreenMode() {
      AndroidFullScreen.immersiveMode()
    },
    startFullScreen() {
      if (!this.info.quest.customization || !this.info.quest.customization.hideFullScreen) {
        document.addEventListener("deviceready", this.swithFullscreenMode, false)
      }
    },
    getStarsNumber() {
      let counter = 0
      let conditionsDone = this.run.conditionsDone
      for (let i = 0; i < conditionsDone.length; i++) {
        if (conditionsDone[i].indexOf("counterIncrement_") !== -1) {
          counter++
        }
      }
      return Math.min(counter, 12);
    },
    reloadPageInAWhile() {
      let _this = this
      setTimeout(() => { _this.moveToStep(_this.navigatingToStepId) }, 15000)
    },
    initOfflineMode() {
      let forceOnlineQuestOption = this.info.quest.customization && this.info.quest.customization.forceOnline
      let userIsAuthor = this.$store.state.user._id === this.info.quest.authorUserId
      let userIsEditor = Array.isArray(this.info.quest.editorsUserId) && this.info.quest.editorsUserId.includes(this.$store.state.user._id)
      
      this.offline.active = !(this.isMultiplayer || forceOnlineQuestOption || !this.isHybrid || userIsAuthor || userIsEditor || this.$store.state.user.isAdmin)
    },
    async changeLanguage(lang) {
      let modifications = {
        language: lang
      }
      let modificationStatus = await AuthService.modifyAccount(modifications)
      this.$i18n.locale = lang
      if (lang === 'fr') {
        this.$router.push('/quest/play/61767ce84a4f2c2276fed543')
      } else {
        this.$router.push('/quest/play/61f178fb16bdb825f1e99cb7')
      }
    }
    /*showNotif() {
      this.$q.notify({
        message: `Vous avez ${this.$store.state.chatNotification === 1? 'un nouveau message' : this.$store.state.chatNotification + ' nouveaux messages'}`,
        icon: 'chat',
        position: 'top',
        timeout: 5000,
        actions: [
          { label: 'Voir', color: 'white', handler: () => { this.chat.isOpened = true } }
        ]
      })
    }*/
  },
  computed: {
    chatNotification () {
      return this.$store.state.chatNotification
    }
  },
  watch: {
    /*chatNotification () {
      if (!chat.isOpened) {
        if (this.$store.state.chatNotification !== 0) {
          this.showNotif()
        }
      }
    }*/
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

  .choose .text {
    background: transparent;
    color: #fff;
  }

  .text-secondary {
    color: #f6cf46 !important;
  }
  .bg-secondary {
    background-color: #f6cf46 !important;
  }
  .bg-secondary.q-badge {
    color: #263e7f !important;
  }

</style>
<style>
  .bg-primary {
    background-color: rgb(86, 156, 210) !important;
  }

  .choose .text, .code .text, .write-text .text, .find-item .text, .puzzle .text {
    background: transparent;
    color: #fff;
    margin: 15px 20px 0 20px;
    padding: 0px;
  }
  .find-item {
    background-color: #263e7f;
  }
  .fit .memory .card {
    background-image: url(../../../../../statics/customers/conseil-europe/images/card-back.png);
  }
  .choose .images-block img {
    border-radius: 0;
  }
  .bg-graaly-blue-dark {
    background-color: #6aaee4;
  }
  .text {
    border-radius: 0px !important;
  }
  .find-item {
    height: 100%;
  }
  .q-notification__message {
    font-family: Arial;
    font-weight: normal;
    font-size: 1.4em;
  }
  .code .q-btn, .write-text .q-btn {
    background-color: #90C95e !important;
    box-shadow: 0px 0.1rem 0.4rem 0.2rem rgb(255 255 255 / 10%) !important;
  }
  .q-loading svg {
    background: url(/statics/customers/conseil-europe/images/spinner.gif) no-repeat;
  }
</style>
