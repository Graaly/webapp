<template>
  
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      
      <h1 class="text-center">{{ $t('message.SignIn') }}<br/>{{ $t('message.toStartTheAdventure') }}</h1>
    
      <!--    
      <div>
        <q-btn @click="facebookLogin" class="full-width" color="facebook" icon="fab fa-facebook">Facebook</q-btn>
        <q-btn @click="googleLogin" class="full-width" color="google" icon="fab fa-google">Google</q-btn>
      </div>
      -->
    
      <form @submit.prevent="login()">
        
        <!--
        <p>{{ $t('message.orSignInWithYourGraalyAccount') }} :</p>
        -->
        
        <q-field :error="$v.form.email.$error">
          <q-input type="email" :float-label="$t('message.YourEmail')" v-model="form.email" @blur="$v.form.email.$touch" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.required">{{ $t('message.PleaseEnterYourEmailAddress') }}</div>
            <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('message.PleaseEnterAValidEmailAddress') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.password.$error">
          <q-input type="password" v-model="form.password" :float-label="$t('message.YourPassword')"  @blur="$v.form.password.$touch" />
          <div class="q-field-bottom" v-if="$v.form.password.$error">
            <div class="q-field-error" v-if="!$v.form.password.required">{{ $t('message.PleaseEnterYourPassword') }}</div>
          </div>
        </q-field>
      
        <q-btn type="submit" color="primary" class="full-width">{{ $t('message.StartTheAventure') }}</q-btn>
      </form>
    
      <div class="link-below-button">
        <router-link :to="{ path: '/user/createAccount' }">{{ $t('message.CreateAnAccount') }}</router-link>
      </div>
      <div class="link-below-button">
        <router-link :to="{ path: '/user/forgottenPassword' }">{{ $t('message.ForgottenPassword') }}</router-link>
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
      form: {
        email: '',
        password: ''
      },
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('message.Connection'));
     
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
    login() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
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
