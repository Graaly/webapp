<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="centered">
        <a v-show="profile._id == user._id" class="big-avatar" @click="$router.push('/user/profile/' + profile._id + '/modify')">
          <div v-if="profile.picture" :style="'background-image: url(/statics/profiles/' + profile.picture + ');'"></div>
          <div v-if="!profile.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
          <span>Modifier</span>
        </a>
        <div v-show="profile._id != user._id" class="big-avatar">
          <div v-if="profile.picture" :style="'background-image: url(/statics/profiles/' + profile.picture + ');'"></div>
          <div v-if="!profile.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
        </div>
        <h1>{{profile.name}}</h1>
        {{profile.team.currentName}}
      </div>
    </div>
    <q-btn v-show="profile._id == user._id" round flat color="primary" @click="$router.push('/user/profile/' + profile._id + '/modify')" class="fixed" style="right: 18px; top: 58px">
      <q-icon name="edit" />
    </q-btn>
    
    <q-tabs>
      <q-route-tab :to="{ name: 'teamRankingList', params: { id: $route.params.id } }" slot="title" label="Enquêtes réussies" exact />
      <q-route-tab :to="{ name: 'profile', params: { id: $route.params.id } }" slot="title" label="Enquêtes créées" exact />
    </q-tabs>
    
    <div class="tab-content">
       <p v-show="profile._id == user._id">
          <q-btn link class="full-width" @click="$router.push('/quest/create/welcome')" color="primary">Créer une nouvelle enquête</q-btn>
        </p>
        
        <q-list highlight>
          <q-item v-for="quest in quests" :key="quest._id">
            <q-item-side v-if="quest.picture" :avatar="'/statics/quests/' + quest.picture" />
            <q-item-side v-if="!quest.picture" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ quest.title }}</q-item-tile>
              <q-item-tile sublabel v-if="quest.status == 'published'">
                <q-rating readonly :value="Math.round(quest.rating)" color="primary" :max="5" size="1rem" /> - 
                Publié depuis {{quest.dateCreated | formatDate}}
                <br />
                [[Score semaine]] [[Score total]]
              </q-item-tile>
              <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                Non publié
              </q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
    
    </div>
    
  </div>
  
</template>

<script>
import QuestService from 'services/QuestService'
import AuthService from 'services/AuthService'
import { QRating } from 'quasar'

export default {
  components: {
    QRating
  },
  data () {
    return {
      user: {name: "--", picture: "", id: ""},
      profile: {name: "--", picture: "", id: "", team: {}},
      quests: []
    }
  },
  mounted() {
    this.getAccountInformations()
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      
      if (!this.$route.params.id || this.$route.params.id === 'me' || this.$route.params.id === this.user._id) {
        this.$store.dispatch('setTitle', 'Mon profil')
        this.profile = this.user
        this.listCreatedQuests(this.user._id)
      } else {
        this.getProfileInformations(this.$route.params.id)
        this.listCreatedQuests(this.$route.params.id)
      }
    },
    async listCreatedQuests(id) {
      let response = await QuestService.ListCreatedByAUser(id)
      this.quests = response.data
    },
    async getProfileInformations(id) {
      let response = await AuthService.getAccount(id)
      this.profile = response.data
      this.$store.dispatch('setTitle', this.profile.name)
    }
  }
}
</script>

<style scoped>

</style>