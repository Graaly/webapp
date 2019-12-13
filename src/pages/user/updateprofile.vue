<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle q-pa-lg">
      <div class="centered text-h5">
        {{ $t('label.WeNeedMoreInformationAboutYou') }}
      </div>
      <div class="centered">
        {{ $t('label.WeNeedMoreInformationAboutYouDesc') }}
      </div>
      <div class="centered q-mt-lg">
        <div class="big-avatar">
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
          <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
          <div v-if="!$store.state.user.picture" :style="'background-image: url(statics/icons/game/profile-small.png); background-color: #fff;'"></div>
          <label for="picturefile" @click="$refs['uploadfile'].click()">{{ $t('label.Edit') }}</label>
          <input @change="uploadImage" ref="uploadfile" name="picturefile" id="picturefile" type="file" accept="image/*" hidden />
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
          
        <q-input
          v-model="profile.form.email"
          :label="$t('label.YourEmail')"
          placeholder="john.doe@gmail.com"
          @blur="$v.profile.form.email.$touch"
          bottom-slots
          :error="$v.profile.form.email.$error"
          :error-message="$t('label.PleaseEnterAValidEmailAddress')"
          />
          
        <q-input
          v-if="displayPassword"
          type="password"
          v-model="profile.form.password"
          :label="$t('label.YourPassword')"
          @blur="$v.profile.form.password.$touch"
          bottom-slots
          :error="$v.profile.form.password.$error"
          :error-message="!$v.profile.form.password.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.profile.form.password.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
          />
                  
        <div class="q-pt-lg q-pb-md">{{ $t('label.ToDisplayRelevantQuests') }}</div>
        
        <q-select
          :label="$t('label.YourCountry')"
          v-model="profile.form.country"
          :options="countries"
          emit-value
          map-options
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
          
        <q-select :label="$t('label.YourLanguage')" v-model="profile.form.language" :options="languages" emit-value map-options @input="changeLanguage" />
        
        <div class="q-pt-lg q-pb-md">{{ $t('label.ToAvoidSendingYourToUnrelevantQuests') }}</div>
        
        <q-select 
          :label="$t('label.YourSex')" 
          v-model="profile.form.sex" 
          :options="sexes" 
          emit-value 
          map-options
          @blur="$v.profile.form.sex.$touch"
          bottom-slots
          :error="$v.profile.form.sex.$error"
          :error-message="$t('label.PleaseSelectYourSex')"
          />
        
        <q-select 
          :label="$t('label.YourAge')" 
          v-model="profile.form.age" 
          :options="ages" 
          emit-value map-options 
          @blur="$v.profile.form.age.$touch"
          bottom-slots
          :error="$v.profile.form.age.$error"
          :error-message="$t('label.PleaseSelectYourAge')"
          />
        
        <div class="q-pt-lg q-pb-md">{{ $t('label.ToHelpYouFindYourFriends') }}</div>
        
        <q-input v-model="profile.form.phone" :label="$t('label.YourPhoneNumber')" :placeholder="$t('label.phoneExample')" />
        
        <q-btn class="full-width" color="primary" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
        <q-btn class="full-width q-pt-md" color="primary" flat @click="backToMap()">{{ $t('label.MaybeLater') }}</q-btn>
      </form>
      
    </div>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import checkPasswordComplexity from 'boot/PasswordComplexity'
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
          age: "",
          password: ""
        }
      },
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      displayPassword: false,
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.profile.form = {
      name: this.$store.state.user.name ? this.$store.state.user.name : '?',
      email: (this.$store.state.user.email && this.$store.state.user.email !== 'providersignin') ? this.$store.state.user.email : '',
      password: '',
      phone: this.$store.state.user.phone ? this.$store.state.user.phone : '',
      picture: this.$store.state.user.picture ? this.$store.state.user.picture : '',
      zipCode: this.$store.state.user.location.postalCode ? this.$store.state.user.location.postalCode : '',
      country: this.$store.state.user.location.country ? this.$store.state.user.location.country : '',
      sex: this.$store.state.user.sex ? this.$store.state.user.sex : '',
      age: this.$store.state.user.age ? this.$store.state.user.age : '',
      language: this.$store.state.user.language
    }
    if (this.$store.state.user.missingPassword) {
      this.displayPassword = true
    }
  },
  methods: {
    /*
     * Submit account changes
     */
    async submitProfileChanges() {
      this.$v.$touch()
      if (!this.$v.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.profile.form.name,
          email: this.profile.form.email,
          password: this.profile.form.password,
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
      if (uploadPicture && uploadPicture.data) {
        if (uploadPicture.data.file) {
          this.$store.state.user.picture = uploadPicture.data.file
        } else if (uploadPicture.data.message && uploadPicture.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      }
      this.$q.loading.hide()
    }
  },
  validations: {
    profile: {
      form: {
        email: { required, email },
        name: { required, minLength: minLength(2) },
        country: { required },
        zipCode: { required },
        password: { required, minLength: minLength(8), checkPasswordComplexity },
        age: { required },
        sex: { required }
      }
    }
  }
}
</script>
