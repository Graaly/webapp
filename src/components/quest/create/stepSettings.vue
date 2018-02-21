<template>
  <div>
    
    <q-field :error="$v.form.title.$error">
      <q-input type="text" float-label="Titre" v-model="form.title" @blur="$v.form.title.$touch" />
      <div class="q-field-bottom" v-if="$v.form.title.$error">
        <div class="q-field-error" v-if="!$v.form.title.required">Veuillez saisir un titre.</div>
      </div>
    </q-field>
    
    <!-- common for all steps (main text or question) -->
    <div>
      <q-input
        v-model="form.text"
        type="textarea"
        :float-label="mainTextFieldLabel"
        :max-height="100"
        :min-rows="4"
        class="full-width"
      />
    </div>
    
    <div v-if="stepType.code == 'info-video'">
      <!-- TODO: upload -->
    </div>
    
    <div v-if="stepType.code == 'new-item'">
      <!-- TODO: choose retrieved item -->
    </div>
    
    <div v-if="stepType.code == 'geolocation'">
      <!-- TODO: select location on GoogleMap -->
      <p>Coordonnées GPS</p>
      <p class="location-gps-inputs">
        <q-input type="text" stack-label="Latitude" v-model="form.answerCoordinates.lat" />
        <q-input type="text" stack-label="Longitude" v-model="form.answerCoordinates.lng" />
      </p>
      <q-checkbox v-model="form.showDistanceToTarget" label="Afficher la distance avec le lieu" />
      <q-checkbox v-model="form.showDirectionToTarget" label="Afficher la flèche de direction" />
    </div>
    
    <div v-if="stepType.code == 'choose'">
      <p>Réponses possibles :</p>
      <p>Sélectionnez la bonne réponse à l'aide des boutons radio.</p>
      <!-- TODO allow to choose between text / image answers -->
      <div class="answer" v-for="(answer, key) in form.answers" :key="key">
        <q-radio v-model="rightAnswerIndex" :val="key" />
        <q-input v-model="answer.text" />
        <q-btn @click="deleteAnswer(key)">
          <q-icon name="clear" />
        </q-btn>
      </div>
      <q-btn @click="addAnswer()" class="full-width add-answer">
        Ajouter une réponse
      </q-btn>
    </div>
    
    <div v-if="stepType.code == 'write-text'">
      <q-input
        v-model="form.answers"
        float-label="Réponse attendue"
      />
    </div>
    
    <div v-if="stepType.code == 'code-keypad'">
      <!-- TODO validation: numbers only -->
      <q-input
        v-model="form.answers"
        float-label="Code"
        max-length="4"
      />
    </div>
    
    <div v-if="stepType.code == 'code-color'">
      Combinaison de couleurs attendue:
      <!-- TODO -->
    </div>
    
    
    <div v-if="stepType.code == 'image-recognition'">
      Image à photographier
      <!-- TODO -->
    </div>
    
    
    <div v-if="stepType.code == 'jigsaw-puzzle'">
      <!-- TODO -->
      Image à reconstituer:
      <ul>
        <li>Nombre de lignes</li>
        <li>Nombre de colonnes</li>
      </ul>
    </div>
    
    <div v-if="stepType.code == 'use-item'">
      Objet à utiliser:
      <!-- TODO -->
    </div>
    
    <!-- TODO. those options do nothing for the moment -->
    <!--
    <h2>Autres options</h2>
    
    <p>Déclencheur</p>
    
    <q-list link>
      <q-item tag="label" v-for="trigger in triggerList" :key="trigger.type">
        <q-item-side>
          <q-radio v-model="form.trigger.type" :val="trigger.type" />
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{ trigger.label }}</q-item-tile>
        </q-item-main>
      </q-item>
    </q-list>
    
    <p class="location-gps-inputs" v-if="form.trigger.type === 'location'">
      <q-input type="text" stack-label="Latitude" v-model="form.trigger.lat" />
      <q-input type="text" stack-label="Longitude" v-model="form.trigger.lng" />
    </p>
    
    <p v-if="form.trigger.type === 'datetime'">
      <q-input type="text" stack-label="Date" v-model="form.trigger.date" />
      <q-input type="text" stack-label="Heure" v-model="form.trigger.time" />
    </p>
    
    <p>Animation de réponse incorrecte</p>
    
    <q-list link>
      <q-item tag="label" v-for="option in wrongAnwserAnimationList" :key="option.type">
        <q-item-side>
          <q-radio v-model="form.wrongAnwserAnimation.type" :val="option.type" />
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{ option.label }}</q-item-tile>
        </q-item-main>
      </q-item>
    </q-list>
    
    <q-input
      v-if="form.wrongAnwserAnimation.type === 'text'"
      v-model="form.wrongAnwserAnimation.text"
      type="textarea"
      float-label="Message en cas de mauvaise réponse"
      :max-height="100"
      :min-rows="4"
      class="full-width"
    />
    -->
    
    <q-btn class="full-width" color="primary" @click="submit">Enregistrer l'étape</q-btn>
    
  </div>
</template>

<script>
import { QCheckbox, QUploader, Toast } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import stepTypes from 'data/stepTypes.json'
import StepService from 'services/StepService'
//import QuestService from 'services/QuestService'
export default {
  components: {
    QCheckbox, QUploader
  },
  data() {
    return {
      questId: null,
      form: {
        title: '',
        text: null,
        answers: null,
        // geolog step specific
        answerCoordinates: { lat: 0, lng: 0 },
        showDistanceToTarget: false,
        showDirectionToTarget: false,
        trigger: {
          type: 'none'
        },
        wrongAnwserAnimation: {
          type: 'none'
        }
      },
      stepType: {
        code: null
      },
      stepTypes,
      
      triggerList: [
        { type: 'none',     label: 'Aucun (immédiat)' },
        { type: 'location', label: 'Lieu (et direction)' },
        { type: 'datetime', label: 'Date / heure' }
      ],
      
      wrongAnwserAnimationList: [
        { type: 'none', label: "Aucune (passer à l'étape suivante)" },
        { type: 'text', label: 'Texte' }
      ],
            
      // for 'choose' steps ('choose-text' and 'choose-image' steps in database)
      defaultNbAnswers: 4,
      minNbAnswers: 2,
      maxNbAnswers: 6,
      rightAnswerIndex: 0
    }
  },
  computed: {
    mainTextFieldLabel() {
      return this.stepType.category === 'enigma' ? 'Question' : 'Texte'
    }
  },
  async mounted() {
    this.stepType = this.$store.state.currentEditedStep.type
    this.questId = this.$store.state.currentEditedQuest.id
    
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.stepType.title)
    
    this.stepNumber = (await StepService.count({ questId: this.questId })) + 1
    
    if (this.stepType.code === 'info-text') {
      this.form.title = 'Niveau ' + this.stepNumber
    }
    
    // TODO: adapt when image type answers will be allowed
    if (this.stepType.code === 'choose') {
      this.form.answers = []
      for (let i = 0; i < this.defaultNbAnswers; i++) {
        this.form.answers.push({ text: 'réponse ' + (i + 1), isRightAnswer: false })
      }
    }
  },
  methods: {
    
    async submit() {
      if (this.stepType.code === 'choose') {
        // only choose-text for the moment
        this.form.answers[this.rightAnswerIndex].isRightAnswer = true
      }
      if (this.stepType.code === 'geolocation') {
        this.form.answers = this.form.answerCoordinates
      }
      await StepService.save(Object.assign(this.form, {
        questId: this.questId,
        type: this.stepType.code === 'choose' ? 'choose-text' : this.stepType.code,
        number: this.stepNumber,
        textPosition: 'top', // tmp
        hint: null, // TODO: add a field for hints
        backgroundImage: null, // tmp
        videoStream: null, // tmp
        audioStream: null // tmp
      }))
      
      Toast.create.positive('Etape enregistrée.')
      this.$router.push('/quest/create/step/list')
      this.$store.dispatch('saveQuestStepType', null)
    },
    
    // for 'choose' step type
    addAnswer: function () {
      if (this.form.answers.length >= this.maxNbAnswers) {
        Toast.create.negative("Veuillez définir un maximum de " + this.maxNbAnswers + " réponses.")
      } else {
        // TODO adapt to support 'choose image'
        this.form.answers.push({ text: 'réponse ' + (this.form.answers.length + 1), isRightAnswer: false });
      }
    },
    deleteAnswer: function (key) {
      if (this.form.answers.length <= this.minNbAnswers) {
        Toast.create.negative("Veuillez définir au moins " + this.minNbAnswers + " réponses.")
      } else {
        this.form.answers.splice(key, 1);
      }
    }
  },
  validations: {
    form: {
      title: { required }
    }
  }
}
</script>

<style scoped>

#main-view { padding: 1rem; overflow-y: scroll; }

h2 { font-size: 1.2rem; color: grey; }
p { margin-bottom: 0.5rem; }

.q-item { padding-top: 0; padding-bottom: 0; min-height: 2rem; }
.q-list { padding-top: 0; }

.answer { display: flex; flex-flow: row nowrap; }
.answer .q-input { flex-grow: 1 }
.answer .q-radio { padding: 0.5rem; }
.answer .q-btn { padding: 0.3rem; margin: 0.2rem; }
.add-answer { margin: 0.5rem auto; }

</style>
