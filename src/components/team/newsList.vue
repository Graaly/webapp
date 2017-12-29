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
          <q-item-side :avatar="'/statics/profiles/eric.png'" />
          <q-item-main>
            <q-item-tile label><q-input v-model="comment" placeholder="Votre commentaire" @keyup.enter="submit" /></q-item-tile>
          </q-item-main>
         </q-item>
    
        <h2>Actualités de mon agence</h2>
        
        <q-list highlight>
          <q-item v-for="item in news" :key="item._id">
            <q-item-side :avatar="'/statics/profiles/' + item.author.picture" />
            <q-item-main>
              <q-item-tile label>{{ item.author.name }}</q-item-tile>
              <q-item-tile label>{{ item.title }}</q-item-tile>
              <q-item-tile sublabel>Il y a 5h - J'aime (10)</q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
    
    </div>
    
  </div>
  
</template>

<script>
import TeamService from 'services/TeamService'
import { required } from 'vuelidate/lib/validators'
import { Toast } from 'quasar'

export default {
  data () {
    return {
      title: 'Mon agence',
      team: { statistics: {}, score: {} },
      comment: "",
      news: []
    }
  },
  mounted() {
    // Set the page title = My agency / Competitor
    this.$store.dispatch('setTitle', 'Mon agence')
    
    this.getTeam(this.$route.params.id)
    
    this.getTeamNews(this.$route.params.id)
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
    async getTeamNews(id) {
      // get the team news list
      let response = await TeamService.listNews(id)
      this.news = response.data      
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
      await TeamService.saveNews({title: this.comment, teamId: this.$route.params.id, type: "standard", author: {picture: "eric.png", name: "Eric Mathieu"}, likes: [], creation: {date: new Date(), userId: "5a450d86e97f9665754a437b"}})
      
      // reset the news list
      this.getTeamNews(this.$route.params.id)
      this.comment = ""
      
      // notification
      Toast.create['positive']({html: 'Votre commentaire est ajouté'})
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