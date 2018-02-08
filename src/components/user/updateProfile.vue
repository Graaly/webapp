<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="centered">
        <a class="big-avatar">
          <div v-if="user.picture" :style="'background-image: url(/statics/profiles/' + user.picture + ');'"></div>
          <div v-if="!user.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
          <span>Modifier</span>
        </a>
      </div>
      <q-field icon="account circle" label="Modifier tes informations" class="padding-medium">
        <q-input v-model="user.name" stack-label="Ton nom" placeholder="John Doe"  />
        <q-input v-model="user.email" stack-label="Ton email" placeholder="your.name@mailbox.com"  />
      </q-field>
      <q-field icon="lock" label="Modifier ton mot de passe" class="padding-medium">
        <q-input stack-label="Mot de passe actuel" type="password" v-model="user.oldPassword" />
        <q-input stack-label="Nouveau mot de passe" type="password" v-model="user.newPassword" />
      </q-field>
      <p class="padding-medium">
        Vous êtes actuellement membre de l'agence <strong>{{user.team.currentName}}</strong>
        <br />
        Mais vous pouvez en changer :
      </p>
    </div>
    
    <q-tabs>
      <q-tab default slot="title" label="Créer une agence" name="create" />
      <q-tab slot="title" label="Rejoindre une agence" name="join" />
      <q-tab-pane name="create">
        <div class="row bottom-separator">
          <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 padding-medium"><img :src="'/statics/badges/' + newTeam.badge" class="full-width" /></div>
          <div class="col padding-medium">
            <q-input v-model="newTeam.name" placeholder="Tapez un nom de votre nouvelle agence" @keyup.enter="createAndAssignNewTeam" />
            <q-btn color="primary" @click="createAndAssignNewTeam">Créer cette agence</q-btn>
          </div>
        </div>
      </q-tab-pane>
      <q-tab-pane name="join">
        contenu join
      </q-tab-pane>
    </q-tabs>
    
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import TeamService from 'services/TeamService'

export default {
  data () {
    return {
      user: {name: "--", picture: "", id: ""},
      newTeam: {name: "", badge: "1"},
      proposedTeams: []
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
    },
    async getBadgeForNewTeam() {
      // get random badge => TO DO : define in the BO the badge
      let nbBadges = 17219
      let badgeId = Math.floor((Math.random() * nbBadges) + 1)
      this.newTeam.badge = "badge" + badgeId + ".png"
    },
    async createAndAssignNewTeam() {
      
    },
    async getNearTeams() {
      let response = await TeamService.listNearestTeams()
      this.proposedTeams = response.data
    }
  }
}
</script>

<style scoped>

</style>