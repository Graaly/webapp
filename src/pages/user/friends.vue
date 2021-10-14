<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg q-pt-xl">
      <div style="margin-top: 120px">
        <q-infinite-scroll @load="loadFriends" :offset="250" v-if="tab === 'follow'">
          <usersList format='list' :add="$store.state.user.id === $route.params.id ? true : false" :users="users" @refresh="reloadFriends"></usersList>
        </q-infinite-scroll>
        <q-infinite-scroll @load="loadSuggestions" :offset="250" v-if="tab === 'suggestion' && user.position !== null">
          <usersList format='list' :add="false" :users="suggestions"></usersList>
        </q-infinite-scroll>
        <div v-if="tab === 'suggestion' && user.position === null">
          {{ $t('label.WeNeedYourPositionForThisFeature') }}
        </div>
      </div>

      <!------------------ HEADER COMPONENT ------------------------>

      <div class="q-py-sm q-px-md dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
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

export default {
  components: {
    usersList,
    geolocation
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
      tab: 'follow',
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
