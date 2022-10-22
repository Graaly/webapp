<template>
  <div></div>
</template>

<script>
import axios from 'axios'
import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  components: {
    QrcodeStream
  },
  data() {
    return {
      step: 'password',
      imagePath: 'https://graaly.com/games/europequest/', 
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
      showNonHybridQRReader: false,
      isHybrid: window.cordova,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      submitting: false,
      version: process.env.VERSION,

      questId: ''
    }
  },
  mounted () {
    utils.clearAllRunningProcesses()
    /*// check if user is redirected to this page to validate his account
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
    }*/
    this.playAnonymousSpecific();
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
      } else {
        this.showNonHybridQRReader = true
      }
    },
    closeQRCodeReader () {
      this.showNonHybridQRReader = false
    },
    async validateTerms() {
      this.terms.show = true
    },
    /*
    * start the game
    */
    async playAnonymousSpecific() {
      /*this.terms.usageError = false
      this.terms.privacyError = false
      if (this.terms.usage === false) {
        this.terms.usageError = true
      } else if (this.terms.privacy === false) {
        this.terms.privacyError = true
      } else {*/
        let checkStatus = await AuthService.playAnonymous(this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (checkStatus.data.user) {
            window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
            axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
            this.$router.push('/quest/play/633d88f560f7913b1661fbe1')
          }
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      //}
    },
    /*
     * Check if the quest code is valid
     * @param   {String}  code            QR Code value
     */
    async checkCode(code) {
      code = utils.removeUnusedUrl(code)
      let checkStatus = await QuestService.checkLoginQRCode(code, this.$t('label.shortLang'))
      if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
        if (checkStatus.data.user) {
          window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
          axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
          if (code.indexOf('_score') === -1) {
            if (checkStatus.data.questId) {
              this.$router.push('/quest/play/' + checkStatus.data.questId)
            } else {
              this.$router.push('/quest/play/' + code)
            }
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
    },
    switchLanguage(lang) {
      this.$i18n.locale = lang
    },
    chooseLanguage(lang) {
      if (lang == 'en') {
        this.questId = '61f178fb16bdb825f1e99cb7'
      }
      if (lang == 'fr') {
        //this.questId = '615dbcffa3872257f0dd40b4'//DEV
        this.questId = '61767ce84a4f2c2276fed543'//PROD
      }
      this.switchLanguage(lang)
      //this.validateTerms()
      this.playAnonymousSpecific()
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

<style scoped>
  .bg-accent {
    background-color: #52b4d3 !important;
  }
  .glossy {
    font-weight: bold;
  }
  .background-coe {
    background: #183a86;
  }
</style>
