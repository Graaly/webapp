<template>
  <div>
    {{ $t('label.RedirectionPleaseWait') }}
    
  </div>
  
</template>

<script>
import utils from 'src/includes/utils'

export default {
  data() {
    return {
      questId: null
    }
  },
  async mounted() {
    this.questId = this.$route.params.questId
    utils.setTimeout(this.redirect, 500)
  },
  methods: {
    /*
     * redirect to builder settings
     */
    redirect() {
      this.$router.push('/quest/settings/' + this.questId)
    }
  }
}
</script>