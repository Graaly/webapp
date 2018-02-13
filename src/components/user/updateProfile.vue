<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="centered">
        <a class="big-avatar">
          <div v-if="form.picture" :style="'background-image: url(https://localhost:3000/upload/profile/' + form.picture + ');'"></div>
          <div v-if="!form.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
          <label for="picturefile">Modifier</label>
          <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
        </a>
      </div>
      <form @submit.prevent="submit()">
        <q-field icon="account circle" label="Modifier tes informations" class="padding-medium">
          <q-field :error="$v.form.name.$error">
            <q-input v-model="form.name" stack-label="Ton nom" placeholder="John Doe" @blur="$v.form.name.$touch"  />
            <div class="q-field-bottom" v-if="$v.form.name.$error">
              <div class="q-field-error" v-if="!$v.form.name.required">Veuillez saisir votre nom.</div>
            </div>
          </q-field>
          <q-field :error="$v.form.email.$error">
            <q-input v-model="form.email" stack-label="Ton email" placeholder="your.name@mailbox.com" @blur="$v.form.email.$touch" />
            <div class="q-field-bottom" v-if="$v.form.email.$error">
              <div class="q-field-error" v-if="!$v.form.email.required">Veuillez saisir votre adresse email.</div>
              <div class="q-field-error" v-if="!$v.form.email.email">Veuillez saisir une adresse email valide.</div>
            </div>
          </q-field>
          <q-field :error="$v.form.zipCode.$error">
            <q-input v-model="form.zipCode" stack-label="Ton code postal" placeholder="38500"  />
            <div class="q-field-bottom" v-if="$v.form.zipCode.$error">
              <div class="q-field-error" v-if="!$v.form.zipCode.required">Veuillez entrer un code postal.</div>
            </div>
          </q-field> 
          <q-field :error="$v.form.country.$error">
            <q-select stack-label="Ton pays" v-model="form.country" :options="countries" />
            <div class="q-field-bottom" v-if="$v.form.country.$error">
               <div class="q-field-error" v-if="!$v.form.country.required">Veuillez sélectionner votre pays.</div>
            </div>
          </q-field>
          <q-btn color="primary" class="full-width" @click="submit()">Enregister</q-btn>
        </q-field>
        <q-field icon="lock" label="Modifier ton mot de passe" class="padding-medium">
          <q-field>
            <q-input type="password" v-model="form.oldPassword" stack-label="Mot de passe actuel" />
          </q-field>
          <q-field>
            <q-input type="password" v-model="form.newPassword" stack-label="Nouveau mot de passe" />
          </q-field>
          <q-btn color="primary" class="full-width" @click="submit()">Enregister</q-btn>
        </q-field>
      </form>
      <p class="padding-medium">
        Vous êtes actuellement membre de l'agence <strong>{{form.team}}</strong>
        <br />
        Mais vous pouvez en changer :
      </p>
    </div>
    
    <q-tabs>
      <q-tab default slot="title" label="Créer une agence" name="create" />
      <q-tab slot="title" label="Rejoindre une agence" name="join" />
      <q-tab-pane name="create">
        <div class="row bottom-separator">
          <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 padding-medium">
            <a class="editable" @click="getBadgeForNewTeam()">
              <div :style="'background-image: url(/statics/badges/' + newTeam.badge + ');'"></div>
              <span>Modifier</span>
             </a>
          </div>
          <div class="col padding-medium">
            <q-input v-model="newTeam.name" placeholder="Tapez un nom de votre nouvelle agence" @keyup.enter="createAndAssignNewTeam" />
            <q-btn color="primary" @click="createAndAssignNewTeam">Créer et rejoindre cette agence</q-btn>
          </div>
        </div>
      </q-tab-pane>
      <q-tab-pane name="join">
        <q-list highlight>
          <q-item v-for="team in proposedTeams" :key="team._id" @click="$router.push('/team/' + team._id + '/members')">
            <q-item-side v-if="team.badge" :avatar="'/statics/badges/' + team.badge" />
            <q-item-side v-if="!team.badge" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ team.name }}</q-item-tile>
              <q-item-tile sublabel>Membre à proximité: {{ team.member.name }}</q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
      </q-tab-pane>
    </q-tabs>
    
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import TeamService from 'services/TeamService'
import { QSelect, Toast } from 'quasar'
import { required, email } from 'vuelidate/lib/validators'

export default {
  components: {
    QSelect,
    Toast
  },
  data () {
    return {
      user: {name: "--", picture: "", id: "", team: {}, location: {}},
      form: {name: "--", picture: "", email: "", zipCode: "", country: "", team: {currentName: ""}},
      newTeam: {name: "", badge: "1"},
      proposedTeams: [],
      countries: [
        { label: 'Belgique', value: 'belgium' },
        { label: 'Espagne', value: 'spain' },
        { label: 'France', value: 'france' }
      ]
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getBadgeForNewTeam()
    
    this.getNearTeams()
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      this.form = {
        name: this.user.name,
        email: this.user.email,
        picture: this.user.picture,
        zipCode: this.user.location.postalCode,
        country: this.user.location.country,
        team: this.user.team.currentName ? this.user.team.currentName : ""
      }
    },
    async getBadgeForNewTeam() {
      // get random badge => TO DO : define in the BO the badge
      let nbBadges = 17219
      let badgeId = Math.floor((Math.random() * nbBadges) + 1)
      this.newTeam.badge = "badge" + badgeId + ".png"
    },
    async createAndAssignNewTeam() {
      // form validator : team name must be set
      if (this.newTeam.name === "") {
        Toast.create('Veuillez entrer le nom de votre agence')
        return
      }
      // save the new team
      let saveTeam = TeamService.create({ name: this.newTeam.name, badge: this.newTeam.badge })
        
      if (!saveTeam) {
        Toast.create('Problème technique, veuillez réessayer ultérieurement')
      } else {
        this.team = this.newTeam.name
        this.user.team.currentName = this.newTeam.name
      }
    },
    async getNearTeams() {
      let response = await TeamService.listNearestTeams()
      this.proposedTeams = response.data
    },
    async submit() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.form.name,
          email: this.form.email,
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          zipCode: this.form.zipCode,
          country: this.form.country,
          language: "fr"
        }
        let modificationStatus = await AuthService.modifyAccount(modifications)
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Toast.create(modificationStatus.data.message)
        } else {
          Toast.create['positive']({html: 'Votre compte a été modifié. Si vous avez modifié votre email, un email vient de vous être envoyé pour confirmer.'})
        }
      }
    },
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      // MP 2018-02-12 should not be necessary because picture info is now updated in user session data
      // remove the commented lines below after a while if no problem occurs with user picture "refreshing" when a new picture is uploaded
      /*var reader = new FileReader()
      reader.onload = (e) => {
        this.form.picture = e.target.result;
      };*/
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.getAccountInformations()
      }
    }
  },
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      zipCode: { required }
    }
  }
}
</script>

<style scoped>

</style>
