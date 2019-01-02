<template>
  <div id="play-view" class="fit">
    <div :class="controlsAreDisplayed ? 'fadeIn' : 'hidden'">
    
      <!------------------ TRANSITION AREA ------------------------>
      
      <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video'">
        <div id="info-clickable" :class="{ grow: !step.videoStream }">
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div class="video" v-if="step.videoStream">
          <video class="full-width" controls controlsList="nodownload" autoplay>
            <source :src="serverUrl + '/upload/quest/' + step.questId + '/step/video/' + step.videoStream" type="video/mp4" />
          </video>
        </div>
        <!--
        <audio controls controlsList="nodownload" autoplay v-if="step.audioStream" class="full-width">
          <source :src="step.audioStream" type="audio/mpeg" />
        </audio>
        -->
      </div>
      
      <!------------------ WIN ITEM STEP AREA ------------------------>
      
      <div class="new-item" v-if="step.type == 'new-item'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div class="item">
          <img style="width: 80%" :src="(step.options.picture.indexOf('statics/') > -1 ? step.options.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + step.options.picture)" />
          <p>{{ step.options.title }}</p>
        </div>
      </div>
            
      <!------------------ CHARACTER STEP AREA ------------------------>
      
      <div class="character" v-if="step.type == 'character'">
        <div class="fixed-bottom story" style="bottom: 50px">
          <div class="bubble-top"><img src="statics/icons/story/sticker-top.png" /></div>
          <div class="bubble-middle" style="background: url(statics/icons/story/sticker-middle.png) repeat-y;">
            <p>{{ getTranslatedText() }}</p>
          </div>
          <div class="bubble-bottom"><img src="statics/icons/story/sticker-bottom.png" /></div>
          <div class="character">
            <img :src="'statics/icons/story/character' + step.options.character + '_attitude1.png'" />
          </div>
        </div>
      </div>
        
      <!------------------ CHOOSE STEP AREA ------------------------>
      
      <div class="choose" v-if="step.type == 'choose'">
        <div>
           <p class="text">{{ getTranslatedText() }}</p>
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
      </div>
      
      <!------------------ KEYPAD STEP AREA ------------------------>
      
      <div class="code" v-if="step.type == 'code-keypad'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
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
          <div>
            <q-btn color="primary" icon="clear" :disable="playerCode[0] === ''" @click="clearLastCodeChar()">{{ $t('label.Clear') }}</q-btn>
            <q-btn color="primary" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
      </div>
      
      <!------------------ CODE COLOR STEP AREA ------------------------>
      
      <div class="code code-color" v-if="step.type == 'code-color'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div class="color-bubbles">
          <div v-for="(color, index) in playerCode" :key="index" :style="'background-color: ' + playerCode[index]" @click="changeColorForCode(index)" class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">&nbsp;</div>
        </div>
        
        <div class="actions buttons-bottom" v-show="playerResult === null">
          <div>
            <q-btn color="primary" icon="done" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
      </div>
      
      <!------------------ IMAGE CODE STEP AREA ------------------------>
      
      <div class="code code-image" v-if="step.type == 'code-image'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
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
          <div>
            <q-btn color="primary" icon="done" @click="checkAnswer()">{{ $t('label.Confirm') }}</q-btn>
          </div>
        </div>
      </div>
      
      <!------------------ IMAGE RECOGNITION STEP AREA ------------------------>
      
      <div class="image-recognition" v-if="step.type == 'image-recognition'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div class="photo">
          <img ref="original-photo" :src="serverUrl + '/upload/quest/' + step.questId + '/step/image-recognition/' + step.answers" class="shadow-8" v-show="!cameraStreamEnabled && !photoTaken" />
          <video ref="camera-stream-for-recognition" v-show="cameraStreamEnabled"></video>
          <canvas ref="photo-buffer" class="hidden"></canvas>
          <img ref="player-photo" v-show="photoTaken" :alt="$t('label.TheScreenCaptureWillAppearInThisBox')" />
        </div>
        <div class="actions buttons-bottom">
          <q-btn @click="toggleCameraStream()" class="full-width" v-show="!cameraStreamEnabled && !photoTaken" icon="photo camera" color="primary">{{ $t('label.TakeThePicture') }}</q-btn>
          <div v-show="cameraStreamEnabled">
            <q-btn color="primary" @click="toggleCameraStream()" icon="clear">{{ $t('label.Cancel') }}</q-btn>
            <q-btn color="primary" @click="checkAnswer()" icon="done">{{ $t('label.Check') }}</q-btn>
          </div>
        </div>
      </div>
      
      <!------------------ GEOLOCALISATION STEP AREA ------------------------>
      
      <div class="geolocation" v-if="step.type == 'geolocation'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
          <p class="text" v-if="step.showDistanceToTarget">{{ $t('label.DistanceInMeters', { distance: Math.round(geolocation.distance) }) }}</p>
          <!--
          <p class="text">Raw direction: {{ Math.round(geolocation.rawDirection) }}°</p>
          <p class="text">Alpha: {{ Math.round(geolocation.alpha) }}°</p>
          <p class="text">Difference direction: {{ geolocation.direction }}°</p>
          -->
        </div>
        <div class="centered bg-warning q-pa-sm" v-if="!geolocation.active">
          <q-spinner-puff class="on-left" /> {{ $t('label.WarningNoLocation') }}
        </div>
      </div>
      
      <!------------------ SIMPLE TEXT INPUT STEP AREA ------------------------>
      
      <div class="write-text" v-if="step.type == 'write-text'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div class="answer-text">
          <input v-model="writetext.playerAnswer" :placeholder="$t('label.YourAnswer')" :class="{right: playerResult === true, wrong: playerResult === false}" />
          <q-btn color="primary" class="full-width" :disabled="playerResult !== null" @click="checkAnswer()">{{ $t('label.ConfirmTheAnswer') }}</q-btn>
        </div>
      </div>
      
      <!------------------ JIGSAW STEP AREA ------------------------>
      
      <div class="puzzle" v-if="step.type === 'jigsaw-puzzle'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div id="pieces">
            <div class="piece" draggable="true"
              v-for="piece in puzzle.pieces" :key="piece.pos" :id="'piece-' + piece.pos"
              @dragstart="handleDragStart($event)"
              @drop="handleDrop($event)"
              @dragend="handleDragEnd($event)"
              :style="'background-image: url(' + puzzle.picture + '); background-size: ' + piece.backSize + '% ' + piece.backSize + '%;background-position: -' + piece.backXPos + ' -' + piece.backYPos + ';'"
            ><header :style="'width: ' + piece.width + 'px;height: ' + piece.height + 'px;'"></header></div>
        </div>
        <img style="display: none" :src="puzzle.picture" /><!--trick to be sure that the puzzle display -->
      </div>
      
      <!------------------ MEMORY STEP AREA ------------------------>
      
      <div class="puzzle" v-if="step.type === 'memory'">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <ul class="memory" id="card-deck">
          <li v-for="(item, key) in memory.items" :key="key" class="card" :class="{ open: item.isClicked, show: item.isClicked, disabled: item.isFound }" @click="selectMemoryCard(key)">
            <img :src="serverUrl + '/upload/quest/' + step.questId + '/step/memory/' + item.imagePath" />
          </li>
        </ul>
      </div>
      
      <!------------------ USE ITEM STEP AREA ------------------------>
      
      <div class="use-item" v-if="step.type == 'use-item'" @click="useItem($event)">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div ref="useItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + step.questId + '/step/background/' + step.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw;'">
          <img id="cross-play" style="position: relative; z-index: 500; width: 16vw; height: 16vw; display: none;" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>
      <p v-if="step.type == 'use-item' && nbTry < 2 && playerResult === null && itemUsed !== null" class="inventory-btn" >
        <q-btn round color="primary">
          <img v-if="itemUsed" :src="(itemUsed.picture.indexOf('statics/') > -1 ? itemUsed.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + itemUsed.picture)" />
        </q-btn>
        {{ $t('label.TouchWhereYouUseThisItem') }}
      </p>
      
      <!------------------ FIND ITEM STEP AREA ------------------------>
      
      <div class="find-item" v-if="step.type == 'find-item'" @click="findItem($event)">
        <div>
          <p class="text">{{ getTranslatedText() }}</p>
        </div>
        <div ref="findItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + step.questId + '/step/background/' + step.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw;'">
          <img id="cross-play" style="position: relative; z-index: 500; width: 16vw; height: 16vw; display: none;" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>
      
      <!------------------ LOCATE ITEM IN AUGMENTED REALITY STEP AREA ------------------------>
      
      <div class="locate-item-ar" v-if="step.type == 'locate-item-ar'">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <video ref="camera-stream-for-locate-item-ar" v-show="cameraStreamEnabled && !playerResult"></video>
        </transition>
        <div v-show="!playerResult">
          <div class="text">
            <p>{{ getTranslatedText() }}</p>
            <p v-if="step.showDistanceToTarget">{{ $t('label.DistanceInMeters', { distance: Math.round(geolocation.distance) }) }}</p>
            <p v-if="!this.geolocation.canSeeTarget">{{ $t('label.ObjectIsTooFar') }}</p>
            <p v-if="this.geolocation.canTouchTarget">{{ $t('label.TouchTheObject') }}</p>
          </div>
        </div>
        <div class="target-view" v-show="!playerResult || (playerResult && step.options.is3D)">
          <canvas id="target-canvas" @click="onTargetCanvasClick"></canvas>
        </div>
        <img ref="item-image" v-show="playerResult && !step.options.is3D" />
      </div>
      
      <!------------------ LOCATE A 2D MARKER ------------------------>
      
      <div class="locate-marker" v-if="step.type == 'locate-marker'">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <video ref="camera-stream-for-locate-marker" v-show="cameraStreamEnabled && !playerResult"></video>
        </transition>
        <div v-if="locateMarker.layer !== null">
          <transition appear :enter-active-class="'animated ' + locateMarker.layer.animationShow" :leave-active-class="'animated ' + locateMarker.layer.animationHide">
            <img class="locate-marker-layer" :src="'statics/images/find-marker-layers/' + step.options.layerCode + '.png'" v-show="playerResult === null || (playerResult === false && nbTry < 2)" />
          </transition>
        </div>
        <div v-show="!playerResult">
          <div class="text" v-show="getTranslatedText() != ''">
            <p>{{ getTranslatedText() }}</p>
          </div>
        </div>
        <img class="locate-marker-answer" v-if="playerResult" :src="'statics/markers/' + locateMarker.playerAnswer + '/marker.png'" />
        <div class="marker-view" v-show="!playerResult">
          <canvas id="marker-canvas"></canvas>
        </div>
        <!-- HELP -->
        <q-btn round size="lg" class="absolute-bottom-left" color="primary" @click="locateMarker.showHelp = true"><span>?</span></q-btn>
        <div class="fixed-bottom over-map" style="height: 100%" v-if="locateMarker.showHelp">
          <story step="help" :data="{help: $t('label.FindMarkerHelp')}" @next="locateMarker.showHelp = false"></story>
        </div>
      </div>
    </div>
    
    <!------------------ COMMON COMPONENTS ------------------>
    
    <div class="direction-helper" v-show="(step.type == 'geolocation' || step.type == 'locate-item-ar') && step.showDirectionToTarget && playerResult === null" :style="{ width: directionHelperSize + 'rem', height: directionHelperSize + 'rem !important' }">
      <canvas id="direction-canvas" :style="{ width: directionHelperSize + 'rem', height: directionHelperSize + 'rem' }"></canvas>
    </div>
    
    <!--====================== WIN POINTS ANIMATION =================================-->
    
    <div v-show="playerResult === true && score > 0" class="fadein-message">+{{ score }} <q-icon color="white" name="fas fa-trophy" /></div>
    <div v-show="playerResult === true && reward > 0" class="fadein-message">+{{ reward }} <q-icon color="white" name="fas fa-bolt" /></div>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
    
  </div>
  
</template>

<script>
import StepService from 'services/StepService'
import simi from 'src/includes/simi' // for image similarity
import utils from 'src/includes/utils'

import colorsForCode from 'data/colorsForCode.json'
import modelsList from 'data/3DModels.json'
import markersList from 'data/markers.json'
import layersForMarkers from 'data/layersForMarkers.json'

import Notification from 'plugins/NotifyHelper'
import story from 'components/story'

import Vue from 'vue'

// required for step 'locate-item-ar'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import GLTFLoader from 'three-gltf-loader'

// required for step 'locate-marker'
// currently (AR.js 1.6.2) MODULE IMPORT IS NOT SUPPORTED.
// => adapted AR.js to work as a module (from file three.js/build/ar.js of the original package).
// see https://github.com/jeromeetienne/AR.js/issues/428
import { THREEx } from 'src/includes/ar' // import * as ARjs from 'ar.js' in future versions?
import { promisify } from 'es6-promisify'

export default {
  /*
   * Properties used on component call
   * step : step data (mandatory)
   * runId : Id of the run (0 = simulation mode)
   * reload : set to true if data must be reload
   * itemUsed : item of the inventory used
   * lang : language of the step (fr, en, ...)
   */
  props: ['step', 'runId', 'reload', 'itemUsed', 'lang'],
  components: {
    story
  },
  watch: { 
    // refresh component if stepId change
    reload: async function(newVal, oldVal) {
      if (newVal === true || newVal === 'true') {
        await this.initData()
      }
      if (newVal === false || newVal === 'false') {
        this.hideReadMoreAlert()
      }
    }
  },
  data: function () {
    return this.initialState()
  },
  computed: {
    directionHelperSize: function () {
      return this.step && this.step.type === 'locate-item-ar' ? 7 : 10 // in rem
    }
  },
  mounted () {
    // seems always already done by "watch" on "reload" key // Uncommented by EMA on 122018, in some case watcher does not work
    this.initData()
  },
  beforeDestroy() {
    // this is called every time route changes => cleanup all memory & CPU intensive tasks here
    
    // (camera streams, 3D animations, GPS trackings...)
    this.clearAllCameraStreams()
    
    // cancels recursive 'requestAnimationFrame()' calls
    // otherwise they continue in the background even when route changes
    this.stopLatestAnimation()
    
    // clean 3D objects/scenes to avoid memory leaks
    this.geolocation.target = null
    this.locateMarker.scene = null
    this.locateMarker.renderer = null
    this.locateMarker.camera = null
    this.locateMarker.arToolkitContext = null
    this.locateMarker.arSmoothedControls = null
    this.locateMarker.markerRoot = null
    this.locateMarker.markerControls = null
    
    if (this.geolocation.locationWatcher !== null) {
      navigator.geolocation.clearWatch(this.geolocation.locationWatcher)
    }
    
    if (this.geolocation.absoluteOrientationSensor !== null) {
      this.geolocation.absoluteOrientationSensor.stop()
    }
    
    utils.clearAllRunningProcesses()
  },
  methods: {
    initialState () {
      return {
        playerResult: null,
        cameraStreamEnabled: false,
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        score: 0,
        reward: 0,
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
        
        // for step types 'geoloc' and 'locate-item-ar'
        geolocation: {
          distance: null,
          direction: null,
          // location
          locationWatcher: null,
          watchLocationInterval: 1000, // ms
          // direction
          rawDirection: null,
          alpha: null,
          beta: null,
          // for 'locate-item-ar'
          absoluteOrientationSensor: null, 
          target: null,
          canSeeTarget: false,
          canTouchTarget: false,
          active: true
        },
        
        // for step type 'locate-marker'
        locateMarker: {
          renderer: null,
          scene: null,
          camera: null,
          arToolkitContext: null,
          arSmoothedControls: null,
          markerRoot: null,
          markerControls: {},
          playerAnswer: '',
          layer: null,
          showHelp: false
        },
        
        // for step type 'write-text'
        writetext: {
          playerAnswer: null
        },
        
        // for step type 'jigsaw puzzle'
        puzzle: {
          pieces: [],
          picture: 'statics/icons/game/medal.png',
          dragSrcEl: null,
          element: {}
        },
        
        // for step type 'memory'
        memory: {
          items: [],
          nbTry: 0,
          score: 0,
          selectedKey: null,
          disabled: false
        },
        // for step type 'find-item'
        itemAdded: null,
        readMoreNotif: null,
        // for story/tutorial
        story: {
          step: null,
          data: null
        },
        // for cleanup
        latestRequestAnimationId: null
      }
    },
    /*
     * Init the component data
     */
    initData () {
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
            // define if background image is a generic one or user defined one
            let backgroundUrl = this.step.backgroundImage[0] === "_" ? 'statics/images/quest/' + this.step.backgroundImage : process.env.SERVER_URL + '/upload/quest/' + this.step.questId + '/step/background/' + this.step.backgroundImage
            background.style.background = '#fff url("' + backgroundUrl + '") center/cover no-repeat'
            // all background clickable for transitions
            //if ((["info-text", "geolocation", "choose", "write-text", "code-keypad", "code-color"]).indexOf(this.step.type) > -1) {
              //let clickable = document.getElementById('info-clickable')
              //let clickable = document.getElementById('main-view')
              //clickable.addEventListener("click", this.showControls, false);
            //}
            
            // display controls after some seconds to let user see background
            utils.setTimeout(this.showControls, 1000)
          }
        } else {
          background.style.background = 'none'
          background.style.backgroundColor = '#fff'
          this.showControls()
        }
        
        // always reset drawDirectionInterval (used for geolocation steps)
        let drawDirectionInterval = this.$store.state.questSteps.geolocation.drawDirectionInterval
        if (drawDirectionInterval !== null) {
          window.clearInterval(drawDirectionInterval)
        }
        this.$store.dispatch('setDrawDirectionInterval', null)

        if (this.step.type === 'info-text' || this.step.type === 'info-video' || this.step.type === 'character' || this.step.type === 'new-item') {
          // validate steps with no enigma
          utils.setTimeout(this.checkAnswer, 1000)
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
          utils.setTimeout(this.initPuzzle, 1000)
          this.$emit('pass')
        }
        
        if (this.step.type === 'memory') {
          this.initMemory()
          this.$emit('pass')
        }
        
        // common process to 'geolocation' and 'locate-item-ar'
        if (this.step.type === 'geolocation' || this.step.type === 'locate-item-ar') {
          // user can pass
          this.$emit('pass')
          
          this.geolocation.locationWatcher = navigator.geolocation.watchPosition(this.watchLocationSuccess, this.watchLocationError, {
            enableHighAccuracy: true,
            timeout: this.geolocation.watchLocationInterval,
            maximumAge: 0
          })
        
          if ('ondeviceorientationabsolute' in window) {
            // chrome specific, see https://developers.google.com/web/updates/2016/03/device-orientation-changes
            window.addEventListener('deviceorientationabsolute', this.handleOrientation)
          }  else {
            // TODO friendly behavior/message for user
            console.warn("No absolute orientation info is available")
          }
          
          // must store object returned by setInterval() in Vue store instead of component properties,
          // otherwise it is reset when route changes & component is reloaded
          this.$store.dispatch('setDrawDirectionInterval', window.setInterval(this.drawDirectionArrow, 200))
        }
        
        if (this.step.type === 'locate-item-ar' && !this.playerResult) {
          let cameraStream = this.$refs['camera-stream-for-locate-item-ar']
          // enable rear camera stream
          // -------------------------
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
            });
          
          // Start absolute orientation sensor
          // ---------------------------------
          // Required to make camera orientation follow device orientation 
          // It is different from 'deviceorientationabsolute' listener whose values are not
          // reliable when device is held vertically
          let sensor = new AbsoluteOrientationSensor({ frequency: 30 })
          sensor.onerror = event => console.error(event.error.name, event.error.message)
          sensor.onreading = this.onAbsoluteOrientationSensorReading
          sensor.start()
          this.geolocation.absoluteOrientationSensor = sensor
          
          // Prepare scene to render
          // -----------------------
          
          let sceneCanvas = document.getElementById("target-canvas")
          
          this.geolocation.target = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000),
            renderer: new THREE.WebGLRenderer({ canvas: sceneCanvas, alpha: true, antialias: true }),
            size: null, // in meters
            // for animation
            mixers: [],
            clock: new THREE.Clock()
          }
          
          this.geolocation.target.renderer.setSize(window.innerWidth, window.innerHeight)
          
          let target = this.geolocation.target
          let scene = target.scene
          
          // --- Light ---
          
          // create a point light from top
          // TODO maybe a directional light would cost less CPU
          const pointLight = new THREE.PointLight(0xD0D0D0)
          pointLight.position.set(0, 0, 1000)
          scene.add(pointLight)
          
          // soft ambient light
          scene.add(new THREE.AmbientLight(0xC0C0C0))
          
          // --- specific parts for 2D/3D ---
          let object
          if (this.step.options.is3D) {
            let scaleFactor = 4 // make objects four times bigger than their "real" size, for better usability
            let objectModel = this.step.options.model
            let objectInit = modelsList[objectModel]
            let gltfData
            try {
              this.$q.loading.show()
              gltfData = await this.ModelLoaderAsync(objectModel)
              this.$q.loading.hide()
            } catch (err) {
              console.error("Error while loading 3D model:", err)
              Notification(this.$t('label.CouldNotDisplayObject'), 'error')
              return
            }
            
            object = gltfData.scene
            
            // apply user-defined rotation
            objectInit.rotation = objectInit.rotation || {}
            if (objectInit.rotation.hasOwnProperty('x')) { object.rotateX(utils.degreesToRadians(objectInit.rotation.x)) } else {
              object.rotateX(Math.PI / 2)
            }
            if (objectInit.rotation.hasOwnProperty('y')) { object.rotateY(utils.degreesToRadians(objectInit.rotation.y)) }
            if (objectInit.rotation.hasOwnProperty('z')) { object.rotateZ(utils.degreesToRadians(objectInit.rotation.z)) }
            
            // apply user-defined scaling
            let scale = (objectInit.scale || 1) * scaleFactor
            object.scale.set(scale, scale, scale)
            
            // set object origin at center
            let objBbox = new THREE.Box3().setFromObject(object)
            
            let pivot = objBbox.getCenter(new THREE.Vector3())
            pivot.multiplyScalar(-1)
            
            let pivotObj = new THREE.Object3D();
            object.applyMatrix(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
            pivotObj.add(object)
            pivotObj.up = new THREE.Vector3(0, 0, 1)
            object = pivotObj
            
            // added offset to make 3D object "sit on the ground" by default (z = 0 at the bottom of the object)
            let box = new THREE.Box3().setFromObject(object)
            let onGroundOffset = (box.max.z - box.min.z) / 2
            object.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, onGroundOffset))
            
            // compute object size = max(length, width, depth)
            target.size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z)
            
            // apply user-defined translation
            if (objectInit.translation) {
              if (objectInit.translation.hasOwnProperty('x')) { object.position.x += objectInit.translation.x * scaleFactor }
              if (objectInit.translation.hasOwnProperty('y')) { object.position.y += objectInit.translation.y * scaleFactor }
              if (objectInit.translation.hasOwnProperty('z')) { object.position.z += objectInit.translation.z * scaleFactor }
            }
            
            // animations ? play first animation
            if (gltfData.animations.length > 0) {
              let mixer = new THREE.AnimationMixer(gltfData.scene)
              mixer.clipAction(gltfData.animations[0]).play()
              this.geolocation.target.mixers.push(mixer)
            }
          } else {
            // 2D plane with transparent image (user uploaded picture) as texture
            let itemImage = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/locate-item-ar/' + this.step.options.picture
          
            this.$refs['item-image'].src = itemImage
            
            target.size = this.step.options.objectSize || 1
            let geometry = new THREE.PlaneGeometry(target.size, target.size)
            let texture
            try {
              texture = new THREE.TextureLoader().load(itemImage)
            } catch (err) {
              console.error("Error while loading image:", err)
              Notification(this.$t('label.CouldNotDisplayObject'), 'error')
              return
            }
            let material = new THREE.MeshBasicMaterial({map: texture})
            object = new THREE.Mesh(geometry, material)
            object.position.y = 0
          }
          
          object.name = "targetObject"
          object.up = new THREE.Vector3(0, 0, 1)
          object.visible = false
          scene.add(object)
          
          // default camera direction => look at positive y axis from origin
          this.geolocation.target.camera.up = new THREE.Vector3(0, 0, 1)
          this.geolocation.target.camera.lookAt(new THREE.Vector3(0, 1, 0))
          // handheld device will be nearly 1.50m above ground (1.5 * 4 = 6 if "is3D")
          this.geolocation.target.camera.position.z = this.step.options.is3D ? 6 : 1.5
          
          // animate & render
          this.animateTargetCanvas()
        }
        
        if (this.step.type === 'locate-marker' && !this.playerResult) {
          // user can pass
          this.$emit('pass')
          
          for (let layer of layersForMarkers) {
            if (layer.code === this.step.options.layerCode) {
              this.locateMarker.layer = layer
              break
            }
          }
          
          let cameraStream = this.$refs['camera-stream-for-locate-marker']
          // enable rear camera stream
          // ------------------------- 
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
            .then((stream) => {
              cameraStream.srcObject = stream
              cameraStream.play()
              cameraStream.onloadeddata = async (e) => {
                this.cameraStreamEnabled = true
                let sceneCanvas = document.getElementById('marker-canvas')
                
                let ratio = cameraStream.videoHeight ? sceneCanvas.clientHeight / cameraStream.videoHeight : 1
                
                sceneCanvas.height = cameraStream.videoHeight * ratio
                sceneCanvas.width = Math.round(sceneCanvas.height * 4 / 3)
                
                let renderer = new THREE.WebGLRenderer({
                  canvas: sceneCanvas,
                  antialias: true,
                  alpha: true
                })
                          
                let scene = new THREE.Scene()
                
                let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000)
                scene.add(camera)
                
                // --- initialize arToolkitContext ---
                
                // create atToolkitContext
                let arToolkitContext = new THREEx.ArToolkitContext({
                  cameraParametersUrl: 'statics/markers/camera_para.dat',
                  detectionMode: 'mono',
                  maxDetectionRate: 30,
                  // sampling size, always 4:3 ratio...
                  canvasWidth: 640,
                  canvasHeight: 480,
                  patternRatio: 0.8
                })
                // initialize it
                arToolkitContext.initAsync = promisify(arToolkitContext.init)
                await arToolkitContext.initAsync()
                
                // copy projection matrix to camera
                camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
                
                // --- Create an ArMarkerControls ---
                
                let markerRoot = new THREE.Group()
                scene.add(markerRoot)
                                
                // build a smoothedControls
                let arWorldRoot = new THREE.Group()
                scene.add(arWorldRoot)
                let arSmoothedControls = new THREEx.ArSmoothedControls(arWorldRoot, {
                  lerpPosition: 0.4,
                  lerpQuaternion: 0.3,
                  lerpScale: 1
                })
                
                // --- add an object in the scene ---
                
                // add a transparent plane
                //let geometry = new THREE.CubeGeometry(1, 1, 1)
                let geometry = new THREE.PlaneGeometry(1, 1)
                let material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
                let mesh  = new THREE.Mesh(geometry, material)
                mesh.rotateX(Math.PI / 2)
                arWorldRoot.add(mesh)
                arWorldRoot.name = 'markerObject'
                
                this.locateMarker.arToolkitContext = arToolkitContext
                this.locateMarker.arSmoothedControls = arSmoothedControls
                
                this.locateMarker.renderer = renderer
                this.locateMarker.scene = scene
                this.locateMarker.camera = camera
                
                this.locateMarker.markerRoot = markerRoot
                this.locateMarker.markerCodeAnswer = this.step.answers
                markersList.forEach((markerCode) => {
                  this.locateMarker.markerControls[markerCode] = this.createMarkerControl(markerCode)
                })
                
                this.animateMarkerCanvas()
              }
            })
            .catch((err) => {
              // TODO friendly behavior/message for user
              console.warn("No camera stream available")
              console.log(err)
            });
        }
      })
    },
    /*
    * creates a marker control for step type 'locate-marker'
    */
    createMarkerControl (markerCode) {
      let arToolkitContext = this.locateMarker.arToolkitContext
      let markerRoot = this.locateMarker.markerRoot
      
      let marker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'statics/markers/' + markerCode + '/pattern-marker.patt'
      })
      marker.code = markerCode
      marker.addEventListener('markerFound', (ev) => { this.checkAnswer(ev.target.code) })
      marker.detected = false
      
      return marker
    },
    /*
     * Show controls buttons
     */
    showControls () {
      this.controlsAreDisplayed = true // !this.controlsAreDisplayed
    },
    /*
     * Send answer server side 
     * @param   {Object}    selectedAnswerKey            Answer object
     */
    async sendAnswer(questId, stepId, runId, answerData, displaySpinner) {
      if (displaySpinner) {
        this.$q.loading.show()
      }
      let checkAnswerResult = await StepService.checkAnswer(questId, stepId, runId, answerData)
      if (displaySpinner) {
        this.$q.loading.hide()
      }
      return checkAnswerResult
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
        case 'character':
          // save step automatic success
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {}, false)
          this.submitGoodAnswer(0)
          break
          
        case 'choose':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, true)

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
            // indicate the right answer
            if (checkAnswerResult.answer || checkAnswerResult.answer === 0) {
              let selectedAnswer = this.step.options[checkAnswerResult.answer]
              selectedAnswer.icon = 'done'
              selectedAnswer.class = 'right'
              Vue.set(this.step.options, checkAnswerResult.answer, selectedAnswer)
            }
            this.nbTry++
            this.submitWrongAnswer()
          }
          
          break
        
        case 'geolocation':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, false)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          }
          break
          
        case 'image-recognition':
          const comparison = this.checkPhoto()
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: comparison}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.submitWrongAnswer()
          }
          break
          
        case 'code-keypad':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('')}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetKeypadCode()
              this.submitRetry()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
        
        case 'code-color':
          this.$q.loading.show()
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('|')}, true)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetColorCode()
              this.submitRetry()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
          
        case 'code-image':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: this.playerCode.join('|')}, true)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset code
              this.resetImageCode()
              this.submitRetry()
            } else {
              this.submitWrongAnswer()
            }
          }
          break
        
        case 'jigsaw-puzzle':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer.join('|')}, true)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          }
          break
          
        case 'memory':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {}, false)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          }
          break
        
        case 'write-text':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: this.writetext.playerAnswer}, true)
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
          } else {
            this.nbTry++
            if (this.nbTry < 2) {
              // reset field
              this.writetext.playerAnswer = ""
              this.submitRetry()
            } else {
              this.submitWrongAnswer()
            }
          }
          
          break
        
        case 'use-item':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, true)
          
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
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, true)
          
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
          
        case 'locate-item-ar':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, false)

          if (checkAnswerResult.result === true) {
            this.geolocation.absoluteOrientationSensor.stop() // stop moving camera when device moves
            
            TWEEN.removeAll() // clear all running animations
            
            // show found object when it's a 3D model
            if (this.step.options && this.step.options.is3D) {
              let target = this.geolocation.target
              let camera = target.camera
              let object = target.scene.getObjectByName('targetObject')
              
              let box = new THREE.Box3().setFromObject(object)
              let size = new THREE.Vector3()
              box.getSize(size)
                            
              let cameraDistance = Math.max(size.x, size.y, size.z) * 2
              
              let startScale = object.scale
              
              let disappearAnimation = new TWEEN.Tween(object.scale).to({ x: 0, y: 0, z: 0 }, 1000)
                .easing(TWEEN.Easing.Back.In)
                .onComplete(() => {
                  camera.position.set(0, 0, cameraDistance * 2 / 3)
                  camera.lookAt(new THREE.Vector3(0, cameraDistance, size.z / 2))
                  object.position.set(0, cameraDistance, size.z / 2)
                  
                  this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
                })
              
              let appearAnimation = new TWEEN.Tween(object.scale).to({ x: startScale.x, y: startScale.y, z: startScale.z }, 1000)
                .easing(TWEEN.Easing.Back.Out)
              
              // https://stackoverflow.com/a/31766476/488666
              let rotationAnimation = new TWEEN.Tween(object.rotation)
                .to({ z: "-" + Math.PI / 2 }, 2000) // relative animation
                .onComplete(function() {
                    // Check that the full 360 degrees of rotation, 
                    // and calculate the remainder of the division to avoid overflow.
                    if (Math.abs(object.rotation.z) >= 2 * Math.PI) {
                        object.rotation.z = object.rotation.z % (2 * Math.PI);
                    }
                })
                .repeat(Infinity)
                
              disappearAnimation.chain(appearAnimation, rotationAnimation).start()
            } else { // 2D image on plane
              this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0)
            }
          }
          break
          
        case 'locate-marker':
          if (!this.locateMarker.markerControls[answer].detected) {
            let object = this.locateMarker.scene.getObjectByName('markerObject')
            
            let raycaster = new THREE.Raycaster()
            
            // imaginary line starting from screen center
            raycaster.setFromCamera(new THREE.Vector2(0, 0), this.locateMarker.camera)
            
            // second parameter set to true so that intersectObject() traverses recursively the object
            // and its children geometries
            let intersects = raycaster.intersectObject(object, true)
            
            if (intersects.length > 0) {
              this.locateMarker.markerControls[answer].detected = true
              checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.id, this.runId, {answer: answer}, true)
              
              if (checkAnswerResult.result === true) {
                this.submitGoodAnswer(checkAnswerResult.score)
                this.stopVideoTracks('camera-stream-for-locate-marker')
                this.locateMarker.scene = new THREE.Scene()
                this.locateMarker.renderer.render(this.locateMarker.scene, this.locateMarker.camera)
                this.locateMarker.playerAnswer = answer // for display
              } else {
                this.nbTry++
                if (this.nbTry === 2) {
                  this.submitWrongAnswer()
                  this.stopVideoTracks('camera-stream-for-locate-marker')
                  this.locateMarker.scene = new THREE.Scene()
                  this.locateMarker.renderer.render(this.locateMarker.scene, this.locateMarker.camera)
                } else {
                  this.submitRetry()
                }
              }
            }
          }
          break

        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }
      
      // display score
      this.score = (checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0
      this.reward = (checkAnswerResult && checkAnswerResult.reward) ? checkAnswerResult.reward : 0
    },
    /*
     * Send good andwer  
     */
    submitGoodAnswer(score) {
      this.playerResult = true
      this.$emit('success', score)
      this.$emit('played')
      
      this.displayReadMoreAlert()
      
      switch (this.step.type) {
        case 'character': 
        case 'new-item': 
        case 'info-text': 
        case 'info-video': 
          
          break
        case 'choose':
        case 'code-keypad':
        case 'code-color':
        case 'code-image':
          this.displaySuccessMessage(true, this.$t('label.GoodAnswer'))
          break
        case 'image-recognition':
        case 'write-text':
        case 'jigsaw-puzzle':
        case 'memory':
        case 'use-item':
        case 'find-item':
        case 'locate-marker':
          this.displaySuccessMessage(true, this.$t('label.WellDone'))
          break
        case 'geolocation':
          this.displaySuccessMessage(true, this.$t('label.YouHaveFoundThePlace'))
          break
        case 'locate-item-ar':
          this.displaySuccessMessage(true, this.$t('label.YouHaveWinANewItem'))
          break
      }
      // advise user to move to next step
      utils.setTimeout(this.alertToPassToNextStep, 15000)
    },
    /*
     * Send wrong answer 
     */
    submitWrongAnswer() {
      this.playerResult = false
      this.$emit('fail')
      this.$emit('played')
      
      this.displayReadMoreAlert()
      
      if (this.step.type === 'image-recognition') {
        this.displaySuccessMessage(false, this.$t('label.PhotosDoesntMatch'))
      } else {
        this.displaySuccessMessage(false, this.$t('label.WrongAnswer'))
      }
      // advise user to move to next step
      utils.setTimeout(this.alertToPassToNextStep, 15000)
    },
    alertToPassToNextStep() {
      this.displaySuccessMessage(true, this.$t('label.ClickOnArrowToMoveToNextStep'))
    },
    /*
     * Display the read more alert
     */
    displayReadMoreAlert() {
      if (this.step.extraText && typeof this.step.extraText === 'object' && this.step.extraText[this.lang]) {
        var actions = [
          {
            label: this.$t('label.ReadMore'),
            handler: () => {
              this.readMore()
            }
          }
        ]
        this.readMoreNotif = Notification(this.$t('label.ClickHereToKnowMore'), 'readMore', actions)
      }
    },
    hideReadMoreAlert() {
      if (this.readMoreNotif !== null) {
        this.readMoreNotif()
      }
    },
    /*
     * Display retry message when wrong answer
     */
    submitRetry() {
      this.displaySuccessMessage(false, this.$t('label.SecondTry'))
    },
    
    ////////////////////////////////////////////// MANAGEMENT OF THE ENIGMA COMPONENTS /////////////////////////////////////////////
    
    /*
     * Reset the key pad 
     */
    resetKeypadCode() {
      //this.playerCode = Array(this.step.answers.length).fill("")
      const length = ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4)
      this.playerCode = Array(length).fill("")
    },
    /*
     * Reset the color code pad
     */
    resetColorCode() {
      const length = ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4)
      this.playerCode = Array(length).fill('red')
    },
    /*
     * Reset the image code pad
     */
    resetImageCode() {
      this.playerCode.length = 0
      for (var i = 0; i < ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4); i++) {
        this.playerCode.push(0)
      }
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
    toggleCameraStream() {
      // already enabled ? => disable
      
      if (this.cameraStreamEnabled) {
        this.stopVideoTracks('camera-stream-for-recognition')
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
        this.stopVideoTracks('camera-stream-for-recognition')
        
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
    stopVideoTracks(cameraStreamElementRef) {
      if (this.$refs[cameraStreamElementRef].srcObject) {
        this.$refs[cameraStreamElementRef].srcObject.getVideoTracks().forEach(function(track) { track.stop() })
      }
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
      this.geolocation.direction = (this.geolocation.rawDirection - this.geolocation.alpha + 360) % 360
      this.geolocation.beta = event.beta
    },
    /*
     * Draw direction arrows for geolocation
     */
    drawDirectionArrow() {
      if (this.geolocation.alpha === null || document.querySelector('.direction-helper canvas') === null) {
        return
      }
      
      // refresh arrow in canvas depending on direction
      let canvas = document.querySelector('.direction-helper canvas')
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      
      let ctx = canvas.getContext('2d')
      
      let w = canvas.width
      let h = canvas.height
      
      let arrowCenterX = Math.round(w / 2)
      let arrowCenterY = Math.round(h / 2)
      
      ctx.save()
      
      ctx.clearRect(0, 0, w, h)
      
      ctx.translate(arrowCenterX, arrowCenterY)
      
      ctx.lineWidth = Math.round(20 * this.directionHelperSize / 10)
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
      this.geolocation.active = false
      console.warn('Could not get location from watchPosition()')
      console.log(err)
    },
    /*
     * Handle location tracking success
     * @param   {object}    pos            User position
     */
    async watchLocationSuccess(pos) {
      this.geolocation.active = true
      let current = pos.coords;
      
      // if lat and lng are not set, compute to have the object close to the current user position
      if (this.step.options.lat === 0 && this.step.options.lng === 0) {
        if (this.step.type === 'locate-item-ar') {
          this.step.options.lat = current.latitude + 0.0002
          this.step.options.lng = current.longitude 
        } else {
          this.step.options.lat = current.latitude + 0.0005
          this.step.options.lng = current.longitude + 0.0005 
        }
      }
      
      let options = this.step.options
      
      if (typeof options === 'undefined') {
        console.warn("watchLocationSuccess: variable 'options' is undefined. Could not get latitude & longitude of the target.")
        return
      }
      
      // compute distance between two coordinates
      this.geolocation.distance = utils.distanceInKmBetweenEarthCoordinates(options.lat, options.lng, current.latitude, current.longitude) * 1000 // meters
      
      this.geolocation.rawDirection = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, options.lat, options.lng)
      
      // compute new X/Y coordinates of the object (considering that camera is always at (0, 0))
      
      if (this.step.type === 'locate-item-ar' && this.geolocation.target.scene !== null) {
        let target = this.geolocation.target
        let scene = target.scene
        let object = scene.getObjectByName('targetObject')
        
        // if target size is 1m, consider that it can be seen at 40m
        // target size 50cm => seen at 20m, etc.
        this.geolocation.canSeeTarget = target.size === null || this.geolocation.distance < target.size * 40
        
        // object may not be loaded at first calls => skip part where 3D scene must be loaded
        if (typeof object === 'undefined') { return }
        object.visible = true
        
        let finalDirection = utils.degreesToRadians(this.geolocation.rawDirection)
        let newPositionX = this.geolocation.distance !== 0 ? Math.sin(finalDirection) * this.geolocation.distance : 0
        let newPositionY = this.geolocation.distance !== 0 ? Math.cos(finalDirection) * this.geolocation.distance : 0
        
        // smooth position change
        new TWEEN.Tween(object.position)
          .to({ x: newPositionX, y: newPositionY }, this.geolocation.watchLocationInterval)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start()
        
        // tell player to touch object + detect touch as soon as device is below a certain distance from the object coordinates
        if (!this.geolocation.canTouchTarget && this.geolocation.distance <= 10) {
          this.geolocation.canTouchTarget = true
        }
      }
      
      if (this.step.type === 'geolocation' && this.geolocation.distance <= 20) {
        navigator.geolocation.clearWatch(this.geolocation.locationWatcher)
        await this.checkAnswer(current)
      }
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
      let answerPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }
      
      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = Math.round(8 * vw)
      // display the right solution
      var cross = document.getElementById('cross-play')
      cross.style.top = (answerPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (answerPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
      var crossPicture = cross.src
      var self = this
      setInterval(function() {
        if (cross.src === crossPicture) {
          cross.src = (self.step.answers.item.indexOf('statics/') > -1 ? self.step.answers.item : self.serverUrl + '/upload/quest/' + self.step.questId + '/step/new-item/' + self.step.answers.item)
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
     * get the translation for main text
     */
    getTranslatedText() {
      let defaultText = ""
      if (this.step.type === 'new-item') {
        defaultText = this.$t('label.YouHaveWinANewItem')
      }
      let translation = (this.step.text && typeof this.step.text === 'object' && this.step.text[this.lang]) ? this.step.text[this.lang] : defaultText
      return translation
    },
    /*
     * Show the item location after success / failure
     */
    async showFoundLocation(posX, posY) {
      let vw = window.innerWidth / 100
      let answerPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }
      
      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = Math.round(8 * vw)
      
      var cross = document.getElementById('cross-play')
      cross.style.top = (answerPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (answerPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
    },
    
    /*
     * Check if the puzzle is correct
     */
    async checkPuzzle() {
      var result = this.comparePuzzlePiecePositions()
      
      if (result) {
        this.checkAnswer(result)
      }
    },
    comparePuzzlePiecePositions() {
      var answer = []
      var rightPositions = this.step.answers.split('|')
      for (var i = 0; i < this.puzzle.pieces.length; i++) {
        answer.push(this.puzzle.pieces[i].pos)
        if (rightPositions[i] !== this.puzzle.pieces[i].pos) {
          return false
        }
      }
      return answer
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
      
      //Shuffle & check that after shuffle the piece are correctly shuffled
      var ordered = true
      while (ordered) {
        this.puzzle.pieces = this.shuffle(this.puzzle.pieces)
        ordered = this.comparePuzzlePiecePositions()
      }
      
      this.puzzle.picture = this.step.options.picture.indexOf('upload/') === -1 ? this.serverUrl + '/upload/quest/' + this.step.questId + '/step/jigsaw-puzzle/' + this.step.options.picture : this.serverUrl + this.step.options.picture

      initJigsaw(this.puzzle.element)
    },
    shuffle(array) {
      for (var i = array.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let k = array[i]
        array[i] = array[j]
        array[j] = k
      }
      return array
    },
    /*
     * Handle puzzle piece move
     * @param   {object}    e            Event when user touch puzzle piece
     */
    handleDragStart(e) {
      if (e.target.className.indexOf('piece') !== -1) {
        this.puzzle.dragSrcEl = e.target;
        /*this.puzzle.dragSrcEl.style.opacity = '0.4';
        var dt = e.dataTransfer;
        dt.effectAllowed = 'move';
        dt.setData('text', this.puzzle.dragSrcEl.innerHTML);
       
        // customize drag image for one of the panels
        if (dt.setDragImage instanceof Function && e.target.innerHTML.indexOf('X') > -1) {
          var img = new Image();
          img.src = 'dragimage.jpg';
          dt.setDragImage(img, img.width / 2, img.height / 2);
        }*/
      }
    },
    /*
     * Handle puzzle piece move over
     * @param   {object}    e            Event when user move puzzle piece over
     *
    handleDragOver(e) {
      if (this.dragSrcEl) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    },*/
    /*
     * Handle puzzle piece drag enter
     * @param   {object}    e            Event when user touch puzzle piece
     *
    handleDragEnter(e) {
      if (this.dragSrcEl) {
        e.target.classList.add('over');
      }
    },
    /*
     * Handle puzzle piece drag leave
     * @param   {object}    e            Event when user touch puzzle piece
     *
    handleDragLeave(e) {
      if (this.dragSrcEl) {
        e.target.classList.remove('over');
      }
    },*/
    /*
     * Handle puzzle piece move end
     * @param   {object}    e            Event when user stop moving puzzle piece
     */
    handleDragEnd(e) {
      this.puzzle.dragSrcEl = null;
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
      if (this.puzzle.dragSrcEl) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        // if the target is defined & a piece is moved
        if (e.target.parentNode.id && this.puzzle.dragSrcEl.id) {
          // get id of piece moved and piece destination
          var destId = e.target.parentNode.id.replace('piece-', '')
          var sourceId = this.puzzle.dragSrcEl.id.replace('piece-', '')
          var destIdPos = 0, sourceIdPos = 0
          
          // if the piece is moved
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
            // check if the puzzle is finished
            this.checkPuzzle()
          }
        }
      }
    },
    /*
     * Init the memory game
     */
    initMemory() {
      var items = []
      for (var i = 0; i < (this.step.options.items.length * 2); i++) {
        let tileUsed = (i < this.step.options.items.length ? this.step.options.items[i] : this.step.options.items[i - this.step.options.items.length])
        // tile is not displayed twice if single
        if (!tileUsed.single || i < this.step.options.items.length) {
          items[i] = {imagePath: tileUsed.imagePath, isClicked: false, isFound: false}
        }
      }
      
      this.memory.items = this.shuffle(items)
    },
    /*
     * Handle selection of the memory card
     * @param   {Number}    key            index of the memory pieces array selected
     */
    selectMemoryCard(key) {
      if (this.memory.disabled) {
        return
      }
      if (this.memory.nbTry >= 1 && key === this.memory.selectedKey) {
        return
      }
      var _self = this
      this.memory.items[key].isClicked = true
      Vue.set(this.memory.items, key, this.memory.items[key])
      if (this.memory.nbTry >= 1) {
        if (this.memory.items[this.memory.selectedKey].imagePath === this.memory.items[key].imagePath) {
          this.memory.score++;
          if (this.memory.score === Math.floor(this.memory.items.length / 2)) { 
            // uncover all tiles
            for (var i = 0; i < this.memory.items.length; i++) {
              if (!this.memory.items[i].isFound) {
                this.memory.items[i].isClicked = true
                Vue.set(this.memory.items, i, this.memory.items[i])
              }
            }
            this.checkAnswer(true)
          } else {
            _self.memory.items[_self.memory.selectedKey].isFound = true
            _self.memory.items[key].isFound = true
            Vue.set(_self.memory.items, _self.memory.selectedKey, _self.memory.items[_self.memory.selectedKey])
            Vue.set(_self.memory.items, key, _self.memory.items[key])
          }
        } else {
          this.memory.disabled = true
          utils.setTimeout(function() {
            _self.memory.items[_self.memory.selectedKey].isClicked = false
            _self.memory.items[key].isClicked = false
            Vue.set(_self.memory.items, _self.memory.selectedKey, _self.memory.items[_self.memory.selectedKey])
            Vue.set(_self.memory.items, key, _self.memory.items[key])
            _self.memory.disabled = false
          }, 1500)
        }
        this.memory.nbTry = 0
      } else {
        this.memory.nbTry++
        this.memory.selectedKey = key
      }
    },
    
    /*
    * Animate canvas showing item (target) to find, for step type "locate-item-ar"
    */
    animateTargetCanvas() {
      this.latestRequestAnimationId = requestAnimationFrame(this.animateTargetCanvas)
      let target = this.geolocation.target
      let mixers = target.mixers
      
      // 2D object: plane must always face camera
      if (this.step.options && !this.step.options.is3D) {
        let plane = target.scene.getObjectByName('targetObject')
        plane.lookAt(target.camera.position)
      }
      // animation
      if (mixers.length > 0) {
        for (var i = 0; i < mixers.length; i++) {
          mixers[i].update(target.clock.getDelta());
        }
      }
      target.renderer.render(target.scene, target.camera)
      TWEEN.update()
    },
    /*
    * Animate canvas showing 3D object on top of marker, for step type "locate-marker"
    */
    animateMarkerCanvas() {
      if (this.playerResult !== null) {
        return
      }
      
      // run the rendering loop
      this.latestRequestAnimationId = requestAnimationFrame(this.animateMarkerCanvas)
      
      this.locateMarker.arToolkitContext.update(this.$refs['camera-stream-for-locate-marker'])
      this.locateMarker.arSmoothedControls.update(this.locateMarker.markerRoot)
      this.locateMarker.renderer.render(this.locateMarker.scene, this.locateMarker.camera);
    },
    /*
    * stop latest animation
    */
    stopLatestAnimation() {
      cancelAnimationFrame(this.latestRequestAnimationId)
      this.latestRequestAnimationId = null
    },
    /*
    * when reading a new value from AbsoluteOrientationSensor, update camera rotation so it matches device orientation
    */
    onAbsoluteOrientationSensorReading() {
      let camera = this.geolocation.target.camera
      camera.quaternion.fromArray(this.geolocation.absoluteOrientationSensor.quaternion)
    },
    /*
    * Detect object touch
    */
    onTargetCanvasClick(event) {
      if (this.playerResult !== null) {
        this.geolocation.canTouchTarget = false
        return
      }
      
      event.preventDefault()
      
      let target = this.geolocation.target
      let object = target.scene.getObjectByName('targetObject')
      
      let touchPos = new THREE.Vector2()
      touchPos.x = (event.clientX / target.renderer.domElement.clientWidth) * 2 - 1
      touchPos.y = -(event.clientY / target.renderer.domElement.clientHeight) * 2 + 1
      
      let raycaster = new THREE.Raycaster()
      
      raycaster.setFromCamera(touchPos, target.camera)
      
      // second parameter set to true so that intersectObject() traverses recursively the object
      // and its children geometries
      let intersects = raycaster.intersectObject(object, true)
      
      if (intersects.length > 0 && this.geolocation.canTouchTarget) {
        // stop location watching
        navigator.geolocation.clearWatch(this.geolocation.locationWatcher)
        // stop camera streams
        this.stopVideoTracks('camera-stream-for-locate-item-ar')
        this.checkAnswer()
      }
    },
    /*
    * Loads material file and object file into a 3D Model for Three.js
    * Supports only GLTF format
    * Returns a Promise, usable with async/await
    */
    async ModelLoaderAsync(objName) {
      let progress = console.log
      
      return new Promise((resolve, reject) => {
        let gltfLoader = new GLTFLoader()
        // loads automatically .bin and textures files if necessary
        gltfLoader.load(this.serverUrl + '/statics/3d-models/' + objName + '/scene.gltf', resolve, progress, reject)
      })
    },
    /*
    * Display the success message
    */
    displaySuccessMessage (success, message, actions) {
      Notification(message, (success ? 'rightAnswer' : 'wrongAnswer'), actions)
    },
    /*
    * Display read more text
    */
    readMore() {
      if (this.step.extraText && typeof this.step.extraText === 'object' && this.step.extraText[this.lang]) {
        this.story.step = 6
        this.story.data = {
          readMore: this.step.extraText[this.lang]
        }
      }
    },
    /*
    * clear all camera streams
    */
    clearAllCameraStreams() {
      // TODO maybe only one "camera stream" <div> could be used by all steps
      let streamDivs = [
        'camera-stream-for-recognition',
        'camera-stream-for-locate-marker',
        'camera-stream-for-locate-item-ar'
      ]
      
      let streams = []
      
      for (let streamDiv of streamDivs) {
        let element = this.$refs[streamDiv]
        if (typeof element !== 'undefined' && element.srcObject) {
          streams.push(element.srcObject)
        }
      }
            
      for (let stream of streams) {
        utils.clearCameraStream(stream)
      }
    }
  }
}
</script>

<style scoped>
  
  .inventory-items div { float: left; margin-right: 15px; width: 100px; height: 175px; overflow: hidden; text-align: center;}
  .inventory-items div img { width: 100px; height: 100px; }

  #play-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #play-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; /*padding-bottom: 4rem;*/ }
  #play-view > div > div { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; /*padding-bottom: 8rem;*/ }
  #play-view > div > div.find-item, #play-view > div > div.use-item { padding: 0px }
  #play-view > div > div.locate-item-ar { padding-bottom: 1rem; }
  
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
  .text p { padding: 0.25rem 0; margin: 0; }
  
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
  .keypad .q-btn { margin: 0.5rem; width: 20%; height: 15%; font-weight: bold; font-size: 1.3rem; }
  
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
  .geolocation .text { margin-bottom: 0.5rem; }
  
  /* jigsaw puzzle specific */
  
  #pieces { padding: 0; margin: 0; width: 100%; background: #777; border: 1px solid #777; display: block; }
  #pieces .piece { display: inline-block; margin: 0; box-shadow: inset 0 0 3px #000; text-align: center; cursor: move; background-repeat: none; }
  
  /* write-text specific */
  
  .answer-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
  .answer-text input { opacity: 0.7; font-size: 1.5em; font-weight: bold; height: 1.5em; background-color: #fff; border-radius: 0.5rem; box-shadow: 0px 0px 0.1rem 0.1rem #fff;}
    
  /* new-item specific */
  
  .new-item .item { text-align: center; }
  .new-item .item p { font-size: 2rem; }
  
  /* locate-item-ar specific */
  
  .locate-item-ar video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-item-ar .target-view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .locate-item-ar #target-canvas { position: relative; width: 100%; height: 100%; z-index: 20; }
  .locate-item-ar .text { z-index: 50; position: relative; } /* positioning is required to have z-index working */
  .locate-item-ar img { margin: 30vw auto; } /* 2D result image */
  
  /* locate-marker specific */
  
  .locate-marker video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-marker .marker-view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .locate-marker #marker-canvas { width: 100%; height: 100%; object-fit: cover; z-index: 20; }
  .locate-marker .text { z-index: 50; position: relative; } /* positioning is required to have z-index working */
  .locate-marker img.locate-marker-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 30; padding: 0; margin: 0; }
  .locate-marker img.locate-marker-answer { width: 60vw; margin: 30vw auto; }
  .locate-marker .q-btn { margin-bottom: 17vw; margin-left: 4vw; z-index: 50; }
  .locate-marker .q-btn span { font-size: 36px; }
  
  /* memory specific */
  
  .memory {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    margin: 0 0 3em;
    list-style-type: none;
  }

  .memory .card {
    height: 3.7rem;
    width: 3.7rem;
    margin: 0.2rem 0.2rem;
    background: #141214;
    color: #ffffff;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 5px 2px 20px 0 rgba(46, 61, 73, 0.5);
  }
  .memory .card img {
    width: 0;
    height: 0;
  }
  .memory .card.open img {
    transform: rotateY(0);
    cursor: default;
    animation-name: flipInY;
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
  }
  .memory .card.show img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }
  .memory .card.disabled {
    pointer-events: none;
    opacity: 0.9;
  }

  .memory .card.match {
    cursor: default;
    background: #E5F720;
    font-size: 33px;
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
  }

  .memory .card.unmatched {
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
    background: #e2043b;
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
  
  .disabled, [disabled] {
    opacity: 0.9 !important;
  }
  
  .actions > div { display: flex; flex-flow: row nowrap; }
  .actions > div > .q-btn { flex-grow: 1; }
  .actions > div > .q-btn:not(:first-child) { flex-grow: 1; margin-left: 1rem; }
    
  .inventory-btn { position: fixed; bottom: 60px; left: 0.7rem; z-index: 1; color: #fff; }
  .inventory-btn img { width: 100%; height: 100%; border-radius: 50%; }
  
  [draggable] {
    user-select: none;
  }
  
  .play .buttons-bottom {
    position: fixed;
    bottom: 70px;
    left: 10px;
    right: 10px;
  }
  
  /*
  * direction helper: width and height are computed properties (depending on the current step type)
  */  
  .direction-helper { position: absolute; bottom: 20vw; left: 0; right: 0; margin-left: auto; margin-right: auto; z-index: 30; min-height: initial !important; }
  .direction-helper canvas { margin: auto; }
  
</style>
