<template>
  <div>
    <h1>Désolé, une erreur est survenue.</h1>
    <p v-if="errorMessage !== null">Message : {{ errorMessage }}</p>
    <p>Veuillez contacter le support.</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      errorMessage: null
    }
  },
  mounted () {
    if (this.$store.state.hasOwnProperty('errorMessage')) {
      this.errorMessage = this.$store.state.errorMessage
    }
  }
}
</script>

<style scoped>
#main-view { overflow-y: scroll; padding: 1rem; }
</style>