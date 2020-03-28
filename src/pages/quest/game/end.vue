<template>
  <div class="scroll background-dark">
    <!------------------ NO NETWORK AREA ------------------------>
    <div v-if="warnings.noNetwork">
      <div class="bg-primary">
        <div class="centered q-pa-lg">    
          <h2 class="text-center size-3 q-mt-xl q-mb-sm">{{ $t('label.YouHaveWin') }}</h2>
          {{ $t('label.ToSaveYouScoreYouNeedToConnect') }}
          <q-btn icon="refresh" class="q-mt-md" color="accent" @click="loadData" :label="$t('label.ConnectToComputeScore')" />
        </div>
      </div>
    </div>
    
    <!------------------ TEXT IF NO SCORING ------------------>
    
    <div class="q-ma-md rounded background-lighter2" v-if="!warnings.noNetwork && quest && quest.customization && quest.customization.removeScoring">
      <div>
        <h4 v-if="quest.customization && quest.customization.endMessage && quest.customization.endMessage !== ''" v-html="quest.customization.endMessage" />
        <h4 v-if="!quest.customization || !quest.customization.endMessage || quest.customization.endMessage === ''">{{ $t('label.ThanksForPlaying') }}</h4>
      </div>
      <div v-if="isUserAuthor" class="back centered q-pa-md">
        <q-btn color="primary" class="glossy large-button" :label="$t('label.BackToBuilder')" @click="$router.push('/quest/builder/' + questId)" />
      </div>
      <div v-if="isUserAdmin" class="back centered q-pa-md">
        <q-btn color="primary" class="glossy large-button" :label="$t('label.GoToQuestValidation')" @click="openValidation(questId, quest.version)"></q-btn>
      </div>
    </div>
    
    <div v-if="isUserAuthor" class="back centered q-pa-md">
      <q-btn color="primary" class="glossy large-button" :label="$t('label.BackToBuilder')" @click="$router.push('/quest/builder/' + questId)" />
    </div>
        
    <div class="q-pa-md" style="margin-top: 50px;" v-if="!isUserAuthor && !warnings.noNetwork && quest && !(quest.customization && quest.customization.removeScoring)">
      <div v-if="run && run._id">
        <div class="relative-position header-point-box">
          <!------------------ TITLE AREA ------------------------>
          <div class="rounded background-lighter2 centered absolute full-width">    
            <h2 class="text-center title2 q-mt-xl q-mb-sm q-mx-xl text-uppercase">{{ $t('label.YouWin') }}</h2>
            <!--<h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.score > 0 || run.reward === 0">{{ run.score }} {{ $t('label.points') }} <!--<q-icon color="white" name="fas fa-trophy" />--</h2>-->
            <!--<h2 class="size-1 q-mt-sm q-mb-sm" v-show="run.reward > 0">{{ run.reward }} <q-icon color="white" name="fas fa-bolt" /></h2>-->
            <!--<router-link to="/help/points" v-show="run.score > 0">{{ $t('label.WhatCanYouDoWithThesePoints') }}</router-link>-->
            <div class="relative-position progress-box q-mb-md">
              <div class="progress-bar">
                <div class="progress" :style="'width: ' + Math.floor(level.progress * 100) + '%'">
                </div>
                <div class="value">
                  {{ Math.floor(level.progress * 100) }}%
                </div>
              </div>
              <div class="rank-level">
                <img :src="'statics/images/icon/level' + $store.state.user.level + '.svg'" />
              </div>
            </div>
          </div>
          <div class="full-width centered header-point absolute">
            <img src="statics/images/icon/wonpoint.png" />
            <div>+{{ run.stars }}</div>
          </div>
        </div>
        
        <!------------------ SUGGESTION AREA ------------------------>
        
        <div class="centered q-mt-md subtitle5">{{ $t('label.YouLikedThisQuest') }}</div>
        <div class="centered q-px-md">
          <span v-show="quest.type !== 'discovery' && run.score > 0 && quest && quest.access === 'public'">
            <a class="small" @click="openChallengeBox">{{ $t('label.ChallengeYourFriends') }}</a> <span class="secondary-font-very-small"> {{ $t('label.or') }} </span>
          </span>
          <a class="small" @click="suggestQuest.show = true">{{ $t('label.SuggestANewQuest') }}</a>
        </div>
        <q-dialog maximized v-model="suggestQuest.show">
          <suggest @close="suggestQuest.show = false"></suggest>
        </q-dialog>
        
        <!------------------ REVIEW AREA ------------------------>
        
        <div class="q-mx-md q-mt-xl q-pa-sm centered" v-if="quest.type !== 'discovery' && showAddReview && quest && quest.access === 'public'">
          <div class="subtitle4">{{ $t('label.ReviewThisQuest') }}</div>
          <div class="q-py-sm"><q-rating v-model="rating" :max="5" size="1rem" class="end-rating" color="white" :disable="reviewSent" @click="showReviewText = true" /></div>
        </div>
        <q-dialog v-model="showReviewText" class="over-map">
          <div class="q-pa-md q-pt-lg centered bg-grey">
            <div class="subtitle4">{{ $t('label.ReviewThisQuest') }}</div>
            <div class="q-py-sm"><q-rating v-model="rating" :max="5" size="1rem" class="end-rating" color="white" :disable="reviewSent" /></div>
            <div class="subtitle6 q-pt-lg">{{ $t('label.CommentThisQuest') }} ({{ $t('label.Optional') }}){{ $t('label.Colon') }}</div>
            <textarea class="shadowed full-width q-my-sm" v-model="comment" :placeholder="$t('label.Feedback')" rows="4" :disabled="reviewSent" />
            <q-btn class="glossy large-button" color="primary" :label="$t('label.Send')" @click="addReview()" :disabled="reviewSent" />
            <div class="q-pa-md">
              <a @click="showReviewText = false">{{ $t('label.Cancel') }}</a>
            </div>
          </div>
        </q-dialog>
        
        <!------------------ REWARD AREA ------------------------>
        
        <div class="q-pa-md q-mt-lg centered rounded background-lighter2" v-if="showReward && run && run.questData">      
          <div class="subtitle4 q-pb-lg">{{ $t('label.YouWonAReward') }}</div>
          <div class="q-pt-md">
            <img class="badge-alone" :src="serverUrl + '/upload/quest/' + run.questData.rewardPicture">
            <div class="subtitle6">{{ $t('label.WonOtherRewardByPlayingOtherGamesInCity') }}</div>
          </div>
        </div>
        
        <!------------------ SHARE AREA ------------------------>
        
        <!--<div class="share bg-secondary q-mt-md q-ml-md q-mr-md q-pa-sm centered">
          <h3 class="size-2 q-ma-sm">{{ $t('label.ShareYourSuccess') }}</h3>
          <ul>
            <li>
              <a @click="utils.openExternalLink('https://www.facebook.com/sharer/sharer.php?u=http://graaly.com')" target="_blank">
                <img src="statics/icons/social-networks/facebook.png" />
              </a>
            </li>
            <li>
              <a @click="utils.openExternalLink('https://twitter.com/intent/tweet?text=To%Define&url=http://graaly.com')" target="_blank">
                <img src="statics/icons/social-networks/twitter.png" />
              </a>
            </li>
            <li>
              <a @click="utils.openExternalLink('https://plus.google.com/share?url=http://graaly.com')" target="_blank">
                <img src="statics/icons/social-networks/googleplus.png" />
              </a>
            </li>
          </ul>
        </div>-->
     
        <!------------------ BACK TO MAP LINK AREA ------------------------>
        
        <div class="back centered q-pa-md">
          <q-btn color="primary" class="glossy large-button" :label="$t('label.BackToTheMap')" @click="$router.push('/home')" />
        </div>
        <div v-if="isUserAdmin" class="back centered q-pa-md">
          <q-btn color="primary" class="glossy large-button" :label="$t('label.GoToQuestValidation')" @click="$router.push('/admin/validate/' + questId + '/version/' + quest.version)" />
        </div>
        
      </div>
      <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork" @click="loadData()">
        <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
      </div>
    </div>
    <!------------------ RANKING AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom q-pa-md" v-show="ranking.show">
        <a class="float-right no-underline close-btn" color="grey" @click="ranking.show = false"><q-icon name="close" class="medium-icon" /></a>
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Ranking') }}</div>
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
      <div class="panel-bottom q-pa-md bg-graaly-blue-dark" v-show="showChallenge">      
        <a class="float-right no-underline" color="grey" @click="closeChallenge"><q-icon name="close" class="subtitle3" /></a>
        <div class="subtitle3 q-pt-md q-pb-lg">{{ $t('label.ChallengeYourFriends') }}</div>
        <div v-if="filteredFriends.length === 0">
          {{ $t('label.NoFriendsLong') }}
        </div>
        <div v-if="filteredFriends.length > 0">
          <div class="q-pa-md centered">
            <q-btn color="primary" class="glossy large-button" full @click="challengeAll" :label="$t('label.ChallengeAllFriends')" />
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
                  <q-btn v-show="!friend.isChallenged" color="primary" class="normal-button glossy" :label="$t('label.Challenge')" @click="challenge(friend)" />
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
        <div class="text-h4 q-pt-md q-pb-lg centered">{{ $t('label.YouWonABonus') }}</div>
        <div class="q-pa-md text-primary">
          <q-card class="q-ma-sm">
            <img :src="'statics/icons/game/bonus_' + run.bonus + '.png'">
            <q-card-section>
              <div class="text-h6">{{ $t('bonus.' + run.bonus) }}</div>
            </q-card-section>
            <q-card-section>
              {{ $t('bonus.' + run.bonus + 'Desc') }}
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" class="glossy normal-button" @click="closeBonus"><div>{{ $t('label.Close') }}</div></q-btn>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </transition>
    
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
import suggest from 'components/quest/suggest'
import utils from 'src/includes/utils'

export default {
  components: {
    suggest
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
      quest: null,
      friends: [],
      filteredFriends: [],
      invitedFriends: {
        id: [],
        name: []
      },
      questId: this.$route.params.questId,
      awardPoints: true,
      showChallenge: false,
      showBonus: false,
      showReward: false,
      showAddReview: false,
      showReviewText: false,
      reviewSent: false,
      isUserAuthor: false,
      isUserAdmin: this.$store.state.user.isAdmin,
      warnings: {
        noNetwork: false
      },
      suggestQuest: {
        show: false
      },
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted () {
    utils.clearAllRunningProcesses()
    await this.loadData()
    // hide status bar on Android
    if (cordova.platformId === 'android') {
      StatusBar.hide()
    }
  },
  methods: {
    /*
     * Init score & level
     */
    async loadData() {
      this.warnings.noNetwork = false
      var runIsInProgress = false
      this.$q.loading.show()
      
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.questId)
      if (runs) {
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
        var quest
        if (this.run && this.run.version) {
          quest = await QuestService.getById(this.questId, this.run.version)
        } else {
          quest = await QuestService.getLastById(this.questId)
        }
        if (quest && quest.data) {
          this.quest = quest.data
        }
        
        if (quest && quest.data) {
          // show review part only if player is not author & has not already sent a review for this quest
          this.isUserAuthor = this.$store.state.user._id === this.quest.authorUserId
          const results = await ReviewService.list({ questId: this.questId, userId: this.$store.state.user._id, version: this.run.version }, { limit: 1 })
          const isReviewAlreadySent = results.data && results.data.length >= 1
          this.showAddReview = !this.isUserAdmin && !this.isUserAuthor && !isReviewAlreadySent
        }
        
        // get user old score
        this.score.old = this.$store.state.user.points
        if (!this.score.old) {
          this.score.old = 0
        }
        
        this.initProgression()
        
        // get offline run data
        const offlineRunData = await this.getOfflineRunData()
      
        let endStatus = await RunService.endRun(this.run._id, offlineRunData, this.questId, this.quest.version, this.quest.mainLanguage)
        if (endStatus && endStatus.data) {
          if (!this.quest.customization || !this.quest.customization.removeScoring) {
            // assign computed score
            this.run.score = endStatus.data.score
            this.run.reward = endStatus.data.reward
            this.run.stars = endStatus.data.stars
            if (endStatus.data.newBonus && endStatus.data.newBonus !== '') {
              this.run.bonus = endStatus.data.newBonus
              this.showBonus = true
            }
            if (this.run.questData && this.run.questData.rewardPicture && this.run.questData.rewardPicture !== '') {
              this.showReward = true
            }
          }
          
          // remove offline data
          await this.removeOfflineData()
        } else {
          this.warnings.noNetwork = true
        }
        
        // if run is not loaded, load it again
        if (!this.run._id) {
          runs = await RunService.listForAQuest(this.questId)
          if (runs && runs.data && runs.data.length > 0) {
            this.run = runs.data[0]
          }
        }
        
        if (!this.quest.customization || !this.quest.customization.removeScoring) {
          // get user new score
          //this.level.color = "secondary"
          this.score.new = runIsInProgress ? this.score.old + this.run.stars : this.score.old

          // force score update
          this.$store.state.user.points = this.score.new
          utils.setTimeout(this.updateProgression, 3000)
        }
      } else {
        // no network
        this.warnings.noNetwork = true
      }
      this.$q.loading.hide()
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
          this.level.progress = 1
          this.$store.state.user.level = newLevel.level
          this.level = newLevel
          this.level.progress = 0.1
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
      // only connected user can challenge
      if (this.$store.state.user.name === '-') {
        this.$router.push("/user/updateprofile")
      } else {
        this.showChallenge = true
        /*var challengers = await UserService.getBestFriends()
        if (challengers && challengers.data && challengers.data.length > 0) {
          this.bestFriends = challengers.data
        }*/
        var allFriends = await UserService.listFriends(this.$store.state.user._id, 0, 100)
        if (allFriends && allFriends.data && allFriends.data.length > 0) {
          this.friends = allFriends.data
          this.filteredFriends = this.friends
        }
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
     * Close the reward modal
     */
    async closeReward() {
      this.showReward = false
    },
    /*
     * Open validation page
     */
    openValidation(questId, version) {
      this.$router.push('/admin/validate/' + questId + '/version/' + version)
    },
    /*
     * Send a review
     */
    async addReview() {
      if (this.rating === 0) {
        Notification(this.$t('label.PleaseRateTheQuest'), 'warning')
        return false
      }
      
      this.$q.loading.show()
      await ReviewService.add(this.questId, this.run.version, this.run._id, this.comment, this.rating)
      // TODO: add error tracking
      this.$q.loading.hide()
      
      this.reviewSent = true
      this.showReviewText = false
      Notification(this.$t('label.ReviewSent'), 'positive')
    },
    /*
     * get offline run data
     */
    async getOfflineRunData() {
      const run = await utils.readFile(this.questId, 'run_' + this.questId + '.json')

      if (!run) {
        return false
      } else {
        return JSON.parse(run)
      }
    },
    /*
     * Remove offline data
     */
    async removeOfflineData() {
      const success = await utils.removeDirectory(this.questId)
      
      await this.removeQuestFromOfflineList(this.questId)

      return success
    },
    /*
     * Add the quest in the offline quests list
     */
    async removeQuestFromOfflineList(questId) {
      // check if quests file exists
      const isQuestOfflineListExisting = await utils.checkIfFileExists('', 'quests.json')
      var quests

      if (isQuestOfflineListExisting) {
        const questFileContent = await utils.readFile('', 'quests.json')

        quests = JSON.parse(questFileContent)
        
        // check if quest is already existing in file
        var questPosition = -1
        for (var i = 0; i < quests.list.length; i++) {
          if (quests.list[i].questId === questId) {
            questPosition = i
          }
        }
        
        if (questPosition !== -1) {
          quests.list.splice(questPosition, 1)
        }
        
        // save quests list
        await utils.writeInFile('', 'quests.json', JSON.stringify(quests), true)
      }
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
