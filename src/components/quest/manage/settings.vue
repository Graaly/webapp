<template>
  
  <div>
    <h1>Paramètres de votre enquête</h1>
    
    <form @submit.prevent="submit()">
    
      <q-field :error="$v.form.title.$error">
        <q-input type="text" :float-label="$t('message.Title')" v-model="form.title" @blur="$v.form.title.$touch" />
        <div class="q-field-bottom" v-if="$v.form.title.$error">
          <div class="q-field-error" v-if="!$v.form.title.required">{{ $t('message.PleaseEnterATitle') }}</div>
        </div>
      </q-field>
      
      <q-field :error="$v.form.category.$error">
        <q-select :float-label="$t('message.Category')" v-model="form.category" @blur="$v.form.category.$touch" :options="categories" />
        <div class="q-field-bottom" v-if="$v.form.category.$error">
          <div class="q-field-error" v-if="!$v.form.category.required">{{ $t('message.PleaseSelectACategory') }}</div>
        </div>
      </q-field>
      
      <div class="description">
        <a href="#" @click="console.log('TODO: exemples')">{{ $t('message.Examples') }}</a>
        <q-input
          v-model="form.description"
          type="textarea"
          :float-label="$t('message.Description')"
          :max-height="100"
          :min-rows="4"
          class="full-width"
        />
      </div>
      
      <div class="location-gps">
        <p>Coordonnées GPS</p>
        <div class="location-gps-inputs">
          <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
          <div>
            <label for="latitude">Latitude</label>
            <input type="number" id="latitude" v-model.number="form.location.lat" placeholder="par ex. 5,65487" step="any" />
          </div>
          <div>
            <label for="longitude">Longitude</label>
            <input type="number" id="longitude" v-model.number="form.location.lng" placeholder="par ex. 45,49812" step="any" />
          </div>
        </div>
      </div>
      
      <div class="location-address">
        <q-input type="text" :float-label="$t('message.StartingPointOfTheQuest')" v-model="form.startingPlace" />
        <img src="/statics/icons/game/location.png" />
      </div>
      
      <q-field>
        <q-select :float-label="$t('message.MainLanguage')" v-model="form.mainLanguage" :options="languages" />
      </q-field>
      
      <q-btn class="full-width" type="button">
        <label for="picturefile">{{ $t('message.UploadAPicture') }}</label>
        <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <div v-if="form.picture !== null">
        <p>{{ $t('message.YourPicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + form.picture" />
      </div>
      
      <q-field>
        <q-select :float-label="$t('message.Difficulty')" v-model="form.level" :options="levels" />
      </q-field>
      
      <q-btn color="primary" class="full-width">{{ $t('message.Save') }}</q-btn>
        
    </form>
    
  </div>
  
</template>


<script>
import { Toast } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import QuestService from 'services/QuestService'
import questCategories from 'data/questCategories.json'
import questLevels from 'data/questLevels.json'
import languages from 'data/languages.json'
import utils from 'src/includes/utils'
export default {
  data() {
    return {
      questId: null,
      isEdition: this.$route.params.action === 'edit',
      form: {
        title: '',
        category: '',
        description: '',
        location: { lat: '', lng: '' },
        startingPlace: '',
        languages: [],
        mainLanguage: 'fr',
        level: 2,
        picture: null
      },
      serverUrl: process.env.SERVER_URL,
      pictureUploadURL: this.serverUrl + '/quest/picture/upload',
      categories: utils.buildOptionsForSelect(questCategories, { valueField: 'id', labelField: 'name' }),
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }),
      levels: utils.buildOptionsForSelect(questLevels, { valueField: 'id', labelField: 'name' })
    }
  },
  async mounted() {
    // force clean current modified step in store
    this.$store.dispatch('setCurrentEditedStep', null)
    
    if (this.isEdition) {
      if (!this.$store.state.currentEditedQuest || !this.$store.state.currentEditedQuest._id) {
        return utils.handleError('current edited quest not found')
      }
      this.questId = this.$store.state.currentEditedQuest._id
      let res = await QuestService.getById(this.questId)
      this.form = res.data
      
      // adapt data from DB to match form data structure
      if (this.form.location.hasOwnProperty('coordinates') && this.form.location.coordinates.length === 2) {
        let coordinates = this.form.location.coordinates
        this.form.location = { lng: coordinates[0], lat: coordinates[1] }
      }
    }
  },
  methods: {
    async submit() {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        let commonProperties = {
          //'rating': 3, // initiate with no rating
          'dateCreated': null,
          'dateUpdated': null,
          'languages': [this.form.mainLanguage],
          'location': { type: 'Point', coordinates: [this.form.location.lng, this.form.location.lat] }
        }
        
        let specificProperties;
        if (this.isEdition) {
          specificProperties =  {
            'dateUpdated': new Date()
          }
        } else {
          specificProperties = {
            'availablePoints': 0,
            'dateCreated': new Date(),
            'authorUserId': this.$store.state.user._id,
            'status': 'unpublished'
          }
        }
        
        let quest = Object.assign({}, this.form, commonProperties, specificProperties)
        // save to DB (or update, if property '_id' is defined)
        let res = await QuestService.save(quest)
        // retrieve new quest ID and save it into store
        this.$store.dispatch('setCurrentEditedQuest', res.data)
        
        Toast.create.positive(this.isEdition ? 'Enquête enregistrée' : 'Nouvelle enquête créée')
        this.$router.push(this.isEdition ? '/quest/edit/step/list' : '/quest/create/step/type')
      }
    },
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadPicture(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        this.form.picture = uploadPictureResult.data.file
      }
    }
  },
  validations: {
    form: {
      title: { required },
      category: { required }
    }
  }
}
</script>


<style scoped>

#main-view { overflow-y: scroll; padding: 1rem; }

.description { position: relative; }
.description a { position: absolute; top: 0; right: 0; text-decoration: underline; }

.location-address { display: flex; flex-flow: row nowrap; justify-content: center; align-items: center; }
.location-address .q-input { flex-grow: 1 }
.location-address img { width: 2.5rem; height: 2.5rem; }

</style>
