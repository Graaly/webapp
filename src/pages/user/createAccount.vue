<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle q-pa-lg">
      
      <!------------------ TITLE AREA ------------------------>
      
      <h1 v-if="step !== 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.tellUsAboutYou') }}</h1>
      <h1 v-if="step === 'firstusage'" class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.IfYouUseGraalyForTheFirstTime') }}</h1>
    
      <!------------------ FORM AREA ------------------------>
    
      <form @submit.prevent="formSubmit()">
            
        <q-field :error="$v.form.name.$error" v-if="step === 'generic'">
          <q-input dark :float-label="$t('label.YourName')" v-model="form.name" @blur="$v.form.name.$touch" />
          <div class="q-field-bottom" v-if="$v.form.name.$error">
            <div class="q-field-error" v-if="!$v.form.name.required">{{ $t('label.PleaseEnterYourName') }}</div>
          </div>
        </q-field>
        
        <q-field v-if="step === 'generic'">
          <q-select dark :float-label="$t('label.YourSex')" v-model="form.sex" :options="sexes" />
        </q-field>
        
        <q-field v-if="step === 'generic'">
          <q-select dark :float-label="$t('label.YourAge')" v-model="form.age" :options="ages" />
        </q-field>
      
        <q-field :error="$v.form.country.$error" v-if="step === 'location'">
          <q-select dark :float-label="$t('label.YourCountry')" v-model="form.country" :options="countries" @blur="$v.form.country.$touch" />
          <div class="q-field-bottom" v-if="$v.form.country.$error">
            <div class="q-field-error" v-if="!$v.form.country.required">{{ $t('label.PleaseSelectYourCountry') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.zipCode.$error" v-if="step === 'location'">
          <q-input dark :float-label="$t('label.YourZipCode')" v-model="form.zipCode" @blur="$v.form.zipCode.$touch" />
          <div class="q-field-bottom" v-if="$v.form.zipCode.$error">
            <div class="q-field-error" v-if="!$v.form.zipCode.required">{{ $t('label.PleaseEnterYourZipCode') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.password.$error" v-if="step === 'password'">
          <q-input dark type="password" v-model="form.password" :float-label="$t('label.YourPassword')"  @blur="$v.form.password.$touch" />
          <div class="q-field-bottom" v-if="$v.form.password.$error">
            <div class="q-field-error" v-if="!$v.form.password.required">{{ $t('label.PleaseEnterYourPassword') }}</div>
            <div class="q-field-error" v-if="!$v.form.password.minLength">{{ $t('label.YourPasswordMustBe6digitsLength') }}</div>
            <div class="q-field-error" v-if="!$v.form.password.checkPasswordComplexity">{{ $t('label.PasswordComplexityRule') }}</div>
          </div>
        </q-field>
        
        <q-field v-if="step === 'validation'">
          {{ $t('label.EnterTheCodeYouReceivedByEmail') }}
          <q-input dark :float-label="$t('label.Code')" v-model="form.code" />
        </q-field>
        
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
    
      <!------------------ PRIVATE DATA AREA ------------------------>
      
      <div class="link-below-button" v-if="step === 'generic'">
        <a @click="showPrivateBox = true">{{ $t('label.HowWeUseYourData') }}</a>
      </div>
      <div v-if="showPrivateBox && step === 'generic'">
        TODO
      </div>
      
    </div>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import { required, minLength } from 'vuelidate/lib/validators'
import Notification from 'plugins/NotifyHelper'
import checkPasswordComplexity from 'plugins/PasswordComplexity'
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
        code: ''
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
    utils.clearAllTimeouts()
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
          // check if name is set
          this.$v.form.name.$touch()
          if (!this.$v.form.name.$error) {
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
          if (!this.$v.form.password.$error) {
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
            this.step = 'firstusage'
          } else if (validationStatus.data && validationStatus.data.message === "You have tries too much codes") {
            Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
          } else {
            Notification(this.$t('label.IncorrectCodePleaseRetry'), 'warning')
          }
          
          this.submitting = false
          
          break
        case 'firstusage':         
          let destination = '/home';
          if (this.$route.query.hasOwnProperty('redirect')) {
            destination = this.$route.query.redirect
          }
          this.$router.push(destination)
          
          break
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
      }
      
      this.submitting = false
    }
  },
  validations: {
    form: {
      name: { required },
      country: { required },
      zipCode: { required },
      password: { required, minLength: minLength(8), checkPasswordComplexity }
    }
  }
}
</script>

<style>
</style>
