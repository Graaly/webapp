<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg">
      <div style="padding-top: 248px;">
        <div v-if="type === 'quest' && results.quests && results.quests.length > 0">
          <questsList format="big" :quests="results.quests"></questsList>
        </div>
        <div v-if="type === 'designer' && results.designers && results.designers.length > 0">
          <usersList :users="results.designers"></usersList>
        </div>
        <div v-if="type === 'player' && results.players && results.players.length > 0">
          <usersList format='list' :users="results.players"></usersList>
        </div>
        <div v-if="type === 'quest' && results.quests && results.quests.length === 0" @click.native="$router.push('/quest/create')" class="centered q-pa-md">
          <q-icon name="explore" size="2rem" />
          {{ $t('label.NoQuestForThisSearch') }}
          <div>
            <a @click="$router.push('/quest/create')">{{ $t('label.WhyDontYouCreateAQuest') }}</a>
          </div>
        </div>
        <div v-if="type === 'designer' && results.designers && results.designers.length === 0" class="centered q-pa-md">
          {{ $t('label.NoDesignerForThisSearch') }}
        </div>
        <div v-if="type === 'player' && results.players && results.players.length === 0" class="centered q-pa-md">
          {{ $t('label.NoPlayerForThisSearch') }}
        </div>
      </div>
      
      <!------------------ HEADER COMPONENT ------------------------>
      
      <q-scroll-observer @scroll="onScroll" />
      <div class="q-py-sm dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        <div class="row q-pa-sm">
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
        </div>
        <div>
          <q-input
            dark
            class="q-px-md"
            v-model="search.text"
            debounce="500"
            :placeholder="$t('label.Search')"
            @input="find()"
          >
            <template v-if="search.text !== ''" v-slot:append>
              <q-icon name="close" />
            </template>
          </q-input>
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
import questsList from 'components/quest/questsList'
import usersList from 'components/user/usersList'
import geolocation from 'components/geolocation'

export default {
  components: {
    geolocation,
    questsList,
    usersList
  },
  data () {
    return {
      type: 'quest',
      results: {
        quests: null,
        designers: null,
        players: null
      },
      search: {
        text: ""
      },
      user: {
        position: null
      },
      scrollInfo: {},
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {

  },
  methods: {
    /*
     * Select the search type (quest, designer, user)
     * @param   {string}    type            ID of the type
     */
    async selectType(type) {
      this.type = type
      await this.find()
    },
    /*
     * Launch search
     */
    async find() {
      if (this.type === 'quest') {
        await this.findQuests()
      } else if (this.type === 'player') {
        await this.findUser('player')
      } else {
        await this.findUser('designer')
      }
    },
    /*
     * Search for player
     */
    async findUser(type) {
      try {
        if (this.search.text.length > 3) {
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
    /*
     * Search for quests
     */
    async findQuests() {
      try {
        if (this.search.text.length > 3) {
          // show loading animation
          this.$q.loading.show()

          // Get quests for the search
          var userPosition = this.user.position

          let response = await QuestService.find(this.search.text, userPosition)
          if (response && response.data) {
            this.results.quests = response.data

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
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
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
    onScroll (info) {
      this.scrollInfo = info
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.push('/map')
    }
  }
}
</script>
