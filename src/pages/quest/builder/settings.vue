<template>
  <div>
    <router-link :to="{ path: '/map'}" class="float-right no-underline" color="grey"><q-icon name="close" class="medium-icon" /></router-link>
    <h1 class="size-3 q-pl-md" v-if="!steps.showNewStepOverview && form.fields.title && form.fields.title[languages.current] && form.fields.title[languages.current] !== ''">{{ form.fields.title[languages.current] }}</h1>
    <h1 class="size-3 q-pl-md" v-if="!steps.showNewStepOverview && (!form.fields.title || !form.fields.title[languages.current] || form.fields.title[languages.current] === '')">{{ $t('label.NoTitle') }}</h1>
    
    <!------------------ TABS ------------------------>
    
    <q-tabs v-model="tabs.selected" v-if="!steps.showNewStepOverview">
      <q-tab slot="title" name="languages" :icon="tabs.progress === 0 ?  'looks_one' : 'check_circle'" :label="$t('label.Languages')" default />
      <q-tab slot="title" :disable="tabs.progress < 1" name="settings" :icon="tabs.progress < 2 ?  'looks_two' : 'check_circle'" :label="$t('label.Intro') + ' (' + languages.current + ')'" />
      <q-tab slot="title" :disable="tabs.progress < 2" name="steps" :icon="tabs.progress < 3 ?  'looks_3' : 'check_circle'" :label="$t('label.Steps') + ' (' + languages.current + ')'" />
      <q-tab slot="title" :disable="tabs.progress < 3" name="publish" :icon="tabs.progress < 4 ?  'looks_4' : 'check_circle'" :label="$t('label.Publish')" />
      
      <!------------------ LANGUAGES TAB ------------------------>
        
      <q-tab-pane name="languages" class="q-pa-md">
        <!-- <p class="q-pb-md">
          {{ $t('label.YourQuestIsConfiguredIn') }}
          <q-chip icon="language" color="primary" v-for="lang in quest.languages" :key="lang.lang">
            {{ $t('language.' + lang.lang) }}
          </q-chip>
        </p>-->
        <q-field
          icon="language"
          :helper="$t('label.SelectTheLanguageAndClickOnNextButton')"
          :label="$t('label.SelectedLanguage')"
        >
          <q-option-group
            type="radio"
            color="primary"
            v-model="languages.current"
            :options="form.languages"
            @input="setOtherLanguage"
          />
        </q-field>
        <q-btn big class="full-width" color="primary" @click="ChooseFirstLanguage()" v-show="tabs.progress === 0" :label="$t('label.StartConfigureYourQuest') + ' (' + $t('language.' + languages.current) + ')'" />
        <div v-show="languages.isNew && tabs.progress !== 0">
          <q-checkbox v-model="languages.cloneSteps" :label="$t('label.cloneSteps')" />
          <q-btn big class="full-width" color="primary" @click="addLanguage()" :label="$t('label.StartConfigureYourQuest') + ' (' + $t('language.' + languages.current) + ')'" />
        </div>
      </q-tab-pane>
      
      <!------------------ SETTINGS TAB ------------------------>
        
      <q-tab-pane name="settings">
    
        <form @submit.prevent="submitSettings()">
        
          <q-field :error="$v.form.fields.title.$error">
            <q-input type="text" :float-label="$t('label.Title')" v-model="form.fields.title[languages.current]" @blur="$v.form.fields.title.$touch" />
            <div class="q-field-bottom" v-if="$v.form.fields.title.$error">
              <div class="q-field-error" v-if="!$v.form.fields.title.required">{{ $t('label.PleaseEnterATitle') }}</div>
            </div>
          </q-field>
          
          <q-field :error="$v.form.fields.category.$error">
            <q-select :float-label="$t('label.Category')" v-model="form.fields.category" @blur="$v.form.fields.category.$touch" :options="form.categories" />
            <div class="q-field-bottom" v-if="$v.form.fields.category.$error">
              <div class="q-field-error" v-if="!$v.form.fields.category.required">{{ $t('label.PleaseSelectACategory') }}</div>
            </div>
          </q-field>
          
          <div class="description">
            <!--<a href="#" @click="console.log('TODO: exemples')">{{ $t('label.Examples') }}</a>-->
            <q-input
              v-model="form.fields.description[languages.current]"
              type="textarea"
              :float-label="$t('label.Description')"
              :max-height="100"
              :min-rows="4"
              class="full-width"
            />
          </div>
          
          <div class="location-gps" style="display: none">
            <input type="number" id="latitude" v-model.number="form.fields.location.lat" step="any" />
            <input type="number" id="longitude" v-model.number="form.fields.location.lng" step="any" />
            <input type="text" v-model="form.fields.zipcode" />
            <input type="text" v-model="form.fields.town" />
          </div>
          
          <div class="location-address">
            <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
              <gmap-autocomplete :placeholder="$t('label.StartingPointOfTheQuest')" v-model="form.fields.startingPlace" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
            </div>
            <a @click="getCurrentLocation()"><img src="/statics/icons/game/location.png" /></a>
          </div>
          
          <div v-if="form.fields.picture !== null">
            <p>{{ $t('label.Picture') }} :</p>
            <img class="full-width" :src="serverUrl + '/upload/quest/' + form.fields.picture" />
          </div>
          <q-btn class="full-width" type="button">
            <label for="picturefile">{{ $t('label.ModifyThePicture') }}</label>
            <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
          </q-btn>
          
          <q-field>
            <q-select :float-label="$t('label.Difficulty')" v-model="form.fields.level" :options="form.levels" />
          </q-field>
          
          <q-field>
            <q-select :float-label="$t('label.Duration')" v-model="form.fields.duration" :options="form.durations" />
          </q-field>
          
          <q-btn type="submit" color="primary" class="full-width">{{ $t('label.Save') }}</q-btn>
            
        </form>
      </q-tab-pane>
      
      <!------------------ STEPS TAB ------------------------>
        
      <q-tab-pane name="steps">
        <p>{{ $t('label.AddYourSteps') }}</p>
        <!-- using https://github.com/timruffles/ios-html5-drag-drop-shim to allow drag & drop on mobile -->
        <ul class="list-group" v-sortable="{ onUpdate: onStepListUpdate, handle: '.handle' }">
          <li class="list-group-item" v-for="step in steps.items" :key="step._id">
            <q-icon class="handle" name="reorder" />
            <p>{{ step.title }}</p>
            <q-icon color="grey" class="q-mr-sm" :name="getIconFromStepType(step.type)" />
            <q-btn @click="modifyStep(step)"><q-icon name="mode edit" /></q-btn>
            <q-btn @click="removeStep(step._id)"><q-icon name="clear" /></q-btn>
          </li>
        </ul>
        
        <p class="centered">
          <q-btn color="primary" icon="fas fa-plus-circle" @click="addStep()" :label="$t('label.AddAStep')" />
        </p>
      
      </q-tab-pane>
      
      <!------------------ PUBLISHING TAB ------------------------>
        
      <q-tab-pane name="publish">
        <p class="centered q-pa-md">
          <q-btn color="primary" icon="play_arrow" @click="testQuest()" :label="$t('label.TestYourQuest')" />
        </p>
        <q-field
          icon="visibility"
          :helper="$t('label.ActivateTheLanguageVisible')"
          :label="$t('label.LanguagesPublished')"
        >
          <p v-for="lang in form.fields.languages" :key="lang.lang">
            <q-toggle v-model="lang.published" :label="$t('language.' + lang.lang)" @input="publish(lang.lang)" />
          </p>
        </q-field>
        
      </q-tab-pane>
      
    </q-tabs>
    
    <q-modal v-model="steps.showNewStepPage">
      <div>
    
        <!------------------ STEP TYPE SELECTION ------------------------>
        
        <a class="float-right no-underline" color="grey" @click="closeStepTypePage"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.ChooseTheStepType') }}</h1>
      
        <div class="q-pa-md">
          <p class="caption">{{ $t('label.Transition') }}</p>
          <q-list>
            <q-collapsible color="primary" popup
              group="steptype"
              v-for="stepType in filteredStepTypes('transition')" :key="stepType.code" 
              :icon="'fas fa-' + stepType.icon"
              :label="$t('stepType.' + stepType.title)"
            >
              <div>
                {{ $t('stepType.' + stepType.description) }}
                <q-btn color="primary" :label="$t('label.UseThisGame')" @click.native="selectStepType(stepType)" />
              </div>
            </q-collapsible>
          </q-list> 
          
          <p class="caption">{{ $t('label.Quest') }}</p>
          
          <q-list>
            <q-collapsible color="primary" popup
              group="steptype"
              v-for="stepType in filteredStepTypes('enigma')" :key="stepType.code" 
              :icon="'fas fa-' + stepType.icon"
              :label="$t('stepType.' + stepType.title)"
            >
              <div>
                {{ $t('stepType.' + stepType.description) }}
                <q-btn color="primary" :label="$t('label.UseThisGame')" @click.native="selectStepType(stepType)" />
              </div>
            </q-collapsible>
          </q-list>
          
          <div class="q-pa-md centered">
            <a @click="closeStepTypePage()">{{ $t('label.Close') }}</a>
          </div>
        </div>
      </div>
      
    </q-modal>
    
    <q-modal v-model="steps.showNewStepPageSettings">
      <div>
    
        <!------------------ STEP SETTINGS SELECTION ------------------------>
        
        <a class="float-right no-underline" color="grey" @click="closeStepSettingsPage"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('stepType.' + steps.new.type.title) }}</h1>
        <div class="q-pa-md">
          <stepSettings :questId="questId" :stepId="stepId" :lang="languages.current" :options="steps.new.type" @change="trackStepChanges"></stepSettings>
        </div>
      </div>
      
    </q-modal>
    
    <div v-if="steps.showNewStepOverview">
      <div class="fit">
    
        <!------------------ STEP SIMULATION ------------------------>
        
        <div class="centered">
          <q-btn-group push>
            <q-btn disable :label="$t('label.Overview') + ':'" flat />
            <q-btn color="primary" :label="$t('label.Submit')" @click="closeOverview" flat />
            <q-btn color="primary" :label="$t('label.Edit')" @click="modifyStep" flat />
          </q-btn-group>
        </div>
        <stepPlay :step="steps.new.overviewData" runId="0" :itemUsed="itemUsed" :reload="steps.reloadStepPlay" @change="trackStepPlayed"></stepPlay>
        
      </div>
    </div>  
    
  </div>
  
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Notification from 'plugins/NotifyHelper'
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
import stepSettings from 'components/quest/builder/stepSettings'
import stepPlay from 'components/quest/game/stepPlay'
import questCategories from 'data/questCategories.json'
import questLevels from 'data/questLevels.json'
import languages from 'data/languages.json'
import stepTypes from 'data/stepTypes.json'
import utils from 'src/includes/utils'

export default {
  components: {
    stepSettings,
    stepPlay
  },
  data() {
    return {
      questId: null,
      stepId: '-1',
      tabs: {
        selected: 'settings',
        progress: 0
      },
      languages: {
        current: '',
        isNew: false,
        available: [],
        cloneSteps: true
      },
      form: {
        fields: {
          title: {fr: '', en: ''},
          category: '',
          description: {fr: '', en: ''},
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
      },
      quest: {
        languages: []
      },
      steps: {
        items: [],
        showNewStepPage: false,
        showNewStepPageSettings: false,
        showNewStepOverview: false,
        reloadStepPlay: false,
        new: {
          title: 'ImageAndText',
          type: {},
          overviewData: {}
        }
      },
      itemUsed: null,
      serverUrl: process.env.SERVER_URL,
      pictureUploadURL: this.serverUrl + '/quest/picture/upload'
    }
  },
  async mounted() {
    if (this.$route.params.questId && this.$route.params.questId !== '') {
      this.loadQuestData()
    } else {
      // if quest Id is not set, redirect to quest creation page
      this.$router.push('/quest/create/welcome')
    }
  },
  methods: {
    /*
     * Load quest and steps
     */
    async loadQuestData() {
      this.questId = this.$route.params.questId
      
      // fill quest settings form
      let res = await QuestService.getById(this.questId)
      
      if (res && res.data) {
        this.quest = res.data

        // get languages
        if (this.quest.languages && this.quest.languages.length > 0 && this.languages.current === '') {
          this.languages.current = this.quest.languages[0].lang
          for (var i = 0; i < this.quest.languages.length; i++) {
            this.languages.available.push({label: this.$t('language.' + this.quest.languages), value: this.quest.languages[i]})
          }
        }
        
        this.form.fields = this.quest
      
        this.form.fields.startingPlace = this.form.fields.location.address || ""
        this.form.fields.zipcode = (this.form.fields.location && this.form.fields.location.zipcode) ? this.form.fields.location.zipcode : ""
        this.form.fields.town = (this.form.fields.location && this.form.fields.location.town) ? this.form.fields.location.town : ""
        
        // adapt data from DB to match form data structure
        if (this.form.fields.location.hasOwnProperty('coordinates') && this.form.fields.location.coordinates.length === 2) {
          let coordinates = this.form.fields.location.coordinates
          this.form.fields.location = { lng: coordinates[0], lat: coordinates[1] }
        }
        
        // define tabs status
        this.tabs.progress = this.quest.creationStep
        
        await this.refreshStepsList()
      } else {
        // TODO : define action if data of quest are not loaded
      }
    },
    /*
     * Refresh / load the step list
     */
    async refreshStepsList() {
      // list steps
      this.steps.items = await StepService.listForAQuest(this.questId, this.languages.current)
      if (this.steps.items && this.steps.items.length > 0 && this.tabs.progress < 3) {
        this.tabs.progress = 3
      }
    },
    /*
     * Submit settings changes
     */
    async submitSettings() {
      this.$v.form.fields.$touch()
      if (!this.$v.form.fields.$error) {
        let commonProperties = {
          'languages': [this.form.fields.mainLanguage],
          'location': { 
            type: 'Point', 
            coordinates: [this.form.fields.location.lng, this.form.fields.location.lat],
            town: this.form.fields.town,
            zipcode: this.form.fields.zipcode,
            address: this.form.fields.startingPlace
          }
        }
        
        let quest = Object.assign({}, this.form.fields, commonProperties)

        // save to DB (or update, if property '_id' is defined)
        let res = await QuestService.save(quest)
        
        if (res && res.data) {
          // update progression in stepper
          if (this.tabs.progress < 2) {
            this.tabs.progress = 2
            this.tabs.selected = 'steps'
          }
          Notification(this.$t('label.QuestSaved'), 'info')
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
        this.form.fields.picture = uploadPictureResult.data.file
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
      this.form.fields.location = {lat: pos.coords.latitude, lng: pos.coords.longitude}
      // get the address
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': {lat: pos.coords.latitude, lng: pos.coords.longitude}}, (results, status) => {
        if (status === 'OK' && results[0].formatted_address) {
          this.form.fields.town = this.getCity(results[0])
          this.form.fields.zipcode = this.getZipcode(results[0])
          this.form.fields.startingPlace = results[0].formatted_address
        }
      });
    },
    /*
     * Fill the location in the settings
     * @param   {Object}    place            Position & address data
     */
    async setLocation(place) {
      this.form.fields.location = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}
      this.form.fields.town = this.getCity(place)
      this.form.fields.zipcode = this.getZipcode(place)
      this.form.fields.startingPlace = (place.formatted_address || '')
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
    async publish(lang) {
      var action = 'unpublish'
      // check if publish or unpublish
      for (var i = 0; i < this.form.fields.languages.length; i++) {
        if (this.form.fields.languages[i].lang && this.form.fields.languages[i].lang === lang) {
          if (this.form.fields.languages[i].published) {
            action = 'publish'
          }
        }
      }
      if (action === 'publish') {
        await QuestService.publish(this.questId, lang)
        this.tabs.progress = 4
      } else {
        await QuestService.unpublish(this.questId, lang)
        this.tabs.progress = 3
      }
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
     * Test the quest
     */
    async testQuest() {
      this.$router.push('/quest/play/' + this.questId)
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
        let removedStepIndex = _this.steps.items.map(function(e) { return e._id; }).indexOf(stepId)
        _this.steps.items.splice(removedStepIndex, 1)
        await _this.reindexSteps()
        // refresh steps list
        await this.refreshStepsList()
      })
    },
    /*
     * modify a step
     * @param   {Object}    step            Data of the step to modify
     */
    async modifyStep(step) {
      if (step && step._id) {
        this.stepId = step._id
        this.steps.new.type = this.getStepTypeInformations(step.type)
      }
      this.steps.showNewStepOverview = false
      this.steps.showNewStepPageSettings = true
      this.steps.reloadStepPlay = false
    },
    /*
     * close overview page
     */
    async closeOverview() {
      await this.refreshStepsList()
      this.stepId = '-1'
      this.steps.new.overviewData = {}
      this.steps.reloadStepPlay = false // reset the overview
      this.steps.showNewStepOverview = false;
    },
    /*
     * add a step
     */
    async addStep() {
      this.steps.showNewStepPage = true;
    },
    /*
     * Save steps order
     */
    // TODO : do the same with only one query
    async reindexSteps() {
      for (let i = 0; i < this.steps.items.length; i++) {
        let step = this.steps.items[i]
        await StepService.save({ _id: step._id, questId: this.questId, number: i + 1 })
      }
    },
    /*
     * Update the list of the languages available for the quest
     */
    async setOtherLanguage() {
      var selLang = this.languages.current
      // check if quest is already available for this lang
      var questConfiguredForThisLanguage = false
      if (this.quest.languages) {
        for (var i = 0; i < this.quest.languages.length; i++) {
          if (this.quest.languages[i].lang === selLang) {
            questConfiguredForThisLanguage = true
          }
        }
      }
      if (questConfiguredForThisLanguage) {
        this.languages.isNew = false
        // reload steps for the lang
        await this.refreshStepsList()
      } else {
        // display add button
        this.languages.isNew = true
      }
    },
    /*
     * Update the list of the languages available for the quest
     */
    async addLanguage() {
      var selLang = this.languages.current
      // are the steps cloned ?
      let action = this.languages.cloneSteps ? 'clonesteps' : 'noaction'
    
      // create lang for the quest
      let addStatus = await QuestService.addLanguage(this.questId, selLang, action)
      
      if (addStatus) {
        this.quest.languages.push({lang: selLang, published: false})
        this.languages.isNew = false
        // reload data for the lang
        await this.loadQuestData()
        this.tabs.selected = 'settings'
      }
    },
    /*
     * Set the first language for the quest
     */
    async ChooseFirstLanguage() {
      let firstLanguageSelection = await QuestService.setFirstLanguage(this.questId, this.languages.current)
      
      if (firstLanguageSelection) {
        if (this.tabs.progress < 1) {
          this.tabs.progress = 1
          this.tabs.selected = 'settings'
        }
      }
    },
    /*
     * Close step type selection page
     */
    closeStepTypePage() {
      // to trigger step type change
      this.stepId = '-1'
      this.steps.reloadStepPlay = false // reset the overview
      this.steps.new.type = {}
      this.steps.showNewStepPage = false
    }, 
    /*
     * Close step settings page
     */
    closeStepSettingsPage() {
      this.steps.new.type = {}
      this.stepId = '0'
      this.steps.showNewStepPageSettings = false
    }, 
    /*
     * Filter step types based on main category code
     */
    filteredStepTypes(categoryCode) {
      return stepTypes.filter(stepType => stepType.category === categoryCode)
    },
    /*
     * Select a step type
     * @param   {Object}    stepType            Type of the step
     */
    async selectStepType(stepType) {
      this.steps.new.type = stepType
      this.steps.showNewStepPage = false
      // to trigger step type change
      this.stepId = '0'
      this.steps.showNewStepPageSettings = true
    },
    /*
     * Launched when the step settings are set
     * @param   {Object}    step            New step data
     */
    async trackStepChanges(step) {
      this.steps.showNewStepPageSettings = false
      this.steps.showNewStepOverview = true
      this.stepId = step.id
      this.steps.new.overviewData = step
      // reset the step overview
      this.steps.reloadStepPlay = true
    },
    /*
     * Launched when the step is played
     * @param   {String}    stepId            ID of the step
     */
    async trackStepPlayed(stepId) {
      alert("demande si continue édition ou valider?")
    },
    /*
     * Get the icon of a step type
     */
    getIconFromStepType(stepType) {
      for (var i = 0; i < stepTypes.length; i++) {
        if (stepTypes[i].code === stepType) {
          return 'fas fa-' + stepTypes[i].icon
        }
      }
      return ''
    },
    /*
     * Get the information of a step type
     */
    getStepTypeInformations(stepType) {
      for (var i = 0; i < stepTypes.length; i++) {
        if (stepTypes[i].code === stepType) {
          return stepTypes[i]
        }
      }
      return ''
    }
  },
  validations: {
    form: {
      fields: {
        title: { required },
        category: { required }
      }
    }
  }
}
</script>
