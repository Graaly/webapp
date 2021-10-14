<template>
  <div class="wrapper background-map">
    <div class="page-content" style="padding-bottom: 100px">

      <!------------------ TITLE AREA ------------------------>

      <div class="centered q-pt-lg q-pb-md">
        <img src="statics/images/logo/logo-home.png" class="logo-top" style="width: 30%; max-width: 200px; margin-bottom: 0px; margin-top: 20px;" />
      </div>

      <div class="q-pa-md">
        <div class="centered title2 q-mb-lg">{{ $t('label.Welcome') }}</div>

        <!------------------ FORM AREA ------------------------>
        <form @submit.prevent="formSubmit">

          <div>

            <q-input
              outlined
              :label="$t('label.TeamID')"
              v-if="!this.$route.params.teamId || this.$route.params.teamId === 'none'"
              v-model="form.teamId"
              @blur="$v.form.teamId.$touch"
              :error="$v.form.teamId.$error"
              :error-message="$t('label.PleaseFillThisForm')"
              />

            <q-input
              outlined
              :label="$t('label.TeamName')"
              v-if="options.indexOf('individual') === -1"
              v-model="form.teamName"
              @blur="$v.form.teamName.$touch"
              :error="$v.form.teamName.$error"
              :error-message="$t('label.PleaseFillThisForm')"
              />

            <q-input
              outlined
              :label="$t('label.YourFullName')"
              v-model="form.name"
              @blur="$v.form.name.$touch"
              :error="$v.form.name.$error"
              :error-message="$t('label.PleaseFillThisForm')"
              />
          </div>
          <div class="text-center">
            <q-btn
              type="submit"
              class="glossy large-btn"
              color="primary"
              :label="$t('label.Start')"
              :loading="submitting"
              />
          </div>

        </form>

        <div class="centered smaller version secondary-font">Version {{ version }}</div>
        <div class="centered smaller version secondary-font">
          Version {{ version }} -
          <img src="statics/icons/game/flag-en.png" @click="switchLanguage('en')" /> -
          <img src="statics/icons/game/flag-fr.png" @click="switchLanguage('fr')" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import RunService from 'services/RunService'
import { required } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

export default {
  data() {
    return {
      questId: this.$route.params.id,
      lang: this.$route.params.lang,
      option: this.$route.params.option ? this.$route.params.option : 'none',
      options: [],
      form: {
        teamId: '',
        teamName: '',
        name: ''
      },
      isHybrid: window.cordova,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      submitting: false,
      version: process.env.VERSION
    }
  },
  mounted () {
    // if user is connected, redirect to the quest - Only for anonymous users
    if (this.$store && this.$store.state && this.$store.state.user && this.$store.state.user.name && this.$store.state.user.name === '-') {
      this.$router.push('/quest/play/' + this.questId)
    }
    this.options = this.option.split("-")
    if (this.options.indexOf('individual') !== -1) {
      this.form.teamName = utils.randomId()
    }
    if (this.$route.params.teamId && this.$route.params.teamId !== 'none') {
      this.form.teamId = this.$route.params.teamId
    }
    this.switchLanguage(this.lang)
  },
  methods: {
    /*
     * Manage login
     */
    async formSubmit() {
      this.$v.$touch()
      this.submitting = true

      // check last name
      if (this.options.indexOf('checklastname') !== -1) {
        let nameParts = this.form.name.split(" ")
        if (nameParts.length < 2) {
          Notification(this.$t('label.PleaseEnterFirstNameAndLastName'), 'error')
          this.submitting = false
          return false
        }
      }

      // create account
      let checkStatus = await AuthService.playAnonymous(this.$t('label.shortLang'))
      if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
        if (checkStatus.data.user) {
          window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
          axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
          // Init runID
          const run = await RunService.initTeamPlay(this.questId, this.lang, this.form.teamId, this.form.teamName, this.form.name)

          if (run && run.data) {
            if (run.data.message) {
              Notification(this.$t('label.' + run.data.message), 'error')
              this.submitting = false
            } else {
              // launch game
              //this.$router.push('/quest/play/' + this.questId + '/version/' + run.data.version + '/step/0/undefined?remoteplay=false')
              this.$router.push('/quest/play/' + this.questId + '/version/' + run.data.version + '/step/0/' + this.lang + '?remoteplay=false')
            }
          }
          /* get quest version
          const quest = await QuestService.getById(this.questId, '999', this.lang)
          let version = 1
          if (quest && quest.data) {
            version = quest.data.version
          }

          // Init runID
          await RunService.init(this.questId, version, this.lang, 'true', this.form.teamId + "|" + this.form.teamName + "|" + this.form.name)
          */
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
          this.submitting = false
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
        this.submitting = false
      }
    },
    switchLanguage(lang) {
      this.$i18n.locale = lang
    }
  },
  validations: {
    form: {
      teamId: { required },
      teamName: { required },
      name: { required }
    }
  }
}
</script>
