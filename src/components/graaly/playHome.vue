<template>
  
  <div class="wrapper">
    
    <h1>{{ graaly.title }}</h1>
    
    <div class="header">
      <div>
        <div class="img shadow-5">&nbsp;</div>
      </div>
      
      <div class="desc">
        <p>[[Auteur]]</p>
        <p v-if="graaly.rating">
          <q-rating readonly :value="Math.round(graaly.rating)" :max="5" size="1.7rem" />
        </p>
        <p>{{ graaly.availablePoints }} points à gagner</p>
        <p><q-btn @click="$router.push('/graaly/play/' + $route.params.id + '/step/1')" color="tertiary">Résoudre l'énigme</q-btn></p>
      </div>
    </div>
    <hr />
    
    <p>{{ graaly.description }}</p>
    <p>Langue: {{ graaly.language }}</p>
    <p v-if="graaly.startingPlace">Lieu de départ: {{ graaly.startingPlace }}</p>
    <p>Difficulté: {{ getGraalyLevelName(graaly.level) }}</p>
  </div>
  
</template>

<script>

import GraalyService from 'services/GraalyService'
import graalyLevels from 'data/graalyLevels.json'
import { QRating } from 'quasar'
import utils from 'src/includes/utils'

export default {
  components: {
    QRating
  },
  data () {
    return {
      title: 'Résoudre un Graaly',
      graaly: {}
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
    
    this.getGraaly(this.$route.params.id);
  },
  methods: {
    async getGraaly(id) {
      let response = await GraalyService.getById(id)
      this.graaly = response.data
    },
    // TODO make this more generic (basic model methods over 'webapp simple JSON files')
    // e.g. import JSONModels from 'utils/json-models'; graalyLevels = JSONModels('graalyLevels'); graalyLevels.getById(123)
    // see https://stackoverflow.com/questions/29923879/pass-options-to-es6-module-imports
    getGraalyLevelName(id) {
      let level = utils.getById(graalyLevels, id)
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
  background: url('../../statics/graalies/sample-icon-graaly.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 10rem 10rem;
}
</style>
