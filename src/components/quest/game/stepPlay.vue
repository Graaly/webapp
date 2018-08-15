<template>
  <div id="play-view" class="fit">
    <div :class="controlsAreDisplayed ? 'fadeIn' : 'hidden'">
    
      <!------------------ TRANSITION AREA ------------------------>
      
      <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video'">
        <div id="info-clickable" :class="{ grow: !step.videoStream }">
          <p class="text">{{ step.text }}</p>
        </div>
        <div class="video" v-if="step.videoStream">
          <video class="full-width" controls controlsList="nodownload" autoplay>
            <source :src="serverUrl + '/upload/quest/' + step.questId + '/step/video/' + step.videoStream" type="video/mp4" />
          </video>
        </div>
        <audio controls controlsList="nodownload" autoplay v-if="step.audioStream" class="full-width">
          <source :src="step.audioStream" type="audio/mpeg" />
        </audio>
      </div>
        
      <!------------------ CHOOSE STEP AREA ------------------------>
      
      <div class="choose" v-if="step.type == 'choose'">
        <div>
           <p class="text">{{ step.text }}</p>
        </div>
        <div class="answers-text" v-if="answerType === 'text'">
          <q-btn v-for="(option, key) in step.options" :key="key" class="full-width" :class="option.class" :icon="option.icon" @click="checkAnswer(key)" :disabled="playerResult !== null">
            {{ option.text }}
          </q-btn>
        </div>
        <div class="answers-images" v-if="answerType === 'image'">
          <div class="images-block">
            <div v-for="(option, key) in step.options" :key="key" :class="option.class" @click="checkAnswer(key)">
              <img :src="serverUrl + '/upload/quest/' + step.questId + '/step/choose-image/' + option.imagePath" :class="option.class" />
              <q-btn v-if="option.class !== null" round :class="option.class" :icon="option.icon" disable />
            </div>
          </div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult !== null">
          <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('label.GoodAnswer') : $t('label.WrongAnswer') }}</div>
        </div>
      </div>
      
      <!------------------ KEYPAD STEP AREA ------------------------>
      
      <div class="code" v-if="step.type == 'code-keypad'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div class="typed-code">
          <table class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">
          <tr>
            <td v-for="(sign, key) in playerCode":key="key" :class="{ typed: sign !== '' }">{{ sign == '' ? '?' : sign }}</td>
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
        <div class="actions buttons-bottom" v-show="playerResult === null">
          <div v-if="nbTry === 1" class="text wrong">{{ $t('label.SecondTry') }}</div>
          <div>
            <q-btn color="primary" icon="clear" :disable="playerCode[0] === ''" @click="clearLastCodeChar()">{{ $t('label.Clear') }}</q-btn>
            <q-btn color="primary" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult !== null">
           <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('label.GoodAnswer') : $t('label.WrongGoodCodeWas') + " " + step.answers }}</div>
        </div>
      </div>
      
      <!------------------ CODE COLOR STEP AREA ------------------------>
      
      <div class="code code-color" v-if="step.type == 'code-color'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div class="color-bubbles">
          <div v-for="(color, index) in playerCode" :key="index" :style="'background-color: ' + playerCode[index]" @click="changeColorForCode(index)" class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">&nbsp;</div>
        </div>
        
        <div class="actions buttons-bottom" v-show="playerResult === null">
          <div v-if="nbTry === 1" class="text wrong">{{ $t('label.SecondTry') }}</div>
          <div>
            <q-btn color="primary" icon="done" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult !== null">
           <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('label.GoodAnswer') : $t('label.WrongAnswer') }}</div>
        </div>
      </div>
      
      <!------------------ IMAGE CODE STEP AREA ------------------------>
      
      <div class="code code-image" v-if="step.type == 'code-image'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <table>
          <tr>
            <td v-for="(code, index) in playerCode" :key="index" class="text-center" @click="previousCodeAnswer(index)">
              <q-icon name="keyboard_arrow_up" />
            </td>
          </tr>
          <tr>
            <td v-for="(code, index) in playerCode" :key="index">
              <img :id="'image-code-' + index" :src="serverUrl + '/upload/quest/' + step.questId + '/step/code-image/' + step.options.images[code].imagePath" />
            </td>
          </tr>
          <tr>
            <td v-for="(code, index) in playerCode" :key="index" class="text-center" @click="nextCodeAnswer(index)">
              <q-icon name="keyboard_arrow_down" />
            </td>
          </tr>
        </table>
        
        <div class="actions buttons-bottom" v-show="playerResult === null">
          <div v-if="nbTry === 1" class="text wrong">{{ $t('label.SecondTry') }}</div>
          <div>
            <q-btn color="primary" icon="done" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult !== null">
           <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('label.GoodAnswer') : $t('label.WrongAnswer') }}</div>
        </div>
      </div>
      
      <!------------------ IMAGE RECOGNITION STEP AREA ------------------------>
      
      <div class="image-recognition" v-if="step.type == 'image-recognition'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div class="photo">
          <img ref="original-photo" :src="serverUrl + '/upload/quest/' + step.questId + '/step/image-recognition/' + step.answers" class="shadow-8" v-show="!cameraStreamEnabled && !photoTaken" />
          <video ref="camera-stream-for-recognition" v-show="cameraStreamEnabled"></video>
          <canvas ref="photo-buffer" class="hidden"></canvas>
          <img ref="player-photo" v-show="photoTaken" :alt="$t('label.TheScreenCaptureWillAppearInThisBox')" />
        </div>
        <div class="actions buttons-bottom">
          <q-btn @click="togglecameraStream()" class="full-width" v-show="!cameraStreamEnabled && !photoTaken" icon="photo camera" color="primary">{{ $t('label.TakeThePicture') }}</q-btn>
          <div v-show="cameraStreamEnabled">
            <q-btn color="primary" @click="togglecameraStream()" icon="clear">{{ $t('label.Cancel') }}</q-btn>
            <q-btn color="primary" @click="checkAnswer()" icon="done">{{ $t('label.Check') }}</q-btn>
          </div>
          <div class="text resultMessage" :class="playerResult ? 'right' : 'wrong'" v-show="playerResult !== null">{{ playerResult ? $t('label.WellDone') : $t('label.PhotosDoesntMatch') }}</div>
        </div>
      </div>
      
      <!------------------ GEOLOCALISATION STEP AREA ------------------------>
      
      <div class="geolocation" v-if="step.type == 'geolocation'">
        <video ref="camera-stream-for-geolocation" v-show="cameraStreamEnabled"></video>
        <div>
          <p class="text">{{ step.text }}</p>
          <p class="text">{{ $t('label.DistanceInMeters', { distance: geolocation.distance }) }}</p>
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
          <div class="text right" v-show="playerResult">{{ $t('label.YouHaveFoundThePlace') }}</div>
        </div>
      </div>
      
      <!------------------ SIMPLE TEXT INPUT STEP AREA ------------------------>
      
      <div class="write-text" v-if="step.type == 'write-text'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div class="answer-text">
          <input v-model="writetext.playerAnswer" :placeholder="$t('label.YourAnswer')" :class="{right: playerResult === true, wrong: playerResult === false}" />
          <q-btn color="primary" class="full-width" :disabled="playerResult !== null" @click="checkAnswer()">{{ $t('label.ConfirmTheAnswer') }}</q-btn>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult !== null">
          <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? $t('label.GoodAnswer') : $t('label.WrongAnswer') }}</div>
        </div>
      </div>
      
      <!------------------ JIGSAW STEP AREA ------------------------>
      
      <div class="puzzle" v-if="step.type == 'jigsaw-puzzle'">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div id="pieces">
            <div class="piece" draggable="true"
              v-for="piece in puzzle.pieces" :key="piece.pos" :id="'piece-' + piece.pos"
              @dragstart="handleDragStart($event)"
              @dragenter="handleDragEnter($event)"
              @dragover="handleDragOver($event)"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop($event)"
              @dragend="handleDragEnd($event)"
              :style="'background-image: url(' + puzzle.picture + '); background-size: ' + piece.backSize + '% ' + piece.backSize + '%;background-position: -' + piece.backXPos + ' -' + piece.backYPos + ';'"
            ><header :style="'width: ' + piece.width + 'px;height: ' + piece.height + 'px;'"></header></div>
        </div>
        <img style="display: none" :src="puzzle.picture" /><!--trick to be sure that the puzzle display -->
        <div class="resultMessage buttons-bottom" v-show="playerResult === true ">
          <div class="text right">{{ $t('label.WellDone') }}</div>
        </div>
      </div>
      
      <!------------------ WIN ITEM STEP AREA ------------------------>
      
      <div class="new-item" v-if="step.type == 'new-item'">
        <div>
          <p class="text">{{ step.text === '' ? $t('label.YouHaveWinANewItem') : step.text }}</p>
        </div>
        <div class="item">
          <img :src="serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + step.options.picture" />
          <p>{{ step.options.title }}</p>
        </div>
      </div>
      
      <!------------------ USE ITEM STEP AREA ------------------------>
      
      <div class="use-item" v-if="step.type == 'use-item'" @click="useItem($event)">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div ref="useItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + step.questId + '/step/background/' + step.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw;'">
          <img id="cross-play" style="position: relative; z-index: 500; width: 16vw; height: 16vw; display: none;" src="/statics/icons/game/find-item-locator.png" />
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === false && nbTry >0 && nbTry < 3">
          <div class="text wrong">{{ $t('label.SecondTry') }}</div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === false && nbTry === 3">
          <div class="text wrong">{{ $t('label.WrongAnswer') }}</div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === true">
          <div class="text right">{{ $t('label.WellDone') }}</div>
        </div>
      </div>
      <p v-if="step.type == 'use-item' && nbTry < 3 && playerResult === null && itemUsed !== null" class="inventory-btn" >
        <q-btn round color="primary">
          <img v-if="itemUsed" :src="serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + itemUsed.picture" />
        </q-btn>
        {{ $t('label.TouchWhereYouUseThisItem') }}
      </p>
      
      <!------------------ FIND ITEM STEP AREA ------------------------>
      
      <div class="find-item" v-if="step.type == 'find-item'" @click="findItem($event)">
        <div>
          <p class="text">{{ step.text }}</p>
        </div>
        <div ref="findItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + step.questId + '/step/background/' + step.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw;'">
          <img id="cross-play" style="position: relative; z-index: 500; width: 16vw; height: 16vw; display: none;" src="/statics/icons/game/find-item-locator.png" />
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === false && nbTry >0 && nbTry < 3">
          <div class="text wrong">{{ $t('label.SecondTry') }}</div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === false && nbTry === 3">
          <div class="text right">{{ $t('label.WrongAnswer') }}</div>
        </div>
        <div class="resultMessage buttons-bottom" v-show="playerResult === true">
          <div class="text right">{{ $t('label.WellDone') }}</div>
        </div>
      </div>
    </div>
    <div v-show="playerResult === true && score > 0" class="fadein-message">+{{ score }} <q-icon color="white" name="fas fa-trophy" /></div>
  </div>
  
</template>

<script>
import StepService from 'services/StepService'
import simi from 'src/includes/simi' // for image similarity
import utils from 'src/includes/utils'
import colorsForCode from 'data/colorsForCode.json'
import questItems from 'data/questItems.json'
import Notification from 'plugins/NotifyHelper'

import Vue from 'vue'

export default {
  /*
   * Properties used on component call
   * step : step data (mandatory)
   * runId : Id of the run (0 = simulation mode)
   * reload : set to true if data must be reload
   * itemUsed : item of the inventory used
   */
  props: ['step', 'runId', 'reload', 'itemUsed'],
  watch: { 
    // refresh component if stepId change
    reload: async function(newVal, oldVal) {
      if (newVal === true || newVal === 'true') {
        await this.initData()
      }
    }
  },
  data: function () {
    return this.initialState();
  },
  mounted () {
    this.initData()
  },
  beforeDestroy() {
    if (this.step.type === 'geolocation') {
      navigator.geolocation.clearWatch(this.geolocation.locationWatcher)
    }
  },
  methods: {
    initialState () {
      return {
        run: {}, // to keep ?
        isRunFinished: false,  // to keep ?
        playerResult: null,
        cameraStreamEnabled: false,
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        score: 0,
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
          dragSrcEl: null,
          element: {}
        },
        
        // for step type 'find-item'
        itemAdded: null
      }
    },
    /*
     * Init the component data
     */
    initData () {
      Object.assign(this.$data, this.initialState());
      /*
      // TODO : manage non continuous path quests
      this.step.nextNumber = this.step.number + 1
      */
      // refresh current run Id in store (step "end" uses it)
      // this.$store.dispatch('setCurrentRun', this.run)
      
      // wait that DOM is loaded (required by steps involving camera)
      this.$nextTick(async () => {
        let background = document.getElementById('play-view')
        
        if (this.step.backgroundImage) {
          if (this.step.type === 'find-item' || this.step.type === 'use-item') {
            background.style.background = 'none'
            background.style.backgroundColor = '#000'
            this.showControls()
          } else if (this.step.type === 'jigsaw-puzzle') {
            background.style.background = 'none'
            background.style.backgroundColor = '#fff'
            this.showControls()
          } else {
            background.style.background = '#fff url("' + process.env.SERVER_URL + '/upload/quest/' + this.step.questId + '/step/background/' + this.step.backgroundImage + '") center/cover no-repeat'
            // all background clickable for transitions
            //if ((["info-text", "geolocation", "choose", "write-text", "code-keypad", "code-color"]).indexOf(this.step.type) > -1) {
              //let clickable = document.getElementById('info-clickable')
              //let clickable = document.getElementById('main-view')
              //clickable.addEventListener("click", this.showControls, false);
            //}
            
            // display controls after some seconds to let user see background
            setTimeout(this.showControls, 1500)
          }
        } else {
          background.style.background = 'none'
          background.style.backgroundColor = '#fff'
          this.showControls()
        }
        
        if (this.step.type === 'info-text' || this.step.type === 'info-video' || this.step.type === 'new-item') {
          // validate steps with no enigma
          this.checkAnswer()
        }
        
        if (this.step.type === 'choose') {
          this.answerType = Array.isArray(this.step.options) && this.step.options[0].hasOwnProperty('imagePath') && this.step.options[0].imagePath !== null ? 'image' : 'text'
        }
        
        if (this.step.type === 'code-keypad') {
          // for step type 'code-keypad', this.step.answers is a string in DB
          this.resetKeypadCode()
        }
        
        if (this.step.type === 'code-color') {
          this.resetColorCode()
        }
        if (this.step.type === 'code-image') {
          this.resetImageCode()
        }
        
        /*if (this.step.type === 'new-item') {
          await this.addItemToInventory(this.step.answers)
        }*/
        
        /*if (this.step.type === 'use-item') {
          await this.fillInventory()
        }*/
        
        if (this.step.type === 'jigsaw-puzzle') {
          setTimeout(this.initPuzzle, 1000)
          this.$emit('pass')
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
            
          // user can pass
          this.$emit('pass')
            
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
    },
    /*
     * Show controls buttons
     */
    showControls () {
      this.controlsAreDisplayed = true // !this.controlsAreDisplayed
    },
    /*
     * Check if the answer is correct
     * @param   {Object}    selectedAnswerKey            Answer object
     */
    async checkAnswer(answer) {
      var checkAnswerResult
      
      if (this.playerResult !== null) {
        return
      }
      
      switch (this.step.type) {
        case 'info-text':
        case 'info-video':
        case 'new-item':
          // save step automatic success
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {})
          this.submitGoodAnswer(0)
          break
        case 'choose':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: answer})

          if (checkAnswerResult.result === true) {
            let selectedAnswer = this.step.options[answer]
            selectedAnswer.icon = 'done'
            selectedAnswer.class = 'right'
            Vue.set(this.step.options, answer, selectedAnswer)
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            let selectedAnswer = this.step.options[answer]
            selectedAnswer.icon = 'clear' // "x" icon
            selectedAnswer.class = 'wrong'
            Vue.set(this.step.options, answer, selectedAnswer)
            this.nbTry++
            this.submitWrongAnswer()
          }
          
          break
        
        case 'geolocation':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: answer})

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          }
          break
          
        case 'image-recognition':
          const comparison = this.checkPhoto()
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: comparison})

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.submitWrongAnswer()
          }
          break
          
        case 'code-keypad':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('')})

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetKeypadCode()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
        
        case 'code-color':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('')})
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetColorCode()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
          
        case 'code-image':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('')})
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetImageCode()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
        
        case 'jigsaw-puzzle':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: answer.join('|')})
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          }
          break
        
        case 'write-text':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: this.writetext.playerAnswer})
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset field
              this.writetext.playerAnswer = ""
            } else {
              this.submitWrongAnswer()
            }
          }
          
          break
        
        case 'use-item':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: answer})
          
          if (checkAnswerResult.result === true) {
            this.showItemLocation(checkAnswerResult.answer.coordinates.left, checkAnswerResult.answer.coordinates.top)
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              Notification(this.$t('label.UseItemNothingHappens'), 'error')
            } else {
              this.showItemLocation(checkAnswerResult.answer.coordinates.left, checkAnswerResult.answer.coordinates.top)
              this.submitWrongAnswer()
            }
          }
          
          break
          
        case 'find-item':
          checkAnswerResult = await StepService.checkAnswer(this.step.questId, this.step.id, this.runId, {answer: answer})
          
          if (checkAnswerResult.result === true) {
            this.showFoundLocation(checkAnswerResult.answer.left, checkAnswerResult.answer.top)
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              Notification(this.$t('label.FindItemNothingHappens'), 'error')
            } else {
              this.showFoundLocation(checkAnswerResult.answer.left, checkAnswerResult.answer.top)
              this.submitWrongAnswer()
            }
          }
          
          break
        
        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }
      
      // display score
      this.score = (checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0
    },
    /*
     * Send good andwer  
     */
    submitGoodAnswer(score) {
      this.playerResult = true
      this.$emit('success', score)
      this.$emit('played')
    },
    /*
     * Send wrong answer 
     */
    submitWrongAnswer() {
      this.playerResult = false
      this.$emit('fail')
      this.$emit('played')
    },
    // TODO : to remove ?
    getRightAnswerKey() {
      for (let i = 0; i < this.step.answers.length; i++) {
        if (this.step.answers[i].isRightAnswer) {
          return i
        }
      }
      throw new Error('No right answer found')
    },
    
    ////////////////////////////////////////////// MANAGEMENT OF THE ENIGMA COMPONENTS /////////////////////////////////////////////
    
    /*
     * Reset the key pad 
     */
    resetKeypadCode() {
      this.playerCode = Array(this.step.answers.length).fill("")
    },
    /*
     * Reset the color code pad
     */
    resetColorCode() {
      this.playerCode = Array(4).fill('red')
    },
    /*
     * Reset the image code pad
     */
    resetImageCode() {
      this.playerCode = [0, 0, 0, 0]
    },
    /*
     * Display next image in the image code pad
     * @param   {Number}    key            index in the code list array
     */
    nextCodeAnswer: function(key) {
      this.playerCode[key]++
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.playerCode[key] >= nbImagesUploaded) {
        this.playerCode[key] = 0
      }
      // force src refresh
      document.getElementById('image-code-' + key).src = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/code-image/' + this.step.options.images[this.playerCode[key]].imagePath
    },
    /*
     * Display the next image in the image code pad
     * @param   {Number}    key            Index in the code list array
     */
    previousCodeAnswer: function(key) {
      this.playerCode[key]--
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.playerCode[key] < 0) {
        this.playerCode[key] = nbImagesUploaded - 1
      }
      // force src refresh
      document.getElementById('image-code-' + key).src = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/code-image/' + this.step.options.images[this.playerCode[key]].imagePath
    },
    /*
     * Get the number of images for the image code pad
     */
    getNbImageUploadedForCode() {
      var nbImagesUploaded = 0
      for (var i = 0; i < this.step.options.images.length; i++) {
        if (this.step.options.images[i] && this.step.options.images[i].imagePath) {
          nbImagesUploaded++
        }
      }
      return nbImagesUploaded
    },
    /*
     * Save the results
     * @param   {string}    success            define if answer was right or wrong
     *
    async saveResult(success) {
      // TODO to avoid cheating, all answer checks
      let response = await RunService.saveResult(this.run._id, this.step._id, success)

      if (response.data && response.data.nextId) {
        this.step.nextId = response.data.nextId
        this.step.nextNumber = response.data.nextNumber
      } else {
        Notification(this.$t('label.TechnicalIssue'), 'error')
      }
    },*/
    /*
     * Add a number in the pad
     * @param   {string}    char            Number to display
     */
    addCodeChar(char) {
      // find next empty char in typed code
      let nextEmptyCharIndex = this.playerCode.indexOf('');
      
      if (nextEmptyCharIndex === -1) {
        return
      }
      
      Vue.set(this.playerCode, nextEmptyCharIndex, char)
    },
    /*
     * Clear the latest char in the pad
     */
    clearLastCodeChar() {
      // find next non empty char in typed code
      let lastTypedCharIndex = this.playerCode.indexOf('')
      lastTypedCharIndex = (lastTypedCharIndex === -1 ? this.playerCode.length - 1 : lastTypedCharIndex - 1)
      
      if (lastTypedCharIndex < 0 || lastTypedCharIndex >= this.playerCode.length) {
        return
      }
      
      Vue.set(this.playerCode, lastTypedCharIndex, '')
    },
    /*
     * Change the color of a circle in the color pad
     * @param   {number}    index            Index in the colors array
     */
    changeColorForCode(index) {
      if (this.playerResult !== null) {
        return
      }
      let currentColorIndex = colorsForCode.indexOf(this.playerCode[index])
      let nextColorIndex = (currentColorIndex + 1) % colorsForCode.length
      this.$set(this.playerCode, index, colorsForCode[nextColorIndex])
    },
    /*
     * Change the image in the image code pad
     * @param   {number}    index            Index in the images array
     */
    changeImageForCode(index) {
      if (this.playerResult !== null) {
        return
      }
      let currentColorIndex = colorsForCode.indexOf(this.playerCode[index])
      let nextColorIndex = (currentColorIndex + 1) % colorsForCode.length
      this.$set(this.playerCode, index, colorsForCode[nextColorIndex])
    },
    /*
     * Display / hide camera
     */
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
    /*
     * Check if a photo is similar to the one expected
     */
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
        imgOriginalPhoto.src = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/image-recognition/' + this.step.answers
        
        imgOriginalPhoto.onload = async () => {
          canvasOriginalPhoto.width = imgOriginalPhoto.naturalWidth
          canvasOriginalPhoto.height = imgOriginalPhoto.naturalHeight
          canvasOriginalPhoto.getContext('2d').drawImage(imgOriginalPhoto, 0, 0, canvasOriginalPhoto.width, canvasOriginalPhoto.height)
          
          this.photoTaken = true
          
          return simi.compare(photoBuffer, canvasOriginalPhoto) >= this.photoComparisonThreshold
        }
      }
    },
    /*
     * Stop the video tracking
     */
    stopVideoTracks() {
      this.$refs['camera-stream-for-recognition'].srcObject.getVideoTracks().forEach(function(track) { track.stop() })
      this.cameraStreamEnabled = false
    },
    /*
     * Check device orientation
     * @param   {object}    event            Event tracked
     */
    handleOrientation(event) {
      // Chrome support only
      // TODO Support Safari/iOS using property webkitCompassHeading, see
      this.geolocation.alpha = (360 - event.alpha)
      this.geolocation.direction = Math.round((this.geolocation.rawDirection - this.geolocation.alpha + 360) % 360)
    },
    /*
     * Draw direction arrows for geolocation
     */
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
    /*
     * Handle location error
     * @param   {string}    err            Error string
     */
    watchLocationError(err) {
      console.warn('Could not get location from watchPosition()')
      console.log(err)
    },
    /*
     * Handle location tracking success
     * @param   {object}    pos            User position
     */
    async watchLocationSuccess(pos) {
      let current = pos.coords;
      let target = this.step.options
      
      // compute distance between two coordinates
      this.geolocation.distance = Math.round(utils.distanceInKmBetweenEarthCoordinates(target.lat, target.lng, current.latitude, current.longitude) * 1000, 2) // meters
      
      // TODO no hardcoding
      if (this.geolocation.distance < 20) {
        navigator.geolocation.clearWatch(this.geolocation.locationWatcher);
        await this.checkAnswer(current)
      }
      
      this.geolocation.currentBearing = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, target.lat, target.lng)
      
      this.geolocation.rawDirection = this.geolocation.currentBearing
    },
    /*
     * Get the icon for an inventory item
     * @param   {string}    code            item code
     */
    getItemIcon(code) {
      let item = questItems.find(item => item.code === code)
      return typeof item !== 'undefined' ? item.icon : 'clear'
    },
    /*
     * Use an item
     * @param   {object}    ev            Event when user touch screen to get location
     */
    async useItem(ev) {
      if (this.playerResult === true || this.nbTry >= 3) {
        return
      }

      // if no item selected
      if (this.itemUsed === null) {
        // this.$t() does not work, see https://github.com/kazupon/vue-i18n/issues/108
        //this.$q.notify({type: 'negative', message: this.$i18n.t('label.PleaseSelectAnItemFirst')})
        Notification(this.$t('label.PleaseSelectAnItemFirst'), 'error')
        // TODO: maybe make blink the 'inventory' icon in the left bottom corner
        return
      }
      
      let vw = window.innerWidth / 100 // in px
      
      var data = {
        windowWidth: vw,
        posX: ev.offsetX,
        posY: ev.offsetY,
        item: this.itemUsed.picture
      }
      
      await this.checkAnswer(data)
    },
    /*
     * Show the item location after success / failure
     */
    async showItemLocation(posX, posY) {
      let vw = window.innerWidth / 100
      let anwserPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }
      
      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = Math.round(8 * vw)
      // display the right solution
      var cross = document.getElementById('cross-play')
      cross.style.top = (anwserPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (anwserPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
      var crossPicture = cross.src
      var self = this
      setInterval(function() {
        if (cross.src === crossPicture) {
          cross.src = self.serverUrl + '/upload/quest/' + self.step.questId + '/step/new-item/' + self.step.answers.item
          cross.style.borderRadius = '50%'
        } else {
          cross.src = crossPicture
          cross.style.borderRadius = '0'
        }
      }, 1000);
    },
    /*
     * Check if user find the item in the picture
     * @param   {object}    ev            Event when user touch the screen
     */
    async findItem(ev) {
      if (this.playerResult === true || this.nbTry >= 3) {
        return
      }
      
      let vw = window.innerWidth / 100 // in px
      
      var data = {
        windowWidth: vw,
        posX: ev.offsetX,
        posY: ev.offsetY
      }
      
      await this.checkAnswer(data)
    },
    /*
     * Show the item location after success / failure
     */
    async showFoundLocation(posX, posY) {
      let vw = window.innerWidth / 100
      let anwserPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }
      
      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = Math.round(8 * vw)
      
      var cross = document.getElementById('cross-play')
      cross.style.top = (anwserPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (anwserPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
    },
    
    /*
     * Check if the puzzle is correct
     */
    async checkPuzzle() {
      var result = true
      var answer = []
      var rightPositions = this.step.answers.split('|')
      for (var i = 0; i < this.puzzle.pieces.length; i++) {
        answer.push(this.puzzle.pieces[i].pos)
        if (rightPositions[i] !== this.puzzle.pieces[i].pos) {
          result = false
          continue
        }
      }
      
      if (result) {
        this.checkAnswer(answer)
      }
    },
    /*
     * Initialize puzzle, re-order pieces
     */
    initPuzzle() {
      // Puzzle sizes
      var level = parseInt((this.step.options.level || 2), 10) // 1=easy, 2=medium, 3=hard
      var puzzleSize = level * 2
      var puzzleWidth = document.getElementById('pieces').clientWidth
      var puzzleHeight = puzzleWidth
      //document.getElementById('pieces').style.height = puzzleHeight + "px"
      var pieceHeight = Math.floor(puzzleHeight / puzzleSize)
      var pieceWidth = Math.floor(puzzleWidth / puzzleSize)
      
      // get the pieces position
      let piecesPosition = this.step.answers.split('|')
      // Build pieces
      for (var i = 0; i < puzzleSize * puzzleSize; i++) {
        let xPos = (pieceWidth * (i % puzzleSize)) + 'px';
        let yPos = (pieceHeight * Math.floor(i / puzzleSize)) + 'px';
        this.puzzle.pieces[i] = { pos: piecesPosition[i], backSize: (puzzleSize * 100), backXPos: xPos, backYPos: yPos, width: pieceWidth, height: pieceHeight }
      }
      
      //Shuffle
      for (i = this.puzzle.pieces.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let k = this.puzzle.pieces[i]
        this.puzzle.pieces[i] = this.puzzle.pieces[j]
        this.puzzle.pieces[j] = k
      }
      this.puzzle.picture = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/jigsaw-puzzle/' + this.step.options.picture

      initJigsaw(this.puzzle.element)
    },
    /*
     * Handle puzzle piece move
     * @param   {object}    e            Event when user touch puzzle piece
     */
    handleDragStart(e) {
      if (e.target.className.indexOf('piece') > -1) {
        this.dragSrcEl = e.target;
        this.dragSrcEl.style.opacity = '0.4';
        var dt = e.dataTransfer;
        dt.effectAllowed = 'move';
        dt.setData('text', this.dragSrcEl.innerHTML);
       
        // customize drag image for one of the panels
        if (dt.setDragImage instanceof Function && e.target.innerHTML.indexOf('X') > -1) {
          var img = new Image();
          img.src = 'dragimage.jpg';
          dt.setDragImage(img, img.width / 2, img.height / 2);
        }
      }
    },
    /*
     * Handle puzzle piece move over
     * @param   {object}    e            Event when user move puzzle piece over
     */
    handleDragOver(e) {
      if (this.dragSrcEl) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    },
    /*
     * Handle puzzle piece drag enter
     * @param   {object}    e            Event when user touch puzzle piece
     */
    handleDragEnter(e) {
      if (this.dragSrcEl) {
        e.target.classList.add('over');
      }
    },
    /*
     * Handle puzzle piece drag leave
     * @param   {object}    e            Event when user touch puzzle piece
     */
    handleDragLeave(e) {
      if (this.dragSrcEl) {
        e.target.classList.remove('over');
      }
    },
    /*
     * Handle puzzle piece move end
     * @param   {object}    e            Event when user stop moving puzzle piece
     */
    handleDragEnd(e) {
      this.dragSrcEl = null;
      var cols = document.querySelectorAll('#pieces .piece');
      [].forEach.call(cols, function (col) {
        col.style.opacity = '';
        col.classList.remove('over');
      });
    },
    /*
     * Handle puzzle piece drop
     * @param   {object}    e            Event when user drop puzzle piece
     */
    handleDrop(e) {
      if (this.dragSrcEl) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        // move piece
        if (e.target.parentNode.id && this.dragSrcEl.id) {
          var destId = e.target.parentNode.id.replace('piece-', '')
          var sourceId = this.dragSrcEl.id.replace('piece-', '')
          var destIdPos = 0, sourceIdPos = 0
          
          if (destId !== sourceId) {
            // get the places in the arrays
            for (var i = 0; i < this.puzzle.pieces.length; i++) {
              if (this.puzzle.pieces[i].pos === destId) {
                destIdPos = i
              }
              if (this.puzzle.pieces[i].pos === sourceId) {
                sourceIdPos = i
              }
            }

            // move the places in the arrays
            let oldPlace = this.puzzle.pieces[destIdPos]
            Vue.set(this.puzzle.pieces, destIdPos, this.puzzle.pieces[sourceIdPos])
            Vue.set(this.puzzle.pieces, sourceIdPos, oldPlace)
            
            this.checkPuzzle()
          }
        }
      }
    }
  }
}
</script>

<style scoped>
  
  .inventory-items div { float: left; margin-right: 15px; width: 100px; height: 175px; overflow: hidden; text-align: center;}
  .inventory-items div img { width: 100px; height: 100px; }

  #play-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #play-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  #play-view > div > div { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  #play-view > div > div.find-item, #play-view > div > div.use-item {padding: 0px}
  
  #play-view div.info,
  #play-view div.new-item,
  #play-view div.geolocation {
    padding-bottom: 1rem;
  }
  #play-view div.find-item,
  #play-view div.use-item {
    padding-bottom: 3rem;
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
  
  .keypad { flex-grow: 1; flex-flow: column nowrap; justify-content: center; text-align: center; }
  .keypad .q-btn { margin: 0.5rem; width: 20%; height: 15%; font-weight: bold; font-size: 1.7rem; }
  
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
  
  .resultMessage .text { text-align: center; font-weight: bold; }
  
  .inventory-btn { position: fixed; bottom: 60px; left: 0.7rem; z-index: 1; color: #fff; }
  .inventory-btn img { width: 100%; height: 100%; border-radius: 50%; }
  
  /* transitions / animations */
  
  .slideInBottom-enter-active, .slideInBottom-leave-active {
    transition: all .3s ease;
  }
  .slideInBottom-enter, .slideInBottom-leave-to {
    transform: translateY(100vh);
    opacity: 0;
  }
  
  .fadein-message {
    position: absolute;
    z-index: 0;
    top: 30%;
    width: 100%;
    height: 0;
    overflow: hidden;
    margin: auto;
    text-align: center;
    font-size: 88px;
    color: #FFF;
    transform-origin: 50% 100%;
    text-shadow: 2px 2px 2px #333;
    animation-duration: 2s;
    animation-name: fadeAndScale;
    animation-fill-mode: forwards;
  }
  
  /* display the controls progressively */
  .fadeIn {
    animation: fadein 2s;
    -moz-animation: fadein 2s; /* Firefox */
    -webkit-animation: fadein 2s; /* Safari et Chrome */
    -o-animation: fadein 2s; /* Opera */
  }
  @keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
  }
  @-moz-keyframes fadein { /* Firefox */
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
  }
  @-webkit-keyframes fadein { /* Chrome */
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
  }
  @-o-keyframes fadein { /* Opera */
    from {
        opacity:0;
    }
    to {
        opacity: 1;
    }
  }
  @keyframes fadeAndScale {
    from {
        opacity: 0;
        transform: scale(.9, .9);
        z-index: 10000;
        height: auto;
    }
    30% {
        opacity: 1;
        transform: scale(1, 1);
        height: auto;
    }
    70% {
        opacity: 1;
        transform: scale(1, 1);
        height: auto;
    }
    99% {
        opacity: 0;
        transform: scale(1.1, 1.1);
        height: auto;
    }
    to {
        height: 0;
        opacity: 0;
    }
  }
  
  [draggable] {
    user-select: none;
  }
  
</style>
