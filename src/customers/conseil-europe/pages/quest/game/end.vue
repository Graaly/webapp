<template>
  <div class="scroll" style="color: #063b8b;">
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
        
    <div class="q-py-md" v-if="!warnings.noNetwork">
      <div class="centered q-pt-lg">
        <img src="statics/customers/conseil-europe/images/logo.png" />
      </div>
      <div class="centered subtitle2 q-pt-lg" v-if="$t('label.shortLang') === 'fr'">
        Bravo, vous avez réussi !
      </div>
      <div class="centered subtitle2 q-pt-lg" v-if="$t('label.shortLang') === 'en'">
        Congratulations, you win the game!
      </div>
      <div class="centered subtitle3 q-mt-lg q-py-md" style="background-color: #063b8b; color :#fff;">
        <div v-if="$t('label.shortLang') === 'en'">
          Your time
        </div>
        <div v-if="$t('label.shortLang') === 'fr'">
          Votre temps de jeu
        </div>
        <div v-if="run && run.duration && (run.duration.m || run.duration.h)">
          {{ run.duration.h }}h {{ run.duration.m }}m 
        </div>
      </div>
      
      <!------------------ NEW QUEST WON AREA ------------------------>
      
      <div v-if="unlockedQuest.show" class="centered q-mt-md subtitle5">
        <span class="text-primary">{{ $t('label.YouWonNewGame') }}</span>
        <div class="centered q-pa-md">
          <q-btn color="primary" class="glossy" :label="$t('label.SolveThisQuest')" @click="$router.push('/quest/play/' + unlockedQuest.id)" />
        </div>
      </div>
            
    </div>
         
    <div v-if="!warnings.noNetwork">
      <div>
        <!------------------ REVIEW AREA ------------------------>
        
        <div class="centered">
          <div class="subtitle4">{{ $t('label.ReviewThisQuest') }}</div>
          <div class="q-py-sm"><q-rating v-model="rating" :max="5" size="1rem" class="end-rating" color="blue-10" :disable="reviewSent" @click="showReviewText = true" /></div>
        </div>
        <q-dialog v-model="showReviewText" class="over-map">
          <div class="q-pa-md q-pt-lg centered bg-grey">
            <div class="subtitle4">{{ $t('label.ReviewThisQuest') }}</div>
            <div class="q-py-sm"><q-rating v-model="rating" :max="5" size="1rem" class="end-rating" color="white" :disable="reviewSent" /></div>
            <div class="subtitle6 q-pt-lg">
              <span v-if="$t('label.shortLang') === 'fr'">Vos commentaires</span>
              <span v-if="$t('label.shortLang') === 'en'">Your comments</span>
              ({{ $t('label.Optional') }}){{ $t('label.Colon') }}</div>
            <textarea class="shadowed full-width q-my-sm" v-model="comment" rows="4" :disabled="reviewSent" />
            <q-btn class="glossy large-button" color="primary" :label="$t('label.Send')" @click="addReview()" :disabled="reviewSent" />
            <div class="q-pa-md">
              <a @click="showReviewText = false">{{ $t('label.Cancel') }}</a>
            </div>
          </div>
        </q-dialog>
        
        <!------------------ COMMENTED VISITS ------------------------>
        
        <div class="centered subtitle3 q-mt-md" style="background-color: #063b8b; color :#fff;">
          <div class="subtitle3 q-pa-md" v-if="$t('label.shortLang') === 'fr'">
            Découvrez l'intérieur des bâtiments avec nos visites virtuelles commentées
          </div>
          <div class="subtitle3 q-pa-md" v-if="$t('label.shortLang') === 'en'">
            Discover our virtual visits
          </div>
          <div class="q-pt-sm">
            <a href="https://www.coe.int/fr/web/about-us/virtual-visits" target="_blank">
              <img src="statics/customers/conseil-europe/images/visites.png" />
            </a>
          </div>
        </div>
        
        <!------------------ REWARD AREA ------------------------>
        
        <div class="q-pa-md q-mt-lg centered rounded background-lighter2" v-if="showReward && run && run.questData">      
          <div class="subtitle4 q-pb-lg">{{ $t('label.YouWonAReward') }}</div>
          <div class="q-pt-md">
            <img class="badge-alone" :src="serverUrl + '/upload/quest/' + run.questData.rewardPicture">
            <div class="subtitle6">{{ $t('label.WonOtherRewardByPlayingOtherGamesInCity') }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!--====================== WIN COINS ANIMATION =================================-->
      
    <!--<div v-if="level.upgraded" class="fadein-message">+100 <q-icon color="white" name="fas fa-bolt" /></div>-->
        
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import ReviewService from 'services/ReviewService'
import RunService from 'services/RunService'
import UserService from 'services/UserService'
import LevelCompute from 'boot/LevelCompute'
import Notification from 'boot/NotifyHelper'
import Vue from 'vue'
import suggest from 'components/quest/suggest'
import userCard from 'components/user/userCard'
import utils from 'src/includes/utils'
import Moment from "moment"

export default {
  components: {
    suggest,
    userCard
  },
  data() {
    return {
      title: 'Enquête réussie',
      rating: 0,
      comment: '',
      ranking: {
        show: false,
        items: [],
        position: "-"
      },
      score: {},
      nbQuestions: 0,
      nbGoodAnwers: 0,
      level: {
        color: "white",
        upgraded: false
      }, 
      run: {
        score: 0,
        stars: 1
      },
      endDate: '',
      quest: null,
      friends: [],
      filteredFriends: [],
      invitedFriends: {
        id: [],
        name: []
      },
      unlockedQuest: {
        show: false,
        id: 0
      },
      author: null,
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
      isHybrid: window.cordova,
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted () {
    utils.clearAllRunningProcesses()
    await this.loadData()
    // hide status bar on Android
    if (this.isHybrid && cordova.platformId === 'android') {
      StatusBar.hide()
    }
    
    // compute end date
    let date = new Date()
    this.endDate = Moment(date).format('DD/MM/YYYY, h:mm:ss')
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

        // get quest data
        var quest
        if (this.run && this.run.version) {
          quest = await QuestService.getByIdOnline(this.questId, this.run.version)
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
        // compute good answers
        await this.computeGoodAnswers()
        
        // get user old score
        this.score.old = this.$store.state.user.points
        if (!this.score.old) {
          this.score.old = 0
        }
        this.initProgression()
        
        // get offline run data
        const offlineRunData = await this.getOfflineRunData()
        
        // end the run
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
          // check if new quest unlocked
          if (endStatus.data.unlockedQuest) {
            this.unlockedQuest.show = true
            this.unlockedQuest.id = endStatus.data.unlockedQuest
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
        
        // get ranking without the user (status of run is still in-progress)
        await this.getRanking()

        // get duration
        const duration = utils.getDurationFromNow(this.run.dateCreated)
        Vue.set(this.run, 'duration', {h: duration.h, m: duration.m})
        this.getAuthorProfile()
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
      if (this.showChallenge || this.showBonus) {
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
        
        if (scores && scores.data) {
          this.ranking.position = scores.data
        }
        /*if (scores && scores.data && scores.data.length > 1) {
          this.ranking.items = scores.data
          this.ranking.items.sort(this.compareScore)
          // compute position
          this.refreshPosition()
          utils.setTimeout(this.showRanking, 5000)
        }*/
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
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getAuthorProfile() {
      let author = await UserService.getFriend(this.quest.authorUserId)
      if (author && author.data && author.data.status !== 'friend') {
        this.author = author.data
      }
    },
    /*
     * get profile image
     */
    getProfileImage () {
      if (this.author.picture && this.author.picture.indexOf('http') !== -1) {
        return this.author.picture
      } else if (this.author.picture) {
        return this.serverUrl + '/upload/profile/' + this.author.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    },
    /*
     * Follow a user
     */
    async follow () {
      if (this.$store.state.user.name !== '-') {
        let addFriendStatus = await UserService.addFriend(this.quest.authorUserId)

        if (addFriendStatus) {
          if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
            Notification(this.$t('label.InvitationSent'), 'success')
          } else {
            Notification(this.$t('label.FriendsAdded'), 'success')
          }
          // hide the user to avoid user add him again as friend
          Vue.set(this.author, 'status', 'friend')
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
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
     * Compute number of good answers
     */
    async computeGoodAnswers() {
      const conditionsDone = this.run.conditionsDone
      let nbQuestions = 0
      let nbGoodAnwers = 0
      for (var i = 0; i < conditionsDone.length; i++) {
        if (conditionsDone[i].indexOf('stepSuccess_') !== -1) {
          nbQuestions++
          nbGoodAnwers++
        } else if (conditionsDone[i].indexOf('stepFail_') !== -1) {
          nbQuestions++
        }
      }
      this.nbQuestions = nbQuestions
      this.nbGoodAnwers = nbGoodAnwers
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
  }
}
</script>
