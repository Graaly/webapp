<template>
  <div>
    
    <div class="centered bg-warning q-pa-sm" v-if="warnings.stepDataMissing" @click="initData()">
      <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
    </div>
    <div class="bg-accent text-white q-pa-md" v-if="warnings.isNetworkLow">{{ $t('label.WarningLowNetwork') }}</div>
    <div v-if="startDate.enabled" class="centered q-pa-lg">
      <img :src="getLogoImage()" v-if="info.quest.customization && info.quest.customization.logo && info.quest.customization.logo !== ''" />
      <img src="statics/icons/app-logo/icon-96x96.png" v-if="!info.quest.customization || !info.quest.customization.logo || info.quest.customization.logo === ''" />
      <div class="text-h6">{{ $t('label.ThisStepIsAvailableIn') }}</div>
      <div class="text-h5">{{ $t('label.TimeRemainingHoursMin', {day: startDate.remainingDays, hour: startDate.remainingHours, min: startDate.remainingMinutes, sec: startDate.remainingSeconds}) }}</div>
    </div>
    
    <stepPlay 
      :step="step" 
      :runId="run._id" 
      :itemUsed="selectedItem" 
      :reload="loadStepData" 
      :lang="lang" 
      :customization="info.quest.customization ? info.quest.customization : {color: 'primary'}" 
      :answer="offline.answer" 
      @played="trackStepPlayed" 
      @success="trackStepSuccess" 
      @fail="trackStepFail" 
      @pass="trackStepPass"
      @msg="trackMessage">
    </stepPlay>
      
    <!------------------ INVENTORY PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div v-show="inventory.isOpened" class="bg-graaly-blue-dark text-white inventory panel-bottom">
        <div class="q-pa-md">
          <a class="float-right no-underline" color="grey" @click="inventory.isOpened = false"><q-icon name="close" class="subtitle3" /></a>
          <div class="subtitle3 q-pb-lg">{{ $t('label.Inventory') }}</div>
          <div class="centered bg-warning q-pa-sm" v-if="warnings.inventoryMissing" @click="fillInventory()">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <p class="subtitle5" v-if="inventory.items.length > 0 && !warnings.inventoryMissing && this.step.type === 'use-item'">{{ $t('label.InventoryUsage') }}</p>
          <p class="subtitle5" v-if="inventory.items.length > 0 && !warnings.inventoryMissing && this.step.type !== 'use-item'">{{ $t('label.InventoryZoom') }}</p>
          <p v-if="inventory.items.length === 0">{{ $t('label.noItemInInventory') }}</p>
          <div class="inventory-items">
            <div v-for="(item, key) in inventory.items" :key="key" @click="selectItem(item)">
              <img :src="((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.picture : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + item.picture)" />
              <p>{{ item.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <q-dialog maximized v-model="inventory.detail.isOpened">
      <div class="bg-white centered">
        <img style="width: 100%" :src="inventory.detail.url">
        <div class="q-pa-md">{{ inventory.detail.title }}</div>
        <div class="q-pa-md text-grey">{{ $t('label.YouCanNotUseAnItemInThisStep') }}</div>
        <q-btn class="glossy normal-button" color="primary" @click="closeInventoryDetail()"><div>{{ $t('label.Close') }}</div></q-btn>
      </div>
    </q-dialog>
    
    <!------------------ INFO PAGE AREA ------------------------>
    
    <transition name="slideInBottom">
      <div v-show="info.isOpened">
        <div class="centered bg-warning q-pa-sm" v-if="warnings.questDataMissing" @click="getQuest(questId)">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
        <div v-if="!warnings.questDataMissing" class="panel-bottom no-padding" :style="'background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat '">
          <div class="text-center dark-banner q-pb-xl q-pt-md fixed-bottom">
            <p class="title">{{ (info.quest && info.quest.title) ? info.quest.title : $t('label.NoTitle') }}</p>
            <!--<q-linear-progress :percentage="this.step.number * 100 / info.stepsNumber" stripe animate height="30px" color="primary"></q-linear-progress>-->
            <!--<p class="q-pa-md score-text" v-show="info && !offline.active && (!info.quest.customization || !info.quest.customization.removeScoring)">{{ $t('label.CurrentScore') }}: {{ info.score }} <!--<q-icon color="white" name="fas fa-trophy" />--</p>-->
            <p>
              <q-btn class="glossy large-button" :color="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? '' : 'primary'" :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''" @click="backToMap"><span>{{ $t('label.LeaveQuest') }}</span></q-btn>
            </p>
            <p>
              <q-btn class="glossy large-button" :color="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? '' : 'primary'" :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''" v-if="!offline.active" @click="showFeedback"><span>{{ $t('label.Feedback') }}</span></q-btn>
            </p>
            <p class="q-pb-xl">
              <q-btn class="glossy large-button" color="secondary" @click="openInfo"><span>{{ $t('label.BackToQuest') }}</span></q-btn>
            </p>
            <p class="q-pb-lg">
            </p>
          </div>
        </div>
      </div>
    </transition>
    
    <!--====================== HINT =================================-->
    
    <div class="fixed-bottom over-map" v-if="hint.isOpened">
      <story step="hint" :data="{hint: hint.label, character: (info.quest.customization && info.quest.customization.character && info.quest.customization.character !== '') ? (info.quest.customization.character.indexOf('blob:') === -1 ? serverUrl + '/upload/quest/' + info.quest.customization.character : info.quest.customization.character) : '3'}" @next="askForHint()"></story>
    </div>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
    
    <!--====================== FEEDBACK =================================-->
    
    <q-dialog v-model="feedback.isOpened">
      <div class="bg-white q-pa-md">
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
    
    <div v-show="footer.show" class="step-menu fixed-bottom">
      <!--<q-linear-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-linear-progress>-->
      <div class="row white-buttons">
        <div class="col centered q-pb-md">
          <q-btn 
            round 
            size="lg" 
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            icon="menu" 
            :class="{'bg-secondary': (info.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')), 'bg-primary': (!info.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === ''))}" 
            @click="openInfo()"
            v-if="!info.quest.customization || !info.quest.customization.logo || info.quest.customization.logo === ''"
          />
          <q-btn
            round
            size="lg"
            class="bg-white"
            @click="openInfo()"
            v-if="info.quest.customization && info.quest.customization.logo && info.quest.customization.logo !== ''" >
            <q-avatar size="60px">
              <img :src="getLogoImage()" />
            </q-avatar>
          </q-btn>
        </div>
        <div class="col centered q-pb-md">
          <q-btn 
            round 
            size="lg" 
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            icon="work" 
            :class="{'flashing': inventory.suggest, 'bg-secondary': inventory.isOpened, 'bg-primary': (!inventory.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === ''))}" 
            @click="openInventory()" 
          />  
            <!--v-show="inventory.show" 
          />-->
        </div>
        <div class="col centered q-pb-md">
          <q-btn 
            round 
            size="lg" 
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            icon="lightbulb" 
            :class="{'flashing': hint.suggest, 'bg-secondary': (hint.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')), 'bg-primary': (!hint.isOpened && (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === ''))}" 
            @click="askForHint()" 
            v-show="hint.show" 
          >
            <q-badge v-if="this.step && this.step.hint" color="secondary" floating>{{ this.step.hint.length }}</q-badge>
          </q-btn>
        </div>
        <div class="col centered q-pb-md">
          <q-btn 
            round 
            size="lg" 
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            :class="{'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}" 
            icon="arrow_back" 
            v-show="previousStepId !== ''" 
            @click="previousStep()"
          />
        </div>
        <div class="col centered q-pb-md">
          <q-btn 
            round 
            size="lg" 
            :style="(info.quest.customization && info.quest.customization.color && info.quest.customization.color !== '') ? 'background-color: ' + info.quest.customization.color : ''"
            :class="{'flashing': next.suggest, 'bg-primary': (!info.quest.customization || !info.quest.customization.color || info.quest.customization.color === '')}" 
            icon="arrow_forward" 
            v-show="next.enabled || next.canPass" 
            @click="nextStep()" 
          />
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
import UserService from 'services/UserService'
//import colorsForCode from 'data/colorsForCode.json'
//import questItems from 'data/questItems.json'
import stepPlay from 'components/quest/game/stepPlay'
import Notification from 'boot/NotifyHelper'
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
    this.keepScreenAwake()
    // hide status bar on Android
    if (this.isHybrid && cordova.platformId === 'android') {
      StatusBar.show()
    }
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
            url: ''
          }
        },
        hint: {
          isOpened: false,
          label: "",
          suggest: false,
          show: false,
          used: false
        },
        info: {
          isOpened: false,
          score: 0,
          quest: {}
        },
        next: {
          suggest: false,
          enabled: false,
          canPass: false
        },
        questId: this.$route.params.questId,
        questVersion: this.$route.params.version,
        step: {},
        story: {
          step: null,
          data: null
        },
        loadStepData: false,
        run: {},
        isRunFinished: false,
        remotePlay: false,
        //cameraStreamEnabled: false,
        isHybrid: window.cordova,
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        controlsAreDisplayed: false,
        lang: this.$route.params.lang,
        offline: {
          active: false,
          answer: null
        },
        warnings: {
          inventoryMissing: false,
          questDataMissing: false,
          stepDataMissing: false,
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
        
        // for step type 'use-item'
        selectedItem: null
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
      this.selectedItem = defaultVars.selectItem
      this.loadStepData = defaultVars.loadStepData
    },
    /*
     * Init step data
     */
    async initData () {
      this.$q.loading.show()
      // get quest information
      //await this.getQuest(this.questId) // remove await to speed up loading
      this.getQuest(this.questId)
      
      this.loadStepData = false

      // get current run or create it
      //await this.getRun() // on sync mode to load step while run is checked
      await this.getRun()
      
      // get current step
      await this.getStep()
      
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
    },
    /*
     * Get the current run or create it
     *
     * The process try to get the run from server, but if not accessable or older than the offline version, 
     * the offline run is used
     */
    async getRun() {
      this.$q.loading.show()
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.questId, null, this.lang)
      
      var currentChapter = 0
      var remotePlay = this.$route.query.hasOwnProperty('remoteplay') ? this.$route.query.remoteplay : false
      
      // check if a run is created on offline mode
      const isRunOfflineLoaded = await this.checkIfRunIsAlreadyLoaded(this.questId)
      if (isRunOfflineLoaded) {
        // read the run
        var offlineRun = await this.loadOfflineRun(this.questId)
      }
      
      // check if run is accessable from server
      if (runs && runs.data) {
        this.offline.active = false
      
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress') {
            this.run = runs.data[i]
            
            currentChapter = runs.data[i].currentChapter
            
            // update the offline run or the online depending on the last updated
            if (isRunOfflineLoaded) {
              if (offlineRun.dateUpdated > this.run.dateUpdated) {
                const tempId = this.run._id
                this.run = offlineRun
                // fix when id is not set
                if (!this.run._id) {
                  this.run._id = tempId
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
        if (currentChapter === 0) {
          // no 'in-progress' run => create run for current player & current quest
          let res = await RunService.init(this.questId, this.questVersion, this.$route.params.lang, remotePlay)
          if (res.status === 200 && res.data && res.data._id) {
            if (isRunOfflineLoaded) {
              // if a offline run already exists
              this.run = offlineRun
              this.run._id = res.data._id
              await RunService.updateFromOffline(this.run)
            } else {
              this.run = res.data
            }
          } else {
            this.$q.dialog({
              title: this.$t('label.TechnicalProblem'),
              message: this.$t('label.TechnicalProblemNetworkIssue')
            }).onOk(() => {
              this.$router.push('/quest/play/' + this.questId)
            })
          }
          // set current score
          this.info.score = 0
        } else {
          // get current score
          this.info.score = this.run.tempScore
        }
      } else {
        this.offline.active = true
        
        // if the run is not accessable, read the offline one
        if (isRunOfflineLoaded) {
          if (offlineRun) {
            this.run = offlineRun
            // get current score
            this.info.score = this.run.tempScore
            // set chapter
            currentChapter = this.run.currentChapter
          }
        } else {
          // if first step => init run
          await this.updateOfflineRun(this.questId)
          /*this.$q.dialog({
            title: this.$t('label.TechnicalProblem'),
            message: this.$t('label.TechnicalProblemNetworkIssue')
          }).onOk(() => {
            this.$router.push('/quest/play/' + this.quest.questId)
          })*/
        }
      }
      
      this.$q.loading.hide()
      
      // init the offline run
      if (currentChapter === 0) {
        await this.updateOfflineRun(this.questId)
      }
    },
    /*
     * Get the step data
     */
    async getStep (forceNetworkLoading) {
      this.warnings.stepDataMissing = false   
      var stepId
      // if no stepId given, load the next one
      if (this.$route.params.stepId && this.$route.params.stepId !== '0' && this.$route.params.stepId.indexOf('success_') === -1 && this.$route.params.stepId.indexOf('pass_') === -1) {
        stepId = this.$route.params.stepId
      } else {
        var response
        if (!this.offline.active) {
          response = await RunService.getNextStep(this.questId)
          
          if (response && response.status !== 200) {
            if (response.data.message === "app_quest_data_is_obsolete") {
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
            return false
          }
        }
        
        if (response && response.data && response.status === 200) {
          // check if a step is triggered
          if (response.data.next) {
            stepId = response.data.next
          } else {
            // if no step is triggered, display the markers sensor
            this.step = {
              id: "sensor"
            }
            return false
          }
        } else {
          // use offline content
          stepId = await this.getNextOfflineStep(this.questId)
          if (!stepId) {
            // if no step is triggered, display the markers sensor
            this.step = {
              id: "sensor"
            }
            return false
          }
        }
      }
      
      if (stepId === 'end') {
        return this.$router.push('/quest/' + this.questId + '/end')
      }

      // check if the quest data are not already saved on device
      let isStepOfflineLoaded = await this.checkIfStepIsAlreadyLoaded(stepId)
      
      if (!isStepOfflineLoaded || forceNetworkLoading) {
        const response2 = await StepService.getById(stepId, this.questVersion, this.lang)
        if (response2 && response2.data && response2.status === 200) {
          if (response2.data && response2.data.message) {
            if (response2.data.message === 'Step not yet available') {
              this.showStepBlockedMessage(response2.data.startDate)
            }
          } else {
            this.step = response2.data
            this.step.id = this.step.stepId
            // get previous button redirect
            this.getPreviousStep()
          }
        } else {
          this.warnings.stepDataMissing = true
          return false
        }
      } else {
        // get quest data from device storage
        const step = await utils.readFile(this.questId, 'step_' + stepId + '.json')

        if (!step) {
          if (forceNetworkLoading) {
            this.warnings.questDataMissing = true 
          } else {
            var stepLoadingStatus = await this.getStep(true)
            return stepLoadingStatus
          }
        } else {
          var tempStep = JSON.parse(step)
          
          const stepAccess = this.offlineCheckAccess(step)
          if (stepAccess && stepAccess.message) {
            if (stepAccessMessage === 'Step not yet available') {
              this.showStepBlockedMessage(stepAccess.startDate)
            }
          }
          
          // get offline media
          if (tempStep.backgroundImage) {
            const pictureUrl = await utils.readBinaryFile(this.questId, tempStep.backgroundImage)
            if (pictureUrl) {
              tempStep.backgroundImage = pictureUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.videoStream && tempStep.videoStream !== '') {
            const videoUrl = await utils.readBinaryFile(this.questId, tempStep.videoStream)
            if (videoUrl) {
              tempStep.videoStream = videoUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }

          if (tempStep.type === 'image-recognition' && tempStep.answers && tempStep.answers !== '') {
            const imageRecognitionUrl = await utils.readBinaryFile(this.questId, tempStep.answers)
            if (imageRecognitionUrl) {
              tempStep.answers = imageRecognitionUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.type === 'choose' && tempStep.options) {
            for (var k = 0; k < tempStep.options.length; k++) {
              if (tempStep.options[k].imagePath) {
                var chooseImageUrl = await utils.readBinaryFile(this.questId, tempStep.options[k].imagePath)
                if (chooseImageUrl) {
                  tempStep.options[k].imagePath = chooseImageUrl
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
          if (tempStep.type === 'jigsaw-puzzle' && tempStep.options && tempStep.options.picture && tempStep.options.picture !== '') {
            const jigsawPictureUrl = await utils.readBinaryFile(this.questId, tempStep.options.picture)
            if (jigsawPictureUrl) {
              tempStep.options.picture = jigsawPictureUrl
            } else {
              this.warnings.stepDataMissing = true
            }
          }
          if (tempStep.type === 'new-item' && tempStep.options && tempStep.options.picture && tempStep.options.picture !== '') {
            const itemImageUrl = await utils.readBinaryFile(this.questId, tempStep.options.picture)
            if (itemImageUrl) {
              tempStep.options.picture = itemImageUrl
            }
          }
          if (tempStep.type === 'character' && tempStep.options && tempStep.options.character && tempStep.options.character !== '') {
            const characterPictureUrl = await utils.readBinaryFile(this.questId, tempStep.options.character)
            if (characterPictureUrl) {
              tempStep.options.character = characterPictureUrl
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
    async trackStepSuccess (score, offline, showResult) {
      if (showResult) {
        // add step score to general score
        this.info.score += score
      }
      
      // hide hint
      this.hideHint()
      
      // save offline run
      await this.saveOfflineAnswer(true)
    },
    /*
     * Track step played
     */
    async trackStepPlayed (returnData, offline) {
      if (this.step.id === 'sensor') {
        await this.getMarkerStep(returnData)
      } else {
        this.next.enabled = true
        if (this.step.type !== 'image-over-flow') {
          this.next.suggest = true
        }
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
      if ((!this.step.canPass && this.step.canPass !== false) || this.step.canPass === true) {
        this.next.canPass = true
      }
    },
    /*
     * Track step fail
     */
    async trackStepFail (offline, showResult) {
      this.hideHint()
        
      // save offline run
      await this.saveOfflineAnswer(false)
    },
    /*
     * Track message sent 
     */
    async trackMessage (message) {
      if (message === 'suggestInventory') {
        this.inventory.suggest = true
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
        response = await RunService.getMarkerNextStep(this.questId, answer)
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
        next = await this.getNextOfflineStep(this.questId, answer)
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
          this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + next + '/' + this.$route.params.lang)
          //this.stopMarkersSensors()
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
      if (this.info.quest.picture && this.info.quest.picture[0] === '_') {
        return 'statics/images/quest/' + this.info.quest.picture
      } else if (this.info.quest.picture && this.info.quest.picture.indexOf('blob:') !== -1) {
        return this.info.quest.picture
      } else if (this.info.quest.picture) {
        return this.serverUrl + '/upload/quest/' + this.info.quest.picture
      } else {
        return 'statics/images/quest/default-quest-picture.png'
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
     * Move to next step
     */
    async nextStep() {
      // reload step to remove notifications
      this.loadStepData = false
      this.$q.loading.show()
      
      if (this.next.enabled) {
        /*utils.clearAllRunningProcesses()
        this.resetData()
        await this.initData()
        */
        await this.moveToNextStep('success')
        this.$q.loading.hide()
      } else if (this.next.canPass) {
        this.$q.loading.hide()
        this.$q.dialog({
          message: this.$t('label.ConfirmPass'),
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).onOk(async () => {          
          if (!this.offline.active) {
            await RunService.passStep(this.run._id, this.step.id)
          }
          
          //if (!passSuccess) {
            // offline treatment
          await this.passOfflineStep(this.step.id)
          //}
          
          // TODO: manage if pass failed
          await this.moveToNextStep('pass')
        }).onCancel(() => {})
      }
    },
    /*
     * Move to next step
     */
    async moveToNextStep(type) {
      // sync offline run
      await this.saveOfflineRun(this.questId, this.run)
    
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
      
      this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + type + '_' + this.step.stepId + '_' + utils.randomId() + '/' + this.$route.params.lang)
    },
    /*
     * Return to previous step
     */
    async previousStep() {
      if (this.previousStepId !== '') {
        if (this.offline.active) {
          this.run.historyIndex--
          if (this.run.historyIndex < 1) {
            this.run.historyIndex = 1
          } else if (this.run.historyIndex > this.run.history.length) {
            this.run.historyIndex = this.run.history.length
          }
          await this.saveOfflineRun(this.questId, this.run)
        } else {
          await RunService.setHistoryOneStepBack(this.run._id)
        }
        this.$router.push('/quest/play/' + this.questId + '/version/' + this.questVersion + '/step/' + this.previousStepId + '/' + this.$route.params.lang)
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
          }).onOk(async () => {
            await this.getHint()
          })
        }
      }
    },
    /*
     * Get the hint and display
     */
    async getHint() {
      var hintLabel 
      if (!this.offline.active) {
        hintLabel = await RunService.getHint(this.run._id, this.step.stepId, this.run.version)
      }

      if (hintLabel && hintLabel.hint) {
        this.hint.label = hintLabel.hint
      } else {
        this.hint.label = this.step.hint
      }
      this.hint.used = true
      this.closeAllPanels()
      this.hint.isOpened = true
      this.footer.tabSelected = 'hint'
    },
    closeAllPanels() {
      this.inventory.isOpened = false
      this.info.isOpened = false
      this.hint.isOpened = false
      this.footer.tabSelected = 'none'
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
      this.$q.loading.show()
      var response
      if (!this.offline.active) {
        response = await RunService.listWonObjects(this.questId, this.run._id)
      }
      
      if (response && response.data) {
        this.inventory.items = response.data
        // to have it compliant with offline mode :
        this.inventory.items.originalPicture = this.inventory.items.picture
      } else {
        let offlineInventory = await this.listWonObjects()
        if (offlineInventory) {
          this.inventory.items = offlineInventory
        } else {
          this.warnings.inventoryMissing = true
        }
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
      return this.$router.push('/home')
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
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    async getQuest(id, forceNetworkLoading) {
      this.warnings.questDataMissing = false

      // check if the quest data are not already saved on device
      let isQuestOfflineLoaded = await QuestService.isCached(id)
      
      if (!isQuestOfflineLoaded || forceNetworkLoading) {
        let response = await QuestService.getLastById(id)
        if (response && response.data) {
          this.info.quest = response.data
        } else {
          this.warnings.questDataMissing = true
        }
      } else {
        // get quest data from device storage
        const quest = await utils.readFile(id, 'quest_' + id + '.json')

        if (!quest) {
          if (forceNetworkLoading) {
            this.warnings.questDataMissing = true
          } else {
            var questLoadingStatus = await this.getQuest(id, true)
            return questLoadingStatus
          }
        } else {
          this.info.quest = JSON.parse(quest)

          const pictureUrl = await utils.readBinaryFile(id, this.info.quest.picture)
          if (pictureUrl) {
            this.info.quest.picture = pictureUrl
          } else {
            this.info.quest.picture = '_default-quest-picture.png'
          }
          // get customized logo
          if (this.info.quest.customization && this.info.quest.customization.logo && this.info.quest.customization.logo !== '') {
            const logoUrl = await utils.readBinaryFile(id, this.info.quest.customization.logo)
            if (logoUrl) {
              this.info.quest.customization.logo = logoUrl
            }
          }
          // get customized hint character
          if (this.info.quest.customization && this.info.quest.customization.character && this.info.quest.customization.character !== '') {
            const characterUrl = await utils.readBinaryFile(id, this.info.quest.customization.character)
            if (characterUrl) {
              this.info.quest.customization.character = characterUrl
            }
          }
        }
      }
    },
    /*
     * count number of steps in a quest
     * @param   {string}    id             Quest ID
     *
    async countStepsNumber(id) {
      let response = await StepService.countForAQuest(id, this.run.version)
      this.info.stepsNumber = (response && response.data && response.data.count) ? response.data.count : 1
    },*/
    /*
     * Select an item in the inventory
     * @param   {object}    item            Item selected
     */
    selectItem(item) {
      if (this.step.type !== 'use-item') {
        this.inventory.detail.isOpened = true
        this.inventory.detail.url = (item.picture.indexOf('statics/') > -1 ? item.picture : this.serverUrl + '/upload/quest/' + this.questId + '/step/new-item/' + item.picture)
        this.inventory.detail.title = item.title
      } else {
        this.selectedItem = item
        this.closeAllPanels()
      }
    },
    closeInventoryDetail() {
      this.inventory.detail.isOpened = false
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
      // console.log("ishindavaibles")
      if (this.step && this.step.hint && this.step.hint !== '' && this.step.hint.length > 0) {
      // console.log("hint is available")
        return true
      } else {
      // console.log("hint is not available")
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
      if (this.run && this.run.questId) {
        // init the offline file with the server one
      } else {
        this.run = {
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
      await this.saveOfflineRun(questId, this.run)
    },
    /*
     * save the offline answer for a run
     */
    async saveOfflineAnswer(success) {
      // check if user has already played this step in current run
      var stepAlreadyPlayed = await this.checkIfStepIsAlreadyPlayedInRun(this.step.stepId)
       
      // add conditions
      var conditions = this.run.conditionsDone

      var ended = false
      var score = 0
      var stepStatus
      var removedStatus
      if (success) {
        // if answer is not displayed => player must be able to play again the step and the step before
        if (this.step.displayRightAnswer === false) {
          removedStatus = await this.removeConditionsUntilLastMarker(conditions, this.step.stepId, this.run.version)
          if (removedStatus.found) {
            conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, false)
          } else {
            conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, true)
          }
        } else {
          conditions = this.updateConditions(conditions, this.step.stepId, true, this.step.type, true)
        }
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
        if (this.step.displayRightAnswer === false) {
          removedStatus = await this.removeConditionsUntilLastMarker(conditions, this.step.stepId, this.run.version)
          if (removedStatus.found) {
            conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, false)
          } else {
            conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, true)
          }
        } else {
          conditions = this.updateConditions(conditions, this.step.stepId, false, this.step.type, true)
        }
      }
      
      // compute nb points
      var answer = {stepId: this.step.stepId, stepNumber: this.step.number, nbTry: 1, ended: ended, score: score, reward: 0, status: stepStatus, useHint: false, date: new Date(), online: false} 
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
      
      let updateAnswer = await this.saveOfflineRun(this.questId, this.run)
     
      if (updateAnswer) {
        return true
      }
      return false
    },
    /*
     * init the run offline file
     */
    async passOfflineStep(stepId) {
      this.run.conditionsDone = this.updateConditions(this.run.conditionsDone, stepId, false, this.step.type, true)
      //this.run.conditionsDone.push('stepFail_' + stepId)
      await this.saveOfflineRun(this.questId, this.run)
    },
    /*
     * Check if user has access to the step
     */
    async offlineCheckAccess(step) {
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
    async saveOfflineRun(questId, run) {
      run.dateUpdated = new Date()
      let status = await utils.writeInFile(this.questId, 'run_' + questId + '.json', JSON.stringify(run), true)
      if (status) {
        return true
      } else {
        return false
      }
    },
    /**
     * Adds step with <StepId> to run object <run> history and saves it to offline file
     * /!\ WARNING /!\ copied & adapted from server side file controller/run.js to handle online mode
     * @param {String} stepId 
     */
    async addStepToHistory (stepId) {
      this.run.history.push(stepId)
      this.run.historyIndex = this.run.history.length
      await this.saveOfflineRun(this.questId, this.run)
    },
    /*
     * Get the next offline step
     * /!\ WARNING /!\ copied & adapted from server side file controller/run.js to handle online mode
     */
    async getNextOfflineStep(questId, markerCode) {
      var steps = []
      
      // check if user is currently navigating in quest history
      await this.updateOfflineRun(questId)
      if (this.run.historyIndex < this.run.history.length) {
        this.run.historyIndex++
        await this.saveOfflineRun(questId, this.run)
        return this.run.history[this.run.historyIndex - 1]
      }
      
      // read all steps
      for (var i = 0; i < this.info.quest.steps.length; i++) {
        let step = await utils.readFile(questId, 'step_' + this.info.quest.steps[i] + '.json')
        steps.push(JSON.parse(step))
      }
      
      // get current chapter
      var chapter = this.run.currentChapter
      if (!chapter) {
        if (this.info.quest.chapters.length > 0) {
          chapter = this.info.quest.chapters[0]
        } else {
          return false
        }
      }

      if (markerCode) {
        // list the marker steps for the chapter
        // TODO: get only the locate-marker for answers = marker
        var markersSteps = await this.listSpecificTypeForAChapter(steps, chapter, 'locate-marker')
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
              if (markersSteps[i].conditions.length > 0) {
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
          return false
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
          await this.saveOfflineAnswer('success')
        } else {
          // set the marker step as done to pass to next step
          var conditionsDone = this.run.conditionsDone
          conditionsDone.push('stepDone_' + stepId.toString())

          // update run
          this.run.conditionDone = conditionsDone
          this.run.currentStep = stepId
        }
      }
      
      // list the steps for the chapter
      var stepsofChapter = await this.listForAChapter(steps, chapter)
      var locationMarkerFound = false
      if (stepsofChapter && stepsofChapter.length > 0) {
        stepListFor: 
        for (i = 0; i < stepsofChapter.length; i++) {
          // check if the step is not already done
          if (this.run.conditionsDone && this.run.conditionsDone.indexOf('stepDone_' + stepsofChapter[i].stepId) === -1) {
            if (stepsofChapter[i].conditions.length > 0) {
              for (j = 0; j < stepsofChapter[i].conditions.length; j++) {
                // if one of the conditions of the step i not ok, continue with next step
                if (this.run.conditionsDone.indexOf(stepsofChapter[i].conditions[j]) === -1) {
                  continue stepListFor
                }
              }
            }
            // if the marker is not requested, do not treat marker step
            if (stepsofChapter[i].type === 'locate-marker') {
              // if advanced mode => do not treat this step
              if (this.info.quest && this.info.quest.editorMode === 'advanced') {
                locationMarkerFound = true
                continue stepListFor
              }
            }
            // if step is end of chapter 
            if (stepsofChapter[i].type === 'end-chapter') {
              let nextStepId = await this.moveToNextChapter()
              
              if (nextStepId !== 'end') {
                // get next step by running the process again for new chapter
                nextStepId = await this.getNextOfflineStep(questId, markerCode)
              }
              await this.addStepToHistory(nextStepId)
              return nextStepId
            } else { // if (markerCode || stepsofChapter[i].type !== 'locate-marker') { // if locate marker, do not start the step until user flash the marker
              // return step if no condition or all conditions met
              let nextStepId = stepsofChapter[i].stepId
              await this.addStepToHistory(nextStepId)
              return nextStepId
            }
          }
        }
      }
      
      // if no next step, check if the type of the quest is simple => end quest
      if (this.info.quest && this.info.quest.editorMode === 'simple' && !locationMarkerFound) {
        let nextStepId = await this.moveToNextChapter()

        if (nextStepId !== 'end') {
          // get next step by running the process again for new chapter
          nextStepId = await this.getNextOfflineStep(questId, markerCode)
          await this.addStepToHistory(nextStepId)
        }
        return nextStepId
      }
      
      return false
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
     */
    async listForAChapter(steps, chapter) {
      var specificSteps = []
      if (steps) {
        for (var i = 0; i < steps.length; i++) {
          if (steps[i].chapterId === chapter) {
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
                  pictureUrl = await utils.readBinaryFile(this.questId, stepData.options.picture)
                } else {
                  pictureUrl = stepData.options.picture
                }

                results.push({step: stepWithObjectId, picture: pictureUrl, originalPicture: stepData.options.picture, title: stepData.options.title})
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
    async checkIfStepIsAlreadyPlayedInRun(stepId) {
      if (this.run && this.run.conditionsDone &&  this.run.conditionsDone.length > 0) {
        if (this.run.conditionsDone.indexOf('stepDone_' + stepId) !== -1) {
          return true
        }
      }
      return false
    },
    /*
     * Update the run conditions done
     *
     * WARNING : this function is a duplicate for server function "updateConditions" of run.js controller
     */
    updateConditions(currentConditions, stepId, isSuccess, stepType, addStepDone) {
      if (currentConditions.indexOf('stepDone_' + stepId) === -1 && addStepDone) {
        currentConditions.push('stepDone_' + stepId)
      }
      if (currentConditions.indexOf('stepSuccess_' + stepId) !== -1) {
        let position = currentConditions.indexOf('stepSuccess_' + stepId)
        currentConditions.splice(position, 1)
      }
      if (currentConditions.indexOf('stepFail_' + stepId) !== -1) {
        let position = currentConditions.indexOf('stepFail_' + stepId)
        currentConditions.splice(position, 1)
      }
      const stepsWithoutSuccessTrigger = ['info-text', 'info-video', 'new-item', 'character', 'end-chapter']
      // assign success or fail status
      if (stepsWithoutSuccessTrigger.indexOf(stepType) === -1) {
        if (isSuccess) {
          currentConditions.push('stepSuccess_' + stepId)
        } else {
          currentConditions.push('stepFail_' + stepId)
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
