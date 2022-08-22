<template>
  <div class="scroll background-welcome">
    <!--  HEADER COMPONENT -->
<!--    <back-bar color="accent"/>-->
    <div class="welcome">
      <q-tab-panels v-model="panel" animated class="bg-transparent q-mb-xl">
        <!--   FIRST PANEL     -->
        <q-tab-panel name="first">
          <div class="text-center">
            <q-img src="statics/new/logo-color-white.png" class="login-logo-top"/>
            <div class="subtitle text-accent">STUDIO DE CREATION</div>
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
                  icon="business_center"
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
                  icon="business_center"
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
                  <div>{{ $t('label.PrivateQuestDesc1') }}"</div>
                </div>
                <text-btn-square
                  class="q-mb-lg"
                  @click.native="selectAccess('private')"
                  :title="$t('label.TryForFree')"
                  :color="userType === 'education' ? 'secondary' : 'accent'"
                  icon="business_center"
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
                :title="$t('label.AcceptAndBuyAPrivateQuest') + ' ' + privateQuest.price"
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

    <!-- -- -- -- -- -- -- ----------- OLD VERSION ------------ -- -- -- -- -- -- -->

<!--    <div id="teaser" class="reduce-window-size-desktop">
      <div v-if="!userType">
        <h1 class="subtitle3 text-uppercase q-px-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderChooseUserType') }}
        </div>
        <div class="q-pa-md cursor-pointer" @click="changeUserType('pro')" test-id="btn-create-public-quest">
          <q-card class="my-card">
            <q-card-section class="bg-accent text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.AProfessional') }}</div>
            </q-card-section>

            <q-card-section class="bg-accent text-white subtitle5">
              {{ $t('label.AProfessionalDesc1') }}
            </q-card-section>
          </q-card>
        </div>
        <div class="q-pa-md cursor-pointer" @click="changeUserType('individual')">
          <q-card class="my-card">
            <q-card-section class="bg-accent text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.AnIndividual') }}</div>
            </q-card-section>

            <q-card-section class="bg-accent text-white subtitle5">
              {{ $t('label.AnIndividualDesc1') }}
            </q-card-section>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card">
            <q-card-section class="bg-accent text-white centered text-uppercase">
              <div class="text-h6">{{ $t('label.Education') }}</div>
            </q-card-section>

            <q-card-section class="bg-accent text-white subtitle5">
              {{ $t('label.EducationDesc') }}
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
          <q-card class="my-card bg-primary text-white" @click="changeAccess('private')">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PrivateQuest') }}</div>
              <div class="subtitle4">{{ $t('label.PaymentOnUsage') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              <div v-html="$t('label.PrivateProQuestDesc1')"></div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="white">{{ $t('label.TryForFree') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white" @click="changeAccess('public')">
            <q-card-section class="centered">
              <div class="subtitle2">{{ $t('label.PublicQuest') }}</div>
              <div class="subtitle4">{{ $t('label.PaymentOnUsage') }}</div>
            </q-card-section>

            <q-card-section class="subtitle5">
              <div v-html="$t('label.PublicProQuestDesc1')"></div>
              &lt;!&ndash;<div class="centered" v-if="!readMorePublicProQuest"><a @click="readMorePublicProQuest = true">{{ $t('label.ReadMore') }}</a></div>&ndash;&gt;
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
        &lt;!&ndash;
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
        &ndash;&gt;
        <div class="centered">
          <q-btn flat @click="backToUserType">{{ $t('label.Back') }}</q-btn>
        </div>
      </div>
      <div v-if="userType==='individual' && !access">
        <h1 class="subtitle3 text-uppercase q-pa-md q-mt-xl q-pt-lg">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderIntro') }}
        </div>
        &lt;!&ndash;<div class="q-pa-md">
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
        </div>&ndash;&gt;
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
              &lt;!&ndash;<q-btn flat>Utiliser un modèle</q-btn>&ndash;&gt;
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
    </div>-->
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
<style scoped lang="scss">
.background-welcome {
  background-image: url('../../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.welcome{
  max-width: 450px;
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
