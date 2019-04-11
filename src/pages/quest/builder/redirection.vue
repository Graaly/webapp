<template>
  <div>
    {{ $t('label.RedirectionPleaseWait') }}
    
  </div>
  
</template>

<script>
export default {
  data() {
    return {
      questId: null
    }
  },
  mounted() {
    this.$router.push('/quest/settings/' + this.$route.params.questId)
  }
}
</script>