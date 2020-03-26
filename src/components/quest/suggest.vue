<template>
  <div class="q-pt-lg">
    <div class="q-pa-md bg-grey-8">
      <div class="subtitle4 centered">{{ $t('label.SuggestAQuest') }}</div>
      <div class="subtitle6 q-py-md">{{ $t('label.SuggestAQuestDesc') }}</div>
      
      <form @submit.prevent="submitSuggestion()">

        <q-input
          dark
          v-model="place.name"
          :label="$t('label.NameOfThePlace')"
          :placeholder="$t('label.NameOfThePlaceExample')"
          maxlength="50"
          bottom-slots
          />
        <q-input
          dark
          v-model="place.address"
          :label="$t('label.Address')"
          maxlength="100"
          bottom-slots
          />
        <q-input
          dark
          v-model="place.postalCode"
          :label="$t('label.ZipCode')"
          maxlength="10"
          bottom-slots
          />
        <q-input
          dark
          v-model="place.city"
          :label="$t('label.Town')"
          maxlength="50"
          bottom-slots
          />
        <q-input
          dark
          v-model="place.country"
          :label="$t('label.Country')"
          maxlength="50"
          bottom-slots
          />
        <q-input
          dark
          v-model="place.contact"
          :label="$t('label.SuggestContactInformation')"
          :placeholder="$t('label.SuggestContactInformationExample')"
          maxlength="50"
          bottom-slots
          />
        <div class="centered">
          <q-btn color="primary" class="glossy large-button" @click="submitSuggestion()">{{ $t('label.Send') }}</q-btn>
        </div>
        <div class="centered q-pt-md">
          <a @click="emitClose()">{{ $t('label.Cancel') }}</a>
        </div>
        <p class="subtitle6">{{ $t('label.SuggestWarningMessage') }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import Notification from 'boot/NotifyHelper'

export default {
  data() {
    return {
      place: {
        name: '',
        address: '',
        postalCode: '',
        city: '',
        contact: ''
      }
    }
  },
  methods: {
    /*
     * Close the popup
     */
    emitClose() {
      this.$emit('close')
    },
    async submitSuggestion() {
      const response = await QuestService.submitSuggestion(this.place)
      if (response && response.data && response.data.status === 'ok') {
        Notification(this.$t('label.ThankYouForYourProposal'), 'positive')
        this.emitClose()
      } else {
        Notification(this.$t('label.TechnicalIssue'), 'error')
      }
    }
  }
}
</script>
