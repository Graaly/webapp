<template>
  <div class="wrapper background-map">
    <div class="page-content">
      
      <div class="centered q-pt-lg q-pb-md">
        <img src="statics/images/logo/logo-home.png" class="logo-top" />
      </div>
      
      <!------------------ TITLE AREA -----------------------
      
      <h1 v-if="step !== 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.tellUsAboutYou') }}</h1>
      <h1 v-if="step === 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.IfYouUseGraalyForTheFirstTime') }}</h1>
      
      -->
      
      <div class="q-pa-md">
        <div class="centered title2 q-mb-lg">{{ $t('label.Welcome') }}</div>
    
        <!------------------ FORM AREA ------------------------>
      
        <form @submit.prevent="formSubmit()" class="q-pa-lg">
          
          <q-input
            outlined
            v-if="step === 'generic'"
            :label="$t('label.YourName')"
            v-model="form.name"
            @blur="$v.form.name.$touch"
            maxlength="30"
            bottom-slots
            :error="$v.form.name.$error"
            :error-message="$t('label.PleaseEnterYourName')"
            test-id="name"
            />
          
          <q-input
            outlined
            v-if="step === 'generic'"
            type="email"
            :label="$t('label.YourEmail')"
            v-model="form.email"
            @blur="$v.form.email.$touch; checkEmail();"
            bottom-slots
            :error="$v.form.email.$error"
            :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
            />
          
          <q-input
            outlined
            v-if="step === 'generic'"
            type="password"
            v-model="form.password"
            :label="$t('label.YourPassword')"
            @blur="$v.form.password.$touch"
            bottom-slots
            :error="$v.form.password.$error"
            :error-message="!$v.form.password.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.form.password.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
            test-id="password"
            />
            
          <q-select
            outlined
            v-if="step === 'location'"
            :label="$t('label.YourSex')"
            v-model="form.sex"
            :options="sexes"
            emit-value
            map-options
            @blur="$v.form.sex.$touch"
            bottom-slots
            :error="$v.form.sex.$error"
            :error-message="$t('label.PleaseSelectYourSex')"
            test-id="sex"
            />
          
          <q-select
            outlined
            v-if="step === 'location'"
            :label="$t('label.YourAge')"
            v-model="form.age"
            :options="ages"
            emit-value
            map-options
            @blur="$v.form.age.$touch"
            bottom-slots
            :error="$v.form.age.$error"
            :error-message="$t('label.PleaseSelectYourAge')"
            test-id="age"
            />
            
          <q-select
            outlined
            v-if="step === 'location'"
            :label="$t('label.YourCountry')"
            v-model="form.country"
            :options="countries"
            emit-value
            map-options
            @blur="$v.form.country.$touch"
            bottom-slots
            :error="$v.form.country.$error"
            :error-message="$t('label.PleaseSelectYourCountry')"
            test-id="country"
            />
          
          <q-input
            outlined
            v-if="step === 'location'"
            :label="$t('label.YourZipCode')"
            v-model="form.zipCode"
            @blur="$v.form.zipCode.$touch"
            bottom-slots
            :error="$v.form.zipCode.$error"
            :error-message="$t('label.PleaseEnterYourZipCode')"
            test-id="zip"
            />
            
          <div class="row" v-if="step === 'location'">
            <div class="col-2"><q-checkbox dark v-model="form.terms" test-id="terms" /></div>
            <div class="col secondary-font-small">
              <span v-html="$t('label.IAgreeTheTermsAndConditions')" />
              <div class="q-field-bottom" v-if="$v.form.terms.$error">
                <div class="q-field-error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
              </div>
            </div>
          </div>
          
          <div class="row" v-if="step === 'location'">
            <div class="col-2"><q-checkbox dark v-model="form.privacy" test-id="privacy" /></div>
            <div class="col secondary-font-small">
              <span v-html="$t('label.IAgreeThePrivacyPolicy')" />
              <div class="q-field-bottom" v-if="$v.form.privacy.$error">
                <div class="q-field-error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="step === 'validation'">
            <p test-id="enter-code">{{ $t('label.EnterTheCodeYouReceivedByEmail') }}</p>
            <q-input :label="$t('label.Code')" v-model="form.code" />
          </div>
          
          <p class="text-right q-mt-md q-mb-md" v-if="step === 'validation'">
            <a @click="generateANewCode()">{{ $t('label.NewCode') }}</a>
          </p>
          
          <p class="text-center q-mt-md q-mb-md" v-if="step === 'firstusage'">
            <img src="statics/icons/game/discovery.png" />
          </p>
        
          <p class="text-center multiple-btn margin-size-3 q-mt-lg">
            <!--<q-btn 
              class="glossy"
              v-if="step !== 'firstusage'" 
              color="accent" 
              icon="fas fa-chevron-left" 
              :loading="submitting" 
              @click="backAction()" />-->
            <q-btn 
              class="glossy large-btn"
              :disabled="formDisabled"
              color="primary" 
              :label="$t('label.Subscribe')" 
              :loading="submitting" 
              type="submit" />
            <div class="centered q-mt-sm q-mb-lg">
              <a @click="goToSignIn()">{{ $t('label.IAlreadyHaveAnAccount') }}</a>
            </div>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import utils from 'src/includes/utils'

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'

export default {
  data () {
    return ({
      form: {
        email: '',
        name: '',
        sex: '',
        age: '',
        country: '',
        zipCode: '',
        password: '',
        code: '',
        terms: false,
        privacy: false
      },
      showPrivateBox: false,
      submitting: false,
      formDisabled: true,
      step: this.$route.params.step ? this.$route.params.step: 'generic',
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}]
    })
  },
  mounted () {
    utils.clearAllRunningProcesses()
  },
  methods: {
    /*
     * Manage account creation
     */
    async formSubmit() {
      switch (this.step) {
        case 'generic':
          // check if password is set
          this.$v.form.password.$touch()
          this.$v.form.email.$touch()
          // check if name is set
          this.$v.form.name.$touch()
          if (!this.$v.form.password.$error && !this.$v.form.email.$error && !this.$v.form.name.$error) {
            this.step = 'location'
          }
          break
        case 'location':
          // check if location is set
          this.$v.form.country.$touch()
          this.$v.form.zipCode.$touch()
          // check if sex and age are set
          this.$v.form.sex.$touch()
          this.$v.form.age.$touch()
          this.$v.form.terms.$touch()
          this.$v.form.privacy.$touch()
          if (!this.$v.form.country.$error && !this.$v.form.zipCode.$error && !this.$v.form.sex.$error && 
            !this.$v.form.age.$error && !this.$v.form.terms.$error && !this.$v.form.privacy.$error) {
            // sign in user
            let newAccount = {
              name: this.form.name,
              email: this.form.email,
              sex: this.form.sex,
              age: this.form.age,
              password: this.form.password,
              zipcode: this.form.zipCode,
              country: this.form.country,
              language: this.$i18n.locale
            }
            this.submitting = true
            
            let creationStatus = await AuthService.createAccount(newAccount)

            if (creationStatus.status && creationStatus.status === 200) {
              //this.step = 'validation' // EMA : remove code validation step
              if (creationStatus.data && creationStatus.data.user) {
                window.localStorage.setItem('jwt', creationStatus.data.user.jwt)
                axios.defaults.headers.common['Authorization'] = `Bearer ${creationStatus.data.user.jwt}`
                this.openHome()
              } else {
                Notification(this.$t('label.ErrorStandardMessage'), 'error')
              }
            } else {
              Notification(this.$t('label.ErrorStandardMessage'), 'error')
            }
            
            this.submitting = false
          }
          break
        case 'validation':
          // check validation code
          let validationStatus = await AuthService.validateAccount(this.form.email, this.form.code)
          
          this.submitting = true
          
          if (validationStatus.status && validationStatus.status === 200) {
            //this.step = 'firstusage'
            this.openHome() // remove firstusage step
          } else if (validationStatus.data && validationStatus.data.message === "You have tries too much codes") {
            Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
          } else {
            Notification(this.$t('label.IncorrectCodePleaseRetry'), 'warning')
          }
          
          this.submitting = false
          
          break
        case 'firstusage':         
          this.openHome()
          
          break
      }
    },
    openHome() {
      let destination = '/home';
      if (this.$route.query.hasOwnProperty('redirect')) {
        destination = this.$route.query.redirect
      }
      this.$router.push(destination)
    },
    /*
     * check if the user email is already existing
     * @param   {string}    email            user email
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
     * Check if email is already used
     */
    async checkEmail() {
      if (!this.$v.form.email.$error) {
        // check if the user email is existing
        var userExisting = await this.checkUserIsExisting(this.form.email)

        if (userExisting && userExisting.status) {
          if (userExisting.status === 'active') {
            Notification(this.$t('label.EmailAlreadyUsed'), 'error')
          } else if (userExisting.status === 'new') {
            // redirect to user creation page
            this.$router.push('/user/createAccount/validation')
          } else if (userExisting.status === 'blocked') {
            // the user account is blocked (too much password or validation code tries)
            Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
          } else {
            this.formDisabled = false
          }
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Manage back button actions
     */
    async backAction() {
      switch (this.step) {
        case 'generic':
          this.$router.push('/user/login')
          break
        case 'location':
          this.step = 'generic'
          break
        case 'validation':
          await this.goToSignIn()
          break
      }
    },
    /*
     * Back to sign-in page
     */
    async goToSignIn() {
      this.$router.push('/user/login')
    },
    /*
     * send a new validation code
     */
    async generateANewCode() {
      this.submitting = true
      
      let codeSent = await AuthService.generateANewValidationCode(this.form.email)
      
      if (codeSent.status === 200) {
        Notification(this.$t('label.ANewCodeHasBeenSent'), 'info')
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      
      this.submitting = false
    }
  },
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      zipCode: { required },
      age: { required },
      sex: { required },
      terms: {
        sameAs: sameAs(() => true)
      },
      privacy: {
        sameAs: sameAs(() => true)
      },
      password: { required, minLength: minLength(8), checkPasswordComplexity }
    }
  }
}
</script>

<style>
</style>
