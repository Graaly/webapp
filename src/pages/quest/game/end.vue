<template>
  <div class="dark-background">
  
    <!------------------ TITLE AREA ------------------------>
    
    <div>    
      <h2 class="text-center size-3 q-mt-xl q-mb-sm">{{ $t('label.YouWin') }}</h2>
      <h2 class="size-1 q-mt-sm q-mb-sm">{{ run.score }} <q-icon color="white" name="fas fa-trophy" /></h2>
      <router-link to="/help/points">{{ $t('label.WhatCanYouDoWithThesePoints') }}</router-link>
    </div>
    
    <!------------------ RATING AREA ------------------------>
    
    <div class="bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md">
      <h3 class="size-3 q-ma-sm">{{ $t('label.RateThisQuest') }}</h3>
      <q-rating v-model="rating" :max="5" size="2rem" @change="rate" />
    </div>
    
    <!------------------ CHALLENGE FRIENDS AREA ------------------------>
    
    <div class="bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md">
      <h3 class="size-3 q-ma-sm">{{ $t('label.ChallengeYourFriends') }}</h3>
      <q-btn icon="people" color="primary" size="lg" @click="openChallengeBox" :label="$t('label.ChallengeYourFriends')" />
    </div>
    
    <!------------------ SHARE AREA ------------------------>
    
    <div class="share bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md">
      <h3 class="size-3 q-ma-sm">{{ $t('label.ShareYourSuccess') }}</h3>
      <ul>
        <li>
          <a href="https://www.facebook.com/sharer/sharer.php?u=http://graaly.com" target="_blank">
            <img src="/statics/icons/social-networks/facebook.png" />
          </a>
        </li>
        <li>
          <a href="https://twitter.com/intent/tweet?text=To%Define&url=http://graaly.com" target="_blank">
            <img src="/statics/icons/social-networks/twitter.png" />
          </a>
        </li>
        <li>
          <a href="https://plus.google.com/share?url=http://graaly.com" target="_blank">
            <img src="/statics/icons/social-networks/googleplus.png" />
          </a>
        </li>
      </ul>
    </div>
 
    <!------------------ BACK TO MAP LINK AREA ------------------------>
    
    <div class="back">
      <router-link to="/quest/search/map">{{ $t('label.BackToTheMap') }}</router-link>
    </div>
    
  </div>
</template>

<script>
import RunService from 'services/RunService'
import UserService from 'services/UserService'
export default {
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
    // List all run for this quest for current user
    var runs = await RunService.listForAQuest(this.questId)
    if (runs && runs.data && runs.data.length > 0) {
      for (var i = 0; i < runs.data.length; i++) {
        if (runs.data[i].status === 'finished') {
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
  },
  methods: {
    async rate() {
      let rate = await RunService.rate(this.run._id, this.rating)
      if (rate.status !== 200) {
        this.$q.notify({type: 'warning', message: this.$t('message.YourRatingHasNotBeenSaved')})
      } else {
        this.$q.notify({type: 'positive', message: this.$t('message.YourRatingHasBeenSaved')})
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

      this.$q.actionSheet({
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

.share ul { margin: 0; padding: 0; display: flex; flex-flow: row nowrap; justify-content: center; }
.share li { list-style-type: none; margin: 0.5rem; }
.share img { width: 3rem; height: 3rem; }

</style>
