<template>
  
  <div class="wrapper">
    <div class="row bottom-separator">
      <div class="col-3 padding-medium">
        <img :src="'/statics/quests/' + quest.picture" class="full-width" />
      </div>
      
      <div class="col desc padding-medium">
        <h1>{{ quest.title }}</h1>
        <p class="text-tertiary">[[Auteur]]</p>
        <p v-if="quest.rating">
          <q-rating readonly :value="Math.round(quest.rating)" :max="5" size="1.7rem" />
        </p>
        <p>{{ quest.availablePoints }} points à gagner</p>
        <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="primary">Résoudre l'énigme</q-btn></p>
      </div>
    </div>
    <div class="padding-medium">
      <p>{{ quest.description }}</p>
      <p>Langue: {{ quest.language }}</p>
      <p v-if="quest.startingPlace">Lieu de départ: {{ quest.startingPlace }}</p>
      <p>Difficulté: {{ getQuestLevelName(quest.level) }}</p>
    </div>
  </div>
  
</template>

<script>

import QuestService from 'services/QuestService'
import questLevels from 'data/questLevels.json'
import { QRating } from 'quasar'
import utils from 'src/includes/utils'

export default {
  components: {
    QRating
  },
  data () {
    return {
      title: 'Résoudre une enquête',
      quest: {}
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
    
    this.getQuest(this.$route.params.id);
  },
  methods: {
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.quest = response.data
    },
    // TODO make this more generic (basic model methods over 'webapp simple JSON files')
    // e.g. import JSONModels from 'utils/json-models'; questLevels = JSONModels('questLevels'); questLevels.getById(123)
    // see https://stackoverflow.com/questions/29923879/pass-options-to-es6-module-imports
    getQuestLevelName(id) {
      let level = utils.getById(questLevels, id)
      return level === null ? '' : level.name
    }
  }
}
</script>

<style scoped>

</style>