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
      this.$router.push('/quest/play/614ae660a5f0ec18ce43566e')
    } else {
      this.$router.push('/quest/play/61767ce84a4f2c2276fed543')
    }
  }
}

</script>