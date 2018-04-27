<template>
  
  <div class="wrapper">
    <div class="header team-box">
      <div class="badge">
        <img :src="serverUrl + '/statics/badges/' + team.profile.badge" />
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
      <q-route-tab :to="{ name: 'teamRankingList', params: { id: $route.params.id } }" slot="title" :label="$t('message.Ranking')" exact />
      <q-route-tab :to="{ name: 'teamChallengesList', params: { id: $route.params.id } }" slot="title" :label="$t('message.Challenges')" exact />
      <q-route-tab :to="{ name: 'teamNewsList', params: { id: $route.params.id } }" alert slot="title" :label="$t('message.News')" exact />
      <q-route-tab :to="{ name: 'teamMembersList', params: { id: $route.params.id } }" slot="title" :label="$t('message.Members')" exact /> 
    </q-tabs>
    
    <div class="tab-content">
      <h2>{{ $t('message.RankingThisMonth') }}</h2>    
      <q-list highlight>
        <q-item v-for="ranking in rankings" :key="ranking.teamId">
          <q-item-side left class="rank">
            {{ ranking.rank }}
          </q-item-side>
          <q-item-main @click="$router.push('/team/' + ranking.teamId + '/members')">
            <q-item-tile label>{{ ranking.teamName }}</q-item-tile>
            <q-item-tile sublabel>{{ $t('message.ScoreThisMonth', { score: ranking.score }) }} </q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
      <!--
      <h2>{{ $t('message.DetailOfYourRankingThisMonth') }}</h2>
      <q-list highlight>
        <q-item v-for="ranking in townRankings" :key="ranking._id.zipcode">
          <q-item-main>
            <q-item-tile label v-if="ranking._id.town">{{ ranking._id.town }} ({{ ranking._id.zipcode }})</q-item-tile>
            <q-item-tile label v-if="!ranking._id.town">{{ $t('message.NoLocalizedQuests') }}</q-item-tile>
            <q-item-tile sublabel>{{ $t('message.nbQuestWonThisMonth', { nb: ranking.count }) }} </q-item-tile>
          </q-item-main>
          <q-item-side right class="score">
            {{ ranking.score }}
          </q-item-side>
        </q-item>
        <q-item v-show='townRankings.length === 0'>
          <q-item-main>
            <q-item-tile label>{{ $t('message.NoQuestPlayedThisMonth') }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
      -->
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'

export default {
  data () {
    return {
      team: { profile: { statistics: {}, score: {} } },
      user: {name: "--", picture: "", id: "", team: { wishedId: 0 }},
      rankings: [],
      townRankings: [],
      serverUrl: process.env.SERVER_URL,
      memberOfTeam: false
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getTeam(this.$route.params.id)
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId && this.user.team.currentId === this.$route.params.id) {
        this.memberOfTeam = true
        // Set the page title = My agency / Competitor
        this.$store.dispatch('setTitle', this.$t('message.MyAgency'))
      } else {
        this.memberOfTeam = false
        this.$store.dispatch('setTitle', this.$t('message.Competitor'))
      }
      
      this.getTeamRanking(this.$route.params.id)
      
      this.getTeamRankingByTown(this.$route.params.id)
    },
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific score
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    async getTeamRanking(id) {
      // get the team ranking in cities
      let response = await TeamService.listMonthlyRankings(id)
      this.rankings = response.data
    },
    async getTeamRankingByTown(id) {
      // get the team ranking in cities
      let response = await TeamService.listMonthlyRankingsByTown(id)
      this.townRankings = response.data      
    }
  }
}
</script>

<style scoped>
  .rank {
    font-size: 1.8em
  }
</style>