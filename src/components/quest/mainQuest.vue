<template>
  <div class="main-quest relative-position">
    <div class="absolute-position fullwidth" :style="'background: url(' + getThumbImage() + ' ) center center /cover no-repeat; height: 35vh'">
      <div class="absolute-position fullwidth" style="height: 20vh;">
      </div>
      <div class="absolute-position fullwidth" style="background: linear-gradient(to bottom, transparent, #323232); height: 15vh;">
      </div>
    </div>
    <div v-if="!quest" class="absolute-center">
      <q-spinner-dots
        color="primary"
        size="2em"
      />
    </div>
    <div v-if="quest">
      <div class="centered main-quest-banner q-pa-md">
        <div class="title2">

        </div>
        <div class="q-pt-md q-pb-md subtitle6">
          <!--{{ $t('label.Difficulty' + quest.level) }}
          <img src="statics/images/icon/separator.png" />
          <span class="q-mx-sm" v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active">{{ $t('label.Paying') }}</span>
          <span class="q-mx-sm" v-if="!(quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active)">{{ $t('label.Free') }}</span>
          <span v-if="quest.availablePoints && quest.availablePoints.maxPts">
            <img src="statics/images/icon/separator.png" />
            +{{ quest.availablePoints.maxPts }} {{ $t('label.points') }}
          </span>-->
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
      uploadUrl: process.env.UPLOAD_URL,
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
        return this.uploadUrl + '/upload/quest/' + this.quest.picture
      } else {
        return 'statics/images/quest/default-quest-picture.png'
      }
    },
    /*
     * get thumb image
     */
    getThumbImage () {
      if (!this.quest) {
        return ''
      }
      if (this.quest.thumb && this.quest.thumb[0] === '_') {
        return 'statics/images/quest/' + this.quest.thumb
      } else if (this.quest.thumb && this.quest.thumb.indexOf('blob:') !== -1) {
        return this.quest.thumb
      } else if (this.quest.thumb) {
        return this.uploadUrl + '/upload/quest/' + this.quest.thumb
      } else {
        return 'statics/images/quest/default-quest-picture.png'
      }
    }
  }
}
</script>
