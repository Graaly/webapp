<template>
  <div class="scroll background-search">
    <q-scroll-observer @scroll="onScroll" />
    <!------------------ HEADER COMPONENT ------------------------>
    <div class="search-component q-pa-md dark-banner fixed-top">
      <div class="flex no-wrap justify-around items-center q-pb-sm">
        <icon-btn-square :label="$t('label.EscapeGame')" icon="key" color="primary" :fill="type !== 'quest'" @click.native="selectType('quest')"/>
        <icon-btn-square :label="$t('label.Designers')" icon="extension" color="secondary" :fill="type !== 'designer'" @click.native="selectType('designer')"/>
        <icon-btn-square :label="$t('label.Players')" icon="face" color="accent" :fill="type !== 'player'" @click.native="selectType('player')"/>
      </div>
<!--      <div class="row q-pa-sm">
        <div class="col-4" @click="selectType('quest')" :class="{'box-unselected': (type !== 'quest')}">
          <div v-if="scrollInfo.position < 20" class="search-box-top search-quest-box-top">
            <img src="statics/images/icon/key-big.svg" />
          </div>
          <div class="search-box-bottom search-quest-box-bottom subtitle6 centered">
            {{ $t('label.EscapeGame') }}
          </div>
        </div>
        <div class="col-4" @click="selectType('designer')" :class="{'box-unselected': (type !== 'designer')}">
          <div v-if="scrollInfo.position < 20" class="search-box-top search-creator-box-top">
            <img src="statics/images/icon/puzzle-big.svg" />
          </div>
          <div class="search-box-bottom search-creator-box-bottom subtitle6 centered">
            {{ $t('label.Designers') }}
          </div>
        </div>
        <div class="col-4" @click="selectType('player')" :class="{'box-unselected': (type !== 'player')}">
          <div v-if="scrollInfo.position < 20" class="search-box-top search-user-box-top">
            <img src="statics/images/icon/user-big.svg" />
          </div>
          <div class="search-box-bottom search-user-box-bottom subtitle6 centered">
            {{ $t('label.Players') }}
          </div>
        </div>
      </div>-->
      <div v-if="type === 'quest'">
        <div class="q-pa-md">
          <q-btn-group spread rounded>
            <q-btn class="material-icons-outlined"
                   color="secondary"
                   :outline="subtype !== 'around'"
                   :label="$t('label.AroundYou')"
                   icon="o_explore"
                   size="sm"
                   @click="selectSubtype('around')"/>
            <q-btn class="material-icons-outlined"
                   color="secondary"
                   :outline="subtype !== 'friends'"
                   :label="$t('label.FriendsQuests')"
                   icon="o_groups"
                   size="sm"
                   @click="selectSubtype('friends')"/>
          </q-btn-group>
        </div>
<!--        <div class="row q-pa-sm">
          <div class="col-6" @click="selectSubtype('around')" :class="{'tab-unselected': (subtype !== 'around')}">
            <q-btn>

            </q-btn>
            <div class="tab-button subtitle6 centered">
              {{ $t('label.AroundYou') }}
            </div>
          </div>
          <div class="col-6" @click="selectSubtype('friends')" :class="{'tab-unselected': (subtype !== 'friends')}">
            <div class="tab-button subtitle6 centered">
              {{ $t('label.FriendsQuests') }}
            </div>
          </div>
        </div>-->
      </div>
      <div class="q-px-md">
        <q-input
          dark
          dense
          bottom-slots
          v-model="search.text"
          debounce="500"
          :label="$t('label.Search')"
          @input="find()"
        >
          <template v-slot:prepend>
            <q-icon color="primary" name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="search.text = ''; selectSubtype('around')" class="cursor-pointer" />
          </template>

          <template v-slot:hint class="flex justify-between">
            <div v-if="search.text !== '' && search.text.length < 3" class="text-negative q-pt-sm">
              3 Letters min.
            </div>
            <div>
              <div class="text-right q-pt-sm" v-if="search.text.length > 2 && type === 'quest' && results.quests">
                {{ results.quests.length }} résultat<span v-if="results.quests.length > 1">s</span>
              </div>
              <div class="text-right q-pt-sm" v-if="search.text.length > 2 && type === 'designer' && results.designers">
                {{ results.designers.length }} résultat<span v-if="results.designers.length > 1">s</span>
              </div>
              <div class="text-right q-pt-sm" v-if="search.text.length > 2 && type === 'player' && results.players">
                {{ results.players.length }} résultat<span v-if="results.players.length > 1">s</span>
              </div>
            </div>
          </template>
        </q-input>
<!--        <q-input
          dark
          class="q-px-md arial"
          v-model="search.text"
          debounce="500"
          :placeholder="$t('label.Search')"
          @input="find()"
        >
          <template v-if="search.text !== ''" v-slot:append>
            <q-icon name="close" />
          </template>
        </q-input>-->
      </div>
    </div>
      <!------------------ QUEST COMPONENT ------------------------>
    <div id="teaser" class="search">
      <div class="q-px-md quest-list" :style="type === 'quest' ? 'top: 250px' : 'top: 200px'">
        <div v-if="type === 'quest'">
          <q-infinite-scroll @load="loadOtherQuests" :offset="250">
            <quest-list color="allColors" :quests="results.quests" :max-show="1000" />
          </q-infinite-scroll>
        </div>
        <div v-if="type === 'designer'">
          <q-infinite-scroll @load="loadOtherUsers" :offset="250">
            <creator-list :creators="results.designers"/>
          </q-infinite-scroll>
        </div>
        <div v-if="type === 'player'">
          <q-infinite-scroll @load="loadOtherUsers" :offset="250">
            <user-list :users="results.players"/>
          </q-infinite-scroll>
        </div>
        <div
          v-if="type === 'quest' && search.text.length > 2 && results.quests && results.quests.length === 0"
          @click.native="$router.push('/quest/create')"
          class="centered q-pa-md text-white">
          <q-icon name="explore" size="2rem" />
          {{ $t('label.NoQuestForThisSearch') }}
          <div>
            <a @click="$router.push('/quest/create')">{{ $t('label.WhyDontYouCreateAQuest') }}</a>
          </div>
        </div>
        <div v-if="type === 'designer' && results.designers && results.designers.length === 0" class="centered q-pa-md text-white">
          {{ $t('label.NoDesignerForThisSearch') }}
        </div>
        <div v-if="type === 'player' && results.players && results.players.length === 0" class="centered q-pa-md text-white">
          {{ $t('label.NoPlayerForThisSearch') }}
        </div>
      </div>
    </div>

    <!------------------ GEOLOCATION COMPONENT ------------------------>

    <geolocation ref="geolocation-component" @success="onLocationSuccess($event)" @error="onLocationError()" />

  </div>
</template>

<script>
import UserService from 'services/UserService'
import QuestService from 'services/QuestService'
import questList from 'components/user/questList'
import usersList from 'components/user/usersList'
import geolocation from 'components/geolocation'

import iconBtnSquare from "../components/user/UI/iconBtnSquare";
import CreatorList from "../components/user/creatorList";
import UserList from "../components/user/userList";

export default {
  components: {
    UserList,
    CreatorList,
    geolocation,
    questList,
    usersList,
    iconBtnSquare
  },
  data () {
    return {
      type: 'quest',
      subtype: null,
      results: {
        quests: null,
        designers: null,
        players: null
      },
      search: {
        text: "",
        limit: 10,
        skip: 0
      },
      user: {
        position: null
      },
      scrollInfo: {},
      findQuestWhenLocationIsKnown: true,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    if (this.$route.params.subtype) {
      this.subtype = this.$route.params.subtype
    }
    if (this.$route.params.type) {
      this.type = this.$route.params.type
    }
    // wait for location of around request
    if (this.subtype !== 'around') {
      this.find()
    }
  },
  methods: {
    /*
     * Select the search type (quest, designer, user)
     * @param   {string}    type            ID of the type
     */
    async selectType(type) {
      this.type = type
      this.subtype = 'none'
      await this.find()
    },
    /*
     * Select the search subtype
     * @param   {string}    subtype            ID of the subtype
     */
    async selectSubtype(subtype) {
      this.subtype = subtype
      this.search.text = ""
      this.search.skip = 0
      await this.find()
    },
    /*
     * Launch search
     */
    async find() {
      if (this.type === 'quest') {
        await this.findQuests()
      } else if (this.type === 'player') {
        this.search.skip = 0
        await this.findUser('player')
      } else {
        this.search.skip = 0
        await this.findUser('designer')
      }
    },
    /*
     * Search for player
     */
    async findUser(type) {
      try {
        if (this.search.text.length > 3) {
          this.subtype = 'keyword'
          // show loading animation
          this.$q.loading.show()

          let response = await UserService.find(type, this.search.text)
          if (response && response.data) {
            if (type === 'player') {
              this.results.players = response.data
            } else {
              this.results.designers = response.data
            }
          } else {
            this.displayNetworkIssueMessage()
          }
        }
        this.$q.loading.hide()
      } catch (e) {
        console.log(e)
        this.$q.loading.hide()
      }
    },
    loadOtherUsers(index, done) {
      if (this.search.skip >= 10) {
        var self = this
        UserService.find(this.type, this.search.text, this.search.skip, function(err, response) {
          self.search.skip += self.search.limit
          if (err) {
            done(err)
          }
          if (response && response.data && response.data.length > 0) {
            if (type === 'player') {
              self.results.players = self.results.players.concat(response.data)
            } else {
              self.results.designers = self.results.designers.concat(response.data)
            }
            done()
          }
        })
      }
    },
    /*
     * Search for quests
     */
    async findQuests() {
      try {
        if (this.subtype !== 'keyword' || this.search.text.length > 2) {
          if (this.search.text.length > 2) {
            this.subtype = 'keyword'
          }
          // show loading animation
          this.$q.loading.show()

          // Get quests for the search
          var userPosition = this.user.position

          var response
          if (this.subtype === 'keyword') {
            response = await QuestService.find(this.search.text, userPosition, 0, 10)
          } else if (this.subtype === 'around') {
            response = await QuestService.listNearest(userPosition, 0)
          } else if (this.subtype === 'friends') {
            response = await QuestService.listFriendQuests()
          }
          if (response && response.data) {
            if (this.subtype === 'friends') {
              this.results.quests = this.formatRunResults(response.data)
            } else {
              this.results.quests = response.data
            }
            this.search.skip = response.data.length

            // compute distance
            if (this.user.position) {
              this.results.quests = this.results.quests.map(function(quest) {
                const R = 6378.137
                let dLat = quest.location.coordinates[1] * Math.PI / 180 - userPosition.latitude * Math.PI / 180
                let dLon = quest.location.coordinates[0] * Math.PI / 180 - userPosition.longitude * Math.PI / 180
                let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userPosition.latitude * Math.PI / 180) * Math.cos(quest.location.coordinates[1] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                quest.distance = Math.floor(R * c)

                return quest
              });
            }
          } else {
            this.displayNetworkIssueMessage()
          }
        }
        this.$q.loading.hide()
      } catch (e) {
        console.log(e)
        this.$q.loading.hide()
      }
    },
    loadOtherQuests(index, done) {
      if (this.user.position && this.search.skip >= 10) {
        var self = this
        // get the team news list
        if (this.subtype === 'around') {
          QuestService.listNearestSync(this.user.position, null, this.search.skip, function(err, response) {
            self.search.skip += self.search.limit
            if (err) {
              done(err)
            }
            if (response && response.data && response.data.length > 0) {
              self.results.quests = self.results.quests.concat(response.data)
              done()
            }
          })
        } else if (this.subtype === 'friends') {
          QuestService.listFriendQuestsync(null, this.search.skip, function(err, response) {
            self.search.skip += self.search.limit
            if (err) {
              done(err)
            }
            if (response && response.data && response.data.length > 0) {
              self.results.quests = self.results.quests.concat(this.formatRunResults(response.data))
              done()
            }
          })
        } else {
          QuestService.findSync(this.search.text, this.user.position, null, this.search.skip, function(err, response) {
            self.search.skip += self.search.limit
            if (err) {
              done(err)
            }
            if (response && response.data && response.data.length > 0) {
              self.results.quests = self.results.quests.concat(response.data)
              done()
            }
          })
        }
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
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
    },
    async onLocationSuccess(position) {
      this.$set(this.user, 'position', position.coords)
      if (this.findQuestWhenLocationIsKnown) {
        this.findQuestWhenLocationIsKnown = false
        await this.find()
      }
    },
    onLocationError(ret) {
      // reset position only if localization never worked, else keep current location
      if (ret) {
        this.user.position = null
      }
    },
    onScroll (info) {
      this.scrollInfo = info
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
.background-search {
  background-image: url('../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.search, .search-component{
  max-width: 450px;
  margin: 0 auto;
}
.search-component{
  z-index: 5;
  max-width: 450px;
  right: 0;
  left: 0;
  background: linear-gradient(180deg, rgb(7,39,90) 65%, rgb(4,20,45) 100%);
  border-radius: 0  0 20px 20px;
}
.quest-list{
  position: relative;
  margin-bottom: 250px;
}
</style>
