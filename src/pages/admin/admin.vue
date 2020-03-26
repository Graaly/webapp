<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <div class="background-dark q-pa-md">
        <a class="float-right no-underline close-btn" color="grey" @click="$router.push('/home')"><q-icon name="close" class="subtitle1" /></a>
        <div class="title2 centered">Administration</div>
      </div>
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs v-model="adminTab" class="bg-primary text-white">
        <q-tab name="validation" icon="check_box" label="Quests validation" default />
        <q-tab name="rejected" icon="sentiment_very_dissatisfied" label="Quests rejected" />
        <q-tab name="minigames" icon="child_friendly" label="Mini games" />
      </q-tabs>
      
      <q-separator />
      
      <q-tab-panels v-model="adminTab" animated>
      
        <!------------------ LIST OF QUESTS TO VALIDATE TAB ------------------------>
        
        <q-tab-panel name="validation">
          
          <q-list highlight>
            <q-item v-for="quest in questsToValidate.items" :key="quest._id">
              <q-item-section avatar @click.native="$router.push('/quest/play/' + quest.questId)">
                <q-avatar>
                  <img v-if="quest.thumb" :src="serverUrl + '/upload/quest/' + quest.thumb" />
                  <img v-if="!quest.thumb" src="statics/profiles/noprofile.png" />
                </q-avatar>
              </q-item-section>
              <q-item-section @click.native="$router.push('/quest/play/' + quest.questId)">
                <q-item-label>{{ getQuestTitle(quest, false) }}</q-item-label>
                <q-item-label caption v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
                </q-item-label>
                <q-item-label caption v-if="quest.status == 'unpublished'">
                  {{ $t('label.Unpublished') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn @click="validate(quest.questId, quest.version)" icon="check"></q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="questsToValidate.items.length === 0">
              <q-item-label>No quest to validate</q-item-label>
            </q-item>
          </q-list>
        </q-tab-panel>
        
        <!------------------ LIST OF QUESTS REJECTED TAB ------------------------>
        
        <q-tab-panel name="rejected">
          
          <q-list highlight>
            <q-item v-for="quest in questsRejected.items" :key="quest._id" @click.native="$router.push('/quest/play/' + quest.questId)">
              <q-item-section avatar>
                <q-avatar>
                  <img v-if="quest.thumb" :src="serverUrl + '/upload/quest/' + quest.thumb" />
                  <img v-if="!quest.thumb" src="statics/profiles/noprofile.png" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }}</q-item-label>
                <q-item-label caption v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
                </q-item-label>
                <q-item-label caption v-if="quest.status !== 'published'">
                  {{ $t('label.Unpublished') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="questsRejected.items.length === 0">
              <q-item-label>No quest rejected</q-item-label>
            </q-item>
          </q-list>
        </q-tab-panel>
        <!------------------ MINI GAMES TAB ------------------------>
        
        <q-tab-panel name="minigames">
          
          <q-btn link class="full-width" @click="$router.push('/admin/minigames/builder')" color="accent">{{ $t('label.AddATown') }}</q-btn>
          
          <q-list highlight>
            <q-item v-for="town in towns.items" :key="town._id">
              <q-item-section>
                <q-item-label>{{ town.name }} ({{ town.zipcode }})</q-item-label>
                <q-item-label caption>{{ town.country }}</q-item-label>
              </q-item-section>
              <q-item-section v-if="town.status === 'new'" side>
                <q-btn>Configure</q-btn>
              </q-item-section>
              <q-item-section v-if="town.status === 'configured'" side>
                <q-btn>Update</q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="towns.items.length === 0">
              <q-item-label>No town configured yet</q-item-label>
            </q-item>
          </q-list>
        </q-tab-panel>
        
      </q-tab-panels>
      
    </div>
  </div>
</template>

<script>
import AdminService from 'services/AdminService'

export default {
  data () {
    return ({
      questsToValidate: {
        items: []
      },
      questsRejected: {
        items: []
      },
      towns: {
        items: []
      },
      adminTab: 'validation',
      serverUrl: process.env.SERVER_URL
    })
  },
  mounted () {
    this.loadQuestsToValidate()
    this.loadQuestsRejected()
    this.loadTowns()
  },
  methods: {
    /*
     * List quests to validate
     */
    async loadQuestsToValidate() {
      // get quests to validate
      let response = await AdminService.ListQuestsToValidate()
      this.questsToValidate.items = response.data.quests
    },
    /*
     * List the towns
     */
    async loadTowns() {
      // get quests to validate
      let response = await AdminService.ListTowns()
      this.towns.items = response.data.towns
    },
    /*
     * validate a quest
     */
    async validate(questId, version) {
      this.$router.push('/admin/validate/' + questId + '/version/' + version)
    },
    /*
     * List quests rejected
     */
    async loadQuestsRejected() {
      // get quests to validate
      let response = await AdminService.ListQuestsRejected()
      this.questsRejected.items = response.data.quests
    },
    /*
     * Display title based on language
     * @param   {object}    quest            quest data
     * @param   {Boolean}   showLanguage     define if the map is displayed if the quest is not translated in the user language
     */
    getQuestTitle(quest, showLanguage) {
      if (!quest || !quest.title) {
        return this.$t('label.NoTitle')
      }
      if (this.$store.state.user.language && quest.title[this.$store.state.user.language]) {
        return quest.title[this.$store.state.user.language]
      } else {
        return quest.title[Object.keys(quest.title)[0]] + (showLanguage ? ' <img class="image-and-text-aligned" src="statics/icons/game/flag-' + Object.keys(quest.title)[0] + '.png" />' : '')
      }
    }
  }
}
</script>

<style>
</style>
