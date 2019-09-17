<template>
  <div class="q-pa-md">
    <h1 class="size-3">{{ $t('label.SuggestAQuest') }}</h1>
    <p>{{ $t('label.SuggestAQuestDesc') }}</p>
    
    <form @submit.prevent="submitSuggestion()">
      <q-item>
        <q-item-section side top>
          <q-icon name="room" class="left-icon" />
        </q-item-section>
        <q-item-section>

          <q-input
            v-model="place.name"
            :label="$t('label.NameOfThePlace')"
            :placeholder="$t('label.NameOfThePlaceExample')"
            maxlength="50"
            bottom-slots
            />
          <q-input
            v-model="place.address"
            :label="$t('label.Address')"
            maxlength="100"
            bottom-slots
            />
          <q-input
            v-model="place.postalCode"
            :label="$t('label.ZipCode')"
            maxlength="10"
            bottom-slots
            />
          <q-input
            v-model="place.city"
            :label="$t('label.Town')"
            maxlength="50"
            bottom-slots
            />
          <q-input
            v-model="place.country"
            :label="$t('label.Country')"
            maxlength="50"
            bottom-slots
            />
          <q-input
            v-model="place.contact"
            :label="$t('label.SuggestContactInformation')"
            :placeholder="$t('label.SuggestContactInformationExample')"
            maxlength="50"
            bottom-slots
            />
          <q-btn color="primary" class="full-width" @click="submitSuggestion()">{{ $t('label.Send') }}</q-btn>
          <div class="centered q-pt-md">
            <a color="primary" class="text-primary" @click="emitClose()">{{ $t('label.Cancel') }}</a>
          </div>
          <p>{{ $t('label.SuggestWarningMessage') }}</p>
        </q-item-section>
      </q-item>
    </form>
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
