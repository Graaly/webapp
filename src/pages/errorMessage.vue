<template>
  <div>
    <img src="/statics/icons/game/oops.png" style="width: 100%" />
    <h3 class="centered" v-if="errorType === 'upgraderequired' && isHybrid">
      {{ $t('label.UpgradeRequired') }}
    </h3>
    <h3 class="centered" v-if="errorType === 'upgraderequired' && !isHybrid">
      {{ $t('label.RefreshCacheRequired') }}
    </h3>
    <h3 v-if="errorType === null">
      {{ $t('label.SorryAnErrorOccurs') }}
    </h3>
    <p v-if="errorMessage !== null">
      {{ errorMessage }}
    </p>
    <p v-if="errorType === null">{{ $t('label.PleaseContactTheSupport') }}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      errorMessage: null,
      errorType: null,
      isHybrid: window.cordova
    }
  },
  mounted () {
    if (this.$store.state.hasOwnProperty('errorMessage')) {
      this.errorMessage = this.$store.state.errorMessage
    }
    if (this.$route.params.errorType) {
      this.errorType = this.$route.params.errorType
    }
  }
}
</script>

<style scoped>
#main-view { overflow-y: scroll; padding: 1rem; }
</style>