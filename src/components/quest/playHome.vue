<template>
  
  <div class="wrapper">
    
    <h1>{{ quest.title }}</h1>
    
    <div class="header">
      <div>
        <div class="img shadow-5">&nbsp;</div>
      </div>
      
      <div class="desc">
        <p>[[Auteur]]</p>
        <p v-if="quest.rating">
          <q-rating readonly :value="Math.round(quest.rating)" :max="5" size="1.7rem" />
        </p>
        <p>{{ quest.availablePoints }} points à gagner</p>
        <p><q-btn @click="$router.push('/quest/play/' + $route.params.id + '/step/1')" color="tertiary">Résoudre l'énigme</q-btn></p>
      </div>
    </div>
    <hr />
    
    <p>{{ quest.description }}</p>
    <p>Langue: {{ quest.language }}</p>
    <p v-if="quest.startingPlace">Lieu de départ: {{ quest.startingPlace }}</p>
    <p>Difficulté: {{ getQuestLevelName(quest.level) }}</p>
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

.wrapper { padding: 1rem; overflow-y: scroll; }

h1 { font-size: 1.3rem; font-weight: bold; margin: 0; margin-bottom: 1rem; }

.header { display: table; border-collapse: collapse; }
.header > div { display: table-cell; }
.header div.desc { padding-left: 1rem; }

.header div.img {
  display: block;
  width: 9rem;
  height: 9rem;
  border-radius: 1rem;
  background: url('../../statics/quests/sample-icon-quest.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 10rem 10rem;
}
</style>