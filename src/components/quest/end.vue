<template>
  <div>
    <div class="end-header">{{ $t('message.CongratulationThisCaseIsClassified') }}.</div>
    
    <div class="end-body">
      <div class="result" v-if="awardPoints">
        <p>{{ $t('message.YouWin') }}</p>
        <div class="result-score">
          <div>{{ run.score }}</div>
          <div><img src="/statics/icons/game/medal.png" /></div>
        </div>
        <router-link to="/help/points">{{ $t('message.WhatCanYouDoWithThesePoints') }}</router-link>
      </div>
      <div v-if="!awardPoints">
        <p>
          {{ $t('message.YouAlreadyPlayThisQuestSoYouWinNoPoints') }}
        </p>
        <p>
          {{ $t('message.ResolveOtherQuestsToWinPoints') }}
        </p>
      </div>
      
      <div class="rating">
        <p>{{ $t('message.RateThisQuest') }}</p>
        <q-rating v-model="rating" :max="5" size="2rem" />
      </div>
      
      <div class="share" v-if="awardPoints">
        <p>{{ $t('message.ShareYourSuccess') }}</p>
        <ul>
          <li><img src="/statics/icons/social-networks/facebook.png"></li>
          <li><img src="/statics/icons/social-networks/twitter.png"></li>
          <li><img src="/statics/icons/social-networks/googleplus.png"></li>
        </ul>
      </div>
      
      <div class="back">
        <router-link to="/quest/search/map">{{ $t('message.BackToTheMap') }}</router-link>
      </div>
    </div>
    
  </div>
</template>

<script>
import { QRating } from 'quasar'
import AuthService from 'services/AuthService'
import RunService from 'services/RunService'
export default {
  components: {
    QRating
  },
  data() {
    return {
      title: 'Enquête réussie',
      rating: 0,
      run: {
        score: 0
      },
      awardPoints: false
    }
  },
  async mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title)
    
    if (this.$store.state.currentRun !== null) {
      let res = await RunService.getById(this.$store.state.currentRun._id)
      this.run = res.data
      
      // no run for this quest & user finished yet ? => award points
      res = await RunService.getOne({ questId: this.run.questId, userId: this.run.userId, status: 'finished' })
      this.awardPoints = (typeof res === 'undefined')
      
      // TODO to avoid cheating, points assignments to a player must be done on server side
      if (this.awardPoints) {
        await AuthService.addPoints(this.run.score)
      }
      
      await RunService.endRun(this.run._id)
      this.$store.dispatch('setCurrentRun', null)
    } else {
      this.$router.push('/home')
    }
  }
}
</script>

<style lang="styl" scoped>
@import '~variables'

#main-view { display: flex; flex-flow: column nowrap; }

#main-view div, #main-view p { text-align: center; font-size: 1.1rem;}

#main-view a { text-decoration: underline; }

.end-header { padding: 1rem; padding-left: 8rem; font-weight: bold; color: #fff; background: #000 url('/statics/icons/game/classified.png') no-repeat left center; height: 6rem; display: flex; align-items: center; }

.end-body { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
.end-body > div { padding: 1rem 0; }

.result-score { display: table; margin: 0 auto; }
.result-score div { display: table-cell; color: $primary; font-weight: bold; font-size: 3.5rem !important; vertical-align: middle; height: 3.5rem; line-height: 2rem; padding: 0; }
.result-score img { width: 3.5rem; height: 3.5rem; margin-left: 0.2rem; }
.result a { font-size: 0.9rem; }

.share ul { margin: 0; padding: 0; display: flex; flex-flow: row nowrap; justify-content: center; }
.share li { list-style-type: none; margin: 0.5rem; }
.share img { width: 3rem; height: 3rem; }

</style>
