<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg q-pt-xl">
      <div style="margin-top: 120px">
        <q-infinite-scroll @load="loadPlayed" :offset="250" v-if="tab === 'played'">
          <questsList format="big" :quests="quests.played"></questsList>
        </q-infinite-scroll>
        <div v-if="tab === 'created' && $route.params.id !== $store.state.user.id">
          <questsList format="big" color="red" :quests="quests.built"></questsList>
        </div>
        <div v-if="tab === 'created' && $route.params.id === $store.state.user.id">
          <div v-if="quests.built && quests.built.rejected && quests.built.rejected.length > 0">
            <!--====================== MY QUESTS REJECTED =================================-->
          
            <div class="subtitle4 q-pa-md">{{ $t('label.YourRejectedQuests') }}</div>

            <questsList format="big" color="red" :quests="quests.built.rejected"></questsList>
          
          </div>
          <div v-if="quests.built && quests.built.tovalidate && quests.built.tovalidate.length > 0">
            <!--====================== MY QUESTS TO VALIDATE =================================-->
          
            <div class="subtitle4 q-pa-md">{{ $t('label.YourUnderValidationQuests') }}</div>

            <questsList format="big" color="red" :quests="quests.built.tovalidate"></questsList>
          
          </div>
          <div v-if="quests.built && quests.built.draft">
            <!--====================== MY QUESTS DRAFT =================================-->
          
            <div class="subtitle4 q-pa-md">{{ $t('label.YourDraftQuests') }}</div>

            <questsList format="big" color="red" :add="true" :quests="quests.built.draft"></questsList>
          
          </div>
          <div v-if="quests.built && quests.built.published && quests.built.published.length > 0">
            <!--====================== MY QUESTS PUBLISHED =================================-->
          
            <div class="subtitle4 q-pa-md">{{ $t('label.YourPublishedQuests') }}</div>

            <questsList format="big" color="red" :quests="quests.built.published"></questsList>
          
          </div>
        </div>
        <div v-if="tab === 'played' && quests.played && quests.played.length === 0" class="centered">
          {{ $t('label.NoQuestPlayed') }}
        </div>
        <div v-if="tab === 'created' && quests.built && quests.built.length === 0" class="centered">
          {{ $t('label.NoQuestCreated') }}
        </div>
      </div>
     
      <!------------------ HEADER COMPONENT ------------------------>
      
      <div class="q-py-sm dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        <div class="row q-pa-sm">
          <div class="col-6" @click="selectTab('played')" :class="{'tab-unselected': (tab !== 'played')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.QuestsSuccessful') }}
            </div>
          </div>
          <div class="col-6" @click="selectTab('created')" :class="{'tab-unselected': (tab !== 'created')}">
            <div class="tab-button subtitle5 centered">
              {{ $t('label.QuestsCreated') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import questsList from 'components/quest/questsList'

export default {
  components: {
    questsList
  },
  data () {
    return {
      quests: {
        played: null,
        built: null
      },
      skip: 0,
      limit: 12,
      tab: 'played',
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.selectTab(this.$route.params.type)
  },
  methods: {
    /*
     * List friends
     */
    async loadPlayed(index, done) {
      var self = this
      QuestService.ListPlayedByAUserSync(this.$route.params.id, null, this.skip, function(err, response) {
        self.skip += self.limit
        if (err) {
          done(err)
        }
        if (response && response.data && response.data.length > 0) {
          self.quests.played = []
          for (var i = 0; i < response.data.length; i++) {
            self.quests.played.push({
              questId: response.data[i].questId,
              picture: response.data[i].questData.picture,
              title: response.data[i].questData.title,
              location: {
                town: response.data[i].questData.town
              },
              playStatus: (response.data[i].status && response.data[i].status !== '') ? response.data[i].status : 'finished',
              points: response.data[i].stars
            })
          }
          done()
        }
      })
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async loadCreated(id) {
      if (!id) {
        id = this.$store.state.user.id
      }
      var response = await QuestService.ListCreatedByAUser(id)
      if (id === this.$store.state.user.id) {
        this.quests.built = {
          rejected: [],
          tovalidate: [],
          draft: [],
          published: []
        }
      }

      if (response && response.data) {
        if (response.data.length > 0) {
          this.quests.createdNb = response.data.length
          if (id === this.$store.state.user.id) {
            for (var i = 0; i < response.data.length; i++) {
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
            }
          } else {
            this.quests.built = response.data
          }
        }
      } else {
        this.quests.built = []
      }
    },
    selectTab(tab) {
      this.tab = tab
      this.skip = 0
      if (tab === 'created') {
        this.loadCreated(this.$route.params.id)
      }
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
