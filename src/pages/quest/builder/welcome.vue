<template>
  <div>
    <div class="wrapper">
      <div v-if="!userType">
        <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md centered">
          {{ $t('label.BuilderChooseUserType') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-secondary text-white">
              <div class="text-h6">{{ $t('label.AProfessional') }}</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.AProfessionalDesc1') }}
            </q-card-section>
            
            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="secondary" @click="changeUserType('pro')" test-id="btn-create-public-quest">{{ $t('label.Select') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-secondary text-white">
              <div class="text-h6">{{ $t('label.AnIndividual') }}</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.AnIndividualDesc1') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="secondary" @click="changeUserType('individual')">{{ $t('label.Select') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="cancel">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div v-if="userType==='pro' && !access">
        <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md centered">
          {{ $t('label.BuilderProIntro') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ $t('label.PublicQuest') }} - {{ $t('label.PaymentOnUsage') }}</div>
            </q-card-section>

            <q-card-section>
              <div v-html="$t('label.PublicProQuestDesc1')"></div>
              <div class="centered" v-if="!readMorePublicProQuest"><a @click="readMorePublicProQuest = true">{{ $t('label.ReadMore') }}</a></div>
            </q-card-section>
            
            <q-card-section v-if="readMorePublicProQuest">
              <div v-html="$t('label.PublicProQuestDesc2')"></div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="primary" @click="changeAccess('public')">{{ $t('label.TryForFree') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ $t('label.PrivateQuest') }} - {{ $t('label.FromPrice') }} 399 €</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.PrivateProQuestDesc1') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="primary" @click="changeAccess('private')">{{ $t('label.TryForFree') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="backToUserType">{{ $t('label.Back') }}</q-btn>
        </div>
      </div>
      <div v-if="userType==='individual' && !access">
        <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderIntro') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ $t('label.PublicQuest') }} - {{ $t('label.Free') }}</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.PublicQuestDesc1') }}
            </q-card-section>
            
            <q-card-section>
              {{ $t('label.PublicQuestDesc2') }}
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="primary" @click="changeAccess('public')">{{ $t('label.CreatePublicQuest') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ $t('label.PrivateQuest') }} <span v-if="privateQuest.buyable">- {{ privateQuest.price }}</span></div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.PrivateQuestDesc1') }}
            </q-card-section>
            
            <!--<q-card-section>
              Vous pouvez soit créer l'enquête à partir d'un modèle, que vous pouvez modifier, soit partir de zéro et construire votre propre enquête
            </q-card-section>-->

            <q-separator />

            <q-card-actions align="right">
              <q-btn v-if="privateQuest.buyable" flat color="primary" @click="changeAccess('private')">{{ $t('label.BuyPrivateQuest') }}</q-btn>
              <q-btn v-if="!privateQuest.buyable" flat disabled>{{ $t('label.OnlyBuyableOnMobile') }}</q-btn>
              <!--<q-btn flat>Utiliser un modèle</q-btn>-->
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="backToUserType">{{ $t('label.Back') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'public'">
        <h1 class="size-3 centered">{{ $t('label.CreateYourPublicQuest') }}</h1>
        <div class="q-pa-md" v-html="$t('label.BuilderWelcomeMessage')"></div>
        <div class="q-px-md">
          <q-btn color="primary" class="full-width center" @click="createNewQuest()" test-id="btn-accept-rules">{{ $t('label.AcceptTheRules') }}</q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'private'">
        <h1 class="size-3 centered">{{ $t('label.CreateYourPrivateQuest') }}</h1>
        <div v-if="userType === 'individual'" class="q-pa-md" v-html="$t('label.BuilderPrivateWelcomeMessage')"></div>
        <div v-if="userType === 'pro'" class="q-pa-md" v-html="$t('label.BuilderPrivateProWelcomeMessage')"></div>
        <div class="q-px-md">
          <q-btn v-if="userType === 'individual'" color="primary" class="full-width center" @click="buyPrivateQuest()">{{ $t('label.AcceptAndBuyAPrivateQuest') }} ({{ privateQuest.price }})</q-btn>
          <q-btn v-if="userType === 'pro'" color="primary" class="full-width center" @click="createNewQuest()">{{ $t('label.AcceptTheRules') }}</q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
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
      readMorePublicProQuest: false,
      privateQuest: {
        price: '-',
        buyable: false
      }
    }
  },
  async mounted () {
    await this.initPay()
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
    changeUserType(userType) {  
      this.userType = userType; 
      this.moveToTop();
    },
    /*
     * change access mode (public / private)
     */
    changeAccess(access) {  
      this.access = access; 
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
      let res = await QuestService.create(newQuest, this.access, this.userType)

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

      var _this = this

      store.register({
        id: 'privatequestprice',
        alias: 'privatequestprice',
        type: store.CONSUMABLE
      })

      store.error(function(error) {
        Notification(error.message + '(code: ' + error.code + ')', 'error')
      })

      store.when('privatequestprice').updated(async(product) => {
        // check if product is orderable
        _this.privateQuest.price = product.price
        if (product.canPurchase) {
          _this.privateQuest.buyable = true
// TO REMOVE          
          //await this.savePurchase(product)
        }
      });

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
      this.$router.push('/map')
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
