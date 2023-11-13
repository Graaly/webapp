<template>
  <div class="bg-white">
    HELLO
    <div>
      <pre>
        Gold: {{ goldCoins | 0 }}

        Product.state: {{myTransaction ? myTransaction.state : ''}}
               .title: {{myProduct ? myProduct.title : ''}}
               .descr: {{myProduct ? myProduct.description : ''}}
               .price: {{myProduct ? myProduct.pricing.price : ''}}

      </pre>
      <button v-if="myProduct && myProduct.canPurchase" @click="myProduct.getOffer().order()">Purchase</button>
    </div>
  </div>
</template>

<script>
import utils from 'src/includes/utils'

export default {
  data () {
    return {
      goldCoins: 0,
      myTransaction: false,
      myProduct: false,
      serverUrl: process.env.SERVER_URL
    }
  },
  mounted() {
    const {store, ProductType, Platform} = CdvPurchase;
    console.log("test1")
    this.refreshUI();
    console.log("test2")
    store.register([{
      type: CdvPurchase.CONSUMABLE,
      id: 'premiumprice5',
      platform: Platform.GOOGLE_PLAY,
    }]);
    console.log("test3")
    store.when()
      .productUpdated(this.refreshUI)
      .approved(this.finishPurchase);
    console.log("test4")
    store.initialize([Platform.GOOGLE_PLAY]);
    console.log("test5")
  },
  methods: {
    finishPurchase(p) {
    console.log("test6")
      this.goldCoins = this.goldCoins + 10;
      console.log("test7")
      p.finish();
      console.log("test8")
      this.refreshUI();
      console.log("test9")
    },
    refreshUI() {
      const {store, ProductType, Platform} = CdvPurchase;
      console.log("test10")
      this.myProduct = store.get('premiumprice5', Platform.GOOGLE_PLAY);
      console.log("test11")
      this.myTransaction = store.findInLocalReceipts(this.myProduct);
      console.log("test12")
    }
  }
}
</script>

<style lang="scss">
</style>
