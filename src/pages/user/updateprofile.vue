<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg">
      <div class="q-py-sm q-px-md dark-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToProfile()" />
      </div>
      <div class="centered">
        <div class="user-card user-card-big main-profile centered relative-position">
          <div class="relative-position no-overflow" :style="'background: url(' + getProfileImage() + ' ) center center / cover no-repeat '">
            <div class="edit-bar centered">
              <label @click="$refs['uploadfile'].click()">
                <q-icon name="camera_alt" />
              </label>
              <input @change="uploadImage" ref="uploadfile" name="picturefile" id="picturefile" type="file" accept="image/*" hidden />
            </div>
          </div>
          <div v-if="profile.form.name !== ''">
            <div class="centered subtitle3 q-mt-lg">
              {{ profile.form.name }}
            </div>
            <div class="centered subtitle6 q-mt-sm" v-if="profile.form.location && (profile.form.location.postalCode || profile.form.location.country)">
              <span v-if="profile.form.location.postalCode">{{ profile.form.location.postalCode }}</span>
              <span v-if="profile.form.location.postalCode && profile.form.location.country">, </span>
              <span v-if="profile.form.location.country">{{ profile.form.location.country }}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div v-if="profile.form.name === ''">
          <div class="centered subtitle5 q-mt-lg">
            {{ $t('label.WeNeedMoreInformationAboutYou') }}
          </div>
          <div class="centered subtitle6">
            {{ $t('label.WeNeedMoreInformationAboutYouDesc') }}
          </div>
        </div>
      </div>
      <form class="q-mt-lg q-pa-md q-ma-md background-lighter rounded" @submit.prevent="submitProfileChanges()">
        
        <q-input
          dark
          v-model="profile.form.name"
          :label="$t('label.YourName')"
          placeholder="John Doe"
          @blur="$v.profile.form.name.$touch"
          bottom-slots
          :error="$v.profile.form.name.$error"
          :error-message="$t('label.PleaseEnterYourName')"
          />
          
        <q-input
          dark
          v-model="profile.form.email"
          :label="$t('label.YourEmail')"
          placeholder="john.doe@gmail.com"
          @blur="$v.profile.form.email.$touch"
          bottom-slots
          :error="$v.profile.form.email.$error"
          :error-message="$t('label.PleaseEnterAValidEmailAddress')"
          />
          
        <q-input
          dark
          v-if="displayPassword"
          type="password"
          v-model="profile.form.password"
          :label="$t('label.YourPassword')"
          @blur="$v.profile.form.password.$touch"
          bottom-slots
          :error="$v.profile.form.password.$error"
          :error-message="!$v.profile.form.password.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.profile.form.password.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
          />
        
        <q-input
          dark
          v-model="profile.form.description"
          :label="$t('label.YourPresentation')"
          bottom-slots
          type="textarea"
          :min-rows="3"
          />
        
        <q-select
          dark
          :label="$t('label.YourCountry')"
          v-model="profile.form.country"
          :options="countries"
          emit-value
          map-options
          bottom-slots
          @blur="getLocation"
          :error="$v.profile.form.country.$error"
          :error-message="$t('label.PleaseSelectYourCountry')">
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="helpFields" />
          </template>
        </q-select>
          
        <q-input
          dark
          v-model="profile.form.zipCode"
          :label="$t('label.YourZipCode')"
          placeholder="38500"
          bottom-slots
          @blur="getLocation"
          :error="$v.profile.form.zipCode.$error"
          :error-message="$t('label.PleaseEnterYourZipCode')">
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="helpFields" />
          </template>
        </q-input>
          
        <q-select 
          dark
          :label="$t('label.YourLanguage')" 
          v-model="profile.form.language" 
          :options="languages" 
          emit-value 
          map-options 
          @input="changeLanguage" />
        
        <q-select 
          dark
          :label="$t('label.YourSex')" 
          v-model="profile.form.sex" 
          :options="sexes" 
          emit-value 
          map-options
          bottom-slots>
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="helpFields" />
          </template>
        </q-select>
        
        <q-select 
          dark
          :label="$t('label.YourAge')" 
          v-model="profile.form.age" 
          :options="ages" 
          emit-value map-options 
          @blur="$v.profile.form.age.$touch"
          bottom-slots
          :error="$v.profile.form.age.$error"
          :error-message="$t('label.PleaseSelectYourAge')">
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="helpFields" />
          </template>
          </q-select>
        
        <q-input 
          dark
          v-model="profile.form.phone" 
          :label="$t('label.YourPhoneNumber')" 
          :placeholder="$t('label.phoneExample')">
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="helpFields" />
          </template>
        </q-input>
        
        <div class="q-pt-md centered">
          <q-btn 
            color="primary" 
            class="glossy large-btn" 
            @click="submitProfileChanges()"
            :label="$t('label.Save')" />
          <q-btn 
             v-if="$store.state.user.name === ''"
            color="primary" 
            class="q-pt-md"
            flat 
            @click="backToMap()"
            :label="$t('label.MaybeLater')" />
        </div>
      </form>
      
      <form class="q-mt-lg q-pa-md q-ma-md background-lighter rounded" v-if="!displayPassword" @submit.prevent="submitProfileChanges()">
        <div class="centered">{{ $t('label.ChangeYourPassword') }}</div>
        
        <q-input 
          dark
          type="password" 
          v-model="profile.form.oldPassword" 
          :label="$t('label.CurrentPassword')"
          @blur="$v.profile.form.oldPassword.$touch"
          bottom-slots
          :error="$v.profile.form.oldPassword.$error"
          :error-message="!$v.profile.form.oldPassword.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.profile.form.oldPassword.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"          
          />
        
        <q-input 
          dark
          type="password" 
          v-model="profile.form.newPassword" 
          :label="$t('label.NewPassword')"
          @blur="$v.profile.form.newPassword.$touch"
          bottom-slots
          :error="$v.profile.form.newPassword.$error"
          :error-message="!$v.profile.form.newPassword.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.profile.form.newPassword.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"                    
          />
        
        <div class="q-pt-md centered">
          <q-btn 
            color="primary" 
            class="glossy large-btn" 
            @click="submitChangePassword()"
            :label="$t('label.Save')" />
        </div>
      </form>
      
      <div class="q-mt-lg q-pa-md q-ma-md background-lighter rounded">
        <div class="centered">{{ $t('label.RemoveYourAccount') }}</div>
        <p class="subtitle6">{{ $t('label.RemoveYourAccountDesc') }}</p>
        <q-btn class="q-my-md glossy" color="negative" :label="$t('label.IConfirmIWantToRemoveMyAccount')" @click="removeAccount()" />
      </div>
      <div>
        <div class="centered q-mt-xl q-mb-sm cursor-pointer"><a @click="disconnect()">{{ $t('label.SignOut') }}</a></div>
        <div class="centered q-mb-sm" v-html="$t('label.TermsAndConditionsLink')"></div>
        <div class="centered q-mb-xl" v-html="$t('label.PrivacyPolicyLink')"></div>
      </div>
    </div>
    <!--<gmap-autocomplete id="destination" :placeholder="$t('label.Address')" class="col q-input-target text-left" @input="value = $event.target.value" />-->
        
    <!------------------ REWARDS POPUP ------------------------>
    
    <q-dialog v-model="showHelpPopup">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.HowWeUseYourData') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          <!--{{ $t('label.AllTheseDataAreOptional') }} -->
          <ul>
            <li >{{ $t('label.DataCountry') }}</li>
            <li >{{ $t('label.DataZipcode') }}</li>
            <li >{{ $t('label.DataSex') }}</li>
            <li >{{ $t('label.DataAge') }}</li>
            <li >{{ $t('label.DataPhone') }}</li>
          </ul>
        </q-card-section>
      </q-card>
    </q-dialog>
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
          description: "",
          picture: "", 
          phone: "",
          zipCode: "", 
          country: "", 
          language: "en",
          sex: "",
          age: "",
          password: "",
          oldPassword: "",
          newPassword: ""
        }
      },
      position: null,
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      displayPassword: false,
      showHelpPopup: false,
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.profile.form = {
      name: this.$store.state.user.name ? (this.$store.state.user.name === '-' ? '' : this.$store.state.user.name) : '?',
      email: (this.$store.state.user.email && this.$store.state.user.email !== 'providersignin') ? (this.$store.state.user.email.indexOf('dummyuser') === -1 ? this.$store.state.user.email : '') : '',
      password: '',
      description: this.$store.state.user.description ? this.$store.state.user.description : '',
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
     * get profile image
     */
    getProfileImage () {
      if (this.profile.form.picture && this.profile.form.picture.indexOf('http') !== -1) {
        return this.profile.form.picture
      } else if (this.profile.form.picture) {
        return this.serverUrl + '/upload/profile/' + this.profile.form.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    },
    /*
     * Submit account changes
     */
    async submitProfileChanges() {
      if (!this.$v.profile.form.name.$error &&
        !this.$v.profile.form.email.$error &&
        !(this.$v.profile.form.password.$error && this.displayPassword)
      ) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.profile.form.name,
          email: this.profile.form.email,
          description: this.profile.form.description,
          password: this.profile.form.password,
          phone: this.profile.form.phone ? this.profile.form.phone : "",
          zipCode: this.profile.form.zipCode,
          country: this.profile.form.country,
          language: this.profile.form.language,
          age: this.profile.form.age,
          sex: this.profile.form.sex
        }
        if (this.position) {
          modifications.position = this.position
        }
        this.$q.loading.show()
        let modificationStatus = await AuthService.modifyAccount(modifications)
        this.$q.loading.hide()
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(this.$t('label.' + modificationStatus.data.message), 'warning')
        } else {
          this.backToProfile()
        }
      }
    },
    /*
     * Get the lat/lng from a zip code
     * @param   {String}    zip code            Zip code
     * @param   {String}    country             country
     */
    getLocation() {
      if (this.profile.form.zipCode && this.profile.form.zipCode !== '' && this.profile.form.country && this.profile.form.country !== '') {
        var geocoder = new google.maps.Geocoder()
        geocoder.geocode({'address': this.profile.form.zipCode + " " + this.profile.form.country}, (results, status) => {
          this.$q.loading.hide()
          if (status === 'OK' && results[0].geometry) {
            this.position = {}
            this.position.lat = results[0].geometry.location.lat()
            this.position.lng = results[0].geometry.location.lng()
          }
        });
      }
    },
    /*
     * Submit account changes
     */
    async submitChangePassword() {
      if (!this.$v.profile.form.oldPassword.$error &&
          !this.$v.profile.form.newPassword.$error
        ) {
        let modifications = {
          oldPassword: this.profile.form.oldPassword,
          newPassword: this.profile.form.newPassword
        }
        this.$q.loading.show()
        let modificationStatus = await AuthService.modifyAccount(modifications)
        this.$q.loading.hide()
          
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(this.$t('label.' + modificationStatus.data.message), 'warning')
        } else {
          this.backToProfile()
        }
      }
    },
    /*
     * Back to the profile
     */
    backToProfile() {
      if (this.profile.form.name === '') {
        this.$router.push('/home')
      } else {
        this.$router.push('/profile/' + this.$store.state.user.id)
      }
    },
    /*
     * Change interface language dynamically
     */
    changeLanguage() {        
      this.$i18n.locale = this.profile.form.language
    },
    /*
     * Show help message
     */
    helpFields() {        
      this.showHelpPopup = true
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
          this.profile.form.picture = uploadPicture.data.file
        } else if (uploadPicture.data.message && uploadPicture.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      }
      this.$q.loading.hide()
    },
    /*
     * Disconnection
     */
    disconnect() {
      this.$router.push('/user/logout')
    },
    /*
     * Remove user account
     */
    async removeAccount() {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureYouWantToRemoveYourAccount'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        const removeAccountStatus = await AuthService.removeAccount()

        if (removeAccountStatus) {
          Notification(_this.$t('label.YourAccountIsRemoved'), 'info')
          await _this.disconnect()
        } else {
          Notification(_this.$t('label.ErrorStandardMessage'), 'error')
        }
      })
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
        oldPassword: { required, minLength: minLength(8), checkPasswordComplexity },
        newPassword: { required, minLength: minLength(8), checkPasswordComplexity },
        age: { required }
      }
    }
  }
}
</script>
