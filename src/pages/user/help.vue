<template>
  
  <div class="wrapper">
    <div class="header">
      To be completed
      
    </div>
    
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'

export default {
  data () {
    return {
      user: {name: "--", picture: "", id: ""}
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', 'Aide')
    
    this.getAccountInformations()
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
    }
  }
}
</script>

<style scoped>

</style>