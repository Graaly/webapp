<template>
  
  <div class="wrapper" >
    <div class="header team-box"> 
      <div class="badge">
        <img :src="'/statics/badges/' + team.profile.badge" />
      </div>
      
      <div class="desc">
        <p><h1>{{ team.profile.name }}</h1></p>
        <p class="subtitle">{{ $t('message.successfulQuests', { nb: team.profile.statistics.nbQuestsSuccessful }) }}</p>
        <p class="subtitle">{{ $t('message.createdQuests', { nb: team.profile.statistics.nbQuestsCreated }) }}</p>
      </div>
      
      <div class="score">
        {{ team.profile.score.total }}
      </div>
    </div>
    
    <q-tabs>
      <q-route-tab :to="{ name: 'teamRankingList', params: { id: team.profile._id } }" slot="title" :label="$t('message.Ranking')" />
      <q-route-tab :to="{ name: 'teamChallengesList', params: { id: team.profile._id } }" slot="title" :label="$t('message.Challenges')" />
      <q-route-tab :to="{ name: 'teamNewsList', params: { id: team.profile._id } }" alert slot="title" :label="$t('message.News')" />
      <q-route-tab :to="{ name: 'teamMembersList', params: { id: team.profile._id } }" slot="title" :label="$t('message.Members')" />
    </q-tabs>
    
    <div class="tab-content">
    
        <h2>{{ $t('message.ChallengesForMyTeam') }}</h2>
        
        <q-list highlight separator class="challenges">
          <q-item v-for="challenge in team.challenges" :key="challenge._id">
            <q-item-main>
              <q-item-tile label>{{ $t('challenge.' + challenge.title) }}</q-item-tile>
            </q-item-main>
            <q-item-side right v-if="challenge.status === 'won'">
              <q-item-tile stamp>{{ $t('message.Succeeded') }}</q-item-tile>
              <q-item-tile v-if="memberOfTeam">
                <q-btn color="primary" size="sm">{{ $t('message.Share') }}</q-btn>
              </q-item-tile>
            </q-item-side>
            <q-item-side right v-if="challenge.status !== 'won'">
              <q-item-tile stamp class="score">{{ challenge.points }}</q-item-tile>
              <q-item-tile v-if="challenge.score < challenge.scoreToReach">
                <div class="challenge-progression" :style="'background-size: ' + challenge.progress + '% 100%;'">
                  {{ challenge.score }} / {{ challenge.scoreToReach }}
                </div>
              </q-item-tile>
              <q-item-tile v-if="memberOfTeam && challenge.score >= challenge.scoreToReach">
                <q-btn color="primary" size="sm" @click="validChallenge(challenge.refChallengeId)">{{ $t('message.Won') }}</q-btn>
              </q-item-tile>
            </q-item-side>
          </q-item>
        </q-list>
    
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'
//import { Toast } from 'quasar'

export default {
  data () {
    return {
      title: 'Mon agence',
      team: { profile: { statistics: {}, score: {} }, challenges: [], memberOfTeam: false },
      user: {name: "--", picture: "", id: ""}
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getTeam(this.$route.params.id)
    
    this.getChallenges(this.$route.params.id)
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId && this.user.team.currentId === this.$route.params.id) {
        // Set the page title = My agency / Competitor
        this.$store.dispatch('setTitle', this.$t('message.MyAgency'))
        this.memberOfTeam = true
      } else {
        this.$store.dispatch('setTitle', this.$t('message.Competitor'))
        this.memberOfTeam = false
      }
    },
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific score
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    async getChallenges(id) {
      // get the challenges list
      let response = await TeamService.listChallenges(id)
      this.team.challenges = response.data   
      
      for (var i = 0; i < this.team.challenges.length; i++) {
        if (this.team.challenges[i].status !== 'won') {
          this.team.challenges[i].progress = this.team.challenges[i].score === 0 ? 0 : Math.max(3, Math.floor(this.team.challenges[i].score * 100 / this.team.challenges[i].scoreToReach))
        }
      }
    },
    async validChallenge(challengeId) {
      let response = await TeamService.validChallenge(this.$route.params.id, challengeId)
      
      if (response) {
        this.getTeam(this.$route.params.id)
        this.getChallenges(this.$route.params.id)
      }
    }
  }
}
</script>

<style scoped>

</style>