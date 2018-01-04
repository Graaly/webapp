<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="badge">
        <img :src="'/statics/badges/' + team.profile.badge" />
      </div>
      
      <div class="desc">
        <p><h1>{{ team.profile.name }}</h1></p>
        <p>{{ team.profile.statistics.nbQuestsSuccessful }} enquêtes résolues</p>
        <p>{{ team.profile.statistics.nbQuestsCreated }} enquêtes créées</p>
      </div>
      
      <div class="score">
        <p>{{ team.profile.score.total }}</p>
      </div>
      
    </div>
    
    <q-tabs>
      <q-route-tab :to="'/team/' + team.profile._id + '/ranking'" slot="title" label="Classement" />
      <q-route-tab :to="'/team/' + team.profile._id + '/challenges'" slot="title" label="Defis" />
      <q-route-tab :to="'/team/' + team.profile._id + '/news'" alert slot="title" label="News" />
      <q-route-tab :to="'/team/' + team.profile._id + '/members'" slot="title" label="Membres" /> 
    </q-tabs>
    
    <div class="tab-content">
        <p><q-btn link @click="inviteFriend()" color="tertiary">Inviter un ami</q-btn></p>
    
        <h2>Membres de mon agence</h2>
        
        <q-list highlight>
          <q-item v-for="member in team.members" :key="member._id">
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
import { Dialog, Toast } from 'quasar'

export default {
  data () {
    return {
      title: 'Mon agence',
      team: { profile: { statistics: {}, score: {} }, members: [] },
      user: {name: "Eric Mathieu", picture: "eric.png", id: "5a450d86e97f9665754a437b"}
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
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific sore
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    async getTeamMembers(id) {
      // get the members list
      let response = await TeamService.listMembers(id)
      this.team.members = response.data      
    },
    openInviteFriendPopup () {
      Dialog.create({
        title: 'Inviter un ami',
        message: "Veuillez entrer l'adresse email de la personne à inviter",
        form: {
          name: {
            type: 'text',
            label: 'Email',
            model: ''
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler (data) {
              Toast.create('Returned ' + JSON.stringify(data))
            }
          }
        ]
      })
    },
    async inviteFriend () {
      let response = await TeamService.sendFriendInvitation({email: "eric.mathieu@kimind.com", teamId: this.$route.params.id})
      
      console.log(response)      
      Toast.create['positive']({html: 'Votre invitation est envoyée'})
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