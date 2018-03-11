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
      
      <div class="location-gps" style="display: none">
        <input type="number" id="latitude" v-model.number="form.location.lat" step="any" />
        <input type="number" id="longitude" v-model.number="form.location.lng" step="any" />
        <input type="text" v-model="form.zipcode" />
        <input type="text" v-model="form.town" />
      </div>
      
      <div class="location-address">
        <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
          <gmap-autocomplete :placeholder="$t('message.StartingPointOfTheQuest')" v-model="form.startingPlace" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
        </div>
        <a @click="getCurrentLocation()"><img src="/statics/icons/game/location.png" /></a>
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
        picture: null,
        town: "",
        zipcode: ""
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
          'location': { 
            type: 'Point', 
            coordinates: [this.form.location.lng, this.form.location.lat],
            town: this.form.town,
            zipcode: this.form.zipcode
          }
        }
        
        let specificProperties
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
        
        Toast.create.positive(this.isEdition ? this.$t('message.QuestSaved') : this.$t('message.NewQuestCreated'))
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
    },
    async getCurrentLocation() {
      // get the current coords
      navigator.geolocation.getCurrentPosition(this.fillLocation)
    },
    async fillLocation(pos) {
      this.form.location = {lat: pos.coords.latitude, lng: pos.coords.longitude}
      // get the address
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': {lat: pos.coords.latitude, lng: pos.coords.longitude}}, (results, status) => {
        if (status === 'OK' && results[0].formatted_address) {
          this.form.town = this.getCity(results[0])
          this.form.zipcode = this.getZipcode(results[0])
          this.form.startingPlace = results[0].formatted_address
        }
      });
    },
    async setLocation(place) {
      this.form.location = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}
      this.form.town = this.getCity(place)
      this.form.zipcode = this.getZipcode(place)
    },
    getZipcode(address) {
      if (address && address.address_components && address.address_components.length > 0) {
        for (var i = 0; i < address.address_components.length; i++) {
          if (address.address_components[i].types) {
            for (var j = 0; j < address.address_components[i].types.length; j++) {
              if (address.address_components[i].types[j] === 'postal_code') {
                return address.address_components[i].long_name
              }
            }
          }
        }
      }
      return ""
    },
    getCity(address) {
      if (address && address.address_components && address.address_components.length > 0) {
        for (var i = 0; i < address.address_components.length; i++) {
          if (address.address_components[i].types) {
            for (var j = 0; j < address.address_components[i].types.length; j++) {
              if (address.address_components[i].types[j] === 'locality') {
                return address.address_components[i].long_name
              }
            }
          }
        }
      }
      return ""
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
