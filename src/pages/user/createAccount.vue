<template>
  
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <h1 class="text-center">{{ $t('message.Subscribe') }}<br />{{ $t('message.toStartTheAdventure') }}</h1>
    
      <form @submit.prevent="submit()">
      
        <q-field :error="$v.form.email.$error">
          <q-input type="email" :float-label="$t('message.YourEmail')" v-model="form.email" @blur="$v.form.email.$touch" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.required">{{ $t('message.PleaseEnterYourEmailAddress') }}</div>
            <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('message.PleaseEnterAValidEmailAddress') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.name.$error">
          <q-input :float-label="$t('message.YourName')" v-model="form.name" @blur="$v.form.name.$touch" />
          <div class="q-field-bottom" v-if="$v.form.name.$error">
            <div class="q-field-error" v-if="!$v.form.name.required">{{ $t('message.PleaseEnterYourName') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.country.$error">
          <q-select :float-label="$t('message.YourCountry')" v-model="form.country" :options="countries" @blur="$v.form.country.$touch" />
          <div class="q-field-bottom" v-if="$v.form.country.$error">
            <div class="q-field-error" v-if="!$v.form.country.required">{{ $t('message.PleaseSelectYourCountry') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.zipCode.$error">
          <q-input :float-label="$t('message.YourZipCode')" v-model="form.zipCode" />
          <div class="q-field-bottom" v-if="$v.form.zipCode.$error">
            <div class="q-field-error" v-if="!$v.form.zipCode.required">{{ $t('message.PleaseEnterYourZipCode') }}</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.password.$error">
          <q-input type="password" v-model="form.password" :float-label="$t('message.YourPassword')"  @blur="$v.form.password.$touch" />
          <div class="q-field-bottom" v-if="$v.form.password.$error">
            <div class="q-field-error" v-if="!$v.form.password.required">{{ $t('message.PleaseEnterYourPassword') }}</div>
          </div>
        </q-field>
      
        <q-btn color="primary" class="full-width">{{ $t('message.StartTheAventure') }}</q-btn>
      </form>
    
      <div class="link-below-button">
        <router-link :to="{ path: '/user/login' }">{{ $t('message.YouHaveAnAccount') }}</router-link>
      </div>
    </div>
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import { required, email } from 'vuelidate/lib/validators'
export default {
  data () {
    return ({
      form: {
        email: '',
        name: '',
        country: '',
        zipCode: '',
        password: ''
      },
      // TODO: retrieve real country list from server or .json file
      countries: [
        { label: this.$t('Belgium'), value: 'belgium' },
        { label: this.$t('Spain'), value: 'spain' },
        { label: this.$t('France'), value: 'france' }
      ]
    })
  },
  mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$t('SignIn'));
  },
  methods: {
    async submit() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let newAccount = {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          zipcode: this.form.zipCode,
          country: this.form.country,
          language: "fr"
        }
        let creationStatus = await AuthService.createAccount(newAccount)
        
        if (creationStatus.data && creationStatus.data.message) {
          this.$q.notify({type: 'info', message: creationStatus.data.message})
        }
      }
    }
  },
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      zipCode: { required },
      password: { required }
    }
  }
}
</script>

<style>
</style>
