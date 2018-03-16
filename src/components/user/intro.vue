<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="row">
        <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 bg-black"><img src="/statics/icons/game/welcome-man.png" class="full-width" style="max-width: 100px" /></div>
        <div class="col bg-black padding-medium text-white" v-if="team.profile.status == 'new'">{{ $t('message.introNewAgency') }}</div>
        <div class="col bg-black padding-medium text-white" v-if="team.profile.status != 'new'">{{ $t('message.introJoinAgency') }}</div>
      </div>
      
      <div class="row bottom-separator" v-if="userNeedToUpdateLocation">
        <q-field :label="$t('message.CompleteYourProfile')" class="padding-medium">
          <q-field>
            <q-select :float-label="$t('message.YourCountry')" v-model="user.location.country" :options="countries" />
          </q-field>
          <q-field>
            <q-input :float-label="$t('message.YourZipCode')" v-model="user.location.postalCode" />
          </q-field>
        </q-field>
      </div>
      
      <div class="row bottom-separator">
        <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 padding-medium"><img :src="serverUrl + '/statics/badges/' + team.profile.badge" class="full-width" /></div>
        <div class="col padding-medium" v-if="team.profile.status == 'new'">
          <q-field :helper="$t('message.YouCanJoinAnotherAgencyLater')">
            <q-input v-model="team.profile.name" :placeholder="$t('message.EnterANameForYourAgency')" @keyup.enter="submit" />
          </q-field>
        </div>
        <div class="col padding-medium" v-if="team.profile.status != 'new'">
          <p><h1>{{ team.profile.name }}</h1></p>
          <p class="subtitle">{{ $t('message.successfulQuests', { nb: team.profile.statistics.nbQuestsSuccessful }) }}</p>
          <p class="subtitle">{{ $t('message.createdQuests', { nb: team.profile.statistics.nbQuestsCreated }) }}</p>
        </div>
      </div>
    </div>
    <div>  
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/medal.png" class="small-icon" /></div>
        <div class="col padding-medium" v-html="$t('message.introBlock1')"></div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/investigation.png" class="small-icon" /></div>
        <div class="col padding-medium" v-html="$t('message.introBlock2')"></div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/magic.png" class="small-icon" /></div>
        <div class="col padding-medium" v-html="$t('message.introBlock3')"></div>
      </div>
      <div class="row">
        <div class="col-auto padding-medium"><img src="/statics/icons/game/cup.png" class="small-icon" /></div>
        <div class="col padding-medium" v-html="$t('message.introBlock4')"></div>
      </div>
      <p class="link-below-button">
        <router-link :to="{ path: '/help' }">{{ $t('message.LearnMore') }}</router-link>
      </p>
      <p class="padding-medium">
        <q-btn link class="full-width" @click="submit()" color="primary">{{ $t('message.ChooseMyFirstQuest') }}</q-btn>
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
      team: { profile: { badge: "", name: "", status: "new", statistics: {}, score: {} }, members: [] },
      user: {name: "--", picture: "", id: "", location: {}},
      userNeedToUpdateLocation: false,
      // TODO: retrieve real country list from server or .json file
      countries: [
        { label: 'Belgique', value: 'belgium' },
        { label: 'Espagne', value: 'spain' },
        { label: 'France', value: 'france' }
      ],
      serverUrl: process.env.SERVER_URL
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
      
      if (!this.user.location || !this.user.location.country) {
        this.userNeedToUpdateLocation = true
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
      
      if (this.userNeedToUpdateLocation) {
        let modifications = {
          zipCode: this.user.location.postalCode,
          country: this.user.location.country
        }
        await AuthService.modifyAccount(modifications)
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
