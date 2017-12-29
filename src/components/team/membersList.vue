<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="badge">
        <img :src="'/statics/badges/' + team.badge" />
      </div>
      
      <div class="desc">
        <p><h1>{{ team.name }}</h1></p>
        <p>{{ team.statistics.nbQuestsSuccessful }} enquêtes résolues</p>
        <p>{{ team.statistics.nbQuestsCreated }} enquêtes créées</p>
      </div>
      
      <div class="score">
        <p>{{ team.score.total }}</p>
      </div>
      
    </div>
    
    <q-tabs>
      <q-route-tab :to="'/team/' + team._id + '/ranking'" slot="title" label="Classement" />
      <q-route-tab :to="'/team/' + team._id + '/challenges'" slot="title" label="Defis" />
      <q-route-tab :to="'/team/' + team._id + '/news'" alert slot="title" label="News" />
      <q-route-tab :to="'/team/' + team._id + '/members'" slot="title" label="Membres" /> 
    </q-tabs>
    
    <div class="tab-content">
        <p><q-btn @click="$router.push('/team/' + $route.params.id + '/invitefriend')" color="tertiary">Inviter un ami</q-btn></p>
    
        <h2>Membres de mon agence</h2>
        
        <q-list highlight>
          <q-item v-for="member in members" :key="member._id">
            <q-item-side :avatar="'/statics/profiles/' + member.picture" />
            <q-item-main>
              <q-item-tile label>{{ member.name }}</q-item-tile>
              <q-item-tile sublabel>{{ member.statistics.nbQuestsSuccessful }} enquêtes réussies | {{ member.statistics.nbQuestsCreated }} enquêtes créées</q-item-tile>
            </q-item-main>
            <q-item-side right>
              {{ member.score }}
            </q-item-side>
          </q-item>
        </q-list>
    
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
export default {
  data () {
    return {
      title: 'Mon agence',
      team: { statistics: {}, score: {} },
      members: []
    }
  },
  mounted() {
    // Set the page title = My agency / Competitor
    this.$store.dispatch('setTitle', 'Mon agence')
    
    this.getTeam(this.$route.params.id)
    
    this.getTeamMembers(this.$route.params.id)
  },
  methods: {
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team = response.data
      
      // compute the total score as the members score + team specific sore
      this.team.score.total = this.team.score.members + this.team.score.challenges
    },
    async getTeamMembers(id) {
      // get the members list
      let response = await TeamService.listMembers(id)
      this.members = response.data      
    }
  }
}
</script>

<style scoped>

.wrapper { overflow-y: scroll; }

#main-view {
  padding: 0;
}

h1 { font-size: 1.3rem; font-weight: bold; margin: 0; margin-bottom: 1rem; }

.header { display: table; border-collapse: collapse; width: 100%; background-color: #efefef; }
.header > div { display: table-cell; vertical-align: top;}
.header div.desc { padding-left: 1rem; }

.header .badge {
  width: 2rem;
  height: 2rem;
  padding: 1rem;
}
.header .badge img {
  display: block;
  width: 5rem;
  height: 5rem;
}

</style>