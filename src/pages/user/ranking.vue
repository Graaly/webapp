<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg">
      <div :style="'padding-top: ' + (tab === 'level' ? 200 : (tab === 'ranking' ? 150 : 110)) + 'px;'">
        <transition name="slideInTop">
          <div v-if="tab === 'level'">
            <div v-for="level in levels" :key="level.number" class="q-ma-md level-to-reach" :class="{'level-not-reached': ($store.state.user.score < level.minPoints)}" :style="'background-image: url(statics/images/icon/level' + level.number + '.svg)'">
              <div class="grey-round-box" v-if="$store.state.user.score < level.minPoints">{{ $t('label.PointsToReachLevel', {score: level.minPoints}) }}</div>
              <div class="grey-round-box" v-if="$store.state.user.score >= level.minPoints">{{ $t('label.LevelReached') }}</div>
            </div>
          </div>
        </transition>
        <transition name="slideInTop">
          <div v-if="tab === 'ranking'">
            <div v-if="ranking && ranking.length > 0" v-for="(user, index) in ranking" :key="index" class="q-pa-md rank-box">
              <div>
                <userCard :user="user" size="medium" @click="openProfile"></userCard>
              </div>
              <div class="full-width">
                <div class="subtitle5">{{ user.name }}</div>
                <div class="subtitle6" v-if="user.location && (user.location.country || user.location.postalCode)">
                  <span v-if="user.location.postalCode">{{ user.location.postalCode }}</span>
                  <span v-if="user.location.postalCode && user.location.country">, </span>
                  <span v-if="user.location.country">{{ user.location.country }}</span>
                </div>
                <div class="grey-round-box row icons q-mt-sm q-pa-sm">
                  <div class="col-6 centered">
                    <img src="statics/images/icon/pts.svg" />
                    {{ user.score }}
                  </div>
                  <div class="col-6 centered">
                    <img src="statics/images/icon/medal.svg" />
                    {{ index + 1 }}
                  </div>
                </div>
              </div>
            </div>
            <div class="centered" v-if="ranking && ranking.length === 0">
              {{ $t('label.NoRanking') }}
            </div>
          </div>
        </transition>
        <transition name="slideInTop">
          <div v-if="tab === 'news'">
            <q-infinite-scroll @load="loadNews">
              <q-list>
                <q-item v-for="(item, index) in news.items" :key="item._id">
                  <q-item-section avatar class="q-pl-md">
                    <userCard :user="item.data" size="medium" @click="openProfile"></userCard>
                  </q-item-section>
                  <q-item-section class="force-justify-start">
                    <q-item-label v-if="item.data && item.data.userId" class="subtitle5">{{ item.data.name }}</q-item-label>
                    <q-item-label class="grey-round-box subtitle6 q-pa-sm">
                      <div v-if="item.type === 'standard'">
                        {{ item.title }}
                      </div>
                      <div v-if="item.type !== 'standard'">
                        <span v-html="$t('news.' + item.type, item.data)"></span>
                        <span v-if="item.type === 'challengeWon'">{{ $t('challenge.' + item.data.name) }}</span>
                      </div>
                      <div class="q-pt-sm">
                        <!--<span v-if="item.data.stars">
                          <q-icon color="warning" name="fas fa-award" />
                          <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="item.data.stars > 1" />
                          <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="item.data.stars > 2" />
                        </span>-->
                        {{item.creation.date | formatDate($store.state.user.language)}}
                        <span v-if="item.destination === 'friends'">
                          - 
                          <a v-if="!isLiked(item)" v-on:click="like(index)">{{ $t('label.Like') }}</a>
                          <a v-if="isLiked(item)" v-on:click="unlike(index)">{{ $t('label.Like') }}</a>
                          <span v-if="item.likes.length > 0">({{ item.likes.length }})</span>
                        </span>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="news.items.length === 0">
                  <q-item-label>{{ $t('label.NoNews') }}</q-item-label>
                </q-item>
              </q-list>
              <div slot="message" class="row justify-center" style="margin-bottom: 50px;">
                <q-spinner-dots :size="5" />
              </div>
            </q-infinite-scroll>
          </div>
        </transition>
      </div>
      
      <!------------------ HEADER COMPONENT ------------------------>
      
      <div class="q-py-sm dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        <div class="row q-pa-sm">
          <div class="col-4" @click="selectTab('level')" :class="{'tab-unselected': (tab !== 'level')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.Level') }}
            </div>
          </div>
          <div class="col-4" @click="selectTab('ranking')" :class="{'tab-unselected': (tab !== 'ranking')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.Ranking') }}
            </div>
          </div>
          <div class="col-4" @click="selectTab('news')" :class="{'tab-unselected': (tab !== 'news')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.News') }}
            </div>
          </div>
        </div>
        <div v-if="tab === 'level'">
          <div class="relative-position progress-box">
            <div class="progress-bar">
              <div class="progress" :style="'width: ' + progression + '%'">
              </div>
              <div class="value">
                {{ progression }}%
              </div>
            </div>
            <div class="score subtitle6">
              {{ $t('label.YouHaveReachAScore', {score: $store.state.user.score}) }}
            </div>
            <div class="rank-level">
              <img :src="'statics/images/icon/level' + $store.state.user.level + '.svg'" />
            </div>
          </div>
        </div>
        <div v-if="tab === 'ranking'">
          <div class="row q-pa-sm">
            <div class="col-3" @click="selectRange('world')" :class="{'tab-unselected': (range !== 'world')}">
              <div class="tab-button subtitle6 centered">
                {{ $t('label.World') }}
              </div>
            </div>
            <div class="col-3" @click="selectRange('country')" :class="{'tab-unselected': (range !== 'country')}">
              <div class="tab-button subtitle6 centered">
                {{ $t('label.MyCountry') }}
              </div>
            </div>
            <div class="col-3" @click="selectRange('city')" :class="{'tab-unselected': (range !== 'city')}">
              <div class="tab-button subtitle6 centered">
                {{ $t('label.MyCity') }}
              </div>
            </div>
            <div class="col-3" @click="selectRange('friends')" :class="{'tab-unselected': (range !== 'friends')}">
              <div class="tab-button subtitle6 centered">
                {{ $t('label.Friends') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from 'services/UserService'
import userCard from 'components/user/userCard'
//import QuestService from 'services/QuestService'
//import Notification from 'boot/NotifyHelper'
//import utils from 'src/includes/utils'
//import questsList from 'components/quest/questsList'
//import usersList from 'components/user/usersList'

export default {
  components: {
    userCard
    /*geolocation,
    questsList,
    usersList*/
  },
  data () {
    return {
      tab: 'level',
      range: 'world',
      news: {
        limit: 20,
        skip: 0,
        items: []
      },
      levels: [
        {number: 9, minPoints: 3000, maxPoints: 15000},
        {number: 8, minPoints: 1500, maxPoints: 3000},
        {number: 7, minPoints: 800, maxPoints: 1500},
        {number: 6, minPoints: 400, maxPoints: 800},
        {number: 5, minPoints: 200, maxPoints: 400},
        {number: 4, minPoints: 100, maxPoints: 200},
        {number: 3, minPoints: 30, maxPoints: 100},
        {number: 2, minPoints: 15, maxPoints: 30},
        {number: 1, minPoints: 0, maxPoints: 15}
      ],
      ranking: null,
      progression: 4,
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.selectTab('level')
  },
  methods: {
    /*
     * Select the tab (level, ranking, news)
     * @param   {string}    type            ID of the type
     */
    async selectTab(tab) {
      this.tab = tab
      if (this.tab === 'level') {
        this.computeProgression()
      }
      if (this.tab === 'ranking') {
        await this.selectRange()
      }
    },
    /*
     * Select the range (world, country, city, friends)
     * @param   {string}    range            ID of the range
     */
    async selectRange(range) {
      if (!range) {
        range = 'world'
      }
      this.range = range
      
      await this.getRanking(range)
    },
    /*
     * Open a user profile
     */
    openProfile(id) {
      this.$router.push('/profile/' + id)
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.push('/map')
    },
    /*
     * Compute the user progression
     */
    computeProgression () {
      for (var i = 0; i < 9; i++) {
        if (this.$store.state.user.score > this.levels[i].minPoints) {
          this.progression = Math.floor(((this.$store.state.user.score - this.levels[i].minPoints) / (this.levels[i].maxPoints - this.levels[i].minPoints)) * 100)
          break
        }
      }
      // if progression is = 0, display at least a little pink bar (=4)
      if (this.progression < 4) {
        this.progression = 4
      }
    },
        
    /*
     * List news
     */
    loadNews(index, done) {
      var self = this
      // get the team news list
      UserService.listNews(this.news.limit, this.news.skip, function(err, response) {
        self.news.skip += self.news.limit
        if (err) {
          done(err)
        }
        if (response && response.data && response.data.length > 0) {
          self.news.items = self.news.items.concat(response.data)
          done()
        }
      })
    },     
    
    /*
     * Like news
     */
    async like (index) {
      this.$q.loading.show()
      this.news.items[index].likes.push({userId: this.$store.state.user._id, date: new Date()})
      await UserService.likeNews(this.news.items[index]._id)
      this.$q.loading.hide()
    },
    /*
     * Unlike news
     */
    async unlike (index) {
      this.$q.loading.show()
      for (var i = 0; i < this.news.items[index].likes.length; i++) {
        if (this.news.items[index].likes[i].userId === this.$store.state.user._id) {
          this.news.items[index].likes.splice(i, 1)
        }
      }
      await UserService.unlikeNews(this.news.items[index]._id)
      this.$q.loading.hide()
    },
    // return true if the current user has liked the news
    isLiked (item) {
      if (item.likes) {
        for (var i = 0; i < item.likes.length; i++) {
          if (item.likes[i].userId === this.$store.state.user._id) {
            return true;
          }
        }
      }
      return false;
    },
    
    /*
     * Load the ranking
     */
    async getRanking (range) {
      this.$q.loading.show()
      const ranking = await UserService.getRangeRanking(range)
      if (ranking && ranking.data && ranking.data.users) {
        this.ranking = ranking.data.users
      } else {
        this.ranking = []
      }
      this.$q.loading.hide()
    }
  }
}
</script>
