<template>
  <div>
    <div class="wrapper">
      <div v-if="!access">
        <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
        <div class="q-pa-md">
          {{ $t('label.BuilderIntro') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-secondary text-white">
            <q-card-section>
              <div class="text-h6">{{ $t('label.PublicQuest') }}</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.PublicQuestDesc1') }}
            </q-card-section>
            
            <q-card-section>
              {{ $t('label.PublicQuestDesc2') }}
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn flat @click="changeAccess('public')" test-id="btn-create-public-quest">{{ $t('label.CreatePublicQuest') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white">
            <q-card-section>
              <div class="text-h6">{{ $t('label.PrivateQuest') }}</div>
            </q-card-section>

            <q-card-section>
              {{ $t('label.PrivateQuestDesc1') }}
            </q-card-section>
            
            <!--<q-card-section>
              Vous pouvez soit créer l'enquête à partir d'un modèle, que vous pouvez modifier, soit partir de zéro et construire votre propre enquête
            </q-card-section>-->

            <q-separator />

            <q-card-actions>
              <q-btn flat @click="changeAccess('private')">{{ $t('label.CreatePrivateQuest') }}</q-btn>
              <!--<q-btn flat>Utiliser un modèle</q-btn>-->
            </q-card-actions>
          </q-card>
        </div>
        <div class="centered">
          <q-btn flat @click="cancel">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'public'">
        <h1 class="size-3 centered">{{ $t('label.CreateYourPublicQuest') }}</h1>
        <!--
        <div class="centered" v-html="$t('label.andWin')"></div>
        <div class="row q-pa-md">
          <div class="col score-text centered">600 <q-icon color="warning" name="fas fa-bolt" /></div>
          <div class="col centered">
            <q-icon color="positive" size="2rem" name="fas fa-money-bill-wave" /> <br />
            {{ $t('label.SomeMoney') }} 
            <a @click="openMoneyPopup()">*</a>
          </div>
        </div>
        -->
        <div class="q-pa-md" v-html="$t('label.BuilderWelcomeMessage')"></div>
        <div class="q-px-md">
          <q-btn color="primary" class="full-width center" @click="createNewQuest()" test-id="btn-accept-rules">{{ $t('label.AcceptTheRules') }}</q-btn>
          <q-btn class="full-width center q-mt-md" @click="cancel()">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
      <div class="grow" v-if="access === 'private'">
        <h1 class="size-3 centered">{{ $t('label.CreateYourPrivateQuest') }}</h1>
        <div class="q-pa-md" v-html="$t('label.BuilderPrivateWelcomeMessage')"></div>
        <div class="q-px-md">
          <q-btn color="primary" class="full-width center" @click="createNewQuest()">{{ $t('label.AcceptTheRules') }}</q-btn>
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
      access: null
    }
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
     * Create a new quest
     */
    async createNewQuest() {
      // Define default quest settings
      let newQuest = {
        title: {}
      }
      let res = await QuestService.create(newQuest, this.access)

      if (res && res.data && res.data.questId) {
        this.$router.push('/quest/builder/' + res.data.questId)
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * Cancel creation
     */
    async cancel() {
      this.$router.push('/map')
    }
  }
}
</script>
