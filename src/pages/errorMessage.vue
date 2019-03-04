<template>
  <div>
    <img src="/statics/icons/game/oops.png" style="width: 100%" />
    <h2 class="centered" v-if="errorType === 'upgraderequired'">
      {{ $t('label.UpgradeRequired') }}
    </h2>
    <h1 v-if="errorType === null">
      {{ $t('label.SorryAnErrorOccurs') }}
    </h1>
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
      errorType: null
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