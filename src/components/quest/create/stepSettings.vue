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
        <q-input type="text" stack-label="Latitude" v-model="form.answers.lat" />
        <q-input type="text" stack-label="Longitude" v-model="form.answers.lng" />
      </p>
      <q-checkbox v-model="form.showDistanceToTarget" label="Afficher la distance avec le lieu" />
      <q-checkbox v-model="form.showDirectionToTarget" label="Afficher la flèche de direction" />
    </div>
    
    <div v-if="stepType.code == 'choose'">
      <p>Réponses possibles</p>
      <!-- TODO allow to choose between text / image answers -->
      <div v-for="(answer, key) in form.answers" :key="key">
        <q-checkbox v-model="answer.isRightAnswer" />
        <q-input v-model="answer.text" />
        <q-btn @click="deleteAnswer(key)">
          Supprimer
        </q-btn>
      </div>
      <q-btn @click="addAnswer">
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
      <q-input type="text" stack-label="Heure" v-model="form.trigger.time" /> <!-- TODO required -->
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
    
    
    <q-btn class="full-width" color="primary" @click="submit">Enregistrer l'étape</q-btn>
    
  </div>
</template>

<script>
import { QUploader, Toast } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import stepTypes from 'data/stepTypes.json'
import StepService from 'services/StepService'
//import QuestService from 'services/QuestService'
export default {
  components: {
    QUploader
  },
  data() {
    return {
      questId: null,
      form: {
        title: '',
        text: null,
        answers: null,
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
      
      // for 'geolocation' steps
      showDistanceToTarget: false,
      showDirectionToTarget: false,
      
      // for 'choose' steps ('choose-text' and 'choose-image' steps in database)
      defaultNbAnswers: 4,
      minNbAnswers: 2,
      maxNbAnswers: 6
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
      for (let i = 0; i < this.defaultNbAnswers; i++) {
        this.form.answers.push({ text: '', isRightAnswer: false })
      }
    }
  },
  methods: {
    
    async submit() {
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
      }
      // TODO adapt to support 'choose image'
      this.form.answers.push({ text: '', isRightAnswer: false });
    },
    deleteAnswer: function (key) {
      console.log(key);
      console.log(this.form.answers);
      if (this.form.answers.length <= this.minNbAnswers) {
        Toast.create.negative("Veuillez définir au moins " + this.minNbAnswers + " réponses.")
      }
      this.form.answers.splice(key, 1);
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
.q-item { padding-top: 0; padding-bottom: 0; min-height: 2rem; }
.q-list { padding-top: 0; }
p { margin-bottom: 0.5rem; }
</style>