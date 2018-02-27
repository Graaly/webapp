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
    
    <div class="background-upload">
      <q-btn class="full-width" type="button">
        <label for="picturefile">Télécharger une image de fond</label>
        <input @change="uploadBackgroundImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p>Attention : l'image est retaillée au format 4:3, orientation portrait.</p>
      <div v-if="form.backgroundImage !== null">
        <p>Image téléchargée :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + form.backgroundImage" />
      </div>
    </div>
    
    <div v-if="stepType.code == 'info-video'">
      <q-btn class="full-width" type="button">
        <label for="videofile">Télécharger une vidéo</label>
        <input @change="uploadVideo" name="videofile" id="videofile" type="file" accept="video/mp4,video/x-m4v,video/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <div>
        <!-- TODO show video file infos (size on disk, width x height, etc.) -->
        <p v-show="form.videoStream === null">Aucune vidéo téléchargée.</p>
        <video v-if="form.videoStream !== null" class="full-width" controls controlsList="nodownload">
          <source :src="serverUrl + '/upload/quest/' + questId + '/step/video/' + form.videoStream" type="video/mp4" />
        </video>
      </div>
    </div>
    
    <div v-if="stepType.code == 'new-item'">
      <!-- TODO: choose retrieved item -->
    </div>
    
    <div v-if="stepType.code == 'geolocation'" class="location-gps">
      <!-- TODO: select location on GoogleMap -->
      <p>Coordonnées GPS</p>
      <div class="location-gps-inputs">
        <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
        <div>
          <label for="anwser-latitude">Latitude</label>
          <input type="number" id="anwser-latitude" v-model.number="form.answerCoordinates.lat" placeholder="par ex. 5,65487" step="any" />
        </div>
        <div>
          <label for="anwser-longitude">Longitude</label>
          <input type="number" id="anwser-longitude" v-model.number="form.answerCoordinates.lng" placeholder="par ex. 45,49812" step="any" />
        </div>
      </div>
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
    
    <div v-if="stepType.category == 'enigma'">
      <q-input v-model="form.hint" float-label="Indice" />
    </div>
    
    <q-btn class="full-width" color="primary" @click="submit">Enregistrer l'étape</q-btn>
    
    <div class="link-below-button">
      <router-link :to="{ path: '/quest/' + (isEdition ? 'edit' : 'create') + '/step/type' }">{{ isEdition ? "Changer de type d'étape" : "Retour au choix d'étape" }}</router-link>
    </div>
    
    <div class="link-below-button" v-if="isEdition">
      <router-link :to="{ path: '/quest/edit/step/list'}">Retour à la liste d'étapes</router-link>
    </div>
    
  </div>
</template>

<script>
import { QCheckbox, QUploader, Toast } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import stepTypes from 'data/stepTypes.json'
import StepService from 'services/StepService'
import QuestService from 'services/QuestService'
//import QuestService from 'services/QuestService'
export default {
  components: {
    QCheckbox, QUploader
  },
  data() {
    return {
      questId: null,
      stepId: null,
      isEdition: false,
      form: {
        title: '',
        text: null,
        answers: null,
        backgroundImage: null,
        // info-video step specific
        videoStream: null,
        // geoloc step specific
        answerCoordinates: { lat: 0, lng: 0 },
        showDistanceToTarget: false,
        showDirectionToTarget: false,
        trigger: {
          type: 'none'
        },
        wrongAnwserAnimation: {
          type: 'none'
        },
        hint: '',
        number: null
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
            
      // for 'choose' steps
      defaultNbAnswers: 4,
      minNbAnswers: 2,
      maxNbAnswers: 6,
      rightAnswerIndex: 0,
      serverUrl: process.env.SERVER_URL
    }
  },
  computed: {
    mainTextFieldLabel() {
      return this.stepType.category === 'enigma' ? 'Question' : 'Texte'
    }
  },
  async mounted() {
    // step ID in route or in store ===> edition mode
    if (this.$route.params.hasOwnProperty('stepId')) {
      this.stepId = this.$route.params.stepId
      this.isEdition = true
    } else if (this.$store.state.currentEditedStep && this.$store.state.currentEditedStep._id) {
      this.stepId = this.$store.state.currentEditedStep._id
      this.isEdition = true
    }
    
    if (this.isEdition) {
      this.form = await StepService.getById(this.stepId)
      
      // apply specific field changes from DB to form
      if (this.form.type === 'geolocation') {
        this.form.answerCoordinates = this.form.answers
      } else if (this.form.type === 'choose' && Array.isArray(this.form.answers)) {
        this.rightAnswerIndex = this.form.answers.map(answer => answer.isRightAnswer).indexOf(true)
      }
      
      this.questId = this.form.questId
      this.$store.dispatch('setCurrentEditedStep', {
        _id: this.stepId,
        type: stepTypes.find(type => type.code === this.form.type)
      })
      let res = await QuestService.getById(this.questId)
      this.$store.dispatch('setCurrentEditedQuest', res.data)
    }
    
    this.stepType = this.$store.state.currentEditedStep.type
    this.questId = this.$store.state.currentEditedQuest._id
    
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.stepType.title)
    
    if (this.form.number === null) {
      this.form.number = (await StepService.count({ questId: this.questId })) + 1
    }
    
    if (this.form.title === '') {
      this.form.title = 'Niveau ' + this.form.number
    }
    
    // TODO: adapt when image type answers will be allowed
    if (this.stepType.code === 'choose' && !Array.isArray(this.form.answers)) {
      this.form.answers = []
      for (let i = 0; i < this.defaultNbAnswers; i++) {
        this.form.answers.push({ text: 'réponse ' + (i + 1), isRightAnswer: false })
      }
    }
  },
  methods: {
    
    async submit() {
      if (this.stepType.code === 'choose') {
        this.form.answers[this.rightAnswerIndex].isRightAnswer = true
      }
      if (this.stepType.code === 'geolocation') {
        this.form.answers = this.form.answerCoordinates
      }
      await StepService.save(Object.assign(this.form, {
        questId: this.questId,
        type: this.stepType.code,
        textPosition: 'top', // tmp
        audioStream: null // tmp
      }))
      
      Toast.create.positive('Etape enregistrée.')
      this.$router.push('/quest/edit/step/list')
      this.$store.dispatch('setCurrentEditedStep', null)
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
    },
    async uploadBackgroundImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadBackgroundImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.backgroundImage = uploadResult.data.file
      }
    },
    async uploadVideo(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('video', files[0])
      let uploadResult = await StepService.uploadVideo(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.videoStream = uploadResult.data.file
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

.background-upload img { max-height: 8rem; max-width: 8rem; width: auto; height: auto; }

</style>
