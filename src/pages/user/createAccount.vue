<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle q-pa-lg">
      
      <!------------------ TITLE AREA ------------------------>
      
      <h1 v-if="step !== 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.tellUsAboutYou') }}</h1>
      <h1 v-if="step === 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.IfYouUseGraalyForTheFirstTime') }}</h1>
    
      <!------------------ FORM AREA ------------------------>
    
      <form @submit.prevent="formSubmit()">
        
        <q-input
          v-if="step === 'generic'"
          dark
          :label="$t('label.YourName')"
          v-model="form.name"
          @blur="$v.form.name.$touch"
          maxlength="30"
          bottom-slots
          :error="$v.form.name.$error"
          :error-message="$t('label.PleaseEnterYourName')"
          test-id="name"
          />
        
        <q-select
          v-if="step === 'generic'"
          dark
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
          v-if="step === 'generic'"
          dark
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
          v-if="step === 'location'"
          dark
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
          v-if="step === 'location'"
          dark
          :label="$t('label.YourZipCode')"
          v-model="form.zipCode"
          @blur="$v.form.zipCode.$touch"
          bottom-slots
          :error="$v.form.zipCode.$error"
          :error-message="$t('label.PleaseEnterYourZipCode')"
          test-id="zip"
          />
        
        <q-input
          v-if="step === 'password'"
          dark
          type="password"
          v-model="form.password"
          :label="$t('label.YourPassword')"
          @blur="$v.form.password.$touch"
          bottom-slots
          :error="$v.form.password.$error"
          :error-message="!$v.form.password.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.form.password.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
          test-id="password"
          />
          
        <div class="row" v-if="step === 'password'">
          <div class="col-2"><q-checkbox dark color="gold" v-model="form.terms" test-id="terms" /></div>
          <div class="col">
            <span v-html="$t('label.IAgreeTheTermsAndConditions')" />
            <div class="q-field-bottom" v-if="$v.form.terms.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
            </div>
          </div>
        </div>
        
        <div class="row" v-if="step === 'password'">
          <div class="col-2"><q-checkbox dark color="gold" v-model="form.privacy" test-id="privacy" /></div>
          <div class="col">
            <span v-html="$t('label.IAgreeThePrivacyPolicy')" />
            <div class="q-field-bottom" v-if="$v.form.privacy.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="step === 'validation'">
          <p test-id="enter-code">{{ $t('label.EnterTheCodeYouReceivedByEmail') }}</p>
          <q-input dark :label="$t('label.Code')" v-model="form.code" />
        </div>
        
        <p class="text-right q-mt-md q-mb-md" v-if="step === 'validation'">
          <a @click="generateANewCode()">{{ $t('label.NewCode') }}</a>
        </p>
        
        <p class="text-center q-mt-md q-mb-md" v-if="step === 'firstusage'">
          <img src="statics/icons/game/discovery.png" />
        </p>
      
        <p class="text-center multiple-btn margin-size-3 q-mt-lg q-mb-xl">
          <q-btn v-if="step !== 'firstusage'" round color="white" text-color="primary" icon="fas fa-chevron-left" :loading="submitting" @click="backAction()" />
          <q-btn round color="white" text-color="primary" icon="fas fa-chevron-right" :loading="submitting" type="submit" />
        </p>
      </form>
      
    </div>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
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
      step: this.$route.params.step ? this.$route.params.step: 'generic',
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}]
    })
  },
  mounted () {
    utils.clearAllRunningProcesses()
    // check that the email is provided
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    } else {
      // redirect to login page
      this.$router.push('/user/login')
    }
  },
  methods: {
    /*
     * Manage account creation
     */
    async formSubmit() {
      switch (this.step) {
        case 'generic':
          // check if sex and age are set
          this.$v.form.sex.$touch()
          this.$v.form.age.$touch()
          // check if name is set
          this.$v.form.name.$touch()
          if (!this.$v.form.name.$error && !this.$v.form.sex.$error && !this.$v.form.age.$error) {
            this.step = 'location'
          }
          break
        case 'location':
          // check if location is set
          this.$v.form.country.$touch()
          this.$v.form.zipCode.$touch()
          if (!this.$v.form.country.$error && !this.$v.form.zipCode.$error) {
            this.step = 'password'
          }
          break
        case 'password':
          // check if password is set
          this.$v.form.password.$touch()
          this.$v.form.terms.$touch()
          this.$v.form.privacy.$touch()
          if (!this.$v.form.password.$error && !this.$v.form.terms.$error && !this.$v.form.privacy.$error) {
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
              this.step = 'validation'
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
        case 'password':
          this.step = 'location'
          break
        case 'validation':
          this.$router.push('/user/login')
          break
      }
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
