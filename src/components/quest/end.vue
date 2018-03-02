<template>
  <div>
    <div class="end-header">Bravo ! Cette affaire est maintenant classée.</div>
    
    <div class="end-body">
      <div class="result" v-if="!isRunFinished">
        <p>Vous gagnez</p>
        <div class="result-score">
          <div>{{ run.score }}</div>
          <div><img src="/statics/icons/game/medal.png" /></div>
        </div>
        <router-link to="/help/points">Que faire avec ces points ?</router-link>
      </div>
      <div v-if="isRunFinished">
        <p>
          Cette enquête ne vous rapporte plus de points.<br />
          Pour en gagner, <router-link to="/quest/search/map">cherchez-en</router-link> ou <router-link to="/quest/create">crééz-en</router-link> d'autres !
        </p>
      </div>
      
      <div class="rating">
        <p>Notez cette enquête</p>
        <q-rating v-model="rating" :max="5" size="2rem" />
      </div>
      
      <div class="share" v-if="!isRunFinished">
        <p>Partagez votre réussite !</p>
        <ul>
          <li><img src="/statics/icons/social-networks/facebook.png"></li>
          <li><img src="/statics/icons/social-networks/twitter.png"></li>
          <li><img src="/statics/icons/social-networks/googleplus.png"></li>
        </ul>
      </div>
      
      <div class="back">
        <router-link to="/quest/search/map">Retour à la carte</router-link>
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
      isRunFinished: true
    }
  },
  async mounted () {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
    
    if (this.$store.state.currentRun !== null) {
      let res = await RunService.getById(this.$store.state.currentRun._id)
      this.run = res.data
      this.isRunFinished = this.run.status === 'finished'
      
      await RunService.save({ _id: this.run._id, status: 'finished' })
      
      // TODO to avoid cheating, points assignments to a player must be done on server side
      await AuthService.addPoints(this.run.score)
      
      this.$store.dispatch('setCurrentRun', null)
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
