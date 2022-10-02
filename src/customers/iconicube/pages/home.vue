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
      this.$router.push('/quest/play/631749df4dd69e42b276d6a4')
    } else {
      this.$router.push('/quest/play/631749df4dd69e42b276d6a4')
    }
  }
}

</script>