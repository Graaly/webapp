<template>
  <div class="column" ref="div-column">
    
    <div class="row">
      <q-list highlight>
        <q-item v-for="(item, index) in quests" :key="item._id">
          <q-item-side>
            <q-icon name="location on" size="2rem" /><br />
            <small>{{ item.distance }} km</small>
          </q-item-side>
          <q-item-main @click="$router.push('/quest/play/' + item._id)">
            <q-item-tile label>{{ item.title }}</q-item-tile>
            <q-item-tile sublabel>
              {{item.author}} 
            </q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
      <q-item v-show='quests.length == 0' @click="$router.push('/quest/create')">
        <q-item-side>
          <q-icon name="explore" size="2rem" />
        </q-item-side>
        <q-item-main>
          <q-item-tile label>Aucune enquête ne correspond à votre recherche</q-item-tile>
          <q-item-tile sublabel>
            <a @click="$router.push('/quest/create')">Pourquoi ne pas créer cette enquête ?</a>
          </q-item-tile>
        </q-item-main>
      </q-item>
    </div>
    
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
export default {
  data () {
    return {
      title: 'Carte',
      userPosition: {
        longitude: 0,
        latitude: 0
      },
      quests: []
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', "Recherche")
    
    if (this.$data.geolocationIsSupported) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userPosition.latitude = position.coords.latitude
        this.userPosition.longitude = position.coords.longitude
      });
    }
    
    this.findQuest()
  },
  methods: {
    async findQuest() {
      var userPosition = this.userPosition
      let response = await QuestService.find(this.$route.params.searchText, this.userPosition)
      this.quests = response.data
      
      // compute distance
      this.quests = this.quests.map(function(quest) {
        let distLong = quest.position.lng - userPosition.longitude
        let distLat = quest.position.lat - userPosition.latitude

        quest.distance = Math.floor(Math.sqrt(distLong*distLong + distLat*distLat))
        return quest;
      });
    }
  }
}
</script>

<style scoped>

</style>
