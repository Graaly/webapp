<template>
  <div>
    <div class="wrapper">
      <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
      <div v-if="!access">
        <div class="q-pa-md">
          {{ $t('label.BuilderIntro') }}
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-primary text-white">
            <q-card-section>
              <div class="text-h6">Enquête privée</div>
            </q-card-section>

            <q-card-section>
              Votre enquête est destiné à votre groupe d'amis ou des personnes que vous choisissez.            
            </q-card-section>
            
            <q-card-section>
              Vous pouvez soit créer l'enquête à partir d'un modèle, que vous pouvez modifier, soit partir de zéro et construire votre propre enquête
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn flat>Créer une enquête privée</q-btn>
              <q-btn flat>Utiliser un modèle</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="q-pa-md">
          <q-card class="my-card bg-secondary text-white">
            <q-card-section>
              <div class="text-h6">Enquête publique</div>
            </q-card-section>

            <q-card-section>
              Vous créez une enquête pour faire découvrir un lieu, une activité, une entreprise.
            </q-card-section>
            
            <q-card-section>
              Une fois validée par les games masters, cette enquête sera visible sur la carte Graaly et jouable par tous
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn flat @click="changeAccess('public')">Créer une enquête publique</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
      <div class="grow" v-if="access === 'public'">
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
