<template>
  <div>
    <div class="dark-background" v-if="!warnings.noNetwork">
      <div class="bg-primary">
        <!------------------ TITLE AREA ------------------------>
        
        <div class="centered">    
          <h2 class="text-center size-3 q-mt-xl q-mb-sm">{{ $t('label.YouWin') }}</h2>
          <h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.score > 0 || run.reward === 0">{{ run.score }} {{ $t('label.points') }} <!--<q-icon color="white" name="fas fa-trophy" />--></h2>
          <h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.reward > 0">{{ run.reward }} <q-icon color="white" name="fas fa-bolt" /></h2>
          <!--<router-link to="/help/points" v-show="run.score > 0">{{ $t('label.WhatCanYouDoWithThesePoints') }}</router-link>-->
          <q-icon name="fas fa-award" class="big-icon" />
          <q-icon name="fas fa-award" class="big-icon q-ml-md" v-if="run.stars > 1" />
          <q-icon name="fas fa-award" class="big-icon q-ml-md" style="color: #ed555d" v-if="run.stars <= 1" />
          <q-icon name="fas fa-award" class="big-icon q-ml-md" v-if="run.stars > 2" />
          <q-icon name="fas fa-award" class="big-icon q-ml-md" style="color: #ed555d" v-if="run.stars <= 2" />
        </div>
        
        <!------------------ PROGRESS AREA ------------------------>
        
        <div class="q-pa-md centered">
          <p class="centered">{{ $t('label.YourLevel') }} : {{ $store.state.user.level }}</p>
          <q-linear-progress :percentage="level.progress" height="30px" color="white"></q-linear-progress>
        </div>
              
        <!------------------ CHALLENGE FRIENDS AREA ------------------------>
        
        <div class="q-mt-md q-ml-md q-mr-md q-pb-md centered" v-show="run.score > 0 && quest && quest.access === 'public'">
          <q-btn icon="people" color="accent" size="lg" @click="openChallengeBox" :label="$t('label.ChallengeYourFriends')" />
        </div>
        
        <!------------------ REVIEW AREA ------------------------>
        
        <div class="bg-secondary q-mt-md q-ml-md q-mr-md q-pa-sm centered" v-if="showAddReview && quest && quest.access === 'public'">
          <h3 class="size-2">{{ $t('label.ReviewThisQuest') }} <!--(+2 <q-icon color="white" name="fas fa-bolt" />)--></h3>
          <p>{{ $t('label.Rating') + $t('label.Colon') }} <q-rating v-model="rating" :max="5" size="1.5rem" :disable="reviewSent" /></p>
          <p>{{ $t('label.CommentThisQuest') }} ({{ $t('label.Optional') }}){{ $t('label.Colon') }}</p>
          <textarea class="shadowed full-width" v-model="comment" rows="5" :disabled="reviewSent" />
          <q-btn class="full-width" color="primary" :label="$t('label.Send')" @click="addReview()" :disabled="reviewSent" />
        </div>
        
        <!------------------ SHARE AREA ------------------------>
        
        <!--<div class="share bg-secondary q-mt-md q-ml-md q-mr-md q-pa-sm centered">
          <h3 class="size-2 q-ma-sm">{{ $t('label.ShareYourSuccess') }}</h3>
          <ul>
            <li>
              <a href="https://www.facebook.com/sharer/sharer.php?u=http://graaly.com" target="_blank">
                <img src="statics/icons/social-networks/facebook.png" />
              </a>
            </li>
            <li>
              <a href="https://twitter.com/intent/tweet?text=To%Define&url=http://graaly.com" target="_blank">
                <img src="statics/icons/social-networks/twitter.png" />
              </a>
            </li>
            <li>
              <a href="https://plus.google.com/share?url=http://graaly.com" target="_blank">
                <img src="statics/icons/social-networks/googleplus.png" />
              </a>
            </li>
          </ul>
        </div>-->
     
        <!------------------ BACK TO MAP LINK AREA ------------------------>
        
        <div class="back centered q-pa-md bg-primary text-primary">
          <q-btn class="text-primary bg-white full-width" :label="$t('label.BackToTheMap')" @click="$router.push('/map')" />
        </div>
        
      </div>
      <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork" @click="loadData()">
        <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
      </div>
    </div>
    <!------------------ RANKING AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="ranking.show">
        <a class="float-right no-underline" color="grey" @click="ranking.show = false"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.Ranking') }}</h1>
        <div class="q-pl-md">{{ $t('label.RankingEndIntro') }}</div>
        <q-list>
          <q-item v-for="rank in ranking.items" :key="rank.id" :class="rank.className" >
            <q-item-section avatar>
              <img :src="'statics/icons/game/medal-' + rank.position + '.png'">
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ rank.name }}</q-item-label>
              <q-item-label caption>{{ rank.score}} {{ $t('label.points') }}<!--<q-icon name="fas fa-trophy" />--></q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-avatar>
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                <img v-if="!rank.picture || rank.picture === ''" src="statics/icons/game/profile-small.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section side v-if="!rank.isFriend && rank.id !== $store.state.user._id" @click.native="addFriend(rank.id)">
              <q-icon name="person_add" color="primary" />
            </q-item-section>
            <q-item-section side v-if="rank.isFriend"></q-item-section>
          </q-item>
        </q-list>
        <div class="centered">
          <q-btn color="primary" :label="$t('label.CloseEndRanking')" @click="ranking.show = false" />
        </div>
      </div>
    </transition>
    
    <!--====================== CHALLENGE YOUR FRIENDS PAGE =================================-->
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="showChallenge">      
        <a class="float-right no-underline" color="grey" @click="closeChallenge"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.ChallengeYourFriends') }}</h1>
        <div v-if="filteredFriends.length === 0">
          {{ $t('label.NoFriendsLong') }}
        </div>
        <div v-if="filteredFriends.length > 0">
          <div class="q-pa-md centered">
            <q-btn color="primary" size="lg" full @click="challengeAll" :label="$t('label.ChallengeAllFriends')" />
          </div>
          <div class="q-pa-md centered">
            {{ $t('label.Or') }}
          </div>
          <!--<div>
            <q-chips-input v-model="invitedFriends.name" :placeholder="$t('label.TypeNameOrAddressOfYourFriends')" add-icon="add_circle">
              <q-autocomplete @search="searchFriend" @selected="selectFriend" :min-characters="0" />
            </q-chips-input>
          </div>-->
          <!-- TODO : if no friend, add them from contact list. If friends, propose 3 randomly-->
          <div v-if="friends && friends.length !== 0">
            <q-list highlight>
              <q-item v-for="friend in filteredFriends" :key="friend.friendId">
                <q-item-section>
                  <q-avatar>
                    <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') !== -1" :src="friend.picture" />
                    <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + friend.picture" />
                    <img v-if="!friend.picture || friend.picture === ''" src="statics/icons/game/profile-small.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-label>{{ friend.name }}</q-item-label>
                <q-item-section side>
                  <q-btn v-show="!friend.isChallenged" color="primary" :label="$t('label.Challenge')" @click="challenge(friend)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </transition>
    
     <!--====================== BONUS PAGE =================================-->
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-if="showBonus">      
        <a class="float-right no-underline" color="grey" @click="closeBonus"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.YouWonABonus') }}</h1>
        <div class="q-pa-md">
          <q-card class="q-ma-sm">
            <img :src="'statics/icons/game/bonus_' + run.bonus + '.png'">
            <q-card-section>
              <div class="text-h6">{{ $t('bonus.' + run.bonus) }}</div>
            </q-card-section>
            <q-card-section>
              {{ $t('bonus.' + run.bonus + 'Desc') }}
            </q-card-section>
          </q-card>
        </div>
      </div>
    </transition>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
    
    <!--====================== WIN COINS ANIMATION =================================-->
      
    <div v-if="level.upgraded" class="fadein-message">+100 <q-icon color="white" name="fas fa-bolt" /></div>
        
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import ReviewService from 'services/ReviewService'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import LevelCompute from 'boot/LevelCompute'
import Notification from 'boot/NotifyHelper'
//import { filter } from 'quasar'
import Vue from 'vue'
import story from 'components/story'
import utils from 'src/includes/utils'

export default {
  components: {
    story
  },
  data() {
    return {
      title: 'Enquête réussie',
      rating: 0,
      comment: '',
      ranking: {
        show: false,
        items: []
      },
      score: {},
      level: {
        color: "white",
        upgraded: false
      }, 
      run: {
        score: 0,
        stars: 1
      },
      quest: {},
      friends: [],
      filteredFriends: [],
      invitedFriends: {
        id: [],
        name: []
      },
      story: {
        step: null,
        data: null
      },
      questId: this.$route.params.questId,
      awardPoints: true,
      showChallenge: false,
      showBonus: false,
      showAddReview: false,
      reviewSent: false,
      warnings: {
        noNetwork: false
      },
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted () {
    utils.clearAllRunningProcesses()
    await this.loadData()
  },
  methods: {
    /*
     * Init score & level
     */
    async loadData() {
      this.warnings.noNetwork = false
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
      
      // get quest data
      this.quest = await QuestService.getById(this.questId, this.run.version)
      if (this.quest && this.quest.data) {
        // show review part only if player is not author & has not already sent a review for this quest
        const isUserAuthor = this.$store.state.user._id === this.quest.data.authorUserId
        const results = await ReviewService.list({ questId: this.questId, userId: this.$store.state.user._id, version: this.run.version }, { limit: 1 })
        const isReviewAlreadySent = results.data && results.data.length >= 1
        this.showAddReview = !isUserAuthor && !isReviewAlreadySent 
      }
      
      // get user old score
      this.score.old = this.$store.state.user.score
      this.initProgression()
    
      let endStatus = await RunService.endRun(this.run._id)
      if (endStatus && endStatus.data) {
        // assign computed score
        this.run.score = endStatus.data.score
        this.run.reward = endStatus.data.reward
        this.run.stars = endStatus.data.stars
        if (endStatus.data.newBonus && endStatus.data.newBonus !== '') {
          this.run.bonus = endStatus.data.newBonus
          this.showBonus = true
        }
      } else {
        this.warnings.noNetwork = true
      }
      
      // story management
      this.startStory()
      
      // get user new score
      //this.level.color = "secondary"
      this.score.new = runIsInProgress ? this.score.old + this.run.score : this.score.old
      utils.setTimeout(this.updateProgression, 3000)
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
      // delay animation if a modal is opened
      if (this.ranking.show || this.showChallenge || this.showBonus) {
        utils.setTimeout(this.updateProgression, 2000)
      } else {
        var newLevel = LevelCompute(this.score.new)
        // check if the user will move to a new level
        if (newLevel.level > this.level.level) {
          this.level.progress = 100
          this.$store.state.user.level = newLevel.level
          this.level = newLevel
          this.level.progress = 10
          this.level.upgraded = true
        } else {
          // get your updated score
          this.level = newLevel
        }
      }
    },
    /*
     * Get the ranking for this quest
     */
    async getRanking() {
      // do not launch with discovery quest
      if (this.questId !== '5b7303ec4efbcd1f8cb101c6') {
        var scores = await RunService.listPlayersForThisQuest(this.questId)
        
        if (scores && scores.data && scores.data.length > 0) {
          this.ranking.items = scores.data
          this.ranking.items.sort(this.compareScore)
          // compute position
          this.refreshPosition()
          utils.setTimeout(this.showRanking, 5000)
        }
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
        utils.setTimeout(this.updateRanking, 3000)
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
            utils.setTimeout(this.updateRanking, 500)
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
    /*
     * Open the challenge friends modal
     */
    async openChallengeBox() {
      this.showChallenge = true
      /*var challengers = await UserService.getBestFriends()
      if (challengers && challengers.data && challengers.data.length > 0) {
        this.bestFriends = challengers.data
      }*/
      var allFriends = await UserService.listFriends()
      if (allFriends && allFriends.data && allFriends.data.length > 0) {
        this.friends = allFriends.data
        this.filteredFriends = this.friends
      }
    },
    /*
     * Close the challenge friends modal
     */
    async closeChallenge() {
      this.showChallenge = false
    },
    /*
     * Challenge a friend
     */
    async challenge(friend) {
      await UserService.challengeFriend(friend.friendId, this.run._id)
      
      for (var i = 0; i < this.filteredFriends.length; i++) {
        if (this.filteredFriends[i].friendId === friend.friendId) {
          this.filteredFriends[i].isChallenged = true
          Vue.set(this.filteredFriends, i, this.filteredFriends[i])
        }
      }
      
      /*if (this.invitedFriends.id.indexOf(friend.friendId) === -1) {
        this.invitedFriends.name.push(friend.name)
        this.invitedFriends.id.push(friend.friendId)
      }
      // remove challenger from the list & reset the list
      for (var i = 0; i < this.friends.length; i++) {
        if (this.friends[i].friendId === friend.friendId) {
          this.friends.splice(i, 1)
        }
      }
      this.filteredFriends = this.friends*/
    },
    /*
     * Challenge all the user's friends
     */
    async challengeAll() {
      await UserService.challengeFriend('all', this.run._id)
    },
    /*
     * Close the bonus modal
     */
    async closeBonus() {
      this.showBonus = false
    },
    /*
     * Start the story
     */
    startStory() {
      if (this.story.step === null) {
        this.story.step = 9
        this.story.data = {
          score: this.run.score,
          level: this.$store.state.user.level,
          progress: this.level.progress,
          discovery: this.questId === '5b7303ec4efbcd1f8cb101c6'
        }
      }
    },
    /*
     * Send a review
     */
    async addReview() {
      if (this.rating === 0) {
        Notification(this.$t('label.PleaseRateTheQuest'), 'success')
        return false
      }
      
      this.$q.loading.show()
      await ReviewService.add(this.questId, this.run._id, this.comment, this.rating)
      // TODO: add error tracking
      this.$q.loading.hide()
      
      this.reviewSent = true
      Notification(this.$t('label.ReviewSent'), 'success')
    }
    /*
     * Search a friend
     *
    searchFriend(name, done) {
      // if email, add in the friends list, or search in friends list
      if (utils.isValidEmail(name)) {
        alert("ajouter email")
        this.invitedFriends.name.push(name)
        this.invitedFriends.id.push(name)
      } else {
        utils.setTimeout(() => {
          done(filter(name, {field: 'label', list: this.friends}))
        }, 1000)
        //this.filteredFriends = filter(name, {field: 'label', list: this.friends})
  //      done(this.filteredFriends)
      }
    },
    /*
     * Select a friend
     *
    selectFriend(friend) {
      if (this.invitedFriends.id.indexOf(friend.friendId) === -1) {
        this.invitedFriends.id.push(friend.friendId)
      }
    }*/
  }
}
</script>

<style lang="styl" scoped>

#main-view { display: flex; flex-flow: column nowrap; }

.share ul { margin: 0; padding: 0; display: flex; flex-flow: row nowrap; justify-content: center; }
.share li { list-style-type: none; margin: 0.5rem; }
.share img { width: 3rem; height: 3rem; }

.selected { background-color: #ddd; }

h3 { line-height: normal; margin: 0 auto 2vw auto; padding: 2vw; }

.bg-secondary p { text-align: left }

</style>
