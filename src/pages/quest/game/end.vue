<template>
  <div>
    <div class="dark-background">
    
      <!------------------ TITLE AREA ------------------------>
      
      <div class="centered" v-show="run.score > 0 || run.reward > 0">    
        <h2 class="text-center size-3 q-mt-xl q-mb-sm">{{ $t('label.YouWin') }}</h2>
        <h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.score > 0 || run.reward === 0">{{ run.score }} <q-icon color="white" name="fas fa-trophy" /></h2>
        <h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.reward > 0">{{ run.reward }} <q-icon color="white" name="fas fa-coins" /></h2>
        <router-link to="/help/points" v-show="run.score > 0">{{ $t('label.WhatCanYouDoWithThesePoints') }}</router-link>
      </div>
      
      <!------------------ PROGRESS AREA ------------------------>
      
      <div class="q-pa-md centered" v-show="run.score > 0">
        <p class="centered">{{ $t('label.MyLevel') }} : {{ $store.state.user.level }}</p>
        <q-progress :percentage="level.progress" height="30px" color="white"></q-progress>
      </div>
      
      <!------------------ RATING AREA ------------------------>
      
      <div class="bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md centered" v-show="run.reward <= 0">
        <h3 class="size-2 q-ma-sm">{{ $t('label.RateThisQuest') }} (+2 <q-icon color="white" name="fas fa-coins" />)</h3>
        <q-rating v-model="rating" :max="5" size="1.5rem" @input="rate" />
      </div>
      
      <!------------------ CHALLENGE FRIENDS AREA ------------------------>
      
      <div class="bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md centered" v-show="run.score > 0">
         <h3 class="size-2 q-ma-sm">{{ $t('label.ChallengeYourFriends') }}</h3>
        <q-btn icon="people" color="primary" size="lg" @click="openChallengeBox" :label="$t('label.ChallengeYourFriends')" />
      </div>
      
      <!------------------ SHARE AREA ------------------------>
      
      <div class="share bg-secondary q-mt-md q-ml-md q-mr-md q-pb-md centered">
         <h3 class="size-2 q-ma-sm">{{ $t('label.ShareYourSuccess') }}</h3>
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
      
      <div class="back centered q-pa-md">
        <q-btn flat :label="$t('label.BackToTheMap')" @click="$router.push('/map')" />
      </div>
      
    </div>
    
    <!------------------ RANKING AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="ranking.show">
        <a class="float-right no-underline" color="grey" @click="ranking.show = false"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.Ranking') }}</h1>
        <q-list>
          <q-item v-for="rank in ranking.items" :key="rank.id" :class="rank.className" >
            <q-item-side>
              <q-item-tile avatar>
                <img :src="'/statics/icons/game/medal-' + rank.position + '.png'">
              </q-item-tile>
            </q-item-side>
            <q-item-main>
              <q-item-tile label>{{ rank.name }}</q-item-tile>
              <q-item-tile sublabel>{{ rank.score}} <q-icon name="fas fa-trophy" /></q-item-tile>
            </q-item-main>
            <q-item-side right>
              <q-item-tile avatar>
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                <img v-if="!rank.picture || rank.picture === ''" src="/statics/icons/game/profile-small.png" />
              </q-item-tile>
            </q-item-side>
            <q-item-side right v-if="!rank.isFriend && rank.id !== $store.state.user._id" @click.native="addFriend(rank.id)">
              <q-item-tile icon="person_add" color="primary" />
            </q-item-side>
            <q-item-side right v-if="rank.isFriend"></q-item-side>
          </q-item>
        </q-list>
      </div>
    </transition>
  </div>
</template>

<script>
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import LevelCompute from 'plugins/LevelCompute'

export default {
  data() {
    return {
      title: 'Enquête réussie',
      rating: 0,
      ranking: {
        show: false,
        items: []
      },
      score: {},
      level: {
        color: "white"
      }, 
      run: {
        score: 0
      },
      questId: this.$route.params.questId,
      awardPoints: true,
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted () {
    var runIsInProgress = false
    // List all run for this quest for current user
    var runs = await RunService.listForAQuest(this.questId)
    if (runs && runs.data && runs.data.length > 0) {
      for (var i = 0; i < runs.data.length; i++) {
        if (runs.data[i].status === 'finished') {
          this.run = runs.data[i]
        }
        if (runs.data[i].status === 'in-progress') {
          this.run = runs.data[i]
          runIsInProgress = true
        }
      }
    }
    
    // get ranking without the user (status of run is still in-progress)
    await this.getRanking()
    
    // get user old score
    this.score.old = this.$store.state.user.score
    this.initProgression()
  
    let endStatus = await RunService.endRun(this.run._id)
    if (endStatus && endStatus.data) {
      // assign computed score
      this.run.score = endStatus.data.score
      this.run.reward = endStatus.data.reward
    }
    
    // get user new score
    //this.level.color = "secondary"
    this.score.new = runIsInProgress ? this.score.old + this.run.score : this.score.old
    setTimeout(this.updateProgression, 3000)
  },
  methods: {
    /*
     * Rate the quest
     */
    async rate() {
      let rate = await RunService.rate(this.run._id, this.rating)
      if (rate.status !== 200) {
        this.$q.notify({type: 'warning', message: this.$t('label.YourRatingHasNotBeenSaved')})
      } else {  
        this.$q.notify({type: 'positive', message: this.$t('label.YourRatingHasBeenSaved')})
      }
    },
    /*
     * Init score & level
     */
    async initProgression() {
      // get your updated score
      this.level = LevelCompute(this.score.old)
    },
    /*
     * Update your score & level
     */
    async updateProgression() {
      var newLevel = LevelCompute(this.score.new)
      // check if the user will move to a new level
      if (newLevel.level > this.level.level) {
        this.level.progress = 100
        this.$store.state.user.level = newLevel.level
        this.level = newLevel
        this.level.progress = 10
      } else {
        // get your updated score
        this.level = newLevel
      }
    },
    /*
     * Get the ranking for this quest
     */
    async getRanking() {
      var scores = await RunService.listPlayersForThisQuest(this.questId)
      
      if (scores && scores.data && scores.data.length > 0) {
        this.ranking.items = scores.data
        this.ranking.items.sort(this.compareScore)
        // compute position
        this.refreshPosition()
        setTimeout(this.showRanking, 5000)
      }
    },
    /*
     * Get the ranking for this quest
     */
    async showRanking() {
      this.ranking.show = true
      
      // check if current user is in the ranking
      var isInRanking = false
      for (var i = 0; i < this.ranking.items.length; i++) {
        if (this.ranking.items[i].id === this.$store.state.user._id) {
          isInRanking = true
        }
      }
      
      if (!isInRanking) {
        this.ranking.items.push({
          id: this.$store.state.user._id, 
          score: this.run.score, 
          name: this.$store.state.user.name, 
          picture: this.$store.state.user.picture, 
          position: this.ranking.items.length + 1, 
          isFriend: true,
          className: "selected"
        })
        // start animation
        setTimeout(this.updateRanking, 3000)
      }
    },
    /*
     * Update the current user ranking
     */
    updateRanking() {
      for (var i = 0; i < this.ranking.items.length; i++) {
        if (this.ranking.items[i].id === this.$store.state.user._id) {
          if (i > 0 && this.ranking.items[i].score >= this.ranking.items[i - 1].score) {
            let userRanking = this.ranking.items[i]
            let otherRanking = this.ranking.items[i - 1]
            this.$set(this.ranking.items, i, otherRanking)
            this.$set(this.ranking.items, i - 1, userRanking)
            this.refreshPosition()
            setTimeout(this.updateRanking, 500)
            break
          }
        }
      }
    },
    /*
     * Update the position in the ranking
     */
    refreshPosition() {
      var position = 0
      for (var i = 0; i < this.ranking.items.length; i++) {
        if (i === 0 || this.ranking.items[i].score !== this.ranking.items[i - 1].score) {
          position = i + 1
          if (!this.ranking.items[i].position || this.ranking.items[i].position !== position) {
            this.ranking.items[i].position = position
            this.$set(this.ranking.items, i, this.ranking.items[i]) // refresh display
          }
        } else {
          position = this.ranking.items[i - 1].position
          if (!this.ranking.items[i].position || this.ranking.items[i].position !== position) {
            this.ranking.items[i].position = position
            this.$set(this.ranking.items, i, this.ranking.items[i]) // refresh display
          }
        }
      }
    },
    /*
     * Sort based on the score
     */
    compareScore(a, b) {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
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

.share ul { margin: 0; padding: 0; display: flex; flex-flow: row nowrap; justify-content: center; }
.share li { list-style-type: none; margin: 0.5rem; }
.share img { width: 3rem; height: 3rem; }

.selected {background-color: #ddd}

</style>
