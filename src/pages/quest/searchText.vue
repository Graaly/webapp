<template>
  <div class="column" ref="div-column">
    <div class="row">
      <q-list highlight>
        <q-item v-for="item in quests" :key="item._id">
          <q-item-side>
            <q-icon name="location on" size="2rem" /><br />
            <small v-if="item.distance && item.distance > 0 && item.distance <= 99">{{ item.distance }} {{ $t('message.km') }}</small>
            <small v-if="item.distance === 0">< 1 {{ $t('message.km') }}</small>
            <small v-if="item.distance > 99">> 99 {{ $t('message.km') }}</small>
          </q-item-side>
          <q-item-main @click.native="$router.push('/quest/play/' + item._id)">
            <q-item-tile label>{{ item.title }}</q-item-tile>
            <q-item-tile sublabel>
              {{item.author}}
            </q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
      <q-item v-show='quests.length == 0' @click.native="$router.push('/quest/create')">
        <q-item-side>
          <q-icon name="explore" size="2rem" />
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{ $t('message.NoQuestForThisSearch') }}</q-item-tile>
          <q-item-tile sublabel>
            <a @click="$router.push('/quest/create')">{{ $t('message.WhyDontYouCreateAQuest') }}</a>
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
      geolocationIsSupported: navigator.geolocation,
      quests: []
    }
  },
  mounted() {
    this.$q.loading.show()
    try {
      // dispatch specific title for other app components
      this.$store.dispatch('setTitle', this.$t('message.Search'))
      if (this.$data.geolocationIsSupported) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.userPosition.latitude = position.coords.latitude
          this.userPosition.longitude = position.coords.longitude
          this.findQuest()
        }, () => {
          console.error('geolocation failed')
          this.geolocationIsSupported = false
          this.findQuest()
        }, { timeout: 10000, maximumAge: 10000 });
      } else {
        this.findQuest()
      }
    } catch (e) {
      this.$q.loading.show()
    }
  },
  methods: {
    async findQuest() {
      try {
        var userPosition = {lat: this.userPosition.latitude, lng: this.userPosition.longitude}
      
        let response = await QuestService.find(this.$route.params.searchText, userPosition)
        this.quests = response.data
        
        // compute distance
        if (this.$data.geolocationIsSupported) {
          this.quests = this.quests.map(function(quest) {
            const R = 6378.137
            let dLat = quest.location.coordinates[1] * Math.PI / 180 - userPosition.lat * Math.PI / 180;
            let dLon = quest.location.coordinates[0] * Math.PI / 180 - userPosition.lng * Math.PI / 180;
            let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userPosition.lat * Math.PI / 180) * Math.cos(quest.location.coordinates[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            quest.distance = Math.floor(R * c);
      
            return quest;
          });
        }
        this.$q.loading.hide()
      } catch (e) {
        this.$q.loading.hide()
      }
    }
  }
}
</script>

<style scoped>

</style>
