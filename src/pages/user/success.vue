<template>
  <div class="wrapper">
    <transition appear enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft">
      <div>
      
        <!------------------ HEADER AREA ------------------------>
        
        <div class="header row">
          <div class="col-4 q-pl-md q-pt-sm">
            <img src="statics/icons/game/cup-medium-white.png" />
          </div>
          <div class="col">
            <p>
              {{ $t('label.YourScore') }}: {{ $store.state.user.score }}
            </p>
            <p>
              {{ $t('label.YourRevenues') }}: {{ $store.state.user.score }}
            </p>
          </div>
        </div>
        
        <!------------------ TABS AREA ------------------------>
        
        <q-tabs>
          <q-tab slot="title" name="built" icon="message" :label="$t('label.QuestsCreated')" default />
          <q-tab slot="title" name="played" icon="fingerprint" :label="$t('label.QuestsSuccessful')" />
        
          <!------------------ LIST OF QUESTS BUILT TAB ------------------------>
          
          <q-tab-pane name="built">
            <!------------------ ADD A QUEST BUTTON AREA ------------------------>
              
            <p v-show="userId === $store.state.user._id">
              <q-btn link class="full-width" @click="$router.push('/quest/create/welcome')" color="primary">{{ $t('label.CreateANewQuest') }}</q-btn>
            </p>
            
            <!------------------ LIST OF QUESTS BUILT AREA ------------------------>
            
            <q-list highlight>
              <q-item v-for="quest in quests.built" :key="quest._id" @click.native="$router.push((profile.me ? '/quest/edit/' + quest._id : '/quest/play/' + quest._id))">
                <q-item-side v-if="quest.picture" :avatar="serverUrl + '/upload/quest/' + quest.picture" />
                <q-item-side v-if="!quest.picture" :avatar="'statics/profiles/noprofile.png'" />
                <q-item-main>
                  <q-item-tile label>{{ quest.title }}</q-item-tile>
                  <q-item-tile sublabel v-if="quest.status === 'published'">
                    <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" /> -
                    {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate}}
                  </q-item-tile>
                  <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                    {{ $t('label.Unpublished') }}
                  </q-item-tile>
                </q-item-main>
              </q-item>
              <q-item v-if="quests.built.length === 0">
                <q-item-main>
                  <q-item-tile label>{{ $t('label.NoQuestCreated') }}</q-item-tile>
                </q-item-main>
              </q-item>
            </q-list>
          </q-tab-pane>
          
          <!------------------ LIST OF QUESTS PLAYED TAB ------------------------>
          
          <q-tab-pane name="played">
            <q-list highlight>
            <q-item v-if="quests.played && quests.played.length > 0" v-for="quest in quests.played" :key="quest._id" @click.native="$router.push('/quest/play/'+quest.questId)">
              <q-item-side v-if="quest.questData && quest.questData.picture" :avatar="serverUrl + '/upload/quest/' + quest.questData.picture" />
              <q-item-side v-if="!quest.questData || !quest.questData.picture" :avatar="'statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ quest.questData.title }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && !quest.score">
                  {{ $t('label.PlayedOn') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                  {{ $t('label.Succeeded') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="!quest.dateCreated">
                  {{ $t('label.Succeeded') }}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'in-progress'">
                  {{ $t('label.ContinueThisQuest') }}
                </q-item-tile>
              </q-item-main>
              <q-item-side right class="score">
                {{ quest.score }}
              </q-item-side>
            </q-item>
            <q-item v-if="quests.played.length === 0">
              <q-item-main>
                <q-item-tile label>{{ $t('label.NoQuestPlayed') }}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
          </q-tab-pane>
        </q-tabs>

        <!------------------ MENU AREA ------------------------>
        
        <div class="menu-background"></div>
        <div class="menu row">
          <div class="q-pr-xl col align-right" @click="backToMap()">
            <q-btn @click="backToMap()" rounded color="primary" size="xl" :label="$t('label.BackToMap')" icon-right="arrow_forward" />
          </div>
        </div>   
      </div>
    </transition>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import AuthService from 'services/AuthService'

export default {
  data () {
    return {
      quests: {
        played: [],
        built: []
      },
      userId: '',
      profile: {},
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.userId = this.$route.params.id === 'me' ? this.$store.state.user._id : this.$route.params.id
    this.getAccountInformations(this.userId)
  },
  methods: {
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getAccountInformations(id) {
      if (id === this.$store.state.user._id) {
        this.listCreatedQuests(id)
      } else {
        this.getProfileInformations(id)
        this.listCreatedQuests(id)
      }
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async listCreatedQuests(id) {
      let response = await QuestService.ListCreatedByAUser(id)
      this.quests.built = response.data
    },
    /*
     * Get the list of the quests played by the user
     * @param   {string}    id            ID of the user
     */
    async listPlayedQuests(id) {
      let response = await QuestService.ListPlayedByAUser(id)
      this.quests.played = response.data
    },
    /*
     * Get the profile of the user
     * @param   {string}    id            ID of the user
     */
    async getProfileInformations(id) {
      let response = await AuthService.getAccount(id)
      this.profile = response.data
      //this.$store.dispatch('setTitle', this.profile.name)
    },
    /*
     * Back to the map
     */
    backToMap() {
      this.$router.push('/map')
    }
  }
}
</script>

<style scoped>

</style>
