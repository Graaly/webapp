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
      <q-route-tab :to="{ name: 'teamNewsList', params: { id: $route.params.id } }" slot="title" :label="$t('message.News')" exact />
      <q-route-tab :to="{ name: 'teamMembersList', params: { id: $route.params.id } }" slot="title" :label="$t('message.Members')" exact /> 
    </q-tabs>
    
    <div class="tab-content">
      <q-item v-if="team.mine">
        <q-item-side v-if="user.picture && user.picture.indexOf('http') !== -1" :avatar="user.picture" />
        <q-item-side v-if="user.picture && user.picture.indexOf('http') === -1" :avatar="serverUrl + '/upload/profile/' + user.picture" />
        <q-item-side v-if="!user.picture" :avatar="'/statics/profiles/noprofile.png'" />
        <q-item-main>
          <q-item-tile label><q-input v-model="comment" :placeholder="$t('message.YourComment')" @keyup.enter="submit" /></q-item-tile>
        </q-item-main>
      </q-item>
    
      <div v-if="team.news.items && team.news.items.length > 0">
        <h2 v-show="user.team && user.team.currentId && user.team.currentId === this.$route.params.id">{{ $t('message.NewsOfYourAgency') }}</h2>
        <h2 v-show="!(user.team && user.team.currentId && user.team.currentId === this.$route.params.id)">{{ $t('message.NewsOfTheAgency') }}</h2>
        
        <q-infinite-scroll :handler="getTeamNews">
          <q-list highlight>
            <q-item v-for="(item, index) in team.news.items" :key="item._id">
              <q-item-side v-if="item.data.picture && item.data.picture.indexOf('http') !== -1" :avatar="item.data.picture" />
              <q-item-side v-if="item.data.picture && item.data.picture.indexOf('http') === -1" :avatar="serverUrl + '/upload/profile/' + item.data.picture" />
              <q-item-side v-if="!item.data.picture" :avatar="'/statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label v-if="item.data && item.data.userId">{{ item.data.name }}</q-item-tile>
                <q-item-tile label v-if="item.type === 'standard'">
                  {{ item.title }}
                </q-item-tile>
                <q-item-tile label v-if="item.type !== 'standard'">
                  <dummytag v-html="$t('news.' + item.type, item.data)"></dummytag>
                  <span v-if="item.type === 'challengeWon'">{{ $t('challenge.' + item.data.name) }}</span>
                </q-item-tile>
                <q-item-tile sublabel>
                  {{item.creation.date | formatDate}}
                  - 
                  <a style="color: #000" v-if="!isLiked(item)" v-on:click="like(index)">{{ $t('message.Like') }}</a>
                  <a v-if="isLiked(item)" v-on:click="unlike(index)">{{ $t('message.Like') }}</a>
                  <span v-if="item.likes.length > 0">({{ item.likes.length }})</span>
                </q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
          <div slot="message" class="row justify-center" style="margin-bottom: 50px;">
            <q-spinner-dots :size="5" />
          </div>
        </q-infinite-scroll>
      </div>
      <div v-if="!team.news.items || team.news.items.length === 0">
        {{ $t('message.NoNewsForThisTeam') }}
      </div>
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'
import { required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      team: {
        profile: {
          statistics: {}, 
          score: {}
        },
        news: {
          limit: 20,
          skip: 0,
          items: []
        },
        mine: false
      },
      comment: "",
      user: {name: "--", picture: "", id: ""},
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getTeam(this.$route.params.id)
    
    this.getTeamNews(0, function() { })
  },
  validations: {
    comment: { required }
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (this.user.team && this.user.team.currentId && this.user.team.currentId === this.$route.params.id) {
        // Set the page title = My agency / Competitor
        this.$store.dispatch('setTitle', this.$t('message.MyAgency'))
        this.team.mine = true
      } else {
        this.$store.dispatch('setTitle', this.$t('message.Competitor'))
        this.team.mine = false
      }
    },
    // get team informations
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team.profile = response.data
      
      // compute the total score as the members score + team specific sore
      this.team.profile.score.total = this.team.profile.score.members + this.team.profile.score.challenges
    },
    // get team
    getTeamNews(index, done) {
      var self = this
      // get the team news list
      TeamService.listNews(this.$route.params.id, this.team.news.skip, this.team.news.limit, function(err, response) {
        self.team.news.skip += self.team.news.limit
        if (err) {
          done(err)
        }
        if (response && response.data && response.data.length > 0) {
          self.team.news.items = self.team.news.items.concat(response.data)
          done()
        }
      })
    },               
    // submit the comment    
    async submit () {
      this.$v.$touch()
      
      // form validator : comment must be set
      if (this.$v.$error) {
        this.$q.notify({type: 'info', message: this.$t('message.PleaseEnterAComment')})
        return
      }
      
      // save the comment
      await TeamService.saveNews(this.$route.params.id, {title: this.comment, type: "standard", data: {userId: this.user._id, picture: this.user.picture, name: this.user.name}})
      
      // reset the news list
      this.team.news.items.length = 0
      this.team.news.skip = 0
      this.getTeamNews(this.$route.params.id)
      this.comment = ""
      
      // notification
      this.$q.notify({type: 'positive', message: this.$t('message.YourCommentIsAdded')})
    },
    // save the like action
    async like (index) {
      this.team.news.items[index].likes.push({userId: this.user._id, date: new Date()})
      await TeamService.likeNews(this.$route.params.id, this.team.news.items[index]._id)
    },
    // save the unlike action
    async unlike (index) {
      for (var i = 0; i < this.team.news.items[index].likes.length; i++) {
        if (this.team.news.items[index].likes[i].userId === this.user._id) {
          this.team.news.items[index].likes.splice(i, 1)
        }
      }
      await TeamService.unlikeNews(this.$route.params.id, this.team.news.items[index]._id)
    },
    // return true if the current user has liked the news
    isLiked (item) {
      if (item.likes) {
        for (var i = 0; i < item.likes.length; i++) {
          if (item.likes[i].userId === this.user._id) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
</script>

<style scoped>

</style>