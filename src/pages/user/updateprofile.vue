<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle q-pa-lg">
    
      <div class="centered">
        {{ $t('label.WeNeedMoreInformationAboutYou') }}
      </div>
      <div class="centered">
        <div class="big-avatar">
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
          <div v-if="!$store.state.user.picture" :style="'background-image: url(statics/icons/game/profile-small.png); background-color: #fff;'"></div>
          <label for="picturefile">{{ $t('label.Edit') }}</label>
          <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
        </div>
      </div>
      <form @submit.prevent="submitProfileChanges()">
        
        <q-input
          v-model="profile.form.name"
          :label="$t('label.YourName')"
          placeholder="John Doe"
          @blur="$v.profile.form.name.$touch"
          bottom-slots
          :error="$v.profile.form.name.$error"
          :error-message="$t('label.PleaseEnterYourName')"
          />
                  
        {{ $t('label.ToDisplayRelevantQuests') }}
        
        <q-select
          :label="$t('label.YourCountry')"
          v-model="profile.form.country"
          :options="countries"
          bottom-slots
          :error="$v.profile.form.country.$error"
          :error-message="$t('label.PleaseSelectYourCountry')"
          />
          
        <q-input
          v-model="profile.form.zipCode"
          :label="$t('label.YourZipCode')"
          placeholder="38500"
          bottom-slots
          :error="$v.profile.form.zipCode.$error"
          :error-message="$t('label.PleaseEnterYourZipCode')"
          />
          
        <q-select :label="$t('label.YourLanguage')" v-model="profile.form.language" :options="languages" @input="changeLanguage" />
        
        {{ $t('label.ToHelpYouFindYourFriends') }}
        
        <q-input v-model="profile.form.phone" :label="$t('label.YourPhoneNumber')" :placeholder="$t('label.phoneExample')" />
        
        {{ $t('label.ToAvoidSendingYourToUnrelevantQuests') }}
        
        <q-select dark :label="$t('label.YourSex')" v-model="profile.form.sex" :options="sexes" />
        <q-select dark :label="$t('label.YourAge')" v-model="profile.form.age" :options="ages" />
        
        <q-btn class="text-primary bg-white full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
      </form>
      
    </div>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import { required } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import languages from 'data/languages.json'
import utils from 'src/includes/utils'

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'

export default {
  data () {
    return {
      profile: {
        form: {
          name: "--", 
          picture: "", 
          phone: "",
          zipCode: "", 
          country: "", 
          language: "en",
          sex: "",
          age: ""
        }
      },
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.profile.form = {
      name: this.$store.state.user.name ? this.$store.state.user.name : '?',
      phone: this.$store.state.user.phone ? this.$store.state.user.phone : '',
      picture: this.$store.state.user.picture ? this.$store.state.user.picture : '',
      zipCode: this.$store.state.user.location.postalCode ? this.$store.state.user.location.postalCode : '',
      country: this.$store.state.user.location.country ? this.$store.state.user.location.country : '',
      sex: this.$store.state.user.sex ? this.$store.state.user.sex : '',
      age: this.$store.state.user.age ? this.$store.state.user.age : '',
      language: this.$store.state.user.language
    }
  },
  methods: {
    /*
     * Submit account changes
     */
    async submitProfileChanges() {      
      if (!this.profile.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.profile.form.name,
          phone: this.profile.form.phone ? this.profile.form.phone : "",
          zipCode: this.profile.form.zipCode,
          country: this.profile.form.country,
          language: this.profile.form.language,
          age: this.profile.form.age,
          sex: this.profile.form.sex
        }
        this.$q.loading.show()
        let modificationStatus = await AuthService.modifyAccount(modifications)
        this.$q.loading.hide()
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(modificationStatus.data.message, 'warning')
        } else {
          this.backToMap()
        }
      }
    },
    /*
     * Back to the map
     */
    backToMap() {
      this.$router.push('/map')
    },
    /*
     * Change interface language dynamically
     */
    changeLanguage() {        
      this.$i18n.locale = this.profile.form.language
    },
    /*
     * upload a profile image
     */
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      // MP 2018-02-12 should not be necessary because picture info is now updated in user session data
      // remove the commented lines below after a while if no problem occurs with user picture "refreshing" when a new picture is uploaded
      /*var reader = new FileReader()
      reader.onload = (e) => {
        this.form.picture = e.target.result;
      };*/
      this.$q.loading.show()
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      }
      this.$q.loading.hide()
    }
  },
  validations: {
    profile: {
      form: {
        name: { required },
        country: { required },
        zipCode: { required }
      }
    }
  }
}
</script>
