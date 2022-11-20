<template>
  <div class="scroll background-dark">
    Chargement ... / Loading ...
  </div>
</template>

<script>

export default {
  data () {
    return {}
  },
  mounted () {
    if (this.$t('label.shortLang') === 'en') {
      //this.$router.push('/quest/play/6321e08cc4301449ca6092d9')
      // BOSCH SPECIFIC - Mini
      this.$router.push('/quest/play/637237cd2bb7ab2eb96aea76')
    } else {
      //this.$router.push('/quest/play/6321e08cc4301449ca6092d9')
      // BOSCH SPECIFIC - Mini
      this.$router.push('/quest/play/637237cd2bb7ab2eb96aea76')
    }
  }
}

</script>