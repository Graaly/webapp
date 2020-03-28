<template>
  <div class="scroll background-dark">
    <div id="teaser q-mb-lg">
      <div class="subtitle3 q-pa-md q-mt-xl q-pt-lg">
        {{ $t('label.' + ($store.state.user.id === $route.params.id ? 'YourBadges' : 'Badges')) }}
      </div>
      <badgesList :format="$store.state.user.id === $route.params.id ? 'bytown' : 'list'" :badges="badges"></badgesList>
        
      <!------------------ HEADER COMPONENT ------------------------>
      
      <div class="q-py-sm q-px-md dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="backToTheMap()" />
      </div>
    </div>
    
  </div>
</template>

<script>
import UserService from 'services/UserService'
import badgesList from 'components/user/badgesList'

export default {
  components: {
    badgesList
  },
  data () {
    return {
      badges: null,
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    this.loadBadges()
  },
  methods: {
    /*
     * List badges
     */
    async loadBadges() {
      const response = await UserService.getRewards(this.$route.params.id, 'all')
      if (response && response.data) {
        this.badges = response.data
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
