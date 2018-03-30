<template>
  
  <div>
  
    <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video'">
      <div id="info-clickable" :class="{ grow: !step.videoStream }">
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="video" v-if="step.videoStream">
        <video class="full-width" controls controlsList="nodownload" autoplay>
          <source :src="serverUrl + '/upload/quest/' + questId + '/step/video/' + step.videoStream" type="video/mp4" />
        </video>
      </div>
      <audio controls controlsList="nodownload" autoplay v-if="step.audioStream" class="full-width">
        <source :src="step.audioStream" type="audio/mpeg" />
      </audio>
      <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
    </div>
    
    
    <div class="choose" v-if="step.type == 'choose'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="answers-text" v-if="answerType === 'text'">
        <q-btn v-for="(answer, key) in step.answers" :key="key" class="full-width" :class="answer.class" :icon="answer.icon" @click="checkAnswer(key)" :disabled="playerResult !== null">
          {{ answer.text }}
        </q-btn>
      </div>
      <div class="answers-images" v-if="answerType === 'image'">
        <div class="images-block">
          <div v-for="(answer, key) in step.answers" :key="key" :class="answer.class" @click="checkAnswer(key)">
            <img :src="serverUrl + '/upload/quest/' + questId + '/step/choose-image/' + answer.imagePath" :class="answer.class" />
            <q-btn v-if="answer.class !== null" round :class="answer.class" :icon="answer.icon" disable />
          </div>
        </div>
      </div>
      <div class="actions fixed-bottom row" v-show="playerResult === null">
        <q-btn v-show="step.hint" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">{{ $t('message.DisplayAHint') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
        <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('message.GoodAnswer') : $t('message.WrongAnswer') }}<span v-if="playerResult && !isRunFinished"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    <div class="code" v-if="step.type == 'code-keypad'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="typed-code">
        <table class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">
        <tr>
          <td v-for="(sign, key) in playerCode" :class="{ typed: sign !== '' }">{{ sign == '' ? '?' : sign }}</td>
        </tr>
        </table>
      </div>
      <div class="keypad">
        <div class="keypadLine">
          <div v-for="(keypadLine, rowKey) in keypad" :key="rowKey">
            <q-btn v-for="(keypadButton, btnKey) in keypadLine" :key="btnKey" color="grey" glossy @click="addCodeChar(keypadButton)" :disable="playerResult !== null">{{ keypadButton }}</q-btn>
          </div>
        </div>
      </div>
      <div class="actions fixed-bottom" v-show="playerResult === null">
        <div>
          <q-btn color="primary" icon="clear" :disable="playerCode[0] === ''" @click="clearLastCodeChar()">{{ $t('message.Clear') }}</q-btn>
          <q-btn color="primary" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()">{{ $t('message.Confirm') }}</q-btn>
        </div>
        <q-btn v-show="step.hint" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">{{ $t('message.DisplayAHint') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
         <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('message.GoodAnswer') : $t('message.WrongGoodCodeWas') + " " + step.answers }}<span v-if="playerResult && !isRunFinished"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    
    
    <div class="code code-color" v-if="step.type == 'code-color'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      
      <div class="color-bubbles">
        <div v-for="(color, index) in playerCode" :key="index" :style="'background-color: ' + playerCode[index]" @click="changeColorForCode(index)" class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">&nbsp;</div>
      </div>
      
      <div class="actions fixed-bottom" v-show="playerResult === null">
        <div>
          <q-btn color="primary" icon="done" @click="checkAnswer()">{{ $t('message.Confirm') }}</q-btn>
        </div>
        <q-btn v-show="step.hint" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">{{ $t('message.DisplayAHint') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
         <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('message.GoodAnswer') : $t('message.WrongAnswer') }}<span v-if="playerResult && !isRunFinished"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    
    <div class="image-recognition" v-if="step.type == 'image-recognition'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="photo">
        <img ref="original-photo" :src="serverUrl + '/upload/quest/' + questId + '/step/image-recognition/' + step.answers" class="shadow-8" v-show="!cameraStreamEnabled && !photoTaken" />
        <video ref="camera-stream-for-recognition" v-show="cameraStreamEnabled"></video>
        <canvas ref="photo-buffer" class="hidden"></canvas>
        <img ref="player-photo" v-show="photoTaken" :alt="$t('message.TheScreenCaptureWillAppearInThisBox')" />
      </div>
      <div class="actions fixed-bottom">
        <q-btn @click="togglecameraStream()" class="full-width" v-show="!cameraStreamEnabled && !photoTaken" icon="photo camera" color="primary">{{ $t('message.TakeThePicture') }}</q-btn>
        <div v-show="cameraStreamEnabled">
          <q-btn color="primary" @click="togglecameraStream()" icon="clear">{{ $t('message.Cancel') }}</q-btn>
          <q-btn color="primary" @click="checkPhoto()" icon="done">{{ $t('message.Check') }}</q-btn>
        </div>
        <q-btn v-show="step.hint && !photoTaken" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">{{ $t('message.DisplayAHint') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep && !photoTaken">{{ $t('message.BackToPreviousStep') }}</q-btn>
        <div class="text resultMessage" :class="playerResult ? 'right' : 'wrong'" v-show="playerResult !== null">{{ playerResult ? $t('message.WellDone') : $t('message.PhotosDoesntMatch') }}<span v-if="playerResult && !isRunFinished"> +10 {{ $t('message.points') }}</span></div>
        <q-btn v-show="photoTaken" color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    
    <div class="geolocation" v-if="step.type == 'geolocation'">
      <video ref="camera-stream-for-geolocation" v-show="cameraStreamEnabled"></video>
      <div>
        <p class="text">{{ step.text }}</p>
        <p class="text">{{ $t('message.DistanceInMeters', { distance: geolocation.distance }) }}</p>
        <!--
        <p class="text">Raw direction: {{ Math.round(geolocation.rawDirection) }}°</p>
        <p class="text">Alpha: {{ Math.round(geolocation.alpha) }}°</p>
        <p class="text">Difference direction: {{ geolocation.direction }}°</p>
        -->
      </div>
      <div class="direction-helper">
        <canvas id="direction-canvas"></canvas>
      </div>
      <div class="resultMessage" >
        <div class="text right" v-show="playerResult">{{ $t('message.YouHaveFoundThePlace') }} (+10 {{ $t('message.points') }})</div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ playerResult ? $t('message.Next') : $t('message.Pass') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
    </div>
    
    
    <div class="write-text" v-if="step.type == 'write-text'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="answer-text">
        <input v-model="writetext.playerAnswer" :placeholder="$t('message.YourAnswer')" :class="{right: playerResult === true, wrong: playerResult === false}" />
        <q-btn color="primary" class="full-width" :disabled="playerResult !== null" @click="checkAnswer()">{{ $t('message.ConfirmTheAnswer') }}</q-btn>
      </div>
      <div class="actions fixed-bottom" v-show="playerResult === null">
        <q-btn v-show="step.hint && playerResult === null" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">{{ $t('message.DisplayAHint') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
        <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('message.GoodAnswer') : $t('message.WrongAnswer') }}<span v-if="playerResult && !isRunFinished"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    <!-- jigsaw puzzle steps -->
    <div class="puzzle" v-if="step.type == 'jigsaw-puzzle'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <ul id="puzzle-container" v-sortable="{ onUpdate: onPieceMove }">
        <li v-for="piece in puzzle.pieces" :key="piece.pos" :id="'piece-' + piece.pos"
          :style="'background-image: url(' + puzzle.picture + '); background-size: ' + piece.backSize + '% ' + piece.backSize + '%;background-position: -' + piece.backXPos + ' -' + piece.backYPos + ';'"
        ><img src="/statics/icons/game/spacer.gif" :style="'width: ' + piece.width + 'px;height: ' + piece.height + 'px;'" /></li>
      </ul>
      <img style="display: none" :src="puzzle.picture" /><!--trick to be sure that the puzzle display -->
      <div class="resultMessage fixed-bottom" v-show="playerResult === true ">
        <div>{{ $t('message.WellDone') }}<span v-if="playerResult"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
      <div class="actions fixed-bottom" v-show="playerResult !== true">
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Pass') }}</q-btn>
        <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
      </div>
    </div>
    
    <!-- inventory steps -->
    
    <div class="new-item" v-if="step.type == 'new-item'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="item">
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/new-item/' + step.answers.picture" />
        <p>{{ step.answers.title }}</p>
      </div>
      <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      <q-btn @click="previousStep()" class="full-width" color="tertiary" v-show="canGoToPreviousStep">{{ $t('message.BackToPreviousStep') }}</q-btn>
    </div>
    
    
    <div class="use-item" v-if="step.type == 'use-item'" @click="useItem($event)">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      
      <div class="resultMessage fixed-bottom" v-show="playerResult === true">
        <div class="text right">{{ $t('message.WellDone') }}<span v-if="!isRunFinished && successAtFirstAttempt"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    <div class="find-item" v-if="step.type == 'find-item'" @click="findItem($event)">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      
      <div class="resultMessage fixed-bottom" v-show="playerResult === true">
        <div class="text right">{{ $t('message.WellDone') }}<span v-if="!isRunFinished && successAtFirstAttempt"> +10 {{ $t('message.points') }}</span></div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ $t('message.Next') }}</q-btn>
      </div>
    </div>
    
    <!-- inventory button -->
    <q-btn v-if="step.type == 'use-item' && !this.selectedItem" round class="inventory-btn" icon="fa-briefcase" color="primary" v-show="playerResult !== true && run.inventory.length > 0" @click="openInventory" />
    <p v-if="step.type == 'use-item' && this.selectedItem" class="inventory-btn" color="primary" v-show="playerResult !== true && run.inventory.length > 0" @click="openInventory">
      <img :src="serverUrl + '/upload/quest/' + questId + '/step/new-item/' + this.selectedItem.picture" />
    </p>
    
    <transition name="slideInBottom">
      <div class="inventory" v-show="isInventoryOpen">
        <h1>{{ $t('message.Inventory') }}</h1>
        <p>{{ $t('message.InventoryUsage') }}</p>
        <div class="inventory-items">
          <div v-for="(item, key) in inventory" :key="key" @click="selectItem(item)">
            <img :src="serverUrl + '/upload/quest/' + questId + '/step/new-item/' + item.picture" />
            <p>{{ item.title}}</p>
          </div>
        </div>
      </div>
    </transition>
    
  </div>
  
</template>

<script>
import simi from 'src/includes/simi' // for image similarity
import utils from 'src/includes/utils'

import RunService from 'services/RunService'
import StepService from 'services/StepService'
import QuestService from 'services/QuestService'

import colorsForCode from 'data/colorsForCode.json'
import questItems from 'data/questItems.json'

import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})
import { Alert, Toast } from 'quasar'

export default {
  data () {
    return {
      step: {},
      run: {},
      quest: {},
      isRunFinished: false,
      playerResult: null,
      cameraStreamEnabled: false,
      questId: this.$route.params.questId,
      serverUrl: process.env.SERVER_URL,
      
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
        picture: '/statics/icons/game/medal.png'
      },
      
      // for step type 'use-item'
      selectedItem: null,
      successAtFirstAttempt: true,
      
      // for step type 'find-item'
      itemAdded: null,
      
      inventory: [],
      isInventoryOpen: false,
      
      canGoToPreviousStep: false
    }
  },
  mounted () {
    // TODO: to avoid cheating for questions with text/image answers, do not load the 'right answer' info on front app, instead make a server call to check it, when player has already selected his answer and clicked on "check answer"
    this.getStep().then(async (step) => {
      // no more available step => we reached end of quest
      if (typeof step === 'undefined' || step === 'OK') {
        return this.$router.push('/quest/end')
      }
      
      // set title
      this.$store.dispatch('setTitle', step.title.substr(0, 20))
      
      // load 'in-progress' run for current quest & current user Id
      var run = await RunService.getOne({ userId: this.$store.state.user._id, questId: this.questId, status: 'in-progress' })

      if (typeof run === 'undefined') {
        // no 'in-progress' run => create run for current player & current quest
        let questData = await QuestService.getById(this.questId)
        this.quest = questData.data
        
        run = {
          userId: this.$store.state.user._id,
          teamId: this.$store.state.user.team.currentId,
          questId: this.questId,
          status: 'in-progress',
          currentStep: 1,
          score: 0,
          dateCreated: new Date(),
          dateUpdated: null,
          questData: {
            picture: this.quest.picture,
            title: this.quest.title, 
            zipcode: this.quest.location.zipcode,
            town: this.quest.location.town
          }
        }
        let res = await RunService.save(run)
        if (res.status === 201) {
          this.$store.dispatch('setCurrentRun', res.data)
        }
        // no run found => go to /quest/<questId>/play/home for current quest
        //Toast.create.negative("Cette étape n'est pas accessible pour le moment. Vous êtes redirigé vers la page d'accueil de l'enquête.")
        //return this.$router.push('/quest/play/' + this.questId)
      } else if (run.currentStep !== step.number && run.status === 'in-progress') {
        // route step is not consistent with run's step => redirect to the correct step
        // Removed by EMA => User needs to be able to go back on steps, but no points needs to be applied
        //return this.$router.push('/quest/play/' + this.questId + '/step/' + run.currentStep)
      }
      
      // check if a 'finished' run already exists for current quest & current user
      let finishedRun = await RunService.getOne({ userId: this.$store.state.user._id, questId: this.questId, status: 'finished' })
      
      this.isRunFinished = (typeof finishedRun !== 'undefined')
      
      this.step = step
      this.run = run
      
      // refresh current run Id in store (step "end" uses it)
      this.$store.dispatch('setCurrentRun', this.run)
      
      // define if user can go back to previous step
      if (this.step.number > 1) {
        this.canGoToPreviousStep = true
      }
      
      // wait that DOM is loaded (required by steps involving camera)
      this.$nextTick(async () => {
        let background = document.getElementById('main-view')
        
        if (this.step.backgroundImage && this.step.type !== 'jigsaw-puzzle') {
          background.style.background = '#fff url("' + process.env.SERVER_URL + '/upload/quest/' + this.questId + '/step/background/' + this.step.backgroundImage + '")  center/cover no-repeat'
          // all background clickable for transitions
          if (this.step.type === 'info-text') {
            let clickable = document.getElementById('info-clickable')
            clickable.addEventListener("click", this.nextStep, false);
          }
        } else {
          background.style.background = 'none'
          background.style.backgroundColor = '#fff'
        }
        
        if (this.step.type === 'choose') {
          this.answerType = Array.isArray(this.step.answers) && this.step.answers[0].hasOwnProperty('imagePath') && this.step.answers[0].imagePath !== null ? 'image' : 'text'
        }
        
        if (this.step.type === 'code-keypad') {
          // for step type 'code-keypad', this.step.answers is a string in DB
          this.playerCode = Array(this.step.answers.length).fill("");
        }
        
        if (this.step.type === 'code-color') {
          this.playerCode = Array(4).fill('red');
        }
        
        if (this.step.type === 'new-item') {
          await this.addItemToInventory(this.step.answers)
        }
        
        if (this.step.type === 'use-item') {
          await this.fillInventory()
        }
        
        if (this.step.type === 'jigsaw-puzzle') {
          setTimeout(this.initPuzzle, 1000)
        }
        
        if (this.step.type === 'geolocation') {
          /*let cameraStream = this.$refs['camera-stream-for-geolocation']
          // enable rear camera stream
          // TODO STOP CAMERA STREAM WHEN DESTINATION IS REACHED OR USER WANTS TO SKIP THE STEP
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
            .then((stream) => {
              cameraStream.srcObject = stream
              cameraStream.play()
              this.cameraStreamEnabled = true
            })
            .catch((err) => {
              // TODO friendly behavior/message for user
              console.warn("No camera stream available")
              console.log(err)
            });*/
            
          if ('ondeviceorientationabsolute' in window) {
            // chrome specific, see https://developers.google.com/web/updates/2016/03/device-orientation-changes
            window.addEventListener('deviceorientationabsolute', this.handleOrientation)
          } else if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', this.handleOrientation)
          } else {
            // TODO friendly behavior/message for user
            console.warn("No absolute orientation info is available")
          }
          
          this.geolocation.locationWatcher = navigator.geolocation.watchPosition(this.watchLocationSuccess, this.watchLocationError, {
            enableHighAccuracy: false,
            timeout: this.geolocation.watchLocationInterval,
            maximumAge: 0
          })
          
          // prepare arrow canvas
          let canvas = document.querySelector('.direction-helper canvas')
          
          canvas.width = canvas.clientWidth
          canvas.height = canvas.clientHeight
          
          // must store object returned by setInterval() in Vue store instead of component properties,
          // otherwise it is reset when route changes & component is reloaded
          this.$store.dispatch('setDrawDirectionInterval', window.setInterval(this.drawDirectionArrow, 200))
        } else {
          let drawDirectionInterval = this.$store.state.questSteps.geolocation.drawDirectionInterval
          if (drawDirectionInterval !== null) {
            window.clearInterval(drawDirectionInterval)
          }
          this.$store.dispatch('setDrawDirectionInterval', null)
        }
      })
    }).catch((err) => {
      Alert.create({
        html: this.$t('message.ErrorStandardMessage'),
        position: 'bottom-center'
      })
      console.log(err)
    })
  },
  beforeDestroy() {
    if (this.$data.step.type === 'geolocation') {
      navigator.geolocation.clearWatch(this.geolocation.locationWatcher)
    }
  },
  methods: {
    
    /* general / multi step methods */
    
    async getStep () {
      return StepService.getByNumber(this.$route.params.questId, this.$route.params.stepNumber)
    },
    
    async nextStep() {
      // update run
      this.run.currentStep++
      await RunService.save(this.run)
      
      this.$router.push('/quest/play/' + this.step.questId + '/step/' + (this.step.number + 1));
    },
    async previousStep() {
      // update run
      this.run.currentStep--
      
      this.$router.push('/quest/play/' + this.step.questId + '/step/' + (this.step.number - 1));
    },
    
    askForHint() {
      // TODO reduce points won for current step
      Toast.create('Indice : ' + this.step.hint)
    },
    
    async checkAnswer(selectedAnswerKey) {
      if (this.playerResult !== null) {
        return
      }
      
      switch (this.step.type) {
        case 'choose':
          // always highlight right answer
          let rightAnswerKey = this.getRightAnswerKey()
          let rightAnswer = this.step.answers[rightAnswerKey]
          rightAnswer.icon = 'done' // "correct" icon
          rightAnswer.class = 'right'
          Vue.set(this.step.answers, rightAnswerKey, rightAnswer)
          
          // TODO this check will have to be done on server side, otherwise a developer can simply do a console.log() to show the right answer
          this.playerResult = (selectedAnswerKey === rightAnswerKey)
          
          if (!this.playerResult) {
            // highlight user selected answer as wrong one
            let selectedAnswer = this.step.answers[selectedAnswerKey]
            selectedAnswer.icon = 'clear' // "x" icon
            selectedAnswer.class = 'wrong'
            Vue.set(this.step.answers, selectedAnswerKey, selectedAnswer)
          }
          break
        
        case 'code-keypad':
          this.playerResult = (this.playerCode.join('') === this.step.answers)
          break
        
        case 'code-color':
          let result = true
          for (let i = 0; i < this.playerCode.length; i++) {
            if (this.playerCode[i] !== this.step.answers[i]) {
              result = false
              break
            }
          }
          this.playerResult = result
          break
        
        case 'write-text':
          this.playerResult = (this.writetext.playerAnswer === this.step.answers)
          break
        
        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }
      
      if (this.playerResult) {
        await this.awardPoints()
      }
    },
    
    getRightAnswerKey() {
      for (let i = 0; i < this.step.answers.length; i++) {
        if (this.step.answers[i].isRightAnswer) {
          return i
        }
      }
      throw new Error('No right answer found')
    },
    
    async awardPoints() {
      // TODO to avoid cheating, all answer checks + points awarding must be moved to server side
      if (this.playerResult === true && !this.isRunFinished) {
        this.run.score += 10
        await RunService.save(this.run)
      }
    },
    
    /* specific methods for step type 'code-keypad' */
    
    addCodeChar(char) {
      // find next empty char in typed code
      let nextEmptyCharIndex = this.playerCode.indexOf('');
      
      if (nextEmptyCharIndex === -1) {
        return
      }
      
      Vue.set(this.playerCode, nextEmptyCharIndex, char)
    },
    
    clearLastCodeChar() {
      // find next non empty char in typed code
      let lastTypedCharIndex = this.playerCode.indexOf('')
      lastTypedCharIndex = (lastTypedCharIndex === -1 ? this.playerCode.length - 1 : lastTypedCharIndex - 1)
      
      if (lastTypedCharIndex < 0 || lastTypedCharIndex >= this.playerCode.length) {
        return
      }
      
      Vue.set(this.playerCode, lastTypedCharIndex, '')
    },
    
    /* specific methods for step type 'code-color' */
    
    changeColorForCode(index) {
      if (this.playerResult !== null) {
        return
      }
      let currentColorIndex = colorsForCode.indexOf(this.playerCode[index])
      let nextColorIndex = (currentColorIndex + 1) % colorsForCode.length
      this.$set(this.playerCode, index, colorsForCode[nextColorIndex])
    },
    
    /* specific methods for step type 'image-recognition' */
    
    togglecameraStream() {
      // already enabled ? => disable
      
      if (this.cameraStreamEnabled) {
        this.stopVideoTracks()
        return
      }
      
      // otherwise, enable
      
      let cameraStream = this.$refs['camera-stream-for-recognition']
      let photoBuffer = this.$refs['photo-buffer']
      let playerPhoto = this.$refs['player-photo']
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then((stream) => {
          cameraStream.srcObject = stream
          cameraStream.play()
        })
        .catch((err) => {
          console.log("An error occured! " + err)
        });
      
      cameraStream.addEventListener('canplay', (ev) => {
        if (!this.cameraStreamEnabled) {
          // get inner parent element with (without margin/padding/border)
          // see https://stackoverflow.com/a/29881817/488666
          let parentElement = ev.target.parentElement
          let style = getComputedStyle(parentElement)
          let width = parentElement.clientWidth - (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight))
          let height = Math.floor(cameraStream.videoHeight / (cameraStream.videoWidth / width))
          
          cameraStream.setAttribute('width', width)
          cameraStream.setAttribute('height', height)
          
          photoBuffer.setAttribute('width', width)
          photoBuffer.setAttribute('height', height)
          
          playerPhoto.setAttribute('width', width)
          playerPhoto.setAttribute('height', height)
          
          this.cameraStreamEnabled = true
        }
      }, false);
    },
    
    checkPhoto() {
      // take photo & stop camera flow
      let photoBuffer = this.$refs['photo-buffer']
      let context = photoBuffer.getContext('2d')
      if (this.cameraStreamEnabled) {
        context.drawImage(this.$refs['camera-stream-for-recognition'], 0, 0, photoBuffer.width, photoBuffer.height)
        
        let data = photoBuffer.toDataURL('image/png')
        this.$refs['player-photo'].setAttribute('src', data)
        this.stopVideoTracks()
        
        let canvasOriginalPhoto = document.createElement('canvas')
        
        // reload original photo with attribute 'crossorigin' to 'anonymous' to avoid cross-origin
        // security error with 'tainted canvas' ; see https://stackoverflow.com/a/18475559/488666
        
        let imgOriginalPhoto = new Image()
        imgOriginalPhoto.crossOrigin = "anonymous";
        imgOriginalPhoto.src = this.serverUrl + '/upload/quest/' + this.questId + '/step/image-recognition/' + this.step.answers
        
        imgOriginalPhoto.onload = async () => {
          canvasOriginalPhoto.width = imgOriginalPhoto.naturalWidth
          canvasOriginalPhoto.height = imgOriginalPhoto.naturalHeight
          canvasOriginalPhoto.getContext('2d').drawImage(imgOriginalPhoto, 0, 0, canvasOriginalPhoto.width, canvasOriginalPhoto.height)
          
          this.playerResult = simi.compare(photoBuffer, canvasOriginalPhoto) >= this.photoComparisonThreshold
          
          this.photoTaken = true
          
          await this.awardPoints()
        }
      }
    },
    
    stopVideoTracks() {
      this.$refs['camera-stream-for-recognition'].srcObject.getVideoTracks().forEach(function(track) { track.stop() })
      this.cameraStreamEnabled = false
    },
    
    /* specific methods for step type 'geolocation' */
    
    handleOrientation(event) {
      // Chrome support only
      // TODO Support Safari/iOS using property webkitCompassHeading, see
      this.geolocation.alpha = (360 - event.alpha)
      this.geolocation.direction = Math.round((this.geolocation.rawDirection - this.geolocation.alpha + 360) % 360)
    },
    
    drawDirectionArrow() {
      if (this.geolocation.alpha === null || document.querySelector('.direction-helper canvas')) {
        let drawDirectionInterval = this.$store.state.questSteps.geolocation.drawDirectionInterval
        if (drawDirectionInterval !== null) {
          window.clearInterval(drawDirectionInterval)
        }
        this.$store.dispatch('setDrawDirectionInterval', null)
        return
      }
      
      // refresh arrow in canvas depending on direction
      let canvas = document.querySelector('.direction-helper canvas')
      let ctx = canvas.getContext('2d')
      
      let w = canvas.width
      let h = canvas.height
      
      let arrowCenterX = Math.round(w / 2)
      let arrowCenterY = Math.round(h / 2)
      
      ctx.save()
      
      ctx.clearRect(0, 0, w, h)
      
      ctx.translate(arrowCenterX, arrowCenterY)
      
      ctx.lineWidth = 20
      ctx.strokeStyle = '#ff0000'
      ctx.fillStyle = '#ff0000'
      
      ctx.beginPath()
      ctx.arc(0, 0, Math.round(h / 2) - 10, 0, 2 * Math.PI)
      ctx.stroke()
      
      ctx.rotate(utils.degreesToRadians(this.geolocation.direction))
      
      ctx.beginPath()
      ctx.moveTo(0, Math.round(h / 2) - 30)
      ctx.lineTo(0, -Math.round(h / 2) + 45)
      ctx.stroke()
      
      ctx.lineWidth = 1
      
      ctx.beginPath()
      ctx.moveTo(0, -Math.round(h / 2) + 25)
      ctx.lineTo(-20, -Math.round(h / 2) + 45)
      ctx.lineTo(20, -Math.round(h / 2) + 45)
      ctx.fill()
      ctx.stroke()
      
      ctx.restore()
    },
    
    watchLocationError(err) {
      console.warn('Could not get location from watchPosition()')
      console.log(err)
    },
    
    async watchLocationSuccess(pos) {
      let current = pos.coords;
      let target = this.step.answers
      
      // compute distance between two coordinates
      this.geolocation.distance = Math.round(utils.distanceInKmBetweenEarthCoordinates(target.lat, target.lng, current.latitude, current.longitude) * 1000, 2) // meters
      
      // TODO no hardcoding
      if (this.geolocation.distance < 20) {
        navigator.geolocation.clearWatch(this.geolocation.locationWatcher);
        this.playerResult = true
        await this.awardPoints()
      }
      
      this.geolocation.currentBearing = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, target.lat, target.lng)
      
      this.geolocation.rawDirection = this.geolocation.currentBearing
    },
    
    /* specific for steps 'new-item' */
    
    getItemIcon(code) {
      let item = questItems.find(item => item.code === code)
      return typeof item !== 'undefined' ? item.icon : 'clear'
    },
    
    async addItemToInventory(itemCode) {
      if (this.run.inventory.indexOf(itemCode) === -1) {
        this.run.inventory.push(itemCode)
        await RunService.save(this.run)
      }
    },
    async fillInventory() {
      // load items won on previous steps
      this.inventory = await StepService.listWonObjects(this.questId, this.step._id)
    },
    
    /* specific for steps 'use-item' */
    
    async useItem(ev) {
      if (this.playerResult === true) {
        return
      }
      
      // get dimensions of #main-view div (same size as div .use-item)
      let targetBounds = ev.target.getBoundingClientRect()
      
      // convert answer's "proportional coordinates" (numbers between 0 to 100) to "pixel coordinates",
      // depending on "#main-view" div size on player device's screen
      let anwserPixelCoordinates = {
        left: this.step.answers.coordinates.left / 100 * targetBounds.width,
        top: this.step.answers.coordinates.top / 100 * targetBounds.height
      }
      
      // solution area radius = max (#main-view width, #main-view height) / 10,
      // to get something as consistent as possible across devices & screen orientations
      let solutionAreaRadius = Math.max(targetBounds.width, targetBounds.height) / 10
      
      let distanceToSolution = Math.sqrt(Math.pow(anwserPixelCoordinates.left - ev.offsetX, 2) + Math.pow(anwserPixelCoordinates.top - ev.offsetY, 2))
   
      if (distanceToSolution <= solutionAreaRadius && this.step.answers.item === this.selectedItem.picture) {
        this.playerResult = true
        if (this.successAtFirstAttempt) {
          await this.awardPoints()
        }
      } else {
        this.successAtFirstAttempt = false
        this.playerResult = false
        // this.$t() did not work here, see https://github.com/kazupon/vue-i18n/issues/108
        Toast.create.negative(this.$i18n.t('message.NothingHappens'))
      }
    },
    openInventory() {
      this.isInventoryOpen = !this.isInventoryOpen
    },
    selectItem(item) {
      this.selectedItem = item
      this.isInventoryOpen = false
    },
    
    /* specific for steps 'jigsaw-puzzle' */
    
    async onPieceMove(event) {
      var childNodes = document.getElementById('puzzle-container').childNodes,
        i = childNodes.length;
      while (i--) {
        if (i !== parseInt(childNodes[i].id.replace('piece-', ''))) {
          return false // if one piece is not well placed
        }
      }

      await this.awardPoints()
      this.playerResult = true
    },
    initPuzzle() {
      // Puzzle sizes
      var level = parseInt((this.step.answers.level || 2), 10) // 1=easy, 2=medium, 3=hard
      var puzzleSize = level * 2
      var puzzleWidth = document.getElementById('puzzle-container').clientWidth
      var puzzleHeight = puzzleWidth
      document.getElementById('puzzle-container').style.height = puzzleHeight + "px"
      var pieceHeight = Math.floor(puzzleHeight / puzzleSize)
      var pieceWidth = Math.floor(puzzleWidth / puzzleSize)
      
      // Build pieces
      for (var i = 0; i < puzzleSize * puzzleSize; i++) {
        let xPos = (pieceWidth * (i % puzzleSize)) + 'px';
        let yPos = (pieceHeight * Math.floor(i / puzzleSize)) + 'px';
        this.puzzle.pieces[i] = { pos: i, backSize: (puzzleSize * 100), backXPos: xPos, backYPos: yPos, width: pieceWidth, height: pieceHeight }
      }
      
      //Shuffle
      for (i = this.puzzle.pieces.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let k = this.puzzle.pieces[i]
        this.puzzle.pieces[i] = this.puzzle.pieces[j]
        this.puzzle.pieces[j] = k
      }
      this.puzzle.picture = this.serverUrl + '/upload/quest/' + this.questId + '/step/jigsaw-puzzle/' + this.step.answers.picture
    },
   
    /* specific for steps 'find-item' */
    
    async findItem(ev) {
      if (this.playerResult === true) {
        return
      }
      
      // get dimensions of #main-view div (same size as div .find-item)
      let targetBounds = ev.target.getBoundingClientRect()
      
      // convert answer's "proportional coordinates" (numbers between 0 to 100) to "pixel coordinates",
      // depending on "#main-view" div size on player device's screen
      let anwserPixelCoordinates = {
        left: this.step.answers.left / 100 * targetBounds.width,
        top: this.step.answers.top / 100 * targetBounds.height
      }
      
      // solution area radius = max (#main-view width, #main-view height) / 10,
      // to get something as consistent as possible across devices & screen orientations
      let solutionAreaRadius = Math.max(targetBounds.width, targetBounds.height) / 10
      
      let distanceToSolution = Math.sqrt(Math.pow(anwserPixelCoordinates.left - ev.offsetX, 2) + Math.pow(anwserPixelCoordinates.top - ev.offsetY, 2))
      
      if (distanceToSolution <= solutionAreaRadius) {
        this.playerResult = true
        if (this.successAtFirstAttempt) {
          await this.awardPoints()
        }
      } else {
        this.successAtFirstAttempt = false
        this.playerResult = false
        // this.$t() did not work here, see https://github.com/kazupon/vue-i18n/issues/108
        Toast.create.negative(this.$i18n.t('message.NothingHappens'))
      }
    }
    
    /*
    async findItem(ev) {
      
      ...
        this.itemAdded = this.step.answers.item
        await addItemToInventory(this.itemAdded)
    }*/
  }
}
</script>

<style scoped>
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > div { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  
  #main-view > div.info,
  #main-view > div.new-item,
  #main-view > div.geolocation {
    padding-bottom: 1rem;
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
  .images-block > div { border-radius: 1rem; padding: 0.5rem; position: relative; }
  .images-block img { max-width: 9rem; max-height: 9rem; border-radius: 0.5rem; }
  
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
  
  #puzzle-container { padding: 0; margin: 0; width: 100%; background: #777; border: 1px solid #777; display: block; }
  #puzzle-container li { padding: 0; margin: 0; border: 0px; list-style-type: none; float: left; background-repeat: none; }
  
  /* write-text specific */
  
  .answer-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
  .answer-text input { opacity: 0.7; font-size: 1.5em; font-weight: bold; height: 1.5em; background-color: #fff; 
    border-radius: 0.5rem;
    box-shadow: 0px 0px 0.1rem 0.1rem #fff;}
    
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
  p.inventory-btn { background-color: #e82a34; padding: 10px; border-radius: 30px; height: 60px; width: 60px; display: block;}
  p.inventory-btn img { width: 40px; height: 40px; }
  
  .inventory { background: white; position: fixed; bottom: 0; left: 0; width: 100%; height: 100%; }
  .inventory h1 { padding-top: 1rem; margin-bottom: 1rem; }
  
  .inventory-items div { float: left; margin-right: 15px; width: 100px; height: 175px; overflow: hidden; text-align: center;}
  .inventory-items div img { width: 100px; height: 100px; }
  
  /* transitions / animations */
  
  .slideInBottom-enter-active, .slideInBottom-leave-active {
    transition: all .3s ease;
  }
  .slideInBottom-enter, .slideInBottom-leave-to {
    transform: translateY(100vh);
    opacity: 0;
  }
  
</style>
