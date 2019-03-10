<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      
      <a class="float-right no-underline" color="grey" @click="$router.push('/map')"><q-icon name="close" class="medium-icon" /></a>
      <h1 class="size-3">Administration</h1>
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs two-lines>
        <q-tab slot="title" name="validation" icon="check_box" label="Quests validation" default />
        <q-tab slot="title" name="rejected" icon="sentiment_very_dissatisfied" label="Quests rejected" />
        <q-tab slot="title" name="minigames" icon="child_friendly" label="Mini games" />
      
        <!------------------ LIST OF QUESTS TO VALIDATE TAB ------------------------>
        
        <q-tab-pane name="validation">
          
          <q-list highlight>
            <q-item v-for="quest in questsToValidate.items" :key="quest._id" @click.native="$router.push('/quest/play/' + quest.questId)">
              <q-item-side v-if="quest.picture" :avatar="serverUrl + '/upload/quest/' + quest.picture" />
              <q-item-side v-if="!quest.picture" :avatar="'statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ getQuestTitle(quest, false) }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                  {{ $t('label.Unpublished') }}
                </q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-if="questsToValidate.items.length === 0">
              <q-item-main>
                <q-item-tile label>No quest to validate</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        
        <!------------------ LIST OF QUESTS REJECTED TAB ------------------------>
        
        <q-tab-pane name="rejected">
          
          <q-list highlight>
            <q-item v-for="quest in questsRejected.items" :key="quest._id" @click.native="$router.push('/quest/play/' + quest.questId)">
              <q-item-side v-if="quest.picture" :avatar="serverUrl + '/upload/quest/' + quest.picture" />
              <q-item-side v-if="!quest.picture" :avatar="'statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ getQuestTitle(quest, false) }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                  {{ $t('label.Unpublished') }}
                </q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-if="questsRejected.items.length === 0">
              <q-item-main>
                <q-item-tile label>No quest rejected</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        <!------------------ MINI GAMES TAB ------------------------>
        
        <q-tab-pane name="minigames">
          
          <q-btn link class="full-width" @click="$router.push('/admin/minigames/builder')" color="tertiary">{{ $t('label.AddATown') }}</q-btn>
          
          <q-list highlight>
            <q-item v-for="town in towns.items" :key="town._id">
              <q-item-main>
                <q-item-tile label>{{ town.name }} ({{ town.zipcode }})</q-item-tile>
                <q-item-tile sublabel >
                  {{ town.country }}
                </q-item-tile>
              </q-item-main>
              <q-item-side v-if="town.status === 'new'" >
                <q-btn>Configure</q-btn>
              </q-item-side>
              <q-item-side v-if="town.status === 'configured'" >
                <q-btn>Update</q-btn>
              </q-item-side>
            </q-item>
            <q-item v-if="towns.items.length === 0">
              <q-item-main>
                <q-item-tile label>No town configured yet</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        
      </q-tabs>
      
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
