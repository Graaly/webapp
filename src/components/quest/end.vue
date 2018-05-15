<template>
  <div>
    <div class="end-header">{{ $t('message.CongratulationThisCaseIsClassified') }}.</div>
    
    <div class="end-body">
      <div class="result" v-if="awardPoints">
        <p>{{ $t('message.YouWin') }}</p>
        <div class="result-score">
          <div>{{ run.score }}</div>
          <div><img src="/statics/icons/game/medal.png" /></div>
        </div>
        <router-link to="/help/points">{{ $t('message.WhatCanYouDoWithThesePoints') }}</router-link>
      </div>
      <div v-if="!awardPoints">
        <p>
          {{ $t('message.YouAlreadyPlayThisQuestSoYouWinNoPoints') }}
        </p>
        <p>
          {{ $t('message.ResolveOtherQuestsToWinPoints') }}
        </p>
      </div>
      
      <div class="rating">
        <p>{{ $t('message.RateThisQuest') }}</p>
        <q-rating v-model="rating" :max="5" size="2rem" @change="rate" />
      </div>
      
      <div class="challenge">
        <q-btn icon="people" color="primary" size="lg" @click="openChallengeBox">{{ $t('message.ChallengeYourFriends') }}</q-btn>
      </div>
      
      <div class="share">
        <p>{{ $t('message.ShareYourSuccess') }}</p>
        <ul>
          <li><img src="/statics/icons/social-networks/facebook.png"></li>
          <li><img src="/statics/icons/social-networks/twitter.png"></li>
          <li><img src="/statics/icons/social-networks/googleplus.png"></li>
        </ul>
      </div>
      
      <div class="back">
        <router-link to="/quest/search/map">{{ $t('message.BackToTheMap') }}</router-link>
      </div>
    </div>
    
  </div>
</template>

<script>
import { QRating, Toast, ActionSheet } from 'quasar'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
export default {
  components: {
    QRating,
    Toast
  },
  data() {
    return {
      title: 'Enquête réussie',
      rating: 0,
      run: {
        score: 0
      },
      questId: this.$route.params.questId,
      awardPoints: true,
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title)
    
    // List all run for this quest for current user
    var runs = await RunService.listForAQuest(this.questId)
    
    if (runs && runs.data && runs.data.length > 0) {
      for (var i = 0; i < runs.data.length; i++) {
        if (runs.data[i].status === 'finished') {
          this.awardPoints = false
          this.run = runs.data[i]
        }
        if (runs.data[i].status === 'in-progress') {
          this.run = runs.data[i]
        }
      }
    }
  
    let endStatus = await RunService.endRun(this.run._id)
    if (endStatus && endStatus.data && endStatus.data.score) {
      // assign computed score
      this.run.score = endStatus.data.score
    }
    this.$store.dispatch('setCurrentRun', null)
  },
  methods: {
    async rate() {
      let rate = await RunService.rate(this.run._id, this.rating)
      if (rate.status !== 200) {
        Toast.create['warning']({html: this.$t('message.YourRatingHasNotBeenSaved')})
      } else {
        Toast.create['positive']({html: this.$t('message.YourRatingHasBeenSaved')})
      }
    },
    async openChallengeBox() {
      var self = this
      var actions = [
         {
           label: "Anne",
           avatar: this.serverUrl + "/upload/profile/1525257260096.jpg",
           handler () { self.challengeUser("5ae988e770c5652ff88ed65a") }
         },
         {
           label: "Aurore",
           avatar: this.serverUrl + "/upload/profile/1522851062997.JPG",
           handler () { self.challengeUser("5aae56cc6198d40c61b67e26") }
         },
         {
           label: "Barbara",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5ae988e870c5652ff88ed65e") }
         },
         {
           label: "Christian",
           avatar: this.serverUrl + "/upload/profile/1525257321486.jpg",
           handler () { self.challengeUser("5ae988e770c5652ff88ed65c") }
         },
         {
           label: "Claude",
           avatar: this.serverUrl + "/upload/profile/1525257292040.jpg",
           handler () { self.challengeUser("5ae988e770c5652ff88ed65b") }
         },
         {
           label: "Eric",
           avatar: this.serverUrl + "/upload/profile/1521463800569.jpg",
           handler () { self.challengeUser("5aacebfd874daa461b6815bc") }
         },
         {
           label: "Hervé",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5ae988e670c5652ff88ed657") }
         },
         {
           label: "Jean-Noel",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5ae988e770c5652ff88ed658") }
         },
         {
           label: "Jingyi",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5ae988e870c5652ff88ed65d") }
         },
         {
           label: "Judi",
           avatar: this.serverUrl + "/upload/profile/1525255361394.jpg",
           handler () { self.challengeUser("5ae988e670c5652ff88ed656") }
         },
         {
           label: "Maxime",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5aafd596cd12470b526e32a2") }
         },
         {
           label: "Valérie",
           avatar: this.serverUrl + "/upload/profile/1525257230460.jpg",
           handler () { self.challengeUser("5ae988e770c5652ff88ed659") }
         },
         {
           label: "Vincent",
           avatar: "/statics/profiles/noprofile.png",
           handler () { self.challengeUser("5ae988ea70c5652ff88ed65f") }
         }
      ]
      
      //var friends = await UserService.listFriends(this.questId)

      ActionSheet.create({
        title: this.$t('message.ChallengeYourFriends'),
        gallery: false,
        actions: actions,
        dismiss: {
          label: this.$t('message.Cancel'),
          icon: 'cancel',
          handler () {
            console.log('Cancelled...')
          }
        }
      })
    },
    async challengeUser(id) {
      await UserService.challengeFriend(id, this.run._id)
    }
  }
}
</script>

<style lang="styl" scoped>
@import '~variables'

#main-view { display: flex; flex-flow: column nowrap; }

#main-view div, #main-view p { text-align: center; font-size: 1.1rem;}

#main-view a { text-decoration: underline; }

.end-header { padding: 1rem; padding-left: 8rem; font-weight: bold; color: #fff; background: #000 url('/statics/icons/game/classified.png') no-repeat left center; height: 6rem; display: flex; align-items: center; }

.end-body { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
.end-body > div { padding: 1rem 0; }

.result-score { display: table; margin: 0 auto; }
.result-score div { display: table-cell; color: $primary; font-weight: bold; font-size: 3.5rem !important; vertical-align: middle; height: 3.5rem; line-height: 2rem; padding: 0; }
.result-score img { width: 3.5rem; height: 3.5rem; margin-left: 0.2rem; }
.result a { font-size: 0.9rem; }

.share ul { margin: 0; padding: 0; display: flex; flex-flow: row nowrap; justify-content: center; }
.share li { list-style-type: none; margin: 0.5rem; }
.share img { width: 3rem; height: 3rem; }

</style>
