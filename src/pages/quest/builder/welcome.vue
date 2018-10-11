<template>
  <div>
    <div class="wrapper">
      <h1 class="size-3 centered">{{ $t('label.CreateYourQuest') }}</h1>
      <div class="grow">
        <div class="centered" v-html="$t('label.andWin')"></div>
        <div class="row q-pa-md">
          <div class="col score-text centered">600 <q-icon color="warning" name="fas fa-coins" /></div>
          <div class="col centered">
            <q-icon color="positive" size="2rem" name="fas fa-money-bill-wave" /> <br />
            {{ $t('label.SomeMoney') }} 
            <a @click="openMoneyPopup()">*</a>
          </div>
        </div>
        <div class="q-pa-md" v-html="$t('label.BuilderWelcomeMessage')"></div>
      </div>
      <q-btn color="primary" class="full-width center" @click="createNewQuest()">{{ $t('label.AcceptTheRules') }}</q-btn>
    </div>
  </div>
</template>

<script>

import Notification from 'plugins/NotifyHelper'
import QuestService from 'services/QuestService'

export default {
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
     * Create a new quest
     */
    async createNewQuest() {
      // Define default quest settings
      let newQuest = {
        title: {}
      }
      let res = await QuestService.create(newQuest)

      if (res && res.data && res.data._id) {
        this.$router.push('/quest/settings/' + res.data._id)
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    }
  }
}
</script>
