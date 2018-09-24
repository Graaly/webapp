<template>
  <div>
    <q-list highlight>
      <q-list-header>{{ $t('label.Coins') }}</q-list-header>
      <q-item>
        <q-item-side image="/statics/icons/game/shop-coins-medium.png" />
        <q-item-main :label="'600 ' + $t('label.coins')" />
        <q-item-side right>
          <q-btn color="positive">0,99 €</q-btn>
        </q-item-side>
      </q-item>
      <q-item>
        <q-item-side image="/statics/icons/game/shop-bag-medium.png" />
        <q-item-main :label="'3000 ' + $t('label.coins')" />
        <q-item-side right>
          <q-btn color="positive">2,99 €</q-btn>
        </q-item-side>
      </q-item>
      <q-item>
        <q-item-side image="/statics/icons/game/shop-chest-medium.png" />
        <q-item-main :label="'6000 ' + $t('label.coins')" />
        <q-item-side right>
          <q-btn color="positive">5,99 €</q-btn>
        </q-item-side>
      </q-item>
    </q-list>
    
  </div>
</template>

<script>

export default {
  data() {
    return {
      
    }
  },
  async mounted() {
    // init
  },
  methods: {
    /*
     * User select an offer in the shop
     */
    async selectOffer() {
      // Get stepId
      
    }
  }
}
</script>
