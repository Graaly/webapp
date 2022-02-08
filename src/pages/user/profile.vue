<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg">
      <div class="q-py-sm q-px-md dark-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        <q-btn flat v-if="$store.state.user.id === userId" class="float-right" icon="settings" @click="updateProfile()" />
      </div>
      <div class="centered">
        <div class="user-card user-card-big main-profile relative-position">
          <div class="relative-position" :style="'background: url(' + getProfileImage() + ' ) center center / cover no-repeat '">
            <div v-if="user.statistics && user.statistics.nbQuestsCreated && user.statistics.nbQuestsCreated > 0" class="profile-item-creator">
              <img src="statics/images/icon/profile-puzzle.svg" />
            </div>
            <div v-if="user.statistics && user.statistics.nbQuestsSuccessful && user.statistics.nbQuestsSuccessful > 0" class="profile-item-level">
              <img :src="'statics/images/icon/level' + user.level + '.svg'" />
            </div>
          </div>
          <div class="centered subtitle3 q-mt-lg">
            {{ user.name }}
          </div>
          <div class="centered subtitle6 q-mt-sm" v-if="user.location && (user.location.postalCode || user.location.country)">
            <span v-if="user.location.postalCode">{{ user.location.postalCode }}</span>
            <span v-if="user.location.postalCode && user.location.country">, </span>
            <span v-if="user.location.country">{{ user.location.country }}</span>
          </div>
        </div>
      </div>
      <div v-if="user.description" class="q-pa-md subtitle6">
        {{ user.description }}
      </div>
      <div class="centered q-pa-md" v-if="$store.state.user.id !== userId">
        <q-btn
           v-if="!user.status || user.status !== 'friend'"
          class="glossy large-btn"
          color="primary"
          :label="$t('label.Follow')"
          @click="follow" />
        <div v-if="user.status && user.status === 'friend'" class="centered">
          <q-chip class="glossy" color="primary" text-color="white" icon-right="star">
            {{ $t('label.Followed') }}
          </q-chip>
          <div class="q-pt-sm">
            <a @click="removeFriend">{{ $t('label.DoNotFollowAnymore') }}</a>
          </div>
        </div>
      </div>
      <div>
        <div class="centered bg-warning q-pa-sm" v-if="warnings.listCreatedQuestsMissing" @click="listCreatedQuests($store.state.user._id)">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
      </div>
      <!--<div v-if="$store.state.user.id === userId">
        <div v-if="quests.built.rejected && quests.built.rejected.length > 0">
          <!--====================== MY QUESTS REJECTED =================================--

          <titleBar :title="{text: $t('label.YourRejectedQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.rejected"></questsList>

        </div>
        <div v-if="quests.built.tovalidate && quests.built.tovalidate.length > 0">
          <!--====================== MY QUESTS TO VALIDATE =================================--

          <titleBar :title="{text: $t('label.YourUnderValidationQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.tovalidate"></questsList>

        </div>
        <div>
          <!--====================== MY QUESTS DRAFT =================================--

          <titleBar :title="{text: $t('label.YourDraftQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :add="true" :quests="quests.built.draft"></questsList>

        </div>
        <div v-if="quests.built.published && quests.built.published.length > 0">
          <!--====================== MY QUESTS PUBLISHED =================================--

          <titleBar :title="{text: $t('label.YourPublishedQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.published"></questsList>

        </div>
      </div>-->
      <div v-if="$store.state.user.id === userId">
        <!--====================== QUESTS CREATED BY CURRENT USER =================================-->

        <titleBar :title="{text: $t('label.EscapeGames'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

        <questsList format="small" color="red" :add="true" :quests="quests.built"></questsList>
      </div>
      <div v-if="$store.state.user.id !== userId && quests && quests.built && quests.built.length > 0">
        <!--====================== QUESTS CREATED BY OTHER USER =================================-->

        <titleBar :title="{text: $t('label.EscapeGames'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

        <questsList format="big" color="red" :quests="quests.built"></questsList>
      </div>
      <div v-if="badges === null || badges.length > 0">
        <!--====================== BADGES WON =================================-->

        <titleBar :title="{text: $t('label.Badges'), type: 'badge'}" :link="{text: $t('label.SeeMore')}" @click="readMoreBadges"></titleBar>

        <badgesList format="scroll" :badges="badges"></badgesList>
      </div>
      <div v-if="quests.played === null || quests.played.length > 0">
        <!--====================== QUESTS PLAYED =================================-->

        <titleBar :title="{text: $t('label.SolvedQuests'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPlayed"></titleBar>

        <questsList format="small" :quests="quests.played"></questsList>
      </div>
      <div v-if="friends.list === null || friends.list.length > 0 || $store.state.user.id === userId">
        <!--====================== FRIENDS =================================-->

        <titleBar :title="{text: $t('label.YouFollowThem'), type: 'friend'}" :link="{text: $t('label.SeeMore')}" @click="readMoreAllFriends"></titleBar>

        <usersList format="scroll" :add="$store.state.user.id === userId ? true : false" :users="friends.list" @refresh="loadFriends"></usersList>
      </div>
      <div v-if="$store.state.user.id === userId">
        <div class="centered q-mt-xl q-mb-sm cursor-pointer"><a @click="disconnect()">{{ $t('label.SignOut') }}</a></div>
        <div class="centered q-mb-sm" v-html="$t('label.TermsAndConditionsLink')"></div>
        <div class="centered q-mb-xl" v-html="$t('label.PrivacyPolicyLink')"></div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from 'services/UserService'
import QuestService from 'services/QuestService'
import Notification from 'boot/NotifyHelper'
//import utils from 'src/includes/utils'
import titleBar from 'components/titleBar'
import questsList from 'components/quest/questsList'
import usersList from 'components/user/usersList'
import badgesList from 'components/user/badgesList'
import Vue from 'vue'

export default {
  components: {
    titleBar,
    questsList,
    usersList,
    badgesList
  },
  data () {
    return {
      user: {
        position: null,
        proposeAQuest: true
      },
      userId: null,
      friends: {
        list: null,
        show: false
      },
      quests: {
        played: null,
        built: null,
        createdNb: 0
      },
      badges: null,
      warnings: {
        listCreatedQuestsMissing: false,
        listFriendsMissing: false
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    if (this.$route.params.id === 'me') {
      this.userId = this.$store.state.user.id
    } else {
      this.userId = this.$route.params.id
    }

    // Get data of the user
    this.getProfile()
    // get list of quests created by the user
    this.listCreatedQuests()
    // get the list of qusts played by the user
    this.listPlayedQuests()
    // get friends of the user
    this.loadFriends()
    // get badges
    this.loadBadges()
    // get organisation of the user
    //await this.loadOrganization()
  },
  methods: {
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getProfile() {
      if (this.userId === this.$store.state.user.id) {
        this.user = {
          name: this.$store.state.user.name,
          email: this.$store.state.user.email,
          description: this.$store.state.user.description,
          phone: this.$store.state.user.phone ? this.$store.state.user.phone : '',
          picture: this.$store.state.user.picture,
          zipCode: this.$store.state.user.location.postalCode,
          country: this.$store.state.user.location.country,
          language: this.$store.state.user.language,
          statistics: this.$store.state.user.statistics,
          level: this.$store.state.user.level
        }

        if (this.user.name === '-') {
          this.updateProfile()
        }

        /*/ check if user can change his email
        if (this.$store.state.user.provider && this.$store.state.user.provider.name !== 'graaly') {
          this.profile.userCanChangeEmail = false
          this.profile.userCanChangePassword = false
        }*/
      } else {
        let friend = await UserService.getFriend(this.userId)
        if (friend && friend.data) {
          this.user = friend.data
        }
      }
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async listCreatedQuests(id) {
      this.warnings.listCreatedQuestsMissing = false
      var response = await QuestService.ListCreatedByAUser(this.userId)
      /*this.quests.built = {
        rejected: [],
        tovalidate: [],
        draft: [],
        published: []
      }*/
      this.quests.built = []

      if (response && response.data) {
        if (response.data.length > 0) {
          this.quests.createdNb = response.data.length
          // avoid to display all version of a quest
          var myQuestsId = []
          this.quests.built = []
          for (var i = 0; i < response.data.length; i++) {
            if (myQuestsId.indexOf(response.data[i].questId) === -1) {
              this.quests.built.push(response.data[i])
              myQuestsId.push(response.data[i].questId)
            }
          }
          /*for (var i = 0; i < response.data.length; i++) {
            var quest = response.data[i]
            if (quest.status === 'published') {
              this.quests.built['published'].push(quest)
            } else if (quest.status === 'rejected') {
              this.quests.built['rejected'].push(quest)
            } else if (quest.status === 'tovalidate') {
              this.quests.built['tovalidate'].push(quest)
            } else {
              this.quests.built['draft'].push(quest)
            }
          }*/
        }
      } else {
        this.warnings.listCreatedQuestsMissing = true
      }
    },
    /*
     * Get the list of the quests played by the user
     * @param   {string}    id            ID of the user
     */
    async listPlayedQuests() {
      let response = await QuestService.ListPlayedByAUser(this.userId)
      if (response && response.data) {
        this.quests.played = this.formatRunResults(response.data)
      }
    },
    formatRunResults(results) {
      var formatedResults = []
      for (var i = 0; i < results.length; i++) {
        formatedResults.push({
          questId: results[i].questId,
          picture: results[i].questData.picture,
          title: results[i].questData.title,
          location: {
            town: results[i].questData.town
          },
          playStatus: results[i].status ? results[i].status : 'succeeded',
          points: results[i].stars
        })
      }
      return formatedResults
    },
    /*
     * List friends
     */
    async loadFriends() {
      this.warnings.listFriendsMissing = false
      let response = await UserService.listFriends(this.userId, 0, 10)

      if (response && response.data) {
        this.friends.list = response.data
      } else {
        this.warnings.listFriendsMissing = true
      }
    },
    /*
     * List badges
     */
    async loadBadges() {
      const response = await UserService.getRewards(this.userId, 'won')
      if (response && response.data) {
        this.badges = response.data
      }
    },
    /*
     * Load organization data
     */
    async loadOrganization() {
      if (this.$store.state.user.organizationId) {
        const organizationData = await UserService.getOrganization()
        if (organizationData) {
          this.user.organization = organizationData.data
        }
      }
    },
    /*
     * Follow a user
     */
    async follow () {
      if (this.$store.state.user.name === '-') {
        this.updateProfile()
      } else {
        let addFriendStatus = await UserService.addFriend(this.userId)

        if (addFriendStatus) {
          if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
            Notification(this.$t('label.InvitationSent'), 'success')
          } else {
            Notification(this.$t('label.FriendsAdded'), 'success')
          }
          // hide the user to avoid user add him again as friend
          Vue.set(this.user, 'status', 'friend')
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Display all quests published
     */
    async readMoreQuestPublished() {
      this.$router.push('/user/' + this.userId + '/quests/created')
    },
    /*
     * Display all quests played
     */
    async readMoreQuestPlayed() {
      this.$router.push('/user/' + this.userId + '/quests/played')
    },
    /*
     * Display all the badges
     */
    async readMoreBadges() {
      this.$router.push('/user/' + this.userId + '/badges')
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      if (this.userId === this.$store.state.user.id) {
        this.$router.push('/home')
      } else {
        this.$router.back()
      }
    },
    /*
     * List all friends
     */
    readMoreAllFriends() {
      this.$router.push('/user/' + this.userId + '/friends')
    },
    /*
     * get profile image
     */
    getProfileImage () {
      if (this.user.picture && this.user.picture.indexOf('http') !== -1) {
        return this.user.picture
      } else if (this.user.picture) {
        return this.uploadUrl + '/upload/profile/' + this.user.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    },
    buildQuest() {
      this.$router.push('/quest/create/welcome')
    },
    updateProfile() {
      this.$router.push('/user/updateprofile')
    },
    /*
     * Disconnection
     */
    disconnect() {
      this.$router.push('/user/logout')
    },
    /*
     * Stop following a friend
     */
    async removeFriend () {
      const friendId = this.userId
      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureYouWantToRemoveThisFriend'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await UserService.removeFriend(friendId)
        Vue.set(this.user, 'status', 'normal')
      })
    }
  }
}
</script>
