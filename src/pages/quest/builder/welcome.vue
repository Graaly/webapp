<template>
  <div class="scroll background-dark">
    <div id="teaser" class="reduce-window-size-desktop">
      <div v-if="!userType">
        <h1 class="subtitle3 text-uppercase q-px-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderChooseUserType') }}
        </div>
        <div class="q-pa-md" @click="changeUserType('pro')" test-id="btn-create-public-quest">
          <q-card class="my-card">
            <q-card-section class="bg-accent text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.AProfessional') }}</div>
            </q-card-section>

            <q-card-section class="bg-accent text-white subtitle5">
              {{ $t('label.AProfessionalDesc1') }}
            </q-card-section>
          </q-card>
        </div>
        <div class="q-pa-md" @click="changeUserType('individual')">
          <q-card class="my-card">
            <q-card-section class="bg-accent text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.AnIndividual') }}</div>
            </q-card-section>

            <q-card-section class="bg-accent text-white subtitle5">
              {{ $t('label.AnIndividualDesc1') }}
            </q-card-section>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="cancel">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div v-if="userType==='pro' && !access">
        <h1 class="subtitle3 text-uppercase q-px-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderProIntro') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white" @click="changeAccess('public')">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PublicQuest') }}</div>
              <div class="subtitle4">{{ $t('label.PaymentOnUsage') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              <div v-html="$t('label.PublicProQuestDesc1')"></div>
              <!--<div class="centered" v-if="!readMorePublicProQuest"><a @click="readMorePublicProQuest = true">{{ $t('label.ReadMore') }}</a></div>-->
            </q-card-section>
            
            <q-card-section v-if="readMorePublicProQuest">
              <div v-html="$t('label.PublicProQuestDesc2')"></div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="white">{{ $t('label.TryForFree') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white" @click="changeAccess('private')">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PrivateQuest') }}</div>
              <div class="subtitle4">{{ $t('label.PaymentOnUsage') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              {{ $t('label.PrivateProQuestDesc1') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="white">{{ $t('label.TryForFree') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          {{ $t('label.AddYourRoomInTheDirectory') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white" @click="changeAccess('public'); changeQuestType('room')">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.AddYourRoom') }}</div>
              <div class="subtitle4">{{ $t('label.Free') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              <div v-html="$t('label.ProAddYourRoom')"></div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="white">{{ $t('label.Add') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="backToUserType">{{ $t('label.Back') }}</q-btn>
        </div>
      </div>
      <div v-if="userType==='individual' && !access">
        <h1 class="subtitle3 text-uppercase q-pa-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderIntro') }}
        </div>
        <!--<div class="q-pa-md">
          <q-card class="my-card bg-primary text-white">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PublicQuest') }}</div>
              <div class="subtitle4">{{ $t('label.Free') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              {{ $t('label.PublicQuestDesc1') }}
            </q-card-section>
            
            <q-card-section class="subtitle5">
              {{ $t('label.PublicQuestDesc2') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="white" @click="changeAccess('public')">{{ $t('label.CreatePublicQuest') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>-->
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PrivateQuest') }}</div>
              <div class="subtitle4" v-if="privateQuest.buyable">{{ privateQuest.price }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              {{ $t('label.PrivateQuestDesc1') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn v-if="privateQuest.buyable" flat color="white" @click="changeAccess('private')">{{ $t('label.BuyPrivateQuest') }}</q-btn>
              <q-btn v-if="!privateQuest.buyable" flat disabled>{{ $t('label.OnlyBuyableOnMobile') }}</q-btn>
              <!--<q-btn flat>Utiliser un modèle</q-btn>-->
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="backToUserType">{{ $t('label.Back') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'public' && questType === 'room'">
        <h1 class="subtitle3 text-uppercase q-pa-md q-mt-xl q-pt-lg">{{ $t('label.AddYourRoom') }}</h1>
        <div class="q-pa-md" v-html="$t('label.BuilderAddRoomMessage')"></div>
        <div class="q-px-md centered">
          <q-btn color="primary" class="glossy large-btn" @click="createNewQuest()" test-id="btn-accept-rules"><div>{{ $t('label.Add') }}</div></q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'public' && questType === 'quest'">
        <h1 class="subtitle3 text-uppercase q-pa-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourPublicQuest') }}</h1>
        <div class="q-pa-md" v-html="$t('label.BuilderWelcomeMessage')"></div>
        <div class="q-px-md centered">
          <q-btn color="primary" class="glossy large-btn" @click="createNewQuest()" test-id="btn-accept-rules"><div>{{ $t('label.AcceptTheRules') }}</div></q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'private'">
        <h1 class="subtitle3 text-uppercase q-pa-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourPrivateQuest') }}</h1>
        <div v-if="userType === 'individual'" class="q-pa-md" v-html="$t('label.BuilderPrivateWelcomeMessage')"></div>
        <div v-if="userType === 'pro'" class="q-pa-md" v-html="$t('label.BuilderPrivateProWelcomeMessage')"></div>
        <div class="q-px-md centered">
          <q-btn v-if="userType === 'individual'" color="primary" class="glossy large-btn" @click="buyPrivateQuest()"><div>{{ $t('label.AcceptAndBuyAPrivateQuest') }} ({{ privateQuest.price }})</div></q-btn>
          <q-btn v-if="userType === 'pro'" color="primary" class="glossy large-btn" @click="createNewQuest()"><div>{{ $t('label.AcceptTheRules') }}</div></q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      
      <!------------------ HEADER COMPONENT ------------------------>
      
      <div class="q-py-sm q-px-md dark-banner opaque-banner fixed-top">
        <q-btn flat icon="arrow_back" @click="cancel()" />
      </div>
    </div>
  </div>
</template>

<script>

import Notification from 'boot/NotifyHelper'
import QuestService from 'services/QuestService'

export default {
  data() {
    return {
      userType: null,
      access: null,
      questType: 'quest',
      readMorePublicProQuest: false,
      privateQuest: {
        price: '-',
        buyable: false,
        computed: false
      }
    }
  },
  async mounted () {
  },
  methods: {
    /*
     * Open money winning explaination
     */
    openMoneyPopup() {  
      this.$q.dialog({
        title: this.$t('label.HowToWinMoney'),
        message: this.$t('label.HowToWinMoneyExplaination')
      })
    },
    /*
     * change user type (pro / individual)
     */
    async changeUserType(userType) {  
      this.userType = userType; 
      this.moveToTop();
      if (userType === 'individual') {
        await this.initPay()
      }
    },
    /*
     * change access mode (public / private)
     */
    changeAccess(access) {  
      this.access = access; 
      this.moveToTop();
    },
    /*
     * change quest type (quest / room)
     */
    changeQuestType(type) {  
      this.questType = type; 
      this.moveToTop();
    },
    /*
     * Scroll page to the top
     */
    moveToTop() {
      window.scrollTo(0, 0)
    },
    /*
     * Buy a private quest
     */
    async buyPrivateQuest() {
      store.order('privatequestprice')
    },
    /*
     * Create a new quest
     */
    async createNewQuest() {
      // Define default quest settings
      let newQuest = {
        title: {}
      }
      let res = await QuestService.create(newQuest, this.access, this.userType, this.questType)

      if (res && res.data && res.data.questId) {
        this.$router.push('/quest/builder/' + res.data.questId)
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * Check if user must pay to play this quest
     */
    async initPay() {
      // init Store pay
      if (!window.cordova) {
        //Notification(this.$t('label.YouMustPlayThisKindOfQuestOnAMobileDevice'), 'error')
        return
      }

      //if price is already computed
      if (this.privateQuest.computed) {
        return
      }
      this.privateQuest.computed = true
      
      // if user already come on this page, product may be already registered
      if (!store.products.byId["privatequestprice"]) {
        store.register({
          id: 'privatequestprice',
          alias: 'privatequestprice',
          type: store.CONSUMABLE
        })
      } else {
        var product = store.get('privatequestprice')
        this.displayPrice(product)
      }

      store.error(function(error) {
        Notification(error.message + '(code: ' + error.code + ')', 'error')
      })
            
      store.when('privatequestprice').updated(this.displayPrice)

      store.when('privatequestprice').approved(function(product) {
        product.verify()
      });

      store.when('privatequestprice').verified(async(product) => {
        // save the product purchase
        const purchaseStatus = await this.savePurchase(product)

        if (purchaseStatus) {
          product.finish()
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });

      store.refresh();
    },
    displayPrice(product) {
      //var product = store.get('privatequestprice')
      // check if product is orderable
      this.privateQuest.price = product.price
      if (product.canPurchase) {
        this.privateQuest.buyable = true
        //await this.savePurchase(product)
      }
    },
    /*
     * Save a purchase
     */
    async savePurchase (product) {
      const purchaseStatus = await QuestService.purchasePrivateQuest(null, product)
      
      if (purchaseStatus && purchaseStatus.data && purchaseStatus.data.status && purchaseStatus.data.status === 'ok') {
        await this.createNewQuest()
        return true
      }
      return false
    },
    /*
     * Cancel creation
     */
    async cancel() {
      this.$router.push('/profile/me')
    },
    /*
     * Back to user type selection
     */
    async backToUserType() {
      this.userType = null
      this.access = null
    }
  }
}
</script>
