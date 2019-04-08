<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle">
      
      <!------------------ TITLE AREA ------------------------>
      
      <h1 class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.letsGo') }}</h1>
    
      <!------------------ FORM AREA ------------------------>
      
      <form @submit.prevent="formSubmit()">
        
        <div class="q-pa-lg">
          
          <q-input
            v-if="step === 'email'"
            type="email"
            dark
            color="white"
            :label="$t('label.YourEmail')"
            v-model="form.email"
            @blur="$v.form.email.$touch"
            bottom-slots
            :error="$v.form.email.$error"
            :error-message="!$v.form.email.email ? $t('label.PleaseEnterAValidEmailAddress') : $t('label.PleaseEnterYourEmailAddress')"
            test-id="login"
            />
            
          <q-input v-if="step === 'password'" type="password" dark color="white" v-model="form.password" :label="$t('label.YourPassword')" test-id="password" />
          
          <!------------------ FORGOTTEN PASS AREA ------------------------>
          
          <p class="text-right q-mt-md q-mb-md" v-if="step === 'password'">
            <a @click="sendForgottenPasswordCode()">{{ $t('label.ForgottenPassword') }}</a>
          </p>
          
          <div v-if="step === 'forgottenpassword'">
            <p>{{ $t('label.EnterTheCodeYouReceivedByEmail') }}</p>
            <q-input :label="$t('label.Code')" v-model="form.code" />
          </div>
          
          <div v-if="step === 'forgottenpassword'">
            <q-input
              type="password"
              dark color="white"
              v-model="form.newPassword"
              :label="$t('label.YourNewPassword')"
              @blur="$v.form.newPassword.$touch"
              bottom-slots
              :error="$v.form.newPassword.$error"
              :error-message="!$v.form.newPassword.checkPasswordComplexity ? $t('label.PasswordComplexityRule') : (!$v.form.newPassword.minLength ? $t('label.YourPasswordMustBe8digitsLength') : $t('label.PleaseEnterYourPassword'))"
              />
          </div>
        </div>
        
        <p class="text-center multiple-btn margin-size-3 q-mt-lg q-mb-xl">
          <q-btn v-if="step !== 'email'" round color="white" text-color="primary" icon="fas fa-chevron-left" :loading="submitting" @click="backAction()" />
          <q-btn round color="white" text-color="primary" icon="fas fa-chevron-right" :loading="submitting" type="submit" />
        </p>
        
      </form>
      
      <!------------------ SOCIAL LOGIN BUTTONS ------------------------>
      
      <p class="text-center margin-size-3 q-mt-xl q-mb-lg">
        {{ $t('label.orSignInWith') }}
      </p>
        
      <div class="q-pl-md q-pr-md">
        <q-btn @click="facebookLogin" class="full-width" color="facebook" icon="fab fa-facebook" label="Facebook" />
        <!--<q-btn @click="googleLogin" class="full-width" color="google" icon="fab fa-google" label="Google" />-->
      </div>
    
    </div>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import { required, minLength, email } from 'vuelidate/lib/validators'
import checkPasswordComplexity from 'boot/PasswordComplexity'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

export default {
  data() {
    return {
      step: 'email',
      form: {
        email: '',
        password: '',
        newPassword: '',
        code: ''
      },
      serverUrl: process.env.SERVER_URL,
      submitting: false
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
  },
  methods: {
    /*
     * Manage login
     */
    async formSubmit() {
      this.submitting = true
      //if (!this.$v.form.$error) {
      switch (this.step) {
        case 'email':
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
          break
        case 'password':
          // sign in user
          var userSignedIn = await this.signIn(this.form.email, this.form.password)
          if (userSignedIn.status) {
            if (userSignedIn.status === 'success') {
              let destination = '/home';
              if (this.$route.query.hasOwnProperty('redirect')) {
                destination = this.$route.query.redirect
              }
              this.$router.push(destination)
            }
            
            if (userSignedIn.status === 'failed') {
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
              let destination = '/home';
              if (this.$route.query.hasOwnProperty('redirect')) {
                destination = this.$route.query.redirect
              }
              this.$router.push(destination)
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
     * Manage back button actions
     */
    async backAction() {
      switch (this.step) {
        case 'password':
          this.step = 'email'
          break
        case 'forgottenpassword':
          this.step = 'password'
          break
      }
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
     * sign in user
     * @param   {string}    email            user email
     * @param   {string}    password         user password
     */
    async signIn(email, password) {
      let result = await AuthService.login(email, password)
      
      if (result.status === 200) {
        return {status: 'success'}
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
            return _this.$router.push('/map')
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
      // check if hybrid app and if cordova plugin is installed
      if (window.cordova && facebookConnectPlugin) {
        facebookConnectPlugin.login(["public_profile"], this.fbLoginSuccess,
          function loginError () {
            Notification(this.$t('label.TechnicalIssue'), 'error')
          }
        )
      } else {
        window.location = this.serverUrl + '/auth/facebook'
        localStorage.setItem('isLoggedIn', true)
      }
    },
    
    /*
     * send the forgotten password code
     */
    async sendForgottenPasswordCode() {
      this.submitting = true
      
      let codeSent = await AuthService.sendForgottenPasswordCode(this.form.email)
      
      if (codeSent.status === 200) {
        this.step = 'forgottenpassword'
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
