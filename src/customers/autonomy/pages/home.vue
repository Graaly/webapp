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
      // AUTONOMY SPECIFIC - Mini
      this.$router.push('/quest/play/6500873bc3663860880775fb')
    } else {
      //this.$router.push('/quest/play/6321e08cc4301449ca6092d9')
      // Autonomy SPECIFIC - Mini
      this.$router.push('/quest/play/6500873bc3663860880775fb')
    }
  }
}

</script>