<template>
  
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <h1 class="text-center">Connectez-vous<br/>pour commencer l'aventure !</h1>
    
      <div>
        <q-btn @click="alert('TODO: Connect with Facebook')" class="full-width" color="facebook" icon="fa-facebook-official">Facebook</q-btn>
        <q-btn @click="alert('TODO: Connect with Google')" class="full-width" color="google" icon="fa-google">Google</q-btn>
      </div>
    
      <form @submit.prevent="login()">
      
        <p>Ou connectez-vous avec votre compte Graaly :</p>
      
        <q-field :error="$v.form.email.$error">
          <q-input type="email" float-label="Votre email" v-model="form.email" @blur="$v.form.email.$touch" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.required">Veuillez saisir votre adresse email.</div>
            <div class="q-field-error" v-if="!$v.form.email.email">Veuillez saisir une adresse email valide.</div>
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
        <router-link :to="{ path: '/user/createAccount' }">Créer un compte</router-link>
      </div>
      <div class="link-below-button">
        <router-link :to="{ path: '/user/forgottenPassword' }">Mot de passe oublié ?</router-link>
      </div>
    </div>
  </div>
  
</template>

<script>
import { Toast } from 'quasar'
import { required, email } from 'vuelidate/lib/validators'
export default {
  components: {
    Toast
  },
  data() {
    return {
      title: 'Connexion',
      form: {
        email: '',
        password: ''
      }
    }
  },
  mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
  },
  methods: {
    login() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
        this.$store.dispatch("login", {
          email: this.form.email,
          password: this.form.password
        }).then(() => {
          let destination = '/home';
          if (this.$route.query.hasOwnProperty('redirect')) {
            destination = this.$route.query.redirect
          }
          this.$router.push(destination)
        }).catch((err) => {
          if (err.hasOwnProperty('response') && err.response.status === 401) {
            Toast.create('Indentifiants incorrects, veuillez réessayer')
          } else {
            Toast.create('Une erreur est survenue, veuillez contacter le support')
            console.log(err)
          }
        });
      }
    },
    alert(msg) {
      Toast.create(msg)
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
