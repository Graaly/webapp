<template>
  
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <h1 class="text-center">Inscrivez-vous<br />pour commencer l'aventure !</h1>
    
      <form @submit.prevent="submit()">
      
        <q-field :error="$v.form.email.$error">
          <q-input type="email" float-label="Votre email" v-model="form.email" @blur="$v.form.email.$touch" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.required">Veuillez saisir votre adresse email.</div>
            <div class="q-field-error" v-if="!$v.form.email.email">Veuillez saisir une adresse email valide.</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.name.$error">
          <q-input float-label="Votre nom" v-model="form.name" @blur="$v.form.name.$touch" />
          <div class="q-field-bottom" v-if="$v.form.name.$error">
            <div class="q-field-error" v-if="!$v.form.name.required">Veuillez saisir votre nom.</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.country.$error">
          <q-select float-label="Votre pays" v-model="form.country" :options="countries" @blur="$v.form.country.$touch" />
          <div class="q-field-bottom" v-if="$v.form.country.$error">
            <div class="q-field-error" v-if="!$v.form.country.required">Veuillez sélectionner votre pays.</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.zipCode.$error">
          <q-input float-label="Votre code postal" v-model="form.zipCode" />
          <div class="q-field-bottom" v-if="$v.form.zipCode.$error">
            <div class="q-field-error" v-if="!$v.form.zipCode.required">Veuillez entrer un code postal.</div>
          </div>
        </q-field>
      
        <q-field :error="$v.form.password.$error">
          <q-input type="password" v-model="form.password" float-label="Votre mot de passe"  @blur="$v.form.password.$touch" />
          <div class="q-field-bottom" v-if="$v.form.password.$error">
            <div class="q-field-error" v-if="!$v.form.password.required">Veuillez saisir votre mot de passe.</div>
          </div>
        </q-field>
      
        <q-btn color="primary" class="full-width">Commencer l'aventure</q-btn>
      </form>
    
      <div class="link-below-button">
        <router-link :to="{ path: '/user/login' }">Déjà inscrit ?</router-link>
      </div>
    </div>
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import { QSelect, Toast } from 'quasar'
import { required, email } from 'vuelidate/lib/validators'
export default {
  components: {
    QSelect,
    Toast
  },
  data () {
    return ({
      title: 'Inscription',
      form: {
        email: '',
        name: '',
        country: '',
        zipCode: '',
        password: ''
      },
      // TODO: retrieve real country list from server or .json file
      countries: [
        { label: 'Belgique', value: 'belgium' },
        { label: 'Espagne', value: 'spain' },
        { label: 'France', value: 'france' }
      ]
    })
  },
  mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
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
        
        if (creationStatus.status >= 300 && creationStatus.data && creationStatus.data.message) {
          Toast.create(creationStatus.data.message)
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
