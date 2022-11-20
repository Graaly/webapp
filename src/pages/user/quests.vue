<template>
  <div class="scroll background-quests">
    <div id="teaser" class="quests q-pa-md">
      <div style="margin-top: 80px">
        <q-infinite-scroll @load="loadPlayed" :offset="10" v-if="tab === 'played'">
          <quest-list
            :quests="quests.played"
            :title="$t('label.SolvedQuests')"
            icon="task_alt"
            color="#1a4567"
            :max-show="100"
            no-price
          />
        </q-infinite-scroll>
        <div v-if="tab === 'created' && $route.params.id !== $store.state.user.id">
          <quest-list
            :quests="quests.built"
            :title="$t('label.SolvedQuests')"
            icon="task_alt"
            color="accent"
            no-rating
            no-price
            :max-show="1000"
          />
        </div>
        <div v-if="tab === 'created' && $route.params.id === $store.state.user.id">

          <!--====================== MY QUESTS REJECTED =================================-->

          <div v-if="quests.built && quests.built.rejected && quests.built.rejected.length > 0">
            <quest-list
              :quests="quests.built.rejected"
              :title="$t('label.YourRejectedQuests')"
              icon="block"
              color="#DB2828"
              :max-show="1000"
            />
          </div>

          <!--====================== MY QUESTS TO VALIDATE =================================-->

          <div v-if="quests.built && quests.built.tovalidate && quests.built.tovalidate.length > 0">
            <quest-list
              :quests="quests.built.tovalidate"
              :title="$t('label.YourUnderValidationQuests')"
              icon="checklist"
              color="secondary"
              :max-show="1000"
            />
          </div>

          <!--====================== MY QUESTS DRAFT =================================-->

          <div v-if="quests.built && quests.built.draft">
            <quest-list
              :quests="quests.built.draft"
              :title="$t('label.YourDraftQuests')"
              icon="edit"
              color="accent"
              :max-show="1000"
            />
          </div>

          <!--====================== MY QUESTS PUBLISHED =================================-->

          <div v-if="quests.built && quests.built.published && quests.built.published.length > 0">
            <quest-list
              :quests="quests.built.published"
              :title="$t('label.YourPublishedQuests')"
              icon="task_alt"
              color="primary"
              :max-show="1000"
            />
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

      <div class="q-py-sm q-px-md fixed-top quests-component">
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
import questList from "../../components/user/questList";
import backBar from "../../components/user/UI/backBar";

export default {
  components: {
    questList,
    backBar
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
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
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
              thumb: response.data[i].questData.thumb,
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
      this.$router.back()
    }
  }
}
</script>
<style scoped lang="scss">
.background-quests {
  background-image: url('../../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.quests, .quests-component{
  max-width: 800px;
  margin: 0 auto;
}
.quests-component{
  z-index: 5;
  max-width: 8000px;
  right: 0;
  left: 0;
  background: linear-gradient(180deg, rgb(7,39,90) 65%, rgb(4,20,45) 100%);
  border-radius: 0  0 20px 20px;
}
</style>
