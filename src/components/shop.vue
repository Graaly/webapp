<template>
  <div>
    <p class="q-ml-md">Pendant les tests, l'énergie est gratuite !</p>
    <q-list highlight>
      <q-item-label>{{ $t('label.Coins') }}</q-item-label>
      <q-item>
        <q-item-section avatar><img src="statics/icons/game/shop-coins-medium.png" /></q-item-section>
        <q-item-label>600 {{ $t('label.coins') }}</q-item-label>
        <q-item-section side>
          <q-btn color="positive" @click="buy('graaly.600-coins')">0€ (Beta)</q-btn>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar><img src="statics/icons/game/shop-bag-medium.png" /></q-item-section>
        <q-item-label>3000 {{ $t('label.coins') }}</q-item-label>
        <q-item-section side>
          <q-btn color="positive" @click="buy('graaly.3000-coins')">0€ (Beta)</q-btn>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar><img src="statics/icons/game/shop-chest-medium.png" /></q-item-section>
        <q-item-label>6000 {{ $t('label.coins') }}</q-item-label>
        <q-item-section side>
          <q-btn color="positive" @click="buy('graaly.6000-coins')">0€ (Beta)</q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    
    <!--====================== WIN COINS ANIMATION =================================-->
      
    <div v-if="coinsWon && coinsWon > 0" class="fadein-message">+{{ coinsWon }} <q-icon color="white" name="fas fa-bolt" /></div>
        
  </div>
</template>

<script>
import UserService from 'services/UserService'
import Notification from 'boot/NotifyHelper'

export default {
  data() {
    return {
      coinsWon: 0
    }
  },
  async mounted() {
    // init
    this.coinsWon = 0
  },
  methods: {
    /*
     * User select an offer in the shop
     */
    async buy(offer) {
      // reset animation
      this.coinsWon = 0
      // Get stepId
      var buyStatus = await UserService.buy(offer)

      if (buyStatus && buyStatus.data && buyStatus.data.coins) {
        this.coinsWon = buyStatus.data.coins
        this.$store.state.user.coins += this.coinsWon
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      setTimeout(this.resetCoinsWon, 2000)
    },
    resetCoinsWon() {
      this.coinsWon = 0
      this.$emit('close')
    }
  }
}
</script>
