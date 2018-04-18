<template>
  <div>
    <q-field :error="$v.form.title.$error">
      <q-input type="text" :float-label="$t('message.Title')" v-model="form.title" @blur="$v.form.title.$touch" />
      <div class="q-field-bottom" v-if="$v.form.title.$error">
        <div class="q-field-error" v-if="!$v.form.title.required">{{ $t('message.PleaseEnterATitle') }}</div>
      </div>
    </q-field>
    
    <!-- common for all steps (main text or question) -->
    <div>
      <q-field
        :error="$v.form.text.$error"
        :error-label="$t('message.KeepEnigmaQuestionsShort')"
        :count="mainTextMaxLength"
      >
        <q-input
          :float-label="$t('message.' + mainTextFieldLabel)"
          v-model="form.text"
          type="textarea"
          :max-height="100"
          :min-rows="4"
          class="full-width"
          @blur="$v.form.text.$touch"
          @input="$v.form.text.$touch"
        />
      </q-field>
    </div>

    <div class="background-upload">
      <q-btn class="full-width" type="button">
        <label for="picturefile">{{ $t('message.UploadABackgroundImage') }}</label>
        <input @change="uploadBackgroundImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p v-if="form.backgroundImage === null">{{ $t('message.WarningImageResize') }}</p>
      <div v-if="form.backgroundImage !== null && form.backgroundImage !== ''">
        <p>{{ $t('message.YourPicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + form.backgroundImage" /> <br />
        <a @click="form.backgroundImage = null">{{ $t('message.remove') }}</a>
      </div>
    </div>
    
    <div v-if="stepType.code == 'info-video'">
      <q-btn class="full-width" type="button">
        <label for="videofile">{{ $t('message.UploadAVideo') }}</label>
        <input @change="uploadVideo" name="videofile" id="videofile" type="file" accept="video/mp4,video/x-m4v,video/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <div>
        <!-- TODO show video file infos (size on disk, width x height, etc.) -->
        <p v-show="form.videoStream === null">{{ $t('message.NoVideoUploaded') }}</p>
        <video v-if="form.videoStream !== null" class="full-width" controls controlsList="nodownload">
          <source :src="serverUrl + '/upload/quest/' + questId + '/step/video/' + form.videoStream" type="video/mp4" />
        </video>
      </div>
    </div>
    
    <div v-if="stepType.code == 'geolocation'" class="location-gps">
      <!-- TODO: select location on GoogleMap -->
      <p>Coordonnées GPS</p>
      <div class="location-gps-inputs">
        <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
        <div>
          <label for="answer-latitude">Latitude</label>
          <input type="number" id="answer-latitude" v-model.number="form.answerCoordinates.lat" placeholder="par ex. 5,65487" step="any" />
        </div>
        <div>
          <label for="answer-longitude">Longitude</label>
          <input type="number" id="answer-longitude" v-model.number="form.answerCoordinates.lng" placeholder="par ex. 45,49812" step="any" />
        </div>
      </div>
      <q-checkbox v-model="form.showDistanceToTarget" :label="$t('message.DisplayDistanceBetweenUserAndLocation')" />
      <q-checkbox v-model="form.showDirectionToTarget" :label="$t('message.DisplayDirectionArrow')" />
    </div>
    
    <div v-if="stepType.code == 'choose'">
      
      <h2>{{ $t('message.ResponseTypes') }}</h2>
      <q-radio v-model="answerType" val="text" :label="$t('message.Texts')" />
      <q-radio v-model="answerType" val="image" :label="$t('message.Pictures')" />
        
      <h2>{{ $t('message.PossibleAnswers') }}</h2>
      <p>{{ $t('message.SelectTheGoodAnswer') }}</p>
      <div class="answer" v-for="(answer, key) in form.answers" :key="key">
        <q-radio v-model="rightAnswerIndex" :val="key" />
        <q-input v-show="answerType === 'text'" v-model="answer.text" />
        <p v-show="answerType === 'image' && answer.imagePath === null">{{ $t('message.NoPictureUploaded') }}</p>
        <p><img v-if="answerType === 'image' && answer.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/choose-image/' + answer.imagePath" /></p>
        <q-btn v-show="answerType === 'image'">
          <label :for="'answerImage' + key"><q-icon name="file upload" /></label>
          <input @change="uploadAnswerImage(key, $event)" :name="'answerImage' + key" :id="'answerImage' + key" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <q-btn @click="deleteAnswer(key)">
          <q-icon name="clear" />
        </q-btn>
      </div>
      <q-btn @click="addAnswer()" class="full-width add-answer">
        {{ $t('message.AddAnAnswer') }}
      </q-btn>
    </div>
    
    <div v-if="stepType.code == 'write-text'">
      <q-input
        v-model="form.answers"
        :float-label="$t('message.ExpectedAnswer')"
      />
    </div>
    
    <div v-if="stepType.code == 'code-keypad'">
      <!-- TODO validation: numbers only -->
      <q-input
        v-model="form.answers"
        :float-label="$t('message.Code')"
        max-length="4"
      />
    </div>
    
    <div v-if="stepType.code == 'code-color'" class="code-color">
      <h2>{{ $t('message.ExpectedColorCodeAnswer') }}</h2>
      <table>
      <tr>
        <td v-for="(color, index) in form.answers" :key="index">
          <q-select :ref="'colorSelect' + index" v-model="form.answers[index]" :options="colorsForCode"  />
        </td>
      </tr>
      <tr>
        <td v-for="(color, index) in form.answers" :key="index">
          <div @click="triggerClickOnColorSelect(index)" class="color-bubble" :style="'background-color: ' + form.answers[index]">&nbsp;</div>
        </td>
      </tr>
      </table>
    </div>
    
    <!-- image recognition steps -->
    
    <div v-if="stepType.code == 'image-recognition'" class="image-recognition">
      <q-btn class="full-width" type="button">
        <label for="image-to-recognize">{{ $t('message.UploadThePictureOfTheObjectToFind') }}</label>
        <input @change="uploadImageToRecognize" name="image-to-recognize" id="image-to-recognize" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <div v-if="form.answers !== null">
        <p>{{ $t('message.UploadedPicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/image-recognition/' + form.answers" />
      </div>
    </div>
    
    <!-- jigsaw puzzle steps -->
    
    <div class="background-upload" v-if="stepType.code == 'jigsaw-puzzle'">
      <q-btn class="full-width" type="button">
        <label for="puzzlefile">{{ $t('message.UploadThePuzzlePicture') }}</label>
        <input @change="uploadPuzzleImage" name="puzzlefile" id="puzzlefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p>{{ $t('message.WarningImageSizeSquare') }}</p>
      <div v-if="form.answers !== null && form.answers.picture && form.answers.picture !== null">
        <p>{{ $t('message.YourPuzzlePicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/jigsaw-puzzle/' + form.answers.picture" />
      </div>
    </div>
    <div v-if="stepType.code == 'jigsaw-puzzle' && form.answers !== null">
      <q-select :float-label="$t('message.Difficulty')" :options="jigsawLevels" v-model="form.answers.level" />
    </div>
    
    <!-- inventory steps -->
    
    <div class="find-item" v-if="stepType.code == 'use-item'">
      <p>{{ $t('message.ClickOnTheLocationTheItemMustBeUsed') }} :</p>
      <div @click="getClickCoordinates($event)" id="findItemPicture" :style="'overflow: hidden;width: 400px; height: 533px; background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + form.backgroundImage + ');background-size: 100% 100%;'">
        <img id="cross" :style="'position: relative; z-index: 10000;top: ' + ((form.answerPointerCoordinates.top * 5.33) - 30) + 'px; left: ' + ((form.answerPointerCoordinates.left * 4) - 23) + 'px;'" src="/statics/icons/game/find-item-locator.png" />
      </div>
    </div>
    
    <div class="inventory" v-if="stepType.code == 'new-item'">
      <q-btn class="full-width" type="button">
        <label for="itemfile">{{ $t('message.UploadTheItemPicture') }}</label>
        <input @change="uploadItemImage" name="itemfile" id="itemfile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p>{{ $t('message.WarningImageSizeSquare') }}</p>
      <div v-if="form.answers !== null && form.answers.picture && form.answers.picture !== null">
        <p>{{ $t('message.YourItemPicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/new-item/' + form.answers.picture" />
      </div>
      <!--<p>{{ $t('message.Or') }}</p>
      <q-select :float-label="$t('message.ObjectToUse')" :options="questItemsAsOptions" v-model="form.answerItem" />
      <div v-show="form.answerItem !== null">
        {{ $t('message.SelectedObject') }} :
        <q-icon :name="getItemIcon(form.answerItem)" />
      </div>-->
      <q-input v-model="form.answers.title" :float-label="$t('message.ObjectName')" />
    </div>
    
    <div class="inventory" v-if="stepType.code == 'use-item'">
      <q-select :float-label="$t('message.ObjectToUse')" :options="questItemsAsOptions" v-model="form.answerItem" />
      <div v-show="form.answerItem !== null">
        {{ $t('message.SelectedObject') }} :
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/new-item/' + form.answerItem" />
      </div>
    </div>
    
    <!-- find-item steps -->

    <div class="find-item" v-if="stepType.code == 'find-item'">
      <p>{{ $t('message.ClickOnTheItemThatIsToFind') }} :</p>
      <div @click="getClickCoordinates($event)" id="findItemPicture" :style="'overflow: hidden;width: 400px; height: 533px; background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + form.backgroundImage + ');background-size: 100% 100%;'">
        <img id="cross" :style="'position: relative; z-index: 10000;top: ' + ((form.answerPointerCoordinates.top * 5.33) - 30) + 'px; left: ' + ((form.answerPointerCoordinates.left * 4) - 23) + 'px;'" src="/statics/icons/game/find-item-locator.png" />
      </div>
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
      <q-item tag="label" v-for="option in wrongAnswerAnimationList" :key="option.type">
        <q-item-side>
          <q-radio v-model="form.wrongAnswerAnimation.type" :val="option.type" />
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{ option.label }}</q-item-tile>
        </q-item-main>
      </q-item>
    </q-list>
    
    <q-input
      v-if="form.wrongAnswerAnimation.type === 'text'"
      v-model="form.wrongAnswerAnimation.text"
      type="textarea"
      float-label="Message en cas de mauvaise réponse"
      :max-height="100"
      :min-rows="4"
      class="full-width"
    />
    -->
    
    <div v-if="stepType.showTrick == 'yes'">
      <q-input v-model="form.hint" :float-label="$t('message.Hint')" />
    </div>
    
    <q-btn class="full-width" color="primary" @click="submit">{{ $t('message.SaveThisStep') }}</q-btn>
    
    <div class="link-below-button">
      <router-link :to="{ path: '/quest/' + (isEdition ? 'edit' : 'create') + '/step/type' }">{{ isEdition ? $t('message.ChangeStepType') : $t('message.BackToStepChoice') }}</router-link>
    </div>
    
    <div class="link-below-button" v-if="isEdition">
      <router-link :to="{ path: '/quest/edit/step/list'}">{{ $t('message.BackToThisQuestStepslist') }}</router-link>
    </div>
    
  </div>
</template>

<script>
import { QCheckbox, QUploader, Toast, Loading } from 'quasar'
import { required } from 'vuelidate/lib/validators'

import colorsForCode from 'data/colorsForCode.json'
import stepTypes from 'data/stepTypes.json'

import StepService from 'services/StepService'
import QuestService from 'services/QuestService'

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
        answerPointerCoordinates: {top: 50, left: 50},
        answerItem: null,
        showDistanceToTarget: false,
        showDirectionToTarget: false,
        trigger: {
          type: 'none'
        },
        wrongAnswerAnimation: {
          type: 'none'
        },
        hint: '',
        number: null
      },
      stepType: {
        code: null
      },
      stepTypes,
      jigsawLevels: [
        { value: 1, label: this.$t('message.Easy') },
        { value: 2, label: this.$t('message.Medium') },
        { value: 3, label: this.$t('message.Hard') }
      ],
      
      triggerList: [
        { type: 'none',     label: this.$t('message.NoneImmediate') },
        { type: 'location', label: this.$t('message.NoneLocationAndDirection') },
        { type: 'datetime', label: this.$t('message.DateTime') }
      ],
      
      wrongAnswerAnimationList: [
        { type: 'none', label: this.$t('message.NoneNextStep') },
        { type: 'text', label: this.$t('message.Text') }
      ],
            
      // for 'choose' steps
      answerType: 'text',
      defaultNbAnswers: 4,
      minNbAnswers: 2,
      maxNbAnswers: 6,
      rightAnswerIndex: 0,
      serverUrl: process.env.SERVER_URL,
      
      // for 'code-color' steps
      colorsForCode: this.getColorsForCodeOptions(),
      
      // for 'new-item' & 'use-item' steps
      questItemsAsOptions: [],
      questItems: []
    }
  },
  computed: {
    mainTextFieldLabel() {
      return this.stepType.category === 'enigma' ? 'Question' : 'Text'
    },
    mainTextMaxLength() {
      let maxNbChars = 400 // default
      
      if (this.stepType.textRules && this.stepType.textRules.maxNbChars) {
        maxNbChars = this.stepType.textRules.maxNbChars
      }
      
      return maxNbChars
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
      Object.assign(this.form, await StepService.getById(this.stepId))
      
      // apply specific field changes from DB to form
      if (this.form.type === 'geolocation' && this.form.answers !== null && this.form.answers.hasOwnProperty('lat') && this.form.answers.hasOwnProperty('lng')) {
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
    
    if (this.$store.state.currentEditedStep === null || this.$store.state.currentEditedQuest === null) {
      this.$router.push('/home')
      return
    }
    
    this.stepType = this.$store.state.currentEditedStep.type
    this.questId = this.$store.state.currentEditedQuest._id
    
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('stepType.' + this.stepType.title))
    
    if (this.form.number === null) {
      this.form.number = (await StepService.countForAQuest(this.questId)) + 1
    }
    
    if (this.form.title === '') {
      this.form.title = this.$t('message.Level') + ' ' + this.form.number
    }
    
    if (this.stepType.code === 'choose') {
      if (!Array.isArray(this.form.answers)) {
        this.answerType = 'text'
        this.form.answers = []
        for (let i = 0; i < this.defaultNbAnswers; i++) {
          this.form.answers.push({ text: this.$t('message.AnswerNb', { nb: (i + 1) }), imagePath: null, isRightAnswer: false })
        }
      } else {
        this.answerType = this.form.answers[0].hasOwnProperty('imagePath') && this.form.answers[0].imagePath !== null ? 'image' : 'text'
      }
    } else if (this.stepType.code === 'code-color') {
      if (!Array.isArray(this.form.answers)) {
        this.form.answers = Array(4).fill('red')
      }
    } else if (this.stepType.code === 'find-item') {
      if (this.form.answers) {
        this.form.answerPointerCoordinates = this.form.answers
      }
    } else if (this.stepType.code === 'use-item') {
      if (this.form.answers && this.form.answers.coordinates) {
        this.form.answerPointerCoordinates = this.form.answers.coordinates
      }
      if (this.form.answers && this.form.answers.item) {
        this.form.answerItem = this.form.answers.item
      }
      this.getQuestItemsAsOptions()
    } else if (this.stepType.code === 'new-item') {
      if (!this.form.answers) {
        this.form.answers = { title: "", picture: null }
      }
    } else if (this.stepType.code === 'jigsaw-puzzle') {
      if (!this.form.answers) {
        this.form.answers = {level: 2}
      }
    }
  },
  methods: {
    
    async submit() {
      if (this.stepType.code === 'choose') {
        this.form.answers = this.form.answers.map((answer) => { answer.isRightAnswer = false; return answer })
        this.form.answers[this.rightAnswerIndex].isRightAnswer = true
        if (this.answerType === 'text') {
          // clear all images => playStep.vue will consider that player should choose between text options
          this.form.answers = this.form.answers.map((answer) => { answer.imagePath = null; return answer })
        }
      }
      if (this.stepType.code === 'geolocation') {
        this.form.answers = this.form.answerCoordinates
      }
      if (this.stepType.code === 'find-item') {
        this.form.answers = this.form.answerPointerCoordinates
      }
      if (this.stepType.code === 'use-item') {
        this.form.answers = {coordinates: this.form.answerPointerCoordinates, item: this.form.answerItem}
      }
      if (this.stepType.code === 'new-item') {
        //this.form.answers = this.form.answerItem
      }
      await StepService.save(Object.assign(this.form, {
        questId: this.questId,
        type: this.stepType.code,
        textPosition: 'top', // tmp
        audioStream: null // tmp
      }))
      
      Toast.create.positive(this.$t('message.StepSaved'))
      this.$router.push('/quest/edit/step/list')
      this.$store.dispatch('setCurrentEditedStep', null)
    },
    
    // for 'choose' step type
    addAnswer: function () {
      if (this.form.answers.length >= this.maxNbAnswers) {
        Toast.create.negative(this.$t('message.YouCantAddMoreThanNbAnswers', { nb: this.maxNbAnswers }))
      } else {
        this.form.answers.push({ text: this.$t('message.AnswerNb', { nb: (this.form.answers.length + 1) }), isRightAnswer: false });
      }
    },
    deleteAnswer: function (key) {
      if (this.form.answers.length <= this.minNbAnswers) {
        Toast.create.negative(this.$t('message.YouMustDefineAtLeastNbAnswers', { nb: this.minNbAnswers }))
      } else {
        this.form.answers.splice(key, 1);
      }
    },
    async uploadBackgroundImage(e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadBackgroundImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.backgroundImage = uploadResult.data.file
        Loading.hide()
      }
    },
    async uploadVideo(e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('video', files[0])
      let uploadResult = await StepService.uploadVideo(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.videoStream = uploadResult.data.file
        Loading.hide()
      }
    },
    async uploadImageToRecognize(e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadImageToRecognize(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.answers = uploadResult.data.file
        Loading.hide()
      }
    },
    async uploadAnswerImage(key, e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadAnswerImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.answers[key].imagePath = uploadResult.data.file
        Loading.hide()
      }
    },
    async uploadPuzzleImage(e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadPuzzleImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.answers.picture = uploadResult.data.file
        Loading.hide()
      }
    },
    async uploadItemImage(e) {
      Loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadItemImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.answers.picture = uploadResult.data.file
        Loading.hide()
      }
    },
    
    // for 'code-color' step type
    getColorsForCodeOptions() {
      let options = []
      colorsForCode.forEach((code) => {
        options.push({
          value: code,
          label: this.$t('color.' + code)
        })
      })
      return options
    },
    triggerClickOnColorSelect(index) {
      // [0] is required because of v-for, see https://forum-archive.vuejs.org/topic/5190/this-refs-ref_name-on-dynamic-component-is-array-instead-of-vuecomponent/2
      this.$refs['colorSelect' + index][0].$el.click()
    },
    
    // for 'new-item' & 'use-item' steps
    async getQuestItemsAsOptions() {
      // load items won on previous steps
      this.questItems = await StepService.listWonObjects(this.questId, this.stepId)
      let options = []
      this.questItems.forEach((item) => {
        options.push({
          value: item.picture,
          label: item.title
        })
      })
      options.sort((a, b) => { return a.label > b.label ? 1 : -1 })
      this.questItemsAsOptions = options
    },
    getItemIcon(code) {
      let item = this.questItems.find(item => item.code === code)
      return typeof item !== 'undefined' ? item.icon : 'clear'
    },
    getClickCoordinates(ev) {
      let posX = Math.min(377, Math.max(23, parseInt(ev.offsetX, 10)))
      let posY = Math.min(503, Math.max(30, parseInt(ev.offsetY, 10)))
      this.form.answerPointerCoordinates.left = Math.floor(posX / 4)
      this.form.answerPointerCoordinates.top = Math.floor(posY / 5.33)
      this.positionFindItemPointer()
    },
    positionFindItemPointer() {
      document.getElementById("cross").style.left = ((this.form.answerPointerCoordinates.left * 4) - 23) + "px"
      document.getElementById("cross").style.top = ((this.form.answerPointerCoordinates.top * 5.33) - 30) + "px"
    },
    
    /*
    for future method to get item coordinates for step 'find-item'
                  and to get location coordinates for step 'use-item'
    // get dimensions of #main-view div (same size as div .use-item)
    let targetBounds = ev.target.getBoundingClientRect()
    console.log('proportional coords')
    console.log('width', ev.offsetX / targetBounds.width * 100)
    console.log('height', ev.offsetY / targetBounds.height * 100)
    */
    
    // validation methods
    checkMainTextLength(value) {
      let maxNbCarriageReturns = 11 // default
      let maxNbChars = this.mainTextMaxLength
      
      if (this.stepType.textRules && this.stepType.textRules.maxNbCarriageReturns) {
        maxNbCarriageReturns = this.stepType.textRules.maxNbCarriageReturns
      }
      
      // (value.match(/\n/g) || []).length counts number of carriage returns in value.
      // see https://stackoverflow.com/q/881085/488666
      return value.length <= maxNbChars && (value.match(/\n/g) || []).length <= maxNbCarriageReturns
    }
  },
  validations: {
    form: {
      title: { required },
      text: { function(value) { return this.checkMainTextLength(value) } }
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

.answer { display: flex; flex-flow: row nowrap; align-items: center; }
.answer .q-input { flex-grow: 1 }
.answer p { flex-grow: 1; margin: auto; }
.answer .q-radio { padding: 0.5rem; }
.answer .q-btn { padding: 0.3rem; margin: 0.2rem; }
.add-answer { margin: 0.5rem auto; }

.background-upload { padding-bottom: 10px; margin-bottom: 10px; background: #efefef; text-align: center;}
.background-upload img, .image-recognition img { max-height: 8rem; max-width: 8rem; width: auto; height: auto; }

.code-color h2 { margin-bottom: 0; }
.code-color table { margin: auto; }
.code-color table td { padding: 0rem; width: 6rem; }
.code-color .color-bubble { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; transition: background-color 0.3s; }

.inventory div { margin: 0.5rem auto; }
.inventory .q-icon { width: 3rem; height: 3rem; font-size: 3rem; }

</style>
