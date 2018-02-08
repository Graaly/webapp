<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="row">
        <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 bg-black"><img src="/statics/icons/game/welcome-man.png" class="full-width" style="max-width: 100px" /></div>
        <div class="col bg-black padding-medium text-white" v-if="team.profile.status == 'new'">Bravo, vous venez de créer votre agence de détectives privés !</div>
        <div class="col bg-black padding-medium text-white" v-if="team.profile.status != 'new'">Bravo, vous venez de rejoindre une agence de détectives privés !</div>
      </div>
      
      <div class="row bottom-separator">
        <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 padding-medium"><img :src="'/statics/badges/' + team.profile.badge" class="full-width" /></div>
        <div class="col padding-medium" v-if="team.profile.status == 'new'">
          <q-field helper="Vous pourrez rejoindre une autre agence ultérieurement">
            <q-input v-model="team.profile.name" placeholder="Tapez un nom de votre agence" @keyup.enter="submit" />
          </q-field>
        </div>
        <div class="col padding-medium" v-if="team.profile.status != 'new'">
          <p><h1>{{ team.profile.name }}</h1></p>
          <p class="subtitle">{{ team.profile.statistics.nbQuestsSuccessful }} enquêtes résolues</p>
          <p class="subtitle">{{ team.profile.statistics.nbQuestsCreated }} enquêtes créées</p>
        </div>
      </div>
    </div>
    <div>  
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/medal.png" class="small-icon" /></div>
        <div class="col padding-medium">Votre objectif est de gagner le plus de <strong>points de réputation</strong> possible</div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/investigation.png" class="small-icon" /></div>
        <div class="col padding-medium">Pour gagner des points, il faut <strong>réussir des enquêtes</strong> présentes sur la carte</div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/magic.png" class="small-icon" /></div>
        <div class="col padding-medium">Vous pouvez aussi <strong>créer vos propre enquêtes</strong>, vous gagnerez des points à chaque fois qu'un joueur la réussi</div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/cup.png" class="small-icon" /></div>
        <div class="col padding-medium">Plus vous ferez gagner des points à votre agence, plus elle aura de chances de <strong>conquérir des territoires</strong></div>
      </div>
      <p class="link-below-button">
        <router-link :to="{ path: '/help' }">En savoir +</router-link>
      </p>
      <p class="padding-medium">
        <q-btn link class="full-width" @click="submit()" color="primary">Choisir ma première enquête</q-btn>
      </p>
      
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'
import { Toast } from 'quasar'

export default {
  components: {
    Toast
  },
  data () {
    return {
      team: { profile: { name: "", status: "new", statistics: {}, score: {} }, members: [] },
      user: {name: "--", picture: "", id: ""}
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', 'Bienvenue !')
    
    this.getAccountInformations()
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId) {
        this.getTeam(this.user.team.currentId)
      } else {
        // get random badge => TO DO : define in the BO the badge
        let nbBadges = 17219
        let badgeId = Math.floor((Math.random() * nbBadges) + 1)
        this.team.profile.badge = "badge" + badgeId + ".png"
      }
    },
    // get team information
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
    },
    // save the team
    async submit () {
      if (this.team.profile.status === "new") {
        // form validator : team name must be set
        if (this.team.profile.name === "") {
          Toast.create('Veuillez entrer le nom de votre agence')
          return
        }
        // save the new team
        let saveTeam = TeamService.create({ name: this.team.profile.name, badge: this.team.profile.badge })
        
        if (!saveTeam) {
          Toast.create('Problème technique, veuillez réessayer ultérieurement')
          return
        }
      }
      
      // change the status of the user
      let activationStatus = await AuthService.newToActive()
      
      if (activationStatus) {
        this.$router.push('/quest/search/map')
      }
    }
  }
}
</script>

<style scoped>

</style>    
