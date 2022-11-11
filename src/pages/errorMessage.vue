<template>
  <div class="background-error">
    <div class="absolute-center text-center" style="max-width: 450px">
      <q-icon name="warning" size="100px" color="negative"/>
      <h4 class="centered" v-if="errorType === 'upgraderequired' && isHybrid">
        {{ $t('label.UpgradeRequired') }}
      </h4>
      <h4 class="centered" v-if="errorType === 'upgraderequired' && !isHybrid">
        {{ $t('label.RefreshCacheRequired') }}
      </h4>
      <h4 v-if="errorType === null">
        {{ $t('label.SorryAnErrorOccurs') }}
      </h4>
      <p v-if="errorMessage !== null">
        {{ errorMessage }}
      </p>
      <p v-if="errorType === null">{{ $t('label.PleaseContactTheSupport') }}</p>
    </div>
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

<style scoped lang="scss">
.background-error {
  height: 100vh;
  width: 100%;
  background-image: url('../statics/new/h-center-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
  color: white;
}
</style>
