<template>
  <div>
    <q-form 
      ref="form"
      @submit="createNewUser"
    >
      <q-input
        outlined
        class="q-pb-lg"
        :label="$t('label.YourName')"
        v-model="form.name"
        @blur="$v.form.name.$touch"
        maxlength="30"
        bottom-slots
        :rules="[ val => val && val.length > 0 || $t('label.PleaseEnterYourName')]"
        test-id="name"
      />

      <q-input
        outlined
        class="q-pb-lg"
        type="email"
        :label="$t('label.YourEmail')"
        v-model="form.email"
        @blur="$v.form.email.$touch"
        bottom-slots
        lazy-rules
        :rules="[
              val => val && val.length > 0 || $t('label.PleaseEnterYourEmailAddress'),
              val => $v.form.email.email || $t('label.PleaseEnterAValidEmailAddress'),
              emailRules
            ]"

      />

      <q-input
        outlined
        class="q-pb-lg"
        type="password"
        v-model="form.password"
        :label="$t('label.YourPassword')"
        @blur="$v.form.password.$touch"
        bottom-slots
        :rules="[
              val => val && val.length > 0 || $t('label.PleaseEnterYourPassword'),
              val => val && val.length >= 8 || $t('label.YourPasswordMustBe8digitsLength'),
              val => checkPasswordComplexity(val) || $t('label.PasswordComplexityRule')
            ]"
        test-id="password"
      />

      <q-select
        outlined
        :label="$t('label.YourSex')"
        v-model="form.sex"
        :options="sexes"
        emit-value
        map-options
        bottom-slots
        test-id="sex"
      />

      <q-select
        outlined
        :label="$t('label.YourAge')"
        v-model="form.age"
        :options="ages"
        emit-value
        map-options
        @blur="$v.form.age.$touch"
        bottom-slots
        test-id="age"
      />

      <q-select
        outlined
        :label="$t('label.YourCountry')"
        v-model="form.country"
        :options="countries"
        emit-value
        map-options
        @blur="$v.form.country.$touch"
        bottom-slots
        test-id="country"
      />

      <q-input
        outlined
        :label="$t('label.YourZipCode')"
        v-model="form.zipCode"
        @blur="$v.form.zipCode.$touch"
        bottom-slots
        :rules="[
              val => val && val.length > 0 || $t('label.PleaseEnterYourZipCode'),
            ]"
        test-id="zip"
      />

      <div class="row">
        <div class="col-2">
          <q-checkbox dark v-model="form.terms" test-id="terms"/>
        </div>
        <div class="col secondary-font-small text-white">
          <span v-html="$t('label.IAgreeTheTermsAndConditions')"/>
          <div class="q-field-bottom" v-if="!termsOk">
            <div class="q-field-error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
          </div>
        </div>
      </div>

      <div class="row q-mb-lg">
        <div class="col-2">
          <q-checkbox dark v-model="form.privacy" test-id="privacy"/>
        </div>
        <div class="col secondary-font-small text-white">
          <span v-html="$t('label.IAgreeThePrivacyPolicy')"/>
          <div class="q-field-bottom" v-if="!termsOk">
            <div class="q-field-error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
          </div>
        </div>
      </div>

      <text-btn-square 
        icon="done" 
        color="primary" 
        title="Create" 
        submit
      />
    </q-form>
  </div>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

import textBtnSquare from "../../components/user/UI/textBtnSquare";
import iconBtnSquare from "../../components/user/UI/iconBtnSquare";

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'
import countriesES from 'data/countries_es.json'

export default {
  name: "createProfilStepper",
  components: {
    textBtnSquare,
    iconBtnSquare
  },
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
      countries: this.$i18n.locale === 'fr' ? countriesFR : (this.$i18n.locale === 'es' ? countriesES : countriesEN),
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      // STEP ERROR
      isBadMail: true,
      termsOk: true
    })
  },
  mounted () {
    utils.clearAllRunningProcesses()
  },
  methods: {
    /*
     * Email Verification and return Message
     */
    emailRules() {
      return new Promise(async(resolve, reject) => {
        const userExisting = await this.checkUserIsExisting(this.form.email)
        if (userExisting && userExisting.status) {
          if (userExisting.status === 'active') {
            Notification(this.$t('label.EmailAlreadyUsed'), 'error')
            this.isBadMail = true
            resolve(false || this.$t('label.RejectedEmail'))
          }
          else if (userExisting.status === 'blocked') {
            Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
            this.isBadMail = true
            resolve(false || this.$t('label.RejectedEmail'))
          }
          else {
            this.isBadMail = false
            resolve(true)
          }
        }
      })
    },
    /*
     * Create a new User in the DB
     */
    async createNewUser() {
      if (!this.form.terms || !this.form.privacy) {
        this.termsOk = false
        return false
      }
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
     * Go to Homepage after create user success
     */
    openHome() {
      let destination = '/home';
      if (this.$route && this.$route.query && this.$route.query.hasOwnProperty('redirect') && this.$route.query.redirect) {
        destination = this.$route.query.redirect
      }
      this.$router.push(destination)
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
    }
  },
  /*
   * Validation Rules for Vuelidate.js
   */
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      zipCode: { required },
      age: { required },
      terms: {
        sameAs: sameAs(() => true)
      },
      privacy: {
        sameAs: sameAs(() => true)
      },
      password: { required, minLength: minLength(8) }
    }
  }
}
</script>

<style scoped>

</style>
