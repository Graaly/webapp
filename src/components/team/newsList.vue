<template>
  
  <div class="wrapper">
    <div class="header team-box">
      <div class="badge">
        <img :src="'/statics/badges/' + team.profile.badge" />
      </div>
      
      <div class="desc">
        <p><h1>{{ team.profile.name }}</h1></p>
        <p class="subtitle">{{ team.profile.statistics.nbQuestsSuccessful }} enquêtes résolues</p>
        <p class="subtitle">{{ team.profile.statistics.nbQuestsCreated }} enquêtes créées</p>
      </div>
      
      <div class="score">
        {{ team.profile.score.total }}
      </div>
    </div>
    
    <q-tabs>
      <q-route-tab :to="{ name: 'teamRankingList', params: { id: team.profile._id } }" slot="title" label="Classement" />
      <q-route-tab :to="{ name: 'teamChallengesList', params: { id: team.profile._id } }" slot="title" label="Defis" />
      <q-route-tab :to="{ name: 'teamNewsList', params: { id: team.profile._id } }" slot="title" label="News" />
      <q-route-tab :to="{ name: 'teamMembersList', params: { id: team.profile._id } }" slot="title" label="Membres" /> 
    </q-tabs>
    
    <div class="tab-content">
      <q-item v-if="team.mine">
        <q-item-side v-if="user.picture" :avatar="serverUrl + '/upload/profile/' + user.picture" />
        <q-item-side v-if="!user.picture" :avatar="'/statics/profiles/noprofile.png'" />
        <q-item-main>
          <q-item-tile label><q-input v-model="comment" placeholder="Votre commentaire" @keyup.enter="submit" /></q-item-tile>
        </q-item-main>
      </q-item>
    
      <div v-if="team.news.items && team.news.items.length > 0">
        <h2 v-show="user.team && user.team.currentId && user.team.currentId === this.$route.params.id">Actualités de mon agence</h2>
        <h2 v-show="!(user.team && user.team.currentId && user.team.currentId === this.$route.params.id)">Actualités de mon agence</h2>
        
        <q-infinite-scroll :handler="getTeamNews">
          <q-list highlight>
            <q-item v-for="(item, index) in team.news.items" :key="item._id">
              <q-item-side v-if="item.author.picture" :avatar="serverUrl + '/upload/profile/' + item.author.picture" />
              <q-item-side v-if="!item.author.picture" :avatar="'/statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ item.author.name }}</q-item-tile>
                <q-item-tile label>{{ item.title }}</q-item-tile>
                <q-item-tile sublabel>
                  {{item.creation.date | formatDate}} 
                  - 
                  <a style="color: #000" v-if="!isLiked(item)" v-on:click="like(index)">J'aime</a>
                  <a v-if="isLiked(item)" v-on:click="unlike(index)">J'aime</a>
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
        Aucune actualité pour cette agence
      </div>
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import AuthService from 'services/AuthService'
import { required } from 'vuelidate/lib/validators'
import { Toast, QSpinnerDots, QInfiniteScroll } from 'quasar'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots
  },
  data () {
    return {
      title: 'Mon agence',
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
        this.$store.dispatch('setTitle', 'Mon agence')
        this.team.mine = true
      } else {
        this.$store.dispatch('setTitle', 'Agence concurrente')
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
      TeamService.listNewsAsync(this.$route.params.id, this.team.news.skip, this.team.news.limit, function(err, response) {
        if (err) {
          done(err)
        }
        self.team.news.items = self.team.news.items.concat(response.data)
        self.team.news.skip += self.team.news.limit
        done()
      })
    },               
    // submit the comment    
    async submit () {
      this.$v.$touch()
      
      // form validator : comment must be set
      if (this.$v.$error) {
        Toast.create('Veuillez entrer un commentaire')
        return
      }
      
      // save the comment
      await TeamService.saveNews({title: this.comment, teamId: this.$route.params.id, type: "standard", author: {picture: this.user.picture, name: this.user.name}, likes: [], creation: {date: new Date(), userId: this.user.id}})
      
      // reset the news list
      this.team.news.items.length = 0
      this.team.news.skip = 0
      this.getTeamNews(this.$route.params.id)
      this.comment = ""
      
      // notification
      Toast.create['positive']({html: 'Votre commentaire est ajouté'})
    },
    // save the like action
    async like (index) {
      this.news.items[index].likes.push({userId: this.user.id, date: new Date()})
      await TeamService.saveNewsLike(this.team.news.items[index]._id, { likes: this.team.news.items[index].likes })
    },
    // save the unlike action
    async unlike (index) {
      for (var i = 0; i < this.team.news.items[index].likes.length; i++) {
        if (this.team.news.items[index].likes[i].userId === this.user.id) {
          this.team.news.items[index].likes.splice(i, 1)
        }
      }
      await TeamService.saveNewsLike(this.team.news.items[index]._id, { likes: this.team.news.items[index].likes })
    },
    // return true if the current user has liked the news
    isLiked (item) {
      if (item.likes) {
        for (var i = 0; i < item.likes.length; i++) {
          if (item.likes[i].userId === this.user.id) {
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