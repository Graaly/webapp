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
        <p>
          <q-btn v-show="user.team && user.team.currentId && user.team.currentId === this.$route.params.id" link class="full-width" @click="openInviteFriendPopup()" color="primary">{{ $t('message.InviteAFriend') }}</q-btn>
          <q-btn v-show="!(user.team && user.team.currentId && user.team.currentId === this.$route.params.id) && user.team.wishedId !== this.$route.params.id" link class="full-width" @click="joinTeam()" color="primary">{{ $t('message.JoinThisAgency') }}</q-btn>
          <q-btn v-show="!(user.team && user.team.currentId && user.team.currentId === this.$route.params.id) && user.team.wishedId === this.$route.params.id" link class="full-width" disabled color="primary">{{ $t('message.RequestSent') }}</q-btn>
        </p>
        
        <q-list highlight v-if="team.joinRequests.length > 0 && memberOfTeam">
          <q-item v-for="request in team.joinRequests" :key="request._id">
            <q-item-side v-if="request.picture && request.picture.indexOf('http') !== -1" :avatar="request.picture" />
            <q-item-side v-if="request.picture && request.picture.indexOf('http') === -1" :avatar="serverUrl + '/upload/profile/' + request.picture" />
            <q-item-side v-if="!request.picture" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ $t('message.NameWantToJoinYourAgency', { name: request.name }) }}</q-item-tile>
              <q-item-tile sublabel>{{ $t('message.successfulQuests', { nb: request.statistics.nbQuestsSuccessful }) }}<br />{{ $t('message.createdQuests', { nb: request.statistics.nbQuestsCreated }) }}</q-item-tile>
            </q-item-main>
            <q-item-side right>
              <q-btn flat round dense icon="more_vert" text-color="primary">
                <q-popover>
                  <q-list link>
                    <q-item>
                      <q-item-main :label="$t('message.Accept')" @click.native="acceptJoinRequest(request._id)" />
                    </q-item>
                    <q-item>
                      <q-item-main :label="$t('message.Reject')" @click.native="rejectJoinRequest(request._id)" />
                    </q-item>
                  </q-list>
                </q-popover>
              </q-btn>
            </q-item-side>
          </q-item>
        </q-list>
    
        <h2 v-show="user.team && user.team.currentId && user.team.currentId === this.$route.params.id">{{ $t('message.MembersOfMyAgency') }}</h2>
        <h2 v-show="!(user.team && user.team.currentId && user.team.currentId === this.$route.params.id)">{{ $t('message.MembersOfTheAgency') }}</h2>
        
        <q-list highlight>
          <q-item v-for="member in team.members" :key="member._id" @click.native="$router.push('/user/profile/' + member._id)">
            <q-item-side v-if="member.picture && member.picture.indexOf('http') !== -1" :avatar="member.picture" />
            <q-item-side v-if="member.picture && member.picture.indexOf('http') === -1" :avatar="serverUrl + '/upload/profile/' + member.picture" />
            <q-item-side v-if="!member.picture" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ member.name }}</q-item-tile>
              <q-item-tile sublabel>{{ $t('message.successfulQuests', { nb: member.statistics.nbQuestsSuccessful }) }}<br />{{ $t('message.createdQuests', { nb: member.statistics.nbQuestsCreated }) }}</q-item-tile>
            </q-item-main>
            <q-item-side right class="score">
              {{ member.score }}
            </q-item-side>
          </q-item>
        </q-list>
    
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'

export default {
  data () {
    return {
      team: { profile: { statistics: {}, score: {} }, members: [], joinRequests: [] },
      user: {name: "--", picture: "", id: "", team: { wishedId: 0 }},
      serverUrl: process.env.SERVER_URL,
      memberOfTeam: false
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getTeam(this.$route.params.id)
    
    this.getTeamMembers(this.$route.params.id)
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId && this.user.team.currentId === this.$route.params.id) {
        this.memberOfTeam = true
        // Set the page title = My agency / Competitor
        this.$store.dispatch('setTitle', this.$t('message.MyAgency'))
        this.getJoinRequest(this.$route.params.id)
      } else {
        this.memberOfTeam = false
        this.$store.dispatch('setTitle', this.$t('message.Competitor'))
      }
    },
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific score
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    async getTeamMembers(id) {
      // get the members list
      let response = await TeamService.listMembers(id)
      this.team.members = response.data      
    },
    async getJoinRequest(id) {
      // get the requests to join the team
      let response = await TeamService.listJoinRequests(id)
      this.team.joinRequests = response.data      
    },
    openInviteFriendPopup () {
      var self = this
      this.$q.dialog.create({
        title: this.$t('message.InviteAFriend'),
        message: this.$t('message.PleaseEnterTheEmailAddressOfThePersonYouWantToInvite'),
        form: {
          email: {
            type: 'text',
            label: this.$t('message.Email'),
            model: ''
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler (data) {
              self.inviteFriend(data.email)
            }
          }
        ]
      })
    },
    async inviteFriend (email) {
      let response = await TeamService.sendFriendInvitation({email: email, teamId: this.$route.params.id})
      
      if (response) {
        this.$q.notify({type: 'positive', message: this.$t('message.YourInvitationHasBeenSent')})
      } else {
        this.$q.notify({type: 'negative', message: this.$t('message.TechnicalIssue')})
      }
    },
    async joinTeam () {
      let response = await TeamService.joinTeam(this.$route.params.id)
      if (response) {
        this.user.team.wishedId = this.$route.params.id
      }
    },
    async acceptJoinRequest (userId) {
      let response = await TeamService.acceptJoinRequest(userId, this.$route.params.id)
      if (response) {
        this.getAccountInformations()
    
        this.getTeam(this.$route.params.id)
    
        this.getTeamMembers(this.$route.params.id)
      }
    },
    async rejectJoinRequest (userId) {
      let response = await TeamService.rejectJoinRequest(userId, this.$route.params.id)
      if (response) {
        this.getJoinRequest(this.$route.params.id)
      }
    }
  }
}
</script>

<style scoped>

</style>
