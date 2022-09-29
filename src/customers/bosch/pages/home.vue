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
      this.$router.push('/quest/play/6321e08cc4301449ca6092d9')
    } else {
      this.$router.push('/quest/play/6321e08cc4301449ca6092d9')
    }
  }
}

</script>