<template>
  <div class="scroll background-friends">
    <div id="teaser" class="friends">
      <div style="margin-top: 80px">
        <q-infinite-scroll @load="loadFriends" :offset="250" v-if="tab === 'follow'">
<!--          <usersList format='list' :add="$store.state.user.id === $route.params.id ? true : false" :users="users" @refresh="reloadFriends"></usersList>-->
          <user-list :users="users" color="accent"/>
        </q-infinite-scroll>
        <q-infinite-scroll @load="loadSuggestions" :offset="250" v-if="tab === 'suggestion' && user.position !== null">
<!--          <usersList format='list' :add="false" :users="suggestions"></usersList>-->
          <user-list :users="suggestions" color="accent"/>
        </q-infinite-scroll>
        <div v-if="tab === 'suggestion' && user.position === null" class="text-white">
          {{ $t('label.WeNeedYourPositionForThisFeature') }}
        </div>
      </div>

      <!------------------ HEADER COMPONENT ------------------------>

      <div class="q-py-sm q-px-md friends-component fixed-top">
        <div v-if="$store.state.user.id === $route.params.id" class="row q-pa-sm">
          <div class="col-6" @click="selectTab('follow')" :class="{'tab-unselected': (tab !== 'follow')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.YouFollowThem') }}
            </div>
          </div>
          <div class="col-6" @click="selectTab('suggestion')" :class="{'tab-unselected': (tab !== 'suggestion')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.Suggestions') }}
            </div>
          </div>
        </div>
        <div v-if="$store.state.user.id !== $route.params.id" class="row q-pa-sm">
          <div class="subtitle3 q-pa-md q-mt-xl q-pt-lg">
            {{ $t('label.FollowedPeople') }}
          </div>
        </div>
      </div>
    </div>

    <!------------------ GEOLOCATION COMPONENT ------------------------>

    <geolocation ref="geolocation-component" @success="onLocationSuccess($event)" @error="onLocationError()" />

  </div>
</template>

<script>
import UserService from 'services/UserService'
import usersList from 'components/user/usersList'
import geolocation from 'components/geolocation'
import userList from "../../components/user/userList";

export default {
  components: {
    usersList,
    geolocation,
    userList
  },
  data () {
    return {
      users: null,
      user: {
        position: null
      },
      suggestions: null,
      suggestionType: 'followers',
      skip: 0,
      limit: 12,
      tab: 'suggestion',
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {

  },
  methods: {
    async reloadFriends() {
      this.skip = 0
      await this.loadFriends(0, function () {})
    },
    /*
     * List friends
     */
    async loadFriends(index, done) {
      var self = this
      UserService.listFriendsSync(0, this.skip, this.limit, function(err, response) {
        if (self.users === null) {
          self.users = []
        }
        if (err) {
          done(err)
        }
        if (response && response.data && response.data.length > 0) {
          self.skip += self.limit
          self.users = self.users.concat(response.data)
          done()
        }
      })
    },
    /*
     * List friends suggestions
     */
    async loadSuggestions(index, done) {
      var self = this
      if (this.suggestionType === 'near') {
        UserService.listSuggestionsSync({ lng: this.user.position.longitude, lat: this.user.position.latitude }, this.limit, this.skip, function(err, response) {
          self.skip += self.limit
          if (self.suggestions === null) {
            self.suggestions = []
          }
          if (err) {
            done(err)
          }
          if (response && response.data && response.data.length > 0) {
            self.suggestions = self.suggestions.concat(response.data)
            done()
          }
        })
      } else {
        UserService.listFollowersSync(this.limit, this.skip, function(err, response) {
          if (self.suggestions === null) {
            self.suggestions = []
          }
          if (err) {
            done(err)
          }
          if (response && response.data && response.data.length > 0) {
            self.skip += response.data.length
            self.suggestions = self.suggestions.concat(response.data)
            done()
          }
          if (!(response && response.data && response.data.length > 0) || response.data.length < self.limit) {
            self.suggestionType = 'near'
            self.loadSuggestions(index, done)
          }
        })
      }
    },
    async onLocationSuccess(position) {
      this.$set(this.user, 'position', position.coords)
    },
    onLocationError(ret) {
      // reset position only if localization never worked, else keep current location
      if (ret) {
        this.user.position = null
      }
    },
    selectTab(tab) {
      this.tab = tab
      this.skip = 0
      if (tab === 'suggestion' && this.suggestions === null) {
        this.loadSuggestions(0, function() {})
      }
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.background-friends {
  background-image: url('../../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.friends, .friends-component{
  max-width: 420px;
  margin: 0 auto;
}
.friends-component{
  z-index: 5;
  max-width: 450px;
  right: 0;
  left: 0;
  background: linear-gradient(180deg, rgb(7,39,90) 65%, rgb(4,20,45) 100%);
  border-radius: 0  0 20px 20px;
}
</style>
