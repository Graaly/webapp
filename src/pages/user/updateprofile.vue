<template>
  <div class="scroll background-profil">
    <div class="profil">
      <div class="flex no-wrap items-end justify-start">
        <div class="profil-photo-top" :style="'background: url(' + getProfileImage() + ' ) center center / cover no-repeat '">
          <icon-btn-square color="secondary" fill icon="camera_alt" @click.native="$refs['uploadfile'].click()" class="absolute" style="top: -10px;right: -25px;"/>
          <input @change="uploadImage" ref="uploadfile" name="picturefile" id="picturefile" type="file" accept="image/*" hidden />
        </div>
        <div>
          <div v-if="profile.form.name !== ''">
            <div class="centered subtitle3 q-mt-lg">
              {{ profile.form.name }}
            </div>
<!--            <div class="centered subtitle6 q-mt-sm" v-if="profile.form.location && (profile.form.location.postalCode || profile.form.location.country)">-->
<!--              <span v-if="profile.form.location.postalCode">{{ profile.form.location.postalCode }}</span>-->
<!--              <span v-if="profile.form.location.postalCode && profile.form.location.country">, </span>-->
<!--              <span v-if="profile.form.location.country">{{ profile.form.location.country }}</span>-->
<!--            </div>-->
          </div>
        </div>
      </div>
      <q-form 
        ref="form"
        class="q-mt-lg"
        @submit="saveProfileChanges"
      >
        <div class="title flex justify-between items-center q-mb-md">
          <div style="text-transform:uppercase;" class="flex items-center">
            <q-icon name="person" class="q-mr-sm material-icons-outlined"/>
            <span v-if="!newAccount">{{ $t('label.ModifyAccount') }}</span>
            <span v-if="newAccount">{{ $t('label.WeNeedMoreInformationAboutYou') }}</span>
          </div>
        </div>
        <div class="flex no-wrap justify-between items-center">
          <div class="full-width q-pr-md">
            <q-input
              dark
              v-model="profile.form.name"
              :label="$t('label.YourName') + ' *'"
              placeholder="John Doe"
              @blur="$v.profile.form.name.$touch"
              bottom-slots
              :rules="[ val => val && val.length > 0 || $t('label.PleaseEnterYourName')]"
            />

            <q-input
              dark
              v-model="profile.form.email"
              :label="$t('label.YourEmail') + ' *'"
              placeholder="john.doe@gmail.com"
              @blur="$v.profile.form.email.$touch"
              bottom-slots
              lazy-rules
              :rules="[
                  val => val && val.length > 0 || $t('label.PleaseEnterYourEmailAddress'),
                  val => $v.profile.form.email.email || $t('label.PleaseEnterAValidEmailAddress'),
                  displayPassword ? emailRules : ''
                ]"
            />

            <q-input
              dark
              v-if="displayPassword"
              type="password"
              v-model="profile.form.password"
              :label="$t('label.YourPassword') + ' *'"
              @blur="$v.profile.form.password.$touch"
              bottom-slots
              :rules="[
                val => val && val.length > 0 || $t('label.PleaseEnterYourPassword'),
                val => val && val.length >= 8 || $t('label.YourPasswordMustBe8digitsLength'),
                val => checkPasswordComplexity(val) || $t('label.PasswordComplexityRule')
              ]"
            />

            <q-input
              dark
              v-model="profile.form.description"
              :label="$t('label.YourPresentation')"
              bottom-slots
              type="textarea"
              :min-rows="3"
            />
          </div>
        </div>

        <div class="flex no-wrap justify-between items-center">
          <div class="full-width q-pr-md">
            <q-select
              dark
              :label="$t('label.YourCountry') + ' *'"
              v-model="profile.form.country"
              :options="countries"
              emit-value
              map-options
              bottom-slots
              @blur="getLocation">
            </q-select>

            <q-input
              dark
              v-model="profile.form.zipCode"
              :label="$t('label.YourZipCode') + ' *'"
              placeholder="38500"
              bottom-slots
              @blur="getLocation"
              :rules="[
                val => val && val.length > 0 || $t('label.PleaseEnterYourZipCode'),
              ]"
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
            </q-select>

            <q-select
              dark
              :label="$t('label.YourAge')"
              v-model="profile.form.age"
              :options="ages"
              emit-value map-options
              @blur="$v.profile.form.age.$touch"
              bottom-slots
            >
            </q-select>

            <q-input
              dark
              v-model="profile.form.phone"
              :label="$t('label.YourPhoneNumber')"
              :placeholder="$t('label.phoneExample')">
            </q-input>
          </div>

        </div>
        
        <div class="row q-pt-md" v-if="newAccount">
          <div class="col-2">
            <q-checkbox dark v-model="profile.form.terms"/>
          </div>
          <div class="col secondary-font-small text-white">
            <span v-html="$t('label.IAgreeTheTermsAndConditions')"/>
            <div class="q-field-bottom" v-if="$v.profile.form.terms.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
            </div>
          </div>
        </div>

        <div class="row" v-if="newAccount">
          <div class="col-2">
            <q-checkbox dark v-model="profile.form.privacy"/>
          </div>
          <div class="col secondary-font-small text-white">
            <span v-html="$t('label.IAgreeThePrivacyPolicy')"/>
            <div class="q-field-bottom" v-if="$v.profile.form.privacy.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
            </div>
          </div>
        </div>
        <div class="row q-pt-md" v-if="profile.form.name === ''">
          {{ $t('label.HowWeUseYourData') }}
          <q-btn round dense flat icon="help" @click="helpFields" size="md"/>
        </div>
        <div class="flex no-wrap q-pt-md" v-if="newAccount">
          <text-btn-square
            :disable="!profile.form.terms || !profile.form.privacy"
            class="q-mb-lg"
            type="submit"
            :title="$t('label.CreateAccount')"
            color="accent"
            icon="person_add"
            submit
          />
        </div>
        <div class="flex no-wrap q-pt-md" v-if="!newAccount">
          <text-btn-square
            class="q-mb-lg"
            type="submit"
            :title="$t('label.ModifyAccount')"
            color="accent"
            icon="person_add"
            submit
          />
        </div>
        
<!--        <template v-slot:message>
<!--          <q-banner v-if="step === 1" class="bg-secondary text-white q-px-lg">-->
<!--            <span v-if="!displayPassword">Vous pouvez modifié votre compte ici</span>-->
<!--            <span v-else>Commencez par remplir ces champs</span>-->
<!--          </q-banner>
          <q-banner v-if="step === 2" class="bg-orange-8 text-white q-px-lg">
            {{ $t('label.HowWeUseYourData') }}
            <q-btn round dense flat icon="help" @click="helpFields" size="md"/>
          </q-banner>
<!--          <q-banner v-if="step === 3" class="bg-accent text-white q-px-lg">-->
<!--            C'est la dernière étape pour la création de votre profil-->
<!--          </q-banner>
        </template>-->
      </q-form>
      <form v-if="!displayPassword" class="q-mt-lg">
        <div class="title flex justify-between items-center q-mb-md">
          <div style="text-transform:uppercase;" class="flex items-center">
            <q-icon name="lock" class="q-mr-sm material-icons-outlined"/>
            <span>{{ $t('label.ChangeYourPassword') }}</span>
          </div>
        </div>
        <div class="q-px-lg">
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
          <div>
            <text-btn-square
              class="q-mb-lg"
              type="submit"
              :title="$t('label.Save')"
              color="primary"
              icon="save"
              @click.native="submitChangePassword"
            />
          </div>

        </div>
      </form>
      <div class="q-mt-lg q-pa-md q-ma-md" v-if="!displayPassword">
        <div class="centered">{{ $t('label.RemoveYourAccount') }}</div>
        <p class="subtitle6">{{ $t('label.RemoveYourAccountDesc') }}</p>
        <text-btn-square
          class="q-mb-lg"
          @click.native="removeAccount()"
          :title="$t('label.RemoveYourAccount')"
          color="#DB2828"
          icon="delete"
        />
      </div>
      <div class="q-pb-xl">
        <div class="centered q-mt-lg q-mb-sm cursor-pointer"><a @click="disconnect()">{{ $t('label.SignOut') }}</a></div>
        <div class="centered q-mb-sm" v-html="$t('label.TermsAndConditionsLink')"></div>
        <div class="centered q-mb-xl" v-html="$t('label.PrivacyPolicyLink')"></div>
      </div>
    </div>
    <gmap-autocomplete id="destination" style="opacity: 0" :placeholder="$t('label.Address')" class="col q-input-target text-left" @input="value = $event.target.value" />

    <!------------------ REWARDS POPUP ------------------------>
    <q-dialog v-model="showHelpPopup">
      <q-card class="help-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.HowWeUseYourData') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
        </q-card-section>
        <q-card-section>
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

    <!------------------ DELETE POPUP ------------------------>
    <q-dialog v-model="deleteDialog">
      <q-card class="help-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.ConfirmDeleteAccount') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
        </q-card-section>

        <q-card-section>
          <div>{{ $t('label.AreYouSureYouWantToRemoveYourAccount') }}</div>
        </q-card-section>
        <q-card-section>
          <text-btn-square
            class="q-mb-lg"
            @click.native="confirmDelete()"
            :title="$t('label.RemoveYourAccount')"
            color="#DB2828"
            icon="delete"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import {required, minLength, email, sameAs} from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import languages from 'data/languages.json'
import utils from 'src/includes/utils'

import iconBtnSquare from "components/user/UI/iconBtnSquare";
import textBtnSquare from "components/user/UI/textBtnSquare";

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'
import countriesES from 'data/countries_es.json'

export default {
  components: {
    iconBtnSquare, textBtnSquare
  },
  data () {
    return {
      step: 1,
      profile: {
        form: {
          name: "",
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
          newPassword: "",
          terms: false,
          privacy: false
        }
      },
      newAccount: false,
      position: null,
      countries: this.$i18n.locale === 'fr' ? countriesFR : (this.$i18n.locale === 'es' ? countriesES : countriesEN),
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      displayPassword: false,
      showHelpPopup: false,
      deleteDialog: false,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      // Error Step
      isBadMail: false,
      errorStepOne: false,
      errorStepTwo: true
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
      language: this.$store.state.user.language,
      terms: false,
      privacy: false
    }
    this.newAccount = this.profile.form.name === ''
    if (this.$store.state.user.missingPassword) {
      this.displayPassword = true
    }
  },
  methods: {
    checkStepOne() {
      if (this.displayPassword) {
      console.log(this.$v.profile.form.name.$error)
      console.log(this.$v.profile.form.email.$error)
      console.log(this.$v.profile.form.password.$error)
      console.log(this.isBadMail)
        if (!this.$v.profile.form.name.$error && !this.$v.profile.form.email.$error && !this.$v.profile.form.password.$error && !this.isBadMail) {
          this.errorStepOne = false
          return true
        } else {
          this.errorStepOne = true
          return false
        }
      } else {
        if (this.profile.form.name !== '' && this.profile.form.email !== '') {
          this.errorStepOne = false
          return true
        } else {
          this.errorStepOne = true
          return false
        }
      }
    },
    checkStepTwo() {
      if (!this.$v.profile.form.country.$error && !this.$v.profile.form.zipCode.$error && !this.$v.profile.form.age.$error) {
        return true
      } else {
        return false
      }
    },
    nextStep() {
      this.$v.profile.form.name.$touch()
      this.$v.profile.form.email.$touch()
      if (this.displayPassword) {
        this.$v.profile.form.password.$touch()
      }
      if (this.checkStepOne()) {
        this.step = 2
      }
    },
    validationStep() {
      console.log("validation")
      if (this.displayPassword) {
        this.$v.profile.form.country.$touch()
        this.$v.profile.form.zipCode.$touch()
        this.$v.profile.form.age.$touch()
        if (this.checkStepTwo()) {
          this.step = 3
        }
      }
    },
    checkPasswordComplexity(password) {
      // Minimum of 1 Uppercase Letter
      if (/[A-Z]/.test(password) === false) {
        return false;
      }

      // Minimum of 1 Number
      if (/\d/.test(password) === false) {
        return false;
      }

      return true;
    },
    /*
    * Email Verification and return Message
    */
    emailRules() {
    console.log('email rule1')
      return new Promise(async(resolve, reject) => {
        const userExisting = await this.checkUserIsExisting(this.profile.form.email)
        console.log('email rule2')
        if (userExisting && userExisting.status) {
        console.log('email rule3')
          if (userExisting.status === 'active') {
          console.log('email rule4')
            Notification(this.$t('label.EmailAlreadyUsed'), 'error')
            this.isBadMail = true
            resolve(false || this.$t('label.RejectedEmail'))
          }
          else if (userExisting.status === 'blocked') {
          console.log('email rule5')
            Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
            this.isBadMail = true
            resolve(false || this.$t('label.RejectedEmail'))
          }
          else {
          console.log('email rule6')
            this.isBadMail = false
            resolve(true)
          }
        }
      })
    },
    /**
     * Check if this email is already existing in DB
     * @param email
     * @returns {Promise<{error: string}|{status}|{status: string}>}
     */
    async checkUserIsExisting(email) {
      let userStatus = await AuthService.checkEmail(email)
      if (userStatus && userStatus.data && userStatus.data.hasOwnProperty('existing') && userStatus.data.existing === true) {
        return {status: userStatus.data.status}
      } else if (userStatus && userStatus.data && userStatus.data.hasOwnProperty('existing') && userStatus.data.existing === false) {
        return {status: 'missing'}
      } else {
        return {error: 'technical issue'}
      }
    },
    /*
     * get profile image
     */
    getProfileImage () {
      if (this.profile.form.picture && this.profile.form.picture.indexOf('http') !== -1) {
        return this.profile.form.picture
      } else if (this.profile.form.picture) {
        return this.uploadUrl + '/upload/profile/' + this.profile.form.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    },
    /*
     * Submit account changes
     */
    async saveProfileChanges() {
      //this.$v.profile.form.name.$touch()
      //this.$v.profile.form.email.$touch()
      //this.$v.profile.form.country.$touch()
      //this.$v.profile.form.zipCode.$touch()
      //this.$v.profile.form.age.$touch()
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
        Notification(this.$t('label.AccountModified'), 'positive')
        this.backToProfile()
      }

      /*if (!this.$v.profile.form.name.$error && !this.$v.profile.form.email.$error && !(this.$v.profile.form.password.$error && this.displayPassword)) {
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
      }*/
    },
    async createNewAccount() {
      if (!this.profile.form.terms || !this.profile.form.privacy) {
        return
      }
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
        Notification(this.$t('label.AccountCreated'), 'positive')
        this.backToProfile()
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
      this.$v.profile.form.oldPassword.$touch()
      this.$v.profile.form.newPassword.$touch()
      if (!this.$v.profile.form.oldPassword.$error && !this.$v.profile.form.newPassword.$error) {
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
          Notification(this.$t('label.PasswordChangeSuccess'), 'positive')
          this.profile.form.oldPassword = null
          this.profile.form.newPassword = null
          this.$v.$reset()
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
      this.deleteDialog = true
      //var _this = this; // workaround for closure scope quirks

      /*this.$q.dialog({
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
      })*/
    },
    async confirmDelete() {
      const _this = this; // workaround for closure scope quirks
      const removeAccountStatus = await AuthService.removeAccount()

      if (removeAccountStatus) {
        Notification(_this.$t('label.YourAccountIsRemoved'), 'info')
        await _this.disconnect()
      } else {
        Notification(_this.$t('label.ErrorStandardMessage'), 'error')
      }
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
        age: { required },
        terms: {
          sameAs: sameAs(() => true)
        },
        privacy: {
          sameAs: sameAs(() => true)
        }
      }
    }
  }
}
</script>
<style scoped lang="scss">

.background-profil {
  background-image: url('../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.profil, .password{
  max-width: 800px;
  margin: 0 auto;
  color: white;

  .profil-photo-top{
    width: 100px;
    height: 100px;
    position: relative;
    margin-left: 12px;
    margin-top: 5vh;
    margin-right: 10px;
    border-radius: 50%;
  }
  .subtitle{
    position: relative;
    top: -10px;
    margin-bottom: 5vh;
  }
}
.help-dialog-card{
  width: 90vw;
  max-width: 400px;
  background: linear-gradient(180deg, rgb(7,39,90), rgb(4,20,45));
}

</style>
