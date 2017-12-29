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
      <q-route-tab :to="'/team/' + team._id + '/news'" slot="title" label="News" />
      <q-route-tab :to="'/team/' + team._id + '/members'" slot="title" label="Membres" /> 
    </q-tabs>
    
    <div class="tab-content">
      <q-item>
        <q-item-side :avatar="'/statics/profiles/' + user.picture" />
        <q-item-main>
          <q-item-tile label><q-input v-model="comment" placeholder="Votre commentaire" @keyup.enter="submit" /></q-item-tile>
        </q-item-main>
      </q-item>
    
      <h2>Actualités de mon agence</h2>
        
      <q-infinite-scroll :handler="getTeamNews">
        <q-list highlight>
          <q-item v-for="(item, index) in news.items" :key="item._id">
            <q-item-side :avatar="'/statics/profiles/' + item.author.picture" />
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
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
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
      team: { statistics: {}, score: {} },
      comment: "",
      news: {limit: 20, skip: 0, items: []},
      user: {name: "Eric Mathieu", picture: "eric.png", id: "5a450d86e97f9665754a437b"}
    }
  },
  mounted() {
    // Set the page title = My agency / Competitor
    this.$store.dispatch('setTitle', 'Mon agence')
    
    this.getTeam(this.$route.params.id)
    
    this.getTeamNews(0, function() { })
  },
  validations: {
    comment: { required }
  },
  methods: {
    async getTeam(id) {
      // get the team informations
      let response = await TeamService.getById(id)
      this.team = response.data
      
      // compute the total score as the members score + team specific sore
      this.team.score.total = this.team.score.members + this.team.score.challenges
    },
    getTeamNews(index, done) {
      var self = this
      // get the team news list
      TeamService.listNewsAsync(this.$route.params.id, this.news.skip, this.news.limit, function(err, response) {
        if (err) {
          done(err)
        }
        self.news.items = self.news.items.concat(response.data)
        self.news.skip += self.news.limit
        done()
      })
    },                                                                                  
    async submit () {
      // submit the comment
      this.$v.$touch()
      
      // form validator : comment must be set
      if (this.$v.$error) {
        Toast.create('Veuillez entrer un commentaire')
        return
      }
      
      // save the comment
      await TeamService.saveNews({title: this.comment, teamId: this.$route.params.id, type: "standard", author: {picture: this.user.picture, name: this.user.name}, likes: [], creation: {date: new Date(), userId: this.user.id}})
      
      // reset the news list
      this.news.items.length = 0
      this.news.skip = 0
      this.getTeamNews(this.$route.params.id)
      this.comment = ""
      
      // notification
      Toast.create['positive']({html: 'Votre commentaire est ajouté'})
    },
    async like (index) {
      // save the like action
      this.news.items[index].likes.push({userId: this.user.id, date: new Date()})
      await TeamService.saveNewsLike(this.news.items[index]._id, { likes: this.news.items[index].likes })
    },
    async unlike (index) {
      // save the unlike action
      for (var i = 0; i < this.news.items[index].likes.length; i++) {
        if (this.news.items[index].likes[i].userId === this.user.id) {
          this.news.items[index].likes.splice(i, 1)
        }
      }
      await TeamService.saveNewsLike(this.news.items[index]._id, { likes: this.news.items[index].likes })
    },
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