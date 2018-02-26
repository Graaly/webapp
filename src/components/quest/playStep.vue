<template>
  
  <div>
  
    <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video'">
      <div :class="{ grow: !step.videoStream }">
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
      <q-btn color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
    </div>
    
    
    <div class="choose" v-if="step.type == 'choose-text' || step.type == 'choose-image'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="answers-text" v-if="step.type == 'choose-text'">
        <q-btn v-for="(answer, key) in step.answers" :key="key" class="full-width" :class="answer.class" :icon="answer.icon" @click="checkAnswer(key)" :disabled="playerResult !== null">
          {{ answer.text }}
        </q-btn>
      </div>
      <div class="answers-images" v-if="step.type == 'choose-image'">
        <div class="images-block">
          <div v-for="(answer, key) in step.answers" :key="key" :class="answer.class" @click="checkAnswer(key)">
            <img :src="answer.imagePath" :class="answer.class" />
            <q-btn v-if="answer.class !== null" round :class="answer.class" :icon="answer.icon" disable />
          </div>
        </div>
      </div>
      <div class="actions fixed-bottom">
        <q-btn v-show="step.hint && playerResult === null" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">Afficher un indice</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
        <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? "Bonne réponse ! (+10 points)" : "Mauvaise réponse !" }}</div>
        <q-btn color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
      </div>
    </div>
    
    
    <div class="code" v-if="step.type == 'code-keypad'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="typedCode">
        <table class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">
        <tr>
          <td v-for="(sign, key) in playerCode" :class="{ typed: sign !== ''}">{{ sign == '' ? '?' : sign }}</td>
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
          <q-btn color="primary" icon="clear" :disable="playerCode[0] === ''" @click="clearLastCodeChar()">Effacer</q-btn>
          <q-btn color="primary" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()">Valider</q-btn>
        </div>
        <q-btn v-show="step.hint" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">Afficher un indice</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
        <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? "Bonne réponse ! (+10 points)" : "Raté ! Le bon code était : " + step.answers }}</div>
        <q-btn color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
      </div>
    </div>
    
    
    <div class="image-recognition" v-if="step.type == 'image-recognition'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="photo">
        <img ref="original-photo" :src="step.answers" class="shadow-8" v-show="!cameraStreamEnabled && !photoTaken" />
        <video ref="camera-stream-for-recognition" v-show="cameraStreamEnabled"></video>
        <canvas ref="photo-buffer" class="hidden"></canvas>
        <img ref="player-photo" v-show="photoTaken" alt="The screen capture will appear in this box." />
      </div>
      <div class="actions fixed-bottom">
        <q-btn @click="togglecameraStream()" class="full-width" v-show="!cameraStreamEnabled && !photoTaken" icon="photo camera" color="primary">Prendre la photo</q-btn>
        <div v-show="cameraStreamEnabled">
          <q-btn color="primary" @click="togglecameraStream()" icon="clear">Annuler</q-btn>
          <q-btn color="primary" @click="checkPhoto()" icon="done">Vérifier</q-btn>
        </div>
        <q-btn v-show="step.hint && !photoTaken" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">Afficher un indice</q-btn>
        <div class="text resultMessage" :class="playerResult ? 'right' : 'wrong'" v-show="playerResult !== null">{{ playerResult ? "Bien joué ! (+10 points)" : "Malheureusement, cette photo ne correspond pas." }}</div>
        <q-btn v-show="photoTaken" color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
      </div>
    </div>
    
    
    <div class="geolocation" v-if="step.type == 'geolocation'">
      <video ref="camera-stream-for-geolocation" v-show="cameraStreamEnabled"></video>
      <div>
        <p class="text">{{ step.text }}</p>
        <p class="text">Distance: {{ geolocation.distance }} mètres</p>
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
        <div class="text right" v-show="playerResult">Bravo, vous êtes à proximité du lieu ! (+10 points)</div>
        <q-btn color="primary" class="full-width" @click="nextStep()">{{ playerResult ? 'Suivant' : 'Passer' }}</q-btn>
      </div>
    </div>
    
    
    <div class="write-text" v-if="step.type == 'write-text'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="answer-text">
        <input v-model="writetext.playerAnswer" placeholder="Votre réponse" :class="{right: playerResult === true, wrong: playerResult === false}" />
        <q-btn color="primary" class="full-width" :disabled="playerResult !== null" @click="checkAnswer()">Valider la réponse</q-btn>
      </div>
      <div class="actions fixed-bottom">
        <q-btn v-show="step.hint && playerResult === null" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">Afficher un indice</q-btn>
      </div>
      <div class="resultMessage fixed-bottom" v-show="playerResult !== null">
        <div class="text" :class="playerResult ? 'right' : 'wrong'">{{ playerResult ? "Bonne réponse ! (+10 points)" : "Mauvaise réponse !" }}</div>
        <q-btn color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
      </div>
    </div>
    
    
  </div>
  
</template>

<script>
import simi from 'src/includes/simi' // for image similarity
import utils from 'src/includes/utils'
import StepService from 'services/StepService'
import Vue from 'vue'
import { Alert, Toast } from 'quasar'
export default {
  data () {
    return {
      step: {},
      playerResult: null,
      cameraStreamEnabled: false,
      questId: this.$route.params.questId,
      serverUrl: process.env.SERVER_URL,
      
      // for step type 'code-keypad'
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
      }
    }
  },
  mounted () {
    // TODO: for questions with text/image answers, do not load the 'right answer' info on front app
    this.getStep().then((step) => {
      // no more available step => we reached end of quest
      if (typeof step === 'undefined') {
        this.$router.push('/quest/end');
        return
      }
      
      this.step = step
      
      // wait that DOM is loaded (required by steps involving camera)
      this.$nextTick(() => {
        let background = document.getElementById('main-view')
        
        if (this.step.backgroundImage) {
          background.style.background = '#fff url("' + process.env.SERVER_URL + '/upload/quest/' + this.questId + '/step/background/' + this.step.backgroundImage + '")  center/cover no-repeat'
        } else {
          background.style.background = 'none'
          background.style.backgroundColor = '#fff'
        }
        
        if (this.step.type === 'code-keypad') {
          // for step type 'code-keypad', this.step.answers is a string in DB
          this.playerCode = Array(this.step.answers.length).fill("");
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
        html: 'Désolé, une erreur est survenue. Veuillez contacter le support.',
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
      return StepService.getOne({
        questId: this.$route.params.questId,
        number: this.$route.params.stepNumber
      })
    },
    
    nextStep() {
      this.$router.push('/quest/play/' + this.step.questId + '/step/' + (this.step.number + 1));
    },
    
    askForHint() {
      // TODO reduce points won for current step
      Toast.create('Indice : ' + this.step.hint)
    },
    
    checkAnswer(selectedAnswerKey) {
      if (this.playerResult !== null) {
        return
      }
      
      switch (this.step.type) {
        case 'choose-text':
        case 'choose-image':
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
        
        case 'write-text':
          this.playerResult = (this.writetext.playerAnswer === this.step.answers)
          break
        
        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }
      
      if (this.playerResult) {
        // TODO: add points to quest player & creator
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
        
        let originalPhoto = document.createElement('canvas')
        originalPhoto.width = this.$refs['original-photo'].naturalWidth
        originalPhoto.height = this.$refs['original-photo'].naturalHeight
        originalPhoto.getContext('2d').drawImage(this.$refs['original-photo'], 0, 0, originalPhoto.width, originalPhoto.height)
        
        this.playerResult = simi.compare(photoBuffer, originalPhoto) >= this.photoComparisonThreshold
        
        this.photoTaken = true
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
    
    watchLocationSuccess(pos) {
      let current = pos.coords;
      let target = this.step.answers
      //test 
      //let target = { lat: 45.322313, lng: 5.557124 } // 90°
      //let target = { lat: 45.343431, lng: 5.522534 } // 0°
      
      // compute distance between two coordinates
      this.geolocation.distance = Math.round(utils.distanceInKmBetweenEarthCoordinates(target.lat, target.lng, current.latitude, current.longitude) * 1000, 2) // meters
      
      // TODO no hardcoding
      if (this.geolocation.distance < 20) {
        console.log('Congratulations, you reached the target')
        navigator.geolocation.clearWatch(this.geolocation.locationWatcher);
        this.playerResult = true
      }
      
      this.geolocation.currentBearing = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, target.lat, target.lng)
      
      this.geolocation.rawDirection = this.geolocation.currentBearing
    }
  }
}
</script>

<style scoped>
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > div { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; padding-bottom: 8rem; }
  
  #main-view > div.info,
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
  
  .typedCode { text-align: center; margin: 1rem auto; }
  .typedCode table { border-collapse: collapse; }
  .typedCode td { width: 2rem; height: 3rem; border: 1px solid black; vertical-align: middle; text-align: center; line-height: 3rem; }
  .typedCode td.typed { font-weight: bold; font-size: 1.7rem; }
  
  .keypad { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; text-align: center; }
  .keypad .q-btn { margin: 0.5rem; width: 15%; height: 15%; font-weight: bold; font-size: 1.7rem; }
  
  /* image recognition specific */
  
  .image-recognition .photo { flex-grow: 1; overflow-y: hidden; margin-top: 1rem; display: flex; flex-flow: column nowrap; justify-content: center; padding: 0.5rem; margin: -0.5rem; } /* negative margin required to have image shadow visible on sides */
  .image-recognition .photo img, 
  .image-recognition .photo > video { width: 100%; border-radius: 0.5rem; }
  
  /* geolocation specific */
  
  .geolocation video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  .geolocation .direction-helper { flex-grow: 1; display: flex; flex-flow: column nowrap; }
  .geolocation .direction-helper canvas { width: 10rem; height: 10rem; margin: auto; margin-bottom: 0; }
  
  /* write-text specific */
  
  .answer-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
  .answer-text input { opacity: 0.7; font-size: 1.5em; font-weight: bold; height: 1.5em; background-color: #fff; 
    border-radius: 0.5rem;
    box-shadow: 0px 0px 0.1rem 0.1rem #fff;}
  
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
  
</style>
