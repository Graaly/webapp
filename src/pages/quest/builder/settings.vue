<template>
  <div>
    <h1 class="size-3">{{ form.title }}</h1>
    
    <!------------------ TABS ------------------------>
    
    <q-tabs v-model="tabs.selected">
      <q-tab slot="title" name="settings" :icon="tabs.progress === 0 ?  'looks_one' : 'check_circle'" :label="$t('label.Intro')" default />
      <q-tab slot="title" :disable="tabs.progress < 1" name="steps" :icon="tabs.progress < 2 ?  'looks_two' : 'check_circle'" :label="$t('label.Steps')" />
      <q-tab slot="title" :disable="tabs.progress < 2" name="languages" :icon="tabs.progress < 3 ?  'looks_3' : 'check_circle'" :label="$t('label.Languages')" />
      <q-tab slot="title" :disable="tabs.progress < 3" name="publish" :icon="tabs.progress < 4 ?  'looks_4' : 'check_circle'" :label="$t('label.Publish')" />
      
      <!------------------ SETTINGS TAB ------------------------>
        
      <q-tab-pane name="settings">
    
        <form @submit.prevent="submitSettings()">
        
          <q-field :error="$v.form.title.$error">
            <q-input type="text" :float-label="$t('label.Title')" v-model="form.title" @blur="$v.form.title.$touch" />
            <div class="q-field-bottom" v-if="$v.form.title.$error">
              <div class="q-field-error" v-if="!$v.form.title.required">{{ $t('label.PleaseEnterATitle') }}</div>
            </div>
          </q-field>
          
          <q-field :error="$v.form.category.$error">
            <q-select :float-label="$t('label.Category')" v-model="form.category" @blur="$v.form.category.$touch" :options="categories" />
            <div class="q-field-bottom" v-if="$v.form.category.$error">
              <div class="q-field-error" v-if="!$v.form.category.required">{{ $t('label.PleaseSelectACategory') }}</div>
            </div>
          </q-field>
          
          <div class="description">
            <a href="#" @click="console.log('TODO: exemples')">{{ $t('label.Examples') }}</a>
            <q-input
              v-model="form.description"
              type="textarea"
              :float-label="$t('label.Description')"
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
              <gmap-autocomplete :placeholder="$t('label.StartingPointOfTheQuest')" v-model="form.startingPlace" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
            </div>
            <a @click="getCurrentLocation()"><img src="/statics/icons/game/location.png" /></a>
          </div>
          
          <q-field>
            <q-select :float-label="$t('label.MainLanguage')" v-model="form.mainLanguage" :options="languages" />
          </q-field>
          
          <q-btn class="full-width" type="button">
            <label for="picturefile">{{ $t('label.UploadAPicture') }}</label>
            <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
          </q-btn>
          <div v-if="form.picture !== null">
            <p>{{ $t('label.YourPicture') }} :</p>
            <img class="full-width" :src="serverUrl + '/upload/quest/' + form.picture" />
          </div>
          
          <q-field>
            <q-select :float-label="$t('label.Difficulty')" v-model="form.level" :options="levels" />
          </q-field>
          
          <q-field>
            <q-select :float-label="$t('label.Duration')" v-model="form.duration" :options="durations" />
          </q-field>
          
          <q-btn type="submit" color="primary" class="full-width">{{ $t('label.Save') }}</q-btn>
            
        </form>
      </q-tab-pane>
      
      <!------------------ STEPS TAB ------------------------>
        
      <q-tab-pane name="steps">
        
        <!-- using https://github.com/timruffles/ios-html5-drag-drop-shim to allow drag & drop on mobile -->
        <ul class="list-group" v-sortable="{ onUpdate: onStepListUpdate, handle: '.handle' }">
          <li class="list-group-item" v-for="step in steps.items" :key="step._id">
            <q-icon class="handle" name="reorder" />
            <p>{{ step.title }}</p>
            <q-btn @click="$router.push('/quest/edit/step/'+step._id)"><q-icon name="mode edit" /></q-btn>
            <q-btn @click="removeStep(step._id)"><q-icon name="clear" /></q-btn>
          </li>
        </ul>
        
        <q-btn color="primary" icon="fas fa-plus-circle" @click="$router.push('/quest/edit/step/type')" :label="$t('label.AddAStep')" />
      
      </q-tab-pane>
      
      <!------------------ LANGUAGES TAB ------------------------>
        
      <q-tab-pane name="languages">
      </q-tab-pane>
      
      <!------------------ PUBLISHING TAB ------------------------>
        
      <q-tab-pane name="publish">
      
        <q-btn big class="full-width" icon="play circle filled" color="primary" @click="$router.push('/quest/play/' + questId + '?test=1')" :label="$t('label.TestYourQuest')" />
        
        <q-btn big class="full-width" icon="check circle" color="primary" @click="publish()" v-show="quest.status !== 'published'" :label="$t('label.PublishYourQuest')" />
        <q-btn big class="full-width" icon="cancel" color="primary" @click="unpublish()" v-show="quest.status === 'published'" :label="$t('label.UnpublishYourQuest')" />
        
      </q-tab-pane>
      
    </q-tabs>
  </div>
  
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import QuestService from 'services/QuestService'
import StepService from 'services/StepService'

// required to define v-sortable directive in Vue 2.0, see https://github.com/sagalbot/vue-sortable/issues/10
import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})
import questCategories from 'data/questCategories.json'
import questLevels from 'data/questLevels.json'
import languages from 'data/languages.json'
import utils from 'src/includes/utils'

export default {
  data() {
    return {
      questId: null,
      tabs: {
        selected: 'settings',
        progress: 0
      },
      form: {
        title: this.$t('label.NewQuest'),
        category: '',
        description: '',
        location: { lat: '', lng: '' },
        startingPlace: '',
        languages: [],
        mainLanguage: 'fr',
        level: 2,
        duration: 30,
        picture: null,
        town: "",
        zipcode: ""
      },
      quest: {},
      steps: {
        items: []
      },
      serverUrl: process.env.SERVER_URL,
      pictureUploadURL: this.serverUrl + '/quest/picture/upload',
      categories: utils.buildOptionsForSelect(questCategories, { valueField: 'id', labelField: 'name' }, this.$t),
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      levels: utils.buildOptionsForSelect(questLevels, { valueField: 'id', labelField: 'name' }, this.$t),
      durations: [
        { label: '15 ' + this.$t('label.minutes'), value: 15 },
        { label: '30 ' + this.$t('label.minutes'), value: 30 },
        { label: '45 ' + this.$t('label.minutes'), value: 45 },
        { label: '60 ' + this.$t('label.minutes'), value: 60 },
        { label: '90 ' + this.$t('label.minutes'), value: 90 },
        { label: '120 ' + this.$t('label.minutes'), value: 120 }
      ]
    }
  },
  async mounted() {
    if (this.$route.params.questId && this.$route.params.questId !== '') {
      this.questId = this.$route.params.questId
      
      // fill quest settings form
      let res = await QuestService.getById(this.questId)
      
      if (res) {
        this.quest = res.data
        this.form = this.quest
      
        this.form.startingPlace = this.form.location.address || ""
        this.form.zipcode = (this.form.location && this.form.location.zipcode) ? this.form.location.zipcode : ""
        this.form.town = (this.form.location && this.form.location.town) ? this.form.location.town : ""
        
        // adapt data from DB to match form data structure
        if (this.form.location.hasOwnProperty('coordinates') && this.form.location.coordinates.length === 2) {
          let coordinates = this.form.location.coordinates
          this.form.location = { lng: coordinates[0], lat: coordinates[1] }
        }
        
        // list steps
        this.steps.items = await StepService.listForAQuest(this.questId)
        
        // define tabs status
        this.tabs.progress = this.quest.creationStep
      } else {
        // TODO : define action if data of quest are not loaded
      }
    } else {
      // if quest Id is not set, redirect to quest creation page
      this.$router.push('/quest/create/welcome')
    }
  },
  methods: {
    /*
     * Submit settings changes
     */
    async submitSettings() {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        let commonProperties = {
          'languages': [this.form.mainLanguage],
          'location': { 
            type: 'Point', 
            coordinates: [this.form.location.lng, this.form.location.lat],
            town: this.form.town,
            zipcode: this.form.zipcode,
            address: this.form.startingPlace
          }
        }
        
        let quest = Object.assign({}, this.form, commonProperties)

        // save to DB (or update, if property '_id' is defined)
        let res = await QuestService.save(quest)
        
        if (res && res.data) {
          // update progression in stepper
          if (this.tabs.progress < 1) {
            this.tabs.progress = 1
            this.tabs.selected = 'steps'
          }
          Notification(this.$t('label.QuestSaved'), 'positive')
        } else {
          // if changes are not saved
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Upload a new image for the quest
     */
    async uploadImage(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadPicture(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        this.form.picture = uploadPictureResult.data.file
        this.$q.loading.hide()
      }
    },
    /*
     * Get current user location
     */
    async getCurrentLocation() {
      // get the current coords
      navigator.geolocation.getCurrentPosition(this.fillLocation)
    },
    /*
     * Get the address based on the position
     * @param   {Object}    pos            Position data
     */
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
    /*
     * Fill the location in the settings
     * @param   {Object}    place            Position & address data
     */
    async setLocation(place) {
      this.form.location = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}
      this.form.town = this.getCity(place)
      this.form.zipcode = this.getZipcode(place)
      this.form.startingPlace = (place.formatted_address || '')
    },
    /*
     * Get the zip code in the location data
     * @param   {Object}    address            Location data
     */
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
    /*
     * Get the city from the location data
     * @param   {Object}    address            Location data
     */
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
    },
    /*
     * Reindex elements in the list after drag & drop
     * @param   {Object}    event            touch event
     */
    async onStepListUpdate(event) {
      this.steps.items.splice(event.newIndex, 0, this.steps.items.splice(event.oldIndex, 1)[0])
      await this.reindexSteps()
    },
    /*
     * Publish a quest
     */
    async publish() {
      this.quest.status = 'published';
      await QuestService.publish(this.questId)
      Notification(this.$t('label.YourQuestIsPublished'), 'positive')
    },
    /*
     * Unpublish a quest
     */
    async unpublish() {
      this.quest.status = 'unpublished';
      await QuestService.unpublish(this.questId)
      Notification(this.$t('label.YourQuestIsUnpublished'), 'positive')
    },
    /*
     * Remove a step
     * @param   {String}    stepId            ID of the step removed
     */
    async removeStep(stepId) {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        message: this.$t('label.DoYouWantToRemoveThisStep'),
        ok: true,
        cancel: true
      }).then(async () => {
        await StepService.remove(_this.questId, stepId)
              
        // reassign a number (1, 2, 3, ...) to remaining steps
        let removedStepIndex = _this.stepList.map(function(e) { return e._id; }).indexOf(stepId)
        _this.stepList.splice(removedStepIndex, 1)
        await _this.reindexSteps()
      })
    },
    /*
     * Save steps ordre
     */
    // TODO : do the same with only one query
    async reindexSteps() {
      for (let i = 0; i < this.steps.items.length; i++) {
        let step = this.steps.items[i]
        await StepService.save({ _id: step._id, questId: this.questId, number: i + 1 })
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
