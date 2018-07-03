<template>
  
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle">
      
      <!------------------ TITLE AREA ------------------------>
      
      <h1 class="text-center size-3 q-mt-xl q-mb-lg">{{ $t('label.letsGo') }}</h1>
    
      <!------------------ EMAIL AREA ------------------------>
      
      <form @submit.prevent="login()">
        
        <q-field :error="$v.form.email.$error" v-if="userStatus === 'undefined'" class="q-pa-lg">
          <q-input type="email" dark color="tertiary" :float-label="$t('label.YourEmail')" v-model="form.email" @blur="$v.form.email.$touch" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.required">{{ $t('message.PleaseEnterYourEmailAddress') }}</div>
            <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('message.PleaseEnterAValidEmailAddress') }}</div>
          </div>
        </q-field>
        
        <q-field :error="$v.form.password.$error" v-if="userStatus === 'registred'">
          <q-input type="password" dark color="tertiary" v-model="form.password" :float-label="$t('message.YourPassword')"  @blur="$v.form.password.$touch" />
          <div class="q-field-bottom" v-if="$v.form.password.$error">
            <div class="q-field-error" v-if="!$v.form.password.required">{{ $t('message.PleaseEnterYourPassword') }}</div>
          </div>
        </q-field>
        <div v-if="userStatus === 'registred'">
          <router-link :to="{ path: '/user/forgottenPassword' }">{{ $t('message.ForgottenPassword') }}</router-link>
        </div>
        
        <p class="text-center margin-size-3 q-mt-lg q-mb-xl">
          <q-btn round color="tertiary" text-color="primary" icon="arrow_forward_ios" type="submit" />
        </p>
      </form>
      
      <!------------------ SOCIAL LOGIN BUTTONS ------------------------>
      
      <p class="text-center margin-size-3 q-mt-xl q-mb-lg">
        {{ $t('label.orSignInWith') }}
      </p>
      
      <div>
        <q-btn @click="facebookLogin" class="full-width" color="facebook" icon="fab fa-facebook" label="Facebook" />
        <q-btn @click="googleLogin" class="full-width" color="google" icon="fab fa-google" label="Google" />
      </div>
    
      <!------------------ TO REMOVE ------------------------>
      <div class="link-below-button">
        <router-link :to="{ path: '/user/createAccount' }">{{ $t('message.CreateAnAccount') }}</router-link>
      </div>
    </div>
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import { required, email } from 'vuelidate/lib/validators'

export default {
  data() {
    return {
      userStatus: 'undefined',
      form: {
        email: '',
        password: ''
      },
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted () {
     
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
    async login() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
        if (this.userStatus === 'undefined') {
          let userExisting = await this.checkUserIsExisting(this.form.email)
        }
      
      
        this.$store.dispatch("login", {
          email: this.form.email,
          password: this.form.password
        }).then((result) => {
          if (result.status === 401) {
            this.$q.notify(this.$t('message.IncorrectLoginPleaseRetry'))
          } else {
            let destination = '/home';
            if (this.$route.query.hasOwnProperty('redirect')) {
              destination = this.$route.query.redirect
            }
            this.$router.push(destination)
          }
        }).catch((err) => {
          this.$q.notify(this.$t('message.ErrorStandardMessage') + err)
        });
      }
    },
    async checkUserIsExisting(email) {
      let userStatus = await AuthService.checkEmail(email)
      
      console.log(userStatus)
      /*if (userStatus && userStatus.data) {
        
      } else {
      
      
      }*/
    },
    async validateAccount(email, code) {
      let validateAccountStatus = await AuthService.validateAccount(email, code)
      
      if (validateAccountStatus.status >= 300 && validateAccountStatus.data && validateAccountStatus.data.message) {
        this.$q.notify(validateAccountStatus.data.message)
      } else {
        this.$q.notify({type: 'positive', message: this.$t('message.YourAccountIsNowValidated')})
      }
    },
    async validateTeamInvitation(email, code) {
      let validateTeamInvitationStatus = await AuthService.validateTeamInvitation(email, code)
      
      if (validateTeamInvitationStatus.status >= 300 && validateTeamInvitationStatus.data && validateTeamInvitationStatus.data.message) {
        this.$q.notify(validateTeamInvitationStatus.data.message)
      } else {
        this.$q.notify({type: 'positive', message: this.$t('message.YourHaveJoinedTheNewTeam')})
      }
    },
    alert(msg) {
      this.$q.notify(msg)
    },
    googleLogin() {
      window.location = this.serverUrl + '/auth/google'
      localStorage.setItem('isLoggedIn', true)
    },
    facebookLogin() {
      window.location = this.serverUrl + '/auth/facebook'
      localStorage.setItem('isLoggedIn', true)
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    }
  }
}
</script>

<style scoped>
form { margin-top: 1rem; }
.q-btn { margin: 0.3rem 0; }
</style>
