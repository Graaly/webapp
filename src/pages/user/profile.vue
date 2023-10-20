<template>
  <div class="scroll background-profil" >

    <!--====================== FRIENDS / CREATORS QUESTS =================================-->

    <div class="profil friends" v-if="$store.state.user.id !== userId">
      <div class="profil-photo-center" :style="'background: url(' + getProfileImage() + ' ) center center / cover no-repeat '">
      </div>
      <div class="flex column items-center justify-center text-center q-mt-lg">
        <div v-if="user.statistics && user.statistics.nbQuestsSuccessful && user.statistics.nbQuestsSuccessful > 0" class="item-level">
          <img :src="'statics/images/icon/level' + user.level + '.svg'" />
        </div>
        <div class="subtitle3">{{ user.name }}</div>
        <div class="subtitle4" v-if="user.email">{{ user.email }}</div>
        <div>Score : {{ user.score }}</div>
        <div v-if="user.description" class="q-pa-md subtitle6">
          {{ user.description }}
        </div>
      </div>
      <div style="max-width: 300px; margin: 24px auto 0;">
        <text-btn-square
          v-if="!user.status || user.status !== 'friend'"
          class="q-mb-lg"
          @click.native="follow()"
          :title="$t('label.Follow')"
          color="accent"
          icon="done"
        />
        <text-btn-square
          v-else
          class="q-mb-lg"
          @click.native="removeFriend()"
          :title="$t('label.DoNotFollowAnymore')"
          color="accent"
          icon="done"
        />
      </div>
      
      <!--====================== CREDITS =================================-->
      
      <user-credits
        v-if="isAdmin"
        :credits="user.credits"
        :canAdd="isAdmin"
        :userId="userId"
        @refresh="refresh"
      />

      <!--====================== QUESTS CREATED BY OTHER USER =================================-->

      <div v-if="$store.state.user.id !== userId && quests && quests.built && quests.built.length > 0">
        <quest-list
          :quests="quests.built"
          :title="$t('label.EscapeGame')"
          icon="extension"
          :max-show="250"
          color="accent"
        />
      </div>
    </div>

    <!--====================== PLAYER PROFIL =================================-->

    <div class="profil q-px-md q-pb-lg" v-else>
      <icon-btn-square icon="settings" color="accent" fill @click.native="updateProfile()" class="float-right q-pa-md q-pb-lg"/>
      <icon-btn-square icon="military_tech" color="primary" fill @click.native="$router.push('/user/ranking/level/world')" class="float-right q-pa-md q-pb-lg"/>
      <div class="float-left no-wrap items-end justify-start q-pb-md">
        <div class="profil-photo-top" :style="'background: url(' + getProfileImage() + ' ) center center / cover no-repeat '">
        </div>
        
      </div>
      <div class="q-pt-md">
          <div v-if="user.name !== ''">
            <div class="subtitle3 q-mt-lg q-pl-md">
              {{ user.name }}
            </div>
<!--            <div class="centered subtitle6 q-mt-sm" v-if="user.location && (user.location.postalCode || user.location.country)">
              <span v-if="user.location.postalCode">{{ user.location.postalCode }}</span>
              <span v-if="user.location.postalCode && user.location.country">, </span>
              <span v-if="user.location.country">{{ user.location.country }}</span>
            </div>-->
          </div>
          <div v-if="user.description" class="q-pa-md subtitle6">
            {{ user.description }}
          </div>
        </div>
      <div style="clear:both;"></div>
      <div>
        <div class="centered bg-warning q-pa-sm" v-if="warnings.listCreatedQuestsMissing" @click="listCreatedQuests($store.state.user._id)">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
      </div>
      <!--<div v-if="$store.state.user.id === userId">
        <div v-if="quests.built.rejected && quests.built.rejected.length > 0">
          --====================== MY QUESTS REJECTED =================================--

          <titleBar :title="{text: $t('label.YourRejectedQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.rejected"></questsList>

        </div>
        <div v-if="quests.built.tovalidate && quests.built.tovalidate.length > 0">
          --====================== MY QUESTS TO VALIDATE =================================--

          <titleBar :title="{text: $t('label.YourUnderValidationQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.tovalidate"></questsList>

        </div>
        <div>
          --====================== MY QUESTS DRAFT =================================--

          <titleBar :title="{text: $t('label.YourDraftQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :add="true" :quests="quests.built.draft"></questsList>

        </div>
        <div v-if="quests.built.published && quests.built.published.length > 0">
          --====================== MY QUESTS PUBLISHED =================================--

          <titleBar :title="{text: $t('label.YourPublishedQuests'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}" @click="readMoreQuestPublished"></titleBar>

          <questsList format="small" color="red" :quests="quests.built.published"></questsList>

        </div>
      </div>-->

      <!--====================== CREDITS =================================-->
      
      <user-credits
        v-if="user.credits && user.credits.paid && user.credits.paid > 0 && (isOwner || isAdmin)"
        :credits="user.credits"
        :userId="userId"
        @refresh="refresh"
      />
      
      <!--====================== QUESTS CREATED BY CURRENT USER =================================-->

      <div v-if="$store.state.user.id === userId">
          <quest-list
            :quests="quests.built"
            :title="$t('label.EscapeGames')"
            icon="extension"
            read-more
            v-on:readMore="readMoreQuestPublished()"
            color="secondary"
          />
      </div>

      <!--====================== QUESTS CREATED BY CURRENT USER =================================-->

      <text-btn-square
        class="q-mb-lg"
        @click.native="buildQuest()"
        :title="$t('label.CreateANewQuest')"
        color="secondary"
        icon="extension"
      />

      <!--====================== BADGES WON =================================-->

      <div v-if="badges === null || badges.length > 0">
        <badge-list :badges="badges" :title="$t('label.Badges')" icon="military_tech"/>
      </div>

      <!--====================== QUESTS PLAYED =================================-->

      <div v-if="quests.played === null || quests.played.length > 0">
        <quest-list
          :quests="quests.played"
          :title="$t('label.SolvedQuests')"
          icon="task_alt"
          read-more
          v-on:readMore="readMoreQuestPlayed()"
          color="#1a4567"
          no-rating
          no-price
        />
      </div>

      <!--====================== FRIENDS =================================-->

      <div v-if="friends.list === null || friends.list.length > 0 && $store.state.user.id === userId">
        <user-list :users="friends.list" horizontal color="accent" :title="$t('label.YouFollowThem')" icon="group"/>
      </div>

      <div v-if="$store.state.user.id === userId">
        <div class="centered q-mt-xl q-mb-sm cursor-pointer"><a @click="disconnect()">{{ $t('label.SignOut') }}</a></div>
        <div class="centered q-mb-sm cursor-pointer"><a @click="removeOfflineData()">{{ $t('label.RemoveOfflineData') }}</a></div>
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
import utils from 'src/includes/utils'
import Vue from 'vue'

import iconBtnSquare from "components/user/UI/iconBtnSquare";
import textBtnSquare from "components/user/UI/textBtnSquare";
import questList from "components/user/questList";
import badgeList from "components/user/badgeList";
import userList from "components/user/userList";
import userCredits from "components/user/userCredits";

export default {
  components: {
    iconBtnSquare,
    textBtnSquare,
    questList,
    badgeList,
    userList,
    userCredits
  },
  data () {
    return {
      user: {
        position: null,
        proposeAQuest: true
      },
      userId: null,
      isOwner: false,
      isAdmin: false,
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
    this.refresh()
  },
  methods: {
    refresh() {
      if (this.$route.params.id === 'me') {
        this.userId = this.$store.state.user.id
      } else {
        this.userId = this.$route.params.id
      }
      if (this.$store.state.user.id === this.userId) {
        this.isOwner = true
      }
      if (this.$store.state.user.isAdmin) {
        this.isAdmin = true
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
          level: this.$store.state.user.level,
          credits: this.$store.state.user.credits
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
          thumb: results[i].questData.thumb,
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
    async removeOfflineData() {
      const offlineQuestsFile = await utils.readFile('', 'quests.json')
      if (offlineQuestsFile) {
        const offlineQuestsData = JSON.parse(offlineQuestsFile)
        if (offlineQuestsData && offlineQuestsData.list) {
          var tempQuestList = offlineQuestsData.list

          if (tempQuestList.length > 0) {
            // get pictures
            for (var i = 0; i < tempQuestList.length; i++) {
              await utils.removeDirectory(tempQuestList[i].questId)
            }
          }
        }
        await utils.writeInFile('', 'quests.json', JSON.stringify({}), true)
      }
      this.$q.dialog({
        dark: true,
        message: this.$t('label.DataHaveBeenRemoved')
      })
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
<style scoped lang="scss">
.background-profil {
  background-image: url('../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}

.profil{
  max-width: 800px;
  margin: 0 auto;
  color: white;
  &.friends{
    .profil-photo-center{
      width: 100px;
      height: 100px;
      position: relative;
      margin: 12vh auto 0;
      border-radius: 50%;
    }
    .item-level{
      height: 40px;
      width: 40px;
    }
  }

  .profil-photo-top{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    position: relative;
    margin-left: 10px;
    margin-top: 5vh;
    margin-right: 10px;
  }
  .subtitle{
    position: relative;
    top: -10px;
    margin-bottom: 5vh;
  }
}
</style>
