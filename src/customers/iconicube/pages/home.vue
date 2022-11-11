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
      this.$router.push('/quest/play/633d88f560f7913b1661fbe1')
    } else {
      this.$router.push('/quest/play/633d88f560f7913b1661fbe1')
    }
  }
}

</script>