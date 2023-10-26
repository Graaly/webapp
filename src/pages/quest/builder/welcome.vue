<template>
  <div class="scroll background-welcome">
    <!--  HEADER COMPONENT -->
    <div class="welcome">
      <q-tab-panels v-model="panel" animated class="bg-transparent q-mb-xl">

        <!--   FIRST PANEL     -->

        <q-tab-panel name="first">
          <div class="text-center">
            <q-img src="statics/new/logo-color-white.png" class="login-logo-top"/>
            <div class="subtitle text-accent text-uppercase">{{ $t('label.CreationStudio') }}</div>
          </div>
          <div class="q-px-lg">
            <div class="q-mb-lg">{{ $t('label.BuilderChooseUserType') }}</div>
            <div class="flex no-wrap items-start">
              <text-btn-square
                class="q-mb-lg q-mr-sm"
                @click.native="selectType('pro')"
                :title=" $t('label.AProfessional')"
                color="secondary"
                icon="business_center"
              />
              <q-btn icon="info" color="secondary" style="max-width: 50px; border-radius: 12px" @click="popupType('pro')"/>
            </div>
            <div class="flex no-wrap items-start">
              <text-btn-square
                class="q-mb-lg q-mr-sm"
                @click.native="selectType('individual')"
                :title="$t('label.AnIndividual')"
                color="primary"
                icon="family_restroom"
              />
              <q-btn icon="info" color="primary" style="max-width: 50px; border-radius: 12px" @click="popupType('individual')"/>
            </div>
            <div class="flex no-wrap items-start">
              <text-btn-square
                class="q-mb-lg q-mr-sm"
                @click.native="selectType('education')"
                :title="$t('label.Education')"
                color="accent"
                icon="school"
                disable
              />
              <q-btn icon="info" color="accent" style="max-width: 50px; border-radius: 12px" @click="popupType('education')"/>
            </div>
          </div>
        </q-tab-panel>

        <!--   SECOND PANEL     -->

        <q-tab-panel name="second">
          <q-card class="new-dialog bg-transparent" flat>
            <q-card-section class="dialog-title flex justify-between items-center">
              <icon-btn-square :color="userType === 'education' ? 'secondary' : 'accent'" fill icon="navigate_before" @click.native="panel = 'first'"/>
              <q-space/>
              <span v-if="userType === 'pro'">{{ $t('label.AProfessional') }}</span>
              <span v-if="userType === 'individual'">{{ $t('label.AnIndividual') }}</span>
              <span v-if="userType === 'education'">{{ $t('label.Education') }}</span>
            </q-card-section>
            <q-card-section v-if="userType === 'pro'">
              <div>
                <div class="centered">
                  <div class="dialog-title">{{ $t('label.PrivateQuest') }} <span class="dialog-subtitle">{{ $t('label.PaymentOnUsage') }}</span></div>
                </div>
                <div class="dialog-text q-mb-md">
                  <div v-html="$t('label.PrivateProQuestDesc1')"></div>
                </div>

                <text-btn-square
                  class="q-mb-lg"
                  @click.native="selectAccess('private')"
                  :title="$t('label.TryForFree')"
                  :color="userType === 'education' ? 'secondary' : 'accent'"
                  icon="play_arrow"
                />
              </div>
              <div>
                <div class="centered">
                  <div class="dialog-title">{{ $t('label.PublicQuest') }} <span class="dialog-subtitle">{{ $t('label.PaymentOnUsage') }}</span></div>
                </div>
                <div class="dialog-text q-mb-md">
                  <div v-html="$t('label.PublicProQuestDesc1')"></div>
                  <div v-if="readMorePublicProQuest" v-html="$t('label.PublicProQuestDesc2')"></div>
                </div>

                <text-btn-square
                  class="q-mb-md"
                  @click.native="selectAccess('public')"
                  :title="$t('label.TryForFree')"
                  :color="userType === 'education' ? 'secondary' : 'accent'"
                  icon="play_arrow"
                />
              </div>
            </q-card-section>
            <q-card-section v-if="userType === 'individual'">
              <div>
                <div class="dialog-text">{{ $t('label.BuilderIntro') }}</div>
                <div class="centered">
                  <div class="dialog-title">{{ $t('label.PrivateQuest') }}</div>
                </div>
                <div class="dialog-text q-mb-md">
                  <div>{{ $t('label.PrivateQuestDesc1') }}</div>
                  <div>{{ $t('label.AnIndividualDesc1') }}</div>
                </div>
                <text-btn-square
                  class="q-mb-lg"
                  @click.native="selectAccess('private')"
                  :title="$t('label.CreatePrivateQuest')"
                  :color="userType === 'education' ? 'secondary' : 'accent'"
                  icon="play_arrow"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!--   LAST PANEL     -->

        <q-tab-panel name="last">
          <q-card class="new-dialog bg-transparent" flat>
            <q-card-section class="dialog-title flex justify-between items-center">
              <icon-btn-square :color="userType === 'education' ? 'secondary' : 'accent'" fill icon="navigate_before" @click.native="panel = 'second'"/>
              <q-space/>
              <span v-if="userType === 'pro'" class="text-right">{{ $t('label.AProfessional') }}<br>{{ access === 'private' ? $t('label.PrivateQuest') : $t('label.PublicQuest') }}</span>
              <span v-if="userType === 'individual'" class="text-right">{{ $t('label.AnIndividual') }}<br>{{ access === 'private' ? $t('label.PrivateQuest') : $t('label.PublicQuest') }}</span>
              <span v-if="userType === 'education'" class="text-right">{{ $t('label.Education') }}<br>{{ access === 'private' ? $t('label.PrivateQuest') : $t('label.PublicQuest') }}</span>
            </q-card-section>
            <q-card-section v-if="access === 'public'">
              <span class="dialog-text" v-html="$t('label.BuilderWelcomeMessage')"></span>
              <text-btn-square
                class="q-mb-lg"
                @click.native="createNewQuest()"
                :title="$t('label.AcceptTheRules')"
                :color="userType === 'education' ? 'secondary' : 'accent'"
                icon="done"
              />
            </q-card-section>
            <q-card-section v-if="access === 'private'">
              <span v-if="userType === 'pro'" class="dialog-text" v-html="$t('label.BuilderPrivateProWelcomeMessage')"></span>
              <span v-if="userType === 'individual'" class="dialog-text" v-html="$t('label.BuilderPrivateWelcomeMessage')"></span>
              <text-btn-square
                v-if="userType === 'pro'"
                class="q-mb-lg"
                @click.native="createNewQuest()"
                :title="$t('label.AcceptTheRules')"
                :color="userType === 'education' ? 'secondary' : 'accent'"
                icon="done"
              />
              <text-btn-square
                v-if="userType === 'individual'"
                class="q-mb-lg"
                @click.native="buyPrivateQuest()"
                :title="$t('label.AcceptTheRules')"
                :color="userType === 'education' ? 'secondary' : 'accent'"
                icon="done"
              />
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>

      <!-- DIALOG SHEET -->

      <q-dialog v-model="infoPopup" position="right">
        <q-card class="new-dialog q-mx-md" :class="[infoType === 'pro' ? 'bg-secondary' : infoType === 'individual' ? 'bg-primary' : 'bg-accent']">
          <q-card-section class="dialog-title flex justify-between items-center">
            <span v-if="infoType === 'pro'">{{ $t('label.AProfessional') }}</span>
            <span v-if="infoType === 'individual'">{{ $t('label.AnIndividual') }}</span>
            <span v-if="infoType === 'education'">{{ $t('label.Education') }}</span>
            <q-space/>
            <icon-btn-square :color="infoType === 'education' ? 'secondary' : 'accent'" icon="close" rotation fill v-close-popup/>
          </q-card-section>
          <q-card-section v-if="infoType === 'pro'">
            {{ $t('label.AProfessionalDesc1') }}
          </q-card-section>
          <q-card-section v-if="infoType === 'individual'">
            {{ $t('label.AnIndividualDesc1') }}
          </q-card-section>
          <q-card-section v-if="infoType === 'education'">
            {{ $t('label.EducationDesc') }}
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>

import Notification from 'boot/NotifyHelper'
import QuestService from 'services/QuestService'

import iconBtnSquare from "../../../components/user/UI/iconBtnSquare";
import textBtnSquare from "../../../components/user/UI/textBtnSquare";
import backBar from "../../../components/user/UI/backBar";

export default {
  components: {
    iconBtnSquare, textBtnSquare, backBar
  },

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
      },

      panel: "first",
      infoPopup: false,
      infoType: 'pro',
      infoColor: 'secondary'
    }
  },
  async mounted () {
  },
  methods: {
    // New Design Methods
    selectType(type) {
      this.userType = type
      this.panel = 'second'
    },
    popupType(type) {
      this.infoType = type
      this.infoPopup = true
    },
    selectAccess(access) {
      this.access = access
      this.panel = 'last'
    },
    /*
     * Open money winning explaination
     */
    /*openMoneyPopup() {
      this.$q.dialog({
        title: this.$t('label.HowToWinMoney'),
        message: this.$t('label.HowToWinMoneyExplaination')
      })
    },*/
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
      // disable purchase
      //store.order('privatequestprice')
      this.createNewQuest()
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
<style scoped lang="scss">
.background-welcome {
  background-image: url('../../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.welcome{
  max-width: 800px;
  margin: 0 auto;
  color: white;
  .login-logo-top{
    width: 25vh;
    margin-top: 5vh;
  }
  .subtitle{
    position: relative;
    top: -10px;
    margin-bottom: 5vh;
  }
}
.new-dialog{
  background: #D60B52;
  border: none;
  .dialog-title{
    text-transform: uppercase;
    font-size: 24px;
  }
  .dialog-subtitle{
    font-size: 20px;
  }
  .dialog-text{
    font-size: 16px;
  }
}
</style>
