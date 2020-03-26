<template>
  <div class="wrapper background-map">
    <div class="page-content">
      
      <!------------------ TITLE AREA ------------------------>
      
      <div class="centered q-pt-lg q-pb-md">
        <img src="statics/images/logo/logo-home.png" class="logo-top" />
      </div>
      
      <div class="q-pa-md">
        <div class="centered title2 q-mb-lg">{{ $t('label.Welcome') }}</div>
        
        <!------------------ FORM AREA ------------------------>
        <form @submit="formSubmit">
          
          <div>
            
            <q-input
              outlined
              type="email"
              :label="$t('label.YourEmail')"
              v-model="form.email"
              @blur="$v.form.email.$touch"
              :error="$v.form.email.$error"
              :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
              test-id="login"
              />
            
            <q-input 
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
              <p>{{ $t('label.EnterTheCodeYouReceivedByEmail') }}</p>
              <q-input outlined :label="$t('label.Code')" v-model="form.code" />
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
          
          <div class="text-center">
            <q-btn 
              type="submit"
              class="glossy large-btn"
              color="primary" 
              :label="$t('label.SignIn')"
              :loading="submitting" 
              @click="formSubmit" />
          </div>
          <div class="centered q-mt-sm q-mb-lg">
            <a @click="goToSubscribe()">{{ $t('label.Subscribe') }}</a>
          </div>
          
        </form>
        
        <!------------------ PLAY ANONYMOUS ------------------>
        
        <div class="q-py-md centered">
          <q-btn 
            class="glossy large-btn" 
            color="accent" 
            @click="validateTerms()"
            :label="$t('label.LetsPlay')"
            />
        </div>
        
        <!------------------ START PLAYING WITH QR CODE ------------------>
        
        <div v-if="isHybrid" class="q-py-md centered">
          <q-btn 
            class="glossy large-btn" 
            color="accent"
            @click="startScanQRCode()"
            :label="$t('label.ScanQRCodeToStartQuest')"
            />
        </div>
        
        <!--<p class="text-center text-h6 text-grey q-mt-md q-mb-md">
          {{ $t('label.orSignInWith') }}
        </p>-->
        
        <!------------------ SOCIAL LOGIN BUTTONS ------------------------>
        <!-- MPA 2019-12-10 not currently supported by new JWT-based auth
        <div class="q-pl-md q-pr-md">
          <q-btn v-if="showSocialLogin.facebook" @click="facebookLogin" class="full-width" color="facebook" icon="fab fa-facebook" label="Facebook" />
          <q-btn v-if="showSocialLogin.google" @click="googleLogin" class="full-width" color="google" icon="fab fa-google" label="Google" />
        </div>
        -->

        <div class="centered smaller version secondary-font">Version {{ version }}</div>
      
      </div>
    </div>
    
    <!------------------ Lost Password Dialog ------------------------>
    
    <q-dialog v-model="passwordForgottenPopup">
      <q-card>
        <q-card-section class="popup-header row items-center">
          {{ $t('label.ForgottenPassword') }}
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            outlined
            type="email"
            :label="$t('label.YourEmail')"
            v-model="form.email"
            @blur="$v.form.email.$touch"
            bottom-slots
            :error="$v.form.email.$error"
            :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
            />
          
          <q-btn 
            class="glossy full-width" 
            color="primary" 
            @click="sendForgottenPasswordCode()"
            :label="$t('label.Ok')"
            />
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!------------------ Validate terms ------------------------>
    
    <q-dialog v-model="terms.show">
      <div class="q-pa-md">
        <q-item dense>
          <q-item-section avatar>
            <q-checkbox dark v-model="terms.usage" />
          </q-item-section>
          <q-item-section>
            <span v-html="$t('label.IAgreeTheTermsAndConditions')" />
            <div class="q-field-bottom" v-if="terms.usageError">
              <div class="error">{{ $t('label.PleaseAgreeTheTermsAndConditions') }}</div>
            </div>
          </q-item-section>
        </q-item>

        <q-item dense>
          <q-item-section avatar>
            <q-checkbox dark v-model="terms.privacy" />
          </q-item-section>
          <q-item-section>
            <span v-html="$t('label.IAgreeThePrivacyPolicy')" />
            <div class="q-field-bottom" v-if="terms.privacyError">
              <div class="error">{{ $t('label.PleaseAgreeThePrivacyPolicy') }}</div>
            </div>
          </q-item-section>
        </q-item>
        
        <div class="centered q-pa-md">
          <q-btn color="primary" class="glossy large-button" @click="playAnonymous()"><span>{{ $t('label.Confirm') }}</span></q-btn>
        </div>
      </div>
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

export default {
  data() {
    return {
      step: 'password',
      form: {
        email: '',
        password: '',
        newPassword: '',
        code: ''
      },
      terms: {
        show: false,
        usage: false,
        usageError: false,
        privacy: false,
        privacyError: false
      },
      showSocialLogin: {
        facebook: false,
        google: false
      },
      passwordForgottenPopup: false,
      isHybrid: window.cordova,
      serverUrl: process.env.SERVER_URL,
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
    // social login buttons
    if (window.cordova) {
      this.showSocialLogin.facebook = true
    }
  },
  methods: {
    /*
     * Manage login
     */
    async formSubmit() {
console.log("submitting")
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
          if (result.status) {
            if (result.status === 'success') {
              window.localStorage.setItem('jwt', result.user.jwt)
              axios.defaults.headers.common['Authorization'] = `Bearer ${result.user.jwt}`
              
              let destination = '/home';
              if (this.$route.query.hasOwnProperty('redirect')) {
                destination = this.$route.query.redirect
              }
              this.$router.push(destination)
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
            
            if (changePasswordStatus.status && changePasswordStatus.status === 200) {
              if (changePasswordStatus.data && changePasswordStatus.data.user) {
                window.localStorage.setItem('jwt', changePasswordStatus.data.user.jwt)
                axios.defaults.headers.common['Authorization'] = `Bearer ${changePasswordStatus.data.user.jwt}`
                let destination = '/home';
                if (this.$route.query.hasOwnProperty('redirect')) {
                  destination = this.$route.query.redirect
                }
                this.$router.push(destination)
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
      
      if (result.status === 200) {
        return {status: 'success', user: result.data.user}
      } else if (result.status === 401) {
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
      
      if (validateAccountStatus.status >= 300 && validateAccountStatus.data && validateAccountStatus.data.message) {
        Notification(validateAccountStatus.data.message, 'warning')
      } else {
        Notification(this.$t('label.YourAccountIsNowValidated'), 'positive')
      }
    },
    
    /*
     * manage google login
     */
    googleLogin() {
      window.location = this.serverUrl + '/auth/google'
      localStorage.setItem('isLoggedIn', true)
    },
    fbLoginSuccess(userData) {
      var _this = this
      facebookConnectPlugin.getAccessToken(function(token) {
        AuthService.checkFacebookToken(userData.authResponse.userID, token, function(err, response) {
          if (err) {
            Notification(_this.$t('label.TechnicalIssue'), 'error')
          }
          if (response && (response.message === 'login successful' || (response.data && response.data.message === 'login successful'))) {
            return _this.$router.push('/home')
          } else {
            Notification(_this.$t('label.TechnicalIssue'), 'error')
          }
        });
      });
    },
    /*
     * manage facebook login
     */
    facebookLogin() {
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
    },
    /*
    * start the scanner for hybrid app
    */
    startScanQRCode() {
      var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              _this.checkCode(result.text)
            }
          },
          function (error) {
            console.log("Scanning failed: " + error)
          },
          {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: false, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: "", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        )
      }
    },
    async validateTerms() {
      this.terms.show = true
    },
    /*
    * start the game
    */
    async playAnonymous() {
      this.terms.usageError = false
      this.terms.privacyError = false
      if (this.terms.usage === false) {
        this.terms.usageError = true
      } else if (this.terms.privacy === false) {
        this.terms.privacyError = true
      } else {
        let checkStatus = await AuthService.playAnonymous(this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (checkStatus.data.user) {
            window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
            axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
            this.$router.push('/home')
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
      let checkStatus = await QuestService.checkLoginQRCode(code, this.$t('label.shortLang'))
      if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
        if (checkStatus.data.user) {
          window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
          axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
          if (code.indexOf('_score') === -1) {
            this.$router.push('/quest/play/' + code)
          } else {
            this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
          }
        } else {
          Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
        }
      } else {
        Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
      }
    },
    /*
     * open the subscribe page
     */
    async goToSubscribe() {
      this.$router.push('/user/createAccount/generic')
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
      
      if (codeSent.status === 200) {
        this.step = 'forgottenpassword'
        this.passwordForgottenPopup = false
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      
      this.submitting = false
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
