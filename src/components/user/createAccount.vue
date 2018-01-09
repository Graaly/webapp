<template>
  
  <div>
    <h1>Inscrivez-vous pour commencer l'aventure !</h1>
    
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
      
      <q-field>
        <q-input float-label="Votre code postal" v-model="form.zipCode" />
      </q-field>
      
      <q-field :error="$v.form.password.$error">
        <q-input type="password" v-model="form.password" float-label="Votre mot de passe"  @blur="$v.form.password.$touch" />
        <div class="q-field-bottom" v-if="$v.form.password.$error">
          <div class="q-field-error" v-if="!$v.form.password.required">Veuillez saisir votre mot de passe.</div>
        </div>
      </q-field>
      
      <q-btn color="primary" class="full-width">Commencer l'aventure</q-btn>
    </form>
    
  </div>
  
</template>

<script>
import { QSelect } from 'quasar'
import { required, email } from 'vuelidate/lib/validators'
export default {
  components: {
    QSelect
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
        { label: 'Belgique', value: 'BEL' },
        { label: 'Espagne', value: 'ESP' },
        { label: 'France', value: 'FRA' }
      ]
    })
  },
  mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
  },
  methods: {
    submit() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
        alert('form validated, try to create account');
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
      }
    }
  },
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      password: { required }
    }
  }
}
</script>

<style>
</style>
