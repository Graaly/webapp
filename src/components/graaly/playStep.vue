<template>
  
  <div class="background" ref="background">
  
    <div class="info" v-if="step.type == 'info'">
      <div :class="{ grow: !step.videoStream }">
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="video" v-if="step.videoStream">
        <video class="full-width" controls controlsList="nodownload" autoplay>
          <source :src="step.videoStream" type="video/mp4" />
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
    
    
    <div class="code" v-if="step.type == 'code'">
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
    
    
    
    
  </div>
  
</template>

<script>
import StepService from 'services/StepService'
import Vue from 'vue'
export default {
  data () {
    return {
      step: {},
      playerResult: null,
      
      // for step type 'code'
      playerCode: [],
      keypad: [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["*", "0", "#"]
      ]
    }
  },
  mounted () {
    // TODO: for questions with text/image answers, do not load the 'right answer' info on front app
    this.getStep().then(() => {
      // wait that DOM is loaded
      this.$nextTick(() => {
        let background = document.getElementById('main-view')
        
        if (this.step.backgroundImage) {
          background.style.background = '#fff url("' + this.step.backgroundImage + '")  center/cover no-repeat'
        } else {
          background.style.background = 'none'
          background.style.backgroundColor = '#fff'
        }
        
        if (this.step.type === 'code') {
          // for step type 'code', this.step.answers is a string in DB
          this.playerCode = Array(this.step.answers.length).fill("");
        }
      })
    })
  },
  methods: {
    
    /* general / multi step methods */
    
    async getStep () {
      this.step = await StepService.get(this.$route.params.graalyId, this.$route.params.stepNumber)
    },
    
    nextStep() {
      this.$router.push('/graaly/play/' + this.step.graalyId + '/step/' + (this.step.number + 1));
    },
    
    askForHint() {
      console.log('TODO: askForHint')
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
        
        case 'code':
          this.playerResult = (this.playerCode.join('') === this.step.answers)
          break
        
        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }
      
      if (this.playerResult) {
        // TODO: add points to Graaly player & creator
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
    
    /* specific methods for step type 'code' */
    
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
    }
  }
}
</script>

<style scoped>
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  .info, .choose, .code { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; }
  .choose, .code { padding-bottom: 8rem; }
  
  .grow { flex-grow: 1; }
  
  .text,
  .answers-text .q-btn {
    opacity: 0.9;
    background-color: #fff;
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin: 0;
    box-shadow: 0px 0px 0.1rem 0.1rem #fff;
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
  .images-block > div { border-radius: 1rem; padding: 0.5rem; position: relative; }
  .images-block img { max-width: 10rem; max-height: 10rem; border-radius: 0.5rem; }
  
  /* keypad specific (code) */
  
  .typedCode { text-align: center; margin: 1rem auto; }
  .typedCode table { border-collapse: collapse; }
  .typedCode td { width: 2rem; height: 3rem; border: 1px solid black; vertical-align: middle; text-align: center; line-height: 3rem; }
  .typedCode td.typed { font-weight: bold; font-size: 1.7rem; }
  
  .keypad { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; text-align: center; }
  .keypad .q-btn { margin: 0.5rem; width: 4rem; height: 4rem; font-weight: bold; font-size: 2rem; }
  
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
