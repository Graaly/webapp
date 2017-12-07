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
    
    <div class="choose-text" v-if="step.type == 'choose-text'">
      <div>
        <p class="text">{{ step.text }}</p>
      </div>
      <div class="answers-text">
        <q-btn v-for="(answer, key) in step.answers" :key="key" class="full-width" :class="answer.class" :icon="answer.icon" @click="checkAnswer(key)" :disabled="playerSuccess !== null">
          {{ answer.text }}
        </q-btn>
      </div>
      <div class="actions">
        <q-btn v-if="step.hint && playerSuccess === null" @click="askForHint()" class="full-width" icon="lightbulb outline" color="primary">Afficher un indice</q-btn>
      </div>
      <div class="successMessage fixed-bottom" v-if="playerSuccess !== null">
        <div class="text" :class="playerSuccess ? 'right' : 'wrong'">{{ playerSuccess ? "Bonne réponse ! (+10 points)" : "Mauvaise réponse !" }}</div>
        <q-btn  color="primary" class="full-width" @click="nextStep()">Suivant</q-btn>
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
      playerSuccess: null
    }
  },
  mounted () {
    // TODO: for questions with text/image answers, do not load the 'right answer' info on front app
    this.getStep()
  },
  methods: {
    async getStep () {
      this.step = await StepService.get(this.$route.params.graalyId, this.$route.params.stepNumber)
      
      if (this.step.backgroundImage) {
        this.$refs.background.style.background = '#fff url("' + this.step.backgroundImage + '")  center/cover no-repeat'
      } else {
        this.$refs.background.style.background = 'none'
        this.$refs.background.style.backgroundColor = '#fff'
      }
    },
    nextStep() {
      this.$router.push('/graaly/play/' + this.step.graalyId + '/step/' + (this.step.number + 1));
    },
    checkAnswer(selectedAnswerKey) {
      // always highlight right answer
      let rightAnswerKey = this.getRightAnswerKey()
      let rightAnswer = this.step.answers[rightAnswerKey]
      rightAnswer.icon = 'done' // "correct" icon
      rightAnswer.class = 'right'
      Vue.set(this.step.answers, rightAnswerKey, rightAnswer)
      
      // TODO this check will have to be done on server side, otherwise a developer can simply do a console.log() to show the right answer
      this.playerSuccess = (selectedAnswerKey === rightAnswerKey)
      
      if (this.playerSuccess) {
        // TODO add points to Graaly player & creator
        
      } else {
        // highlight user selected answer as wrong one
        let selectedAnswer = this.step.answers[selectedAnswerKey]
        selectedAnswer.icon = 'clear' // "x" icon
        selectedAnswer.class = 'wrong'
        Vue.set(this.step.answers, selectedAnswerKey, selectedAnswer)
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
    askForHint() {
      console.log('TODO: askForHint')
    }
  }
}
</script>

<style scoped>
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  .info, .choose-text { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; }
  
  .grow { flex-grow: 1; }
  
  .text,
  .answers-text .q-btn {
    opacity: 0.9;
    background-color: #fff;
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin: 0;
    box-shadow: 0px 0px 0.1rem 0.1rem #fff; }
    
  .q-btn, audio, video { box-shadow: 0px 0.1rem 0.4rem 0.2rem rgba(20, 20, 20, 0.6); }
  
  .q-btn { margin-top: 1rem; }
  
  audio { opacity: 0.9; }
  
  .video { flex-grow: 1; display: flex; align-items: center; }
  
  .answers-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; padding: 0 1rem; }
  .answers-text .q-btn { margin: 0.75rem; font-weight: bold; font-size: 1.2rem; text-transform: none; }
  .right, .q-btn.right { color: #0a0; background-color: #cfc; box-shadow: 0px 0px 0.3rem 0.3rem #9f9; }
  .wrong, .q-btn.wrong { color: #c22; background-color: #fcc; box-shadow: 0px 0px 0.3rem 0.3rem #f99; }
  
  .disabled, [disabled] {
    opacity: 0.9 !important;
  }
  
  .successMessage { padding: 1rem; }
  .successMessage .text { text-align: center; font-weight: bold; }
</style>
