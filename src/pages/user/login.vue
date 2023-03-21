<template>
  <div class="background-login wrapper">
    <div class="login">
      <div class="page-content" style="padding-bottom: 100px" v-if="showPage">

        <!------------------ TITLE AREA ------------------------>
        <div class="centered">
          <img src="statics/new/logo-color-white.png" class="login-logo-top"/>
        </div>

        <div class="q-pa-lg login-form">

          <!------------------ FORM AREA ------------------------>
          <form @submit.prevent="formSubmit">
            <div>
              <!---- LOGIN ---->
              <q-input
                id="loginemail"
                outlined
                type="email"
                :label="$t('label.YourEmail')"
                v-model="form.email"
                ref="loginemail"
                @blur="$v.form.email.$touch"
                :error="$v.form.email.$error"
                :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
                test-id="login"
              />
              <!---- PASSWORD ---->
              <q-input
                id="loginPass"
                outlined
                type="password"
                v-model="form.password"
                :label="$t('label.YourPassword')"
                v-if="step !== 'forgottenpassword'"
                test-id="password"
              />
              <!------------------ FORGOTTEN PASS AREA ------------------------>
              <p class="centered q-mt-sm q-mb-lg" v-if="step !== 'forgottenpassword'">
                <a @click="openPasswordForgottenPopup()">{{ $t('label.ForgottenPassword') }}</a>
              </p>

              <div v-if="step === 'forgottenpassword'">
                <p class="code-square">{{ $t('label.EnterTheCodeYouReceivedByEmail') }}</p>
                <q-input class="q-pb-md" outlined :label="$t('label.Code')" v-model="form.code"/>
              </div>

              <div v-if="step === 'forgottenpassword'">
                <q-input
                  outlined
                  type="password"
                  v-model="form.newPassword"
                  :label="$t('label.YourNewPassword')"
                  @blur="$v.form.newPassword.$touch"
                  bottom-slots
                  :error="$v.form.newPassword.$error"
                  :error-message="!$v.form.newPassword.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.form.newPassword.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
                />
              </div>
            </div>
            <!---- BTN SUBMIT ---->
            <div class="text-center q-mb-lg q-mt-lg">
              <text-btn-square
                submit
                :loading="submitting"
                :title="$t('label.SignIn')"
                color="secondary"
                icon="face"
              />
            </div>
            <!---- BTN SUBSCRIBE ---->
            <div class="text-center q-mb-xl">
              <text-btn-square
                @click.native="goToSubscribe()"
                :title="$t('label.Subscribe')"
                color="primary"
                icon="add_circle"
              />
            </div>
          </form>

          <!------------------ START PLAYING WITH QR CODE ------------------>

          <div class="q-py-md text-center">
            <text-btn-square
              @click.native="startScanQRCode()"
              :title="$t('label.ScanA')"
              color="accent"
              icon="qr_code_2"
            />
          </div>

          <!------------------ PLAY ANONYMOUS ------------------>

          <div class="q-py-md text-center">
            <text-btn-square
              @click.native="validateTerms()"
              :title="$t('label.LetsPlayWithoutAccount')"
              color="accent"
              icon="no_accounts"
            />
          </div>

          <!------------------ TEAM PLAY ------------------>

          <div class="q-py-md text-center">
            <text-btn-square
              @click.native="teamPlayPopup = !teamPlayPopup"
              :title="$t('label.TeamPlay')"
              outlined
              color="accent"
              icon="supervised_user_circle"
            />
          </div>
        </div>

        <div class="centered text-white q-pt-lg">
          Version {{ version }} -
          <img :class="$i18n.locale === 'en' ? '' :'lang-opacity'" src="statics/icons/game/flag-en.png"
               @click="switchLanguage('en')"/> -
          <img :class="$i18n.locale === 'fr' ? '' :'lang-opacity'" src="statics/icons/game/flag-fr.png"
               @click="switchLanguage('fr')"/>
        </div>
      </div>
    </div>

    <!------------------ Lost Password Dialog ------------------------>

    <q-dialog v-model="passwordForgottenPopup">
      <q-card class="login-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.ForgottenPassword') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>

        </q-card-section>

        <q-separator/>

        <q-card-section>
          <q-input
            class="q-mb-md"
            outlined
            type="email"
            :label="$t('label.YourEmail')"
            v-model="form.email"
            @blur="$v.form.email.$touch"
            bottom-slots
            :error="$v.form.email.$error"
            :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
          />
          <text-btn-square
            class="q-mb-lg"
            @click.native="sendForgottenPasswordCode()"
            :title="$t('label.Ok')"
            color="primary"
            icon="forward_to_inbox"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!------------------ Validate terms ------------------------>

    <q-dialog v-model="terms.show">
      <q-card class="login-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.LetsPlayWithoutAccount') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
        </q-card-section>

        <q-card-section>
          <q-item dense>
            <q-item-section avatar>
              <q-checkbox dark color="accent" v-model="terms.usage"/>
            </q-item-section>
            <q-item-section>
              <span v-html="$t('label.IAgreeTheTermsAndConditions')"/>
              <div class="q-field-bottom" v-if="terms.usageError">
                <div class="error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
              </div>
            </q-item-section>
          </q-item>

          <q-item dense class="q-mb-lg">
            <q-item-section avatar>
              <q-checkbox dark color="accent" v-model="terms.privacy"/>
            </q-item-section>
            <q-item-section>
              <span v-html="$t('label.IAgreeThePrivacyPolicy')"/>
              <div class="q-field-bottom" v-if="terms.privacyError">
                <div class="error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
              </div>
            </q-item-section>
          </q-item>
          <text-btn-square
            class="q-mb-lg"
            @click.native="playAnonymous()"
            :title="$t('label.Confirm')"
            color="accent"
            icon="done"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!------------------ TeamPlay ------------------------>

    <q-dialog v-model="teamPlayPopup" style="max-width: 400px">
      <q-card class="login-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.JoinATeam') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
        </q-card-section>

        <q-card-section>
          {{ $t('label.TypeTeamPlayId') }}
          <q-input
            class="q-my-md"
            outlined
            type="email"
            :label="$t('label.TeamID')"
            v-model="teamPlayId"
            bottom-slots
          />
          <text-btn-square
            class="q-mb-lg"
            @click.native="playAnonymous()"
            :title="$t('label.Confirm')"
            color="accent"
            icon="done"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

import iconBtnSquare from "components/user/UI/iconBtnSquare"
import textBtnSquare from "components/user/UI/textBtnSquare"

export default {
  components: {
    iconBtnSquare,
    textBtnSquare
  },
  data() {
    return {
      step: 'password',
      form: {
        email: '',
        password: '',
        newPassword: '',
        code: ''
      },
      showPage: true,
      terms: {
        show: false,
        usage: false,
        usageError: false,
        privacy: false,
        privacyError: false
      },
      // showSocialLogin: {
      //   facebook: false,
      //   google: false
      // },
      passwordForgottenPopup: false,
      teamPlayPopup: false,
      //showNonHybridQRReader: false,
      teamPlayId: "",
      isHybrid: window.cordova,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      submitting: false,
      version: process.env.VERSION
    }
  },
  mounted () {
    utils.clearAllRunningProcesses()
    // check if user is redirected to this page to validate his account
    if (this.$route.query.email && this.$route.query.code) {
      this.validateAccount(this.$route.query.email, this.$route.query.code)
    }
    // check if user is redirected to this page to confirm team invitation
    if (this.$route.query.email && this.$route.query.invitation) {
      this.validateTeamInvitation(this.$route.query.email, this.$route.query.invitation)
    }
    // check if user is redirected to this page to start a game after anonymous signin
    if (this.$route.query.qrcode) {
      this.showPage = false
      this.checkCode(this.$route.query.qrcode)
    }
    // social login buttons
    if (window.cordova) {
      this.showSocialLogin.facebook = true
    }
    this.$nextTick(() => {
      this.$refs["loginemail"].focus()
    })
  },
  methods: {
    /*
     * Manage login
     */
    async formSubmit() {
      this.$v.$touch()
      this.submitting = true
      //if (!this.$v.form.$error) {
      switch (this.step) {
        /*case 'email':
          if (!this.$v.form.email.$error) {
            // check if the user email is existing
            var userExisting = await this.checkUserIsExisting(this.form.email)

            if (userExisting && userExisting.status) {
              if (userExisting.status === 'active') {
                // show password field
                this.step = 'password'
              } else if (userExisting.status === 'new') {
                // redirect to user creation page
                this.$router.push('/user/createAccount/' + this.form.email + '/validation')
              } else if (userExisting.status === 'blocked') {
                // the user account is blocked (too much password or validation code tries)
                Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
              } else {
                // redirect to user creation page
                this.$router.push('/user/createAccount/' + this.form.email + '/generic')
              }
            } else {
              Notification(this.$t('label.ErrorStandardMessage'), 'error')
            }
          }
          break*/
        case 'password':
          // sign in user
          let result = await this.signIn(this.form.email, this.form.password)
          if (result && result.status) {
            if (result.status === 'success') {
              window.localStorage.setItem('jwt', result.user.jwt)
              axios.defaults.headers.common['Authorization'] = `Bearer ${result.user.jwt}`

              this.$router.push(this.defineRedirection())
            }

            if (result.status === 'failed') {
              Notification(this.$t('label.IncorrectLoginPleaseRetry'), 'warning')
            }
          } else {
            Notification(this.$t('label.ErrorStandardMessage'), 'error')
          }
          break
        case 'forgottenpassword':
          if (!this.$v.form.newPassword.$error) {
            // check validation code
            let changePasswordStatus = await AuthService.changePassword(this.form.email, this.form.newPassword, this.form.code)

            if (changePasswordStatus && changePasswordStatus.status && changePasswordStatus.status === 200) {
              if (changePasswordStatus.data && changePasswordStatus.data.user) {
                window.localStorage.setItem('jwt', changePasswordStatus.data.user.jwt)
                axios.defaults.headers.common['Authorization'] = `Bearer ${changePasswordStatus.data.user.jwt}`
                this.$router.push(this.defineRedirection())
              } else {
                Notification(this.$t('label.ErrorStandardMessage'), 'error')
              }
            } else if (changePasswordStatus.data && changePasswordStatus.data.message === "You have tries too much codes") {
              Notification(this.$t('label.YourAccountIsBlocked'), 'warning')
            } else {
              Notification(this.$t('label.IncorrectCodePleaseRetry'), 'warning')
            }
          }
          break
      }
      this.submitting = false
    },

    /*
     * sign in user
     * @param   {string}    email            user email
     * @param   {string}    password         user password
     */
    async signIn(email, password) {
      let result = await AuthService.login(email, password)

      if (result && result.status === 200) {
        return {status: 'success', user: result.data.user}
      } else if (result && result.status === 401) {
        return {status: 'failed', error: 'incorrect login'}
      } else {
        return {error: 'technical issue'}
      }
    },

    /*
     * validate an account with the link provided in the welcome email
     * @param   {string}    email            user email
     * @param   {string}    code             validation code
     */
    async validateAccount(email, code) {
      let validateAccountStatus = await AuthService.validateAccount(email, code)

      if (validateAccountStatus && validateAccountStatus.status >= 300 && validateAccountStatus.data && validateAccountStatus.data.message) {
        Notification(validateAccountStatus.data.message, 'warning')
      } else {
        Notification(this.$t('label.YourAccountIsNowValidated'), 'positive')
      }
    },

    /*
     * manage google login
     */
    /*googleLogin() {
      window.location = this.serverUrl + '/auth/google'
      localStorage.setItem('isLoggedIn', true)
    },*/
    /*fbLoginSuccess(userData) {
      var _this = this
      facebookConnectPlugin.getAccessToken(function(token) {
        AuthService.checkFacebookToken(userData.authResponse.userID, token, function(err, response) {
          if (err) {
            Notification(_this.$t('label.TechnicalIssue'), 'error')
          }
          if (response && (response.message === 'login successful' || (response.data && response.data.message === 'login successful'))) {
            this.$router.push(this.defineRedirection())
          } else {
            Notification(_this.$t('label.TechnicalIssue'), 'error')
          }
        });
      });
    },*/
    defineRedirection() {
      let destination = '/home';
      if (this.$route && this.$route.query && this.$route.query.hasOwnProperty('redirect') && this.$route.query.redirect) {
        destination = this.$route.query.redirect
      }
      return destination
    },
    /*
     * manage facebook login
     */
    /*facebookLogin() {
      var _this = this
      // check if hybrid app and if cordova plugin is installed
      if (window.cordova && facebookConnectPlugin) {
        facebookConnectPlugin.login(["public_profile"], this.fbLoginSuccess,
          function loginError (err) {
            console.log(err)
            Notification(_this.$t('label.TechnicalIssue'), 'error')
          }
        )
      } else {
        window.location = this.serverUrl + '/auth/facebook'
        localStorage.setItem('isLoggedIn', true)
      }
    },*/
    /*
    * start the scanner for hybrid app
    */
    startScanQRCode() {
      this.$router.push({ name: 'scanCode', params: { login: 'true' } })
    },
    /*closeQRCodeReader () {
      this.showNonHybridQRReader = false
    },*/
    async validateTerms() {
      this.terms.show = true
    },
    /*
    * start the game
    */
    async playAnonymous(force, noRedirect) {
      this.terms.usageError = false
      this.terms.privacyError = false
      if (this.terms.usage === false && !force) {
        this.terms.usageError = true
      } else if (this.terms.privacy === false && !force) {
        this.terms.privacyError = true
      } else {
        let checkStatus = await AuthService.playAnonymous(this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (checkStatus.data.user) {
            window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
            axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
            if (!noRedirect) {
              this.$router.push(this.defineRedirection())
            }
          } else {
            Notification(this.$t('label.ErrorStandardMessage'), 'error')
          }
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Check if the quest code is valid
     * @param   {String}  code            QR Code value
     */

    async checkCode(code) {
      // if code is 3 digits => this is a game QR code, not to be flashed here
      if (code.length == 3) {
        return
      }
      this.playAnonymous(true, true)
      // treat teamplay
      if (code.indexOf('teamplay_') !== -1) {
        let teamPlayCode = code.replace('teamplay_', '')
        if (teamPlayCode.indexOf('_') === -1) {
          this.$router.push({path: '/teamplay/' + teamPlayCode + '/' + this.$t('label.shortLang'), query: {redirect: '/user/login'}})
        } else {
          let teamPlayCodeParts = teamPlayCode.split('_')
          this.$router.push({path: '/teamplay/' + teamPlayCodeParts[0] + '/' + this.$t('label.shortLang') + '/individual-firstandlast-checklastname/' + teamPlayCodeParts[1], query: {redirect: '/user/login'}})
        }
      } else {
        code = utils.removeUnusedUrl(code)
        // From login page
        let checkStatus = await QuestService.checkLoginQRCode(code, this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (checkStatus.data.user) {
            window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
            axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
            if (code.indexOf('_score') === -1) {
              if (code.indexOf('-slash-') === -1 && code.indexOf('tierplay_') === -1) {
                if (checkStatus.data.questId) {
                  this.$router.push('/quest/play/' + checkStatus.data.questId)
                } else {
                  this.$router.push('/quest/play/' + code)
                }
              } else {
                this.$q.dialog({
                  message: this.$t('label.UniqueUsageQRCodeWarning'),
                  ok: this.$t('label.Ok')
                }).onOk(data => {        
                  if (checkStatus.data.questId) {
                    this.$router.push('/quest/play/' + checkStatus.data.questId)
                  } else {
                    this.$router.push('/quest/play/' + code)
                  }
                })
              }
            } else {
              this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
            }
          } else {
            if (code.indexOf('-slash-') === -1 && code.indexOf('tierplay_') === -1) {
              Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
            } else {
              Notification(this.$t('label.QRCodeAlreadyUsed'), 'error')
            }
          }
        } else {
          if (code.indexOf('-slash-') === -1 && code.indexOf('tierplay_') === -1) {
            Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
          } else {
            Notification(this.$t('label.QRCodeAlreadyUsed'), 'error')
          }
        }
      }
    },
    /*
     * open the subscribe page
     */
    async goToSubscribe() {
      this.$router.push({path: '/user/createAccount/generic', query: {redirect: this.$route.query.redirect}})
    },
    /*
     * open the forgotten password popup
     */
    async openPasswordForgottenPopup() {
      this.passwordForgottenPopup = true
    },
    /*
     * send the forgotten password code
     */
    async sendForgottenPasswordCode() {
      this.submitting = true

      let codeSent = await AuthService.sendForgottenPasswordCode(this.form.email)

      if (codeSent && codeSent.status === 200) {
        this.step = 'forgottenpassword'
        this.passwordForgottenPopup = false
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }

      this.submitting = false
    },
    switchLanguage(lang) {
      this.$i18n.locale = lang
    },
    teamPlay(data) {
      this.$router.push({path: '/teamplay/' + data + '/' + this.$t('label.shortLang'), query: {redirect: '/user/login'}})
    }
  },
  validations: {
    form: {
      email: { required, email },
      newPassword: { required, minLength: minLength(8), checkPasswordComplexity }
    }
  }
}
</script>

<style scoped lang="scss">
.login{
  max-width: 800px;
  margin: 0 auto;
}
.login-logo-top{
  width: 25vh;
  margin-top: 10vh;
}
.login-form{
  max-width: 400px;
  margin: 0 auto;
  .code-square{
    color: white;
    font-size: 14px;
    text-align: center;
    padding: 8px 12px;
    background: #D60B52;
  }
}
.background-login {
  background-image: url('../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.login-dialog-card{
  width: 90vw;
  max-width: 400px;
  background: linear-gradient(180deg, rgb(7,39,90), rgb(4,20,45));
}
.lang-opacity{
  opacity: 0.5;
}
.camera-title{
  background: linear-gradient(180deg, rgb(7,39,90), rgb(4,20,45));
}
</style>
