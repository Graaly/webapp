<template>
  <div class="main-quest relative-position" :style="'background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat '">
    <div v-if="!quest" class="absolute-center">
      <q-spinner-dots
        color="primary"
        size="2em"
      />
    </div>
    <div v-if="quest">
      <div class="centered main-quest-banner q-pa-md" style="background: linear-gradient(to bottom, transparent, #323232);">
        <div class="title2">
          {{ quest.title }}
        </div>
        <div class="q-pt-md q-pb-md subtitle6">
          {{ $t('label.Difficulty' + quest.level) }}
          <img src="statics/images/icon/separator.png" />
          <span class="q-mx-sm" v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active">{{ $t('label.Paying') }}</span>
          <span class="q-mx-sm" v-if="!(quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active)">{{ $t('label.Free') }}</span>
          <span v-if="quest.availablePoints && quest.availablePoints.maxPts">
            <img src="statics/images/icon/separator.png" />
            +{{ quest.availablePoints.maxPts }} {{ $t('label.points') }}
          </span>
        </div>
        <div>
          <q-btn 
            class="glossy large-btn"
            color="primary" 
            :label="$t('label.Play')"
            :loading="submitting" 
            @click="playQuest" />
        </div>
        <div class="white-overliner q-mt-md subtitle6" v-if="quest.description.length < 30">
          {{ $t('label.' + quest.description) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['quest'],
  data() {
    return {
      serverUrl: process.env.SERVER_URL,
      submitting: false
    }
  },
  methods: {
    /*
     * launch the quest
     */
    async playQuest() {
      this.submitting = true
      this.$router.push('/quest/play/' + this.quest.questId)
    },
    /*
     * get background image
     */
    getBackgroundImage () {
      if (!this.quest) {
        return ''
      }
      if (this.quest.picture && this.quest.picture[0] === '_') {
        return 'statics/images/quest/' + this.quest.picture
      } else if (this.quest.picture && this.quest.picture.indexOf('blob:') !== -1) {
        return this.quest.picture
      } else if (this.quest.picture) {
        return this.serverUrl + '/upload/quest/' + this.quest.picture
      } else {
        return 'statics/images/quest/default-quest-picture.png'
      }
    }
  }
}
</script>
