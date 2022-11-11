<template>
    <q-stepper
      v-model="stepper"
      ref="stepper"
      animated
      flat
      style="background:transparent;"
    >
      <q-step
        :name="1"
        :title="$t('label.CreateAccount')"
        icon="face"
        active-icon="face"
        :done="checkStepOne()"
        done-icon="done"
        done-color="positive"
      >
        <q-input
          outlined
          class="q-pb-lg"
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
          class="q-pb-lg"
          type="email"
          :label="$t('label.YourEmail')"
          v-model="form.email"
          @blur="$v.form.email.$touch"
          bottom-slots
          lazy-rules
          :rules="[
                val => val.length !== 0 || $t('label.PleaseEnterYourEmailAddress'),
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
          :error="$v.form.password.$error"
          :error-message="!$v.form.password.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.form.password.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
          test-id="password"
        />
      </q-step>

      <q-step
        :name="2"
        :title="$t('label.AccountInfo')"
        icon="info"
        active-icon="info"
        :done="checkStepTwo()"
        done-icon="done"
        done-color="positive"
      >
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
          :error="$v.form.age.$error"
          :error-message="$t('label.PleaseSelectYourAge')"
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
          :error="$v.form.country.$error"
          :error-message="$t('label.PleaseSelectYourCountry')"
          test-id="country"
        />

        <q-input
          outlined
          :label="$t('label.YourZipCode')"
          v-model="form.zipCode"
          @blur="$v.form.zipCode.$touch"
          bottom-slots
          :error="$v.form.zipCode.$error"
          :error-message="$t('label.PleaseEnterYourZipCode')"
          test-id="zip"
        />

        <div class="row">
          <div class="col-2">
            <q-checkbox dark v-model="form.terms" test-id="terms"/>
          </div>
          <div class="col secondary-font-small text-white">
            <span v-html="$t('label.IAgreeTheTermsAndConditions')"/>
            <div class="q-field-bottom" v-if="$v.form.terms.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-2">
            <q-checkbox dark v-model="form.privacy" test-id="privacy"/>
          </div>
          <div class="col secondary-font-small text-white">
            <span v-html="$t('label.IAgreeThePrivacyPolicy')"/>
            <div class="q-field-bottom" v-if="$v.form.privacy.$error">
              <div class="q-field-error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
            </div>
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex no-wrap q-py-md">
          <icon-btn-square icon="arrow_back_ios_new" v-if="stepper > 1" color="primary" @click.native="$refs.stepper.previous()" class="q-mr-md"/>
          <text-btn-square v-if="stepper == 1" :disable="errorStepOne" icon="arrow_forward_ios" color="primary" title="Continue" @click.native="$refs.stepper.next()"/>
          <text-btn-square v-else-if="stepper == 2" :disable="errorStepTwo" icon="done" color="primary" title="Create" @click.native="createNewUser"/>
          <!--              <text-btn-square v-else  :icon="stepper == 3 ? 'done' : 'arrow_forward_ios'" color="primary" :title="stepper === 3 ? 'Finish' : 'Continue'" @click.native="$refs.stepper.next()"/>-->
        </q-stepper-navigation>
      </template>
    </q-stepper>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import utils from 'src/includes/utils'

import textBtnSquare from "../../components/user/UI/textBtnSquare";
import iconBtnSquare from "../../components/user/UI/iconBtnSquare";

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'

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
      step: this.$route.params.step ? this.$route.params.step: 'generic',
      stepper: 1,
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      sexes: [{label: this.$t('label.Male'), value: 'male'}, {label: this.$t('label.Female'), value: 'female'}],
      ages: [{label: '13 - 25', value: '13-25'}, {label: '26 - 39', value: '26-39'}, {label: '40 - 49', value: '40-49'}, {label: '50 - 64', value: '50-64'}, {label: '65 +', value: '65+'}],
      // STEP ERROR
      isBadMail: true,
      errorStepOne: true,
      errorStepTwo: true

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
     * Check if all required for Step One
     */
    checkStepOne() {
      if (this.form.password && this.form.name && this.form.email && !this.form.password.length <= 8) {
        if (!this.$v.form.password.$error && !this.$v.form.name.$error && !this.$v.form.email.$error) {
          if (!this.isBadMail) {
            this.errorStepOne = false
            return true
          } else {
            this.errorStepOne = true
            return false
          }
        } else {
          this.errorStepOne = true
          return false
        }
      } else {
        this.errorStepOne = true
        return false
      }
    },
    /*
     * Check if all required for Step Two
     */
    checkStepTwo() {
      if (this.form.sex !== "" && this.form.age !== "" && this.form.country !== "" && this.form.zipCode !== "" && this.form.terms && this.form.privacy) {
        this.errorStepTwo = false;
        return true
      } else {
        this.errorStepTwo = true;
        return false
      }
    },
    /*
     * Create a new User in the DB
     */
    async createNewUser() {
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
      password: { required, minLength: minLength(8), checkPasswordComplexity }
    }
  }
}
</script>

<style scoped>

</style>
