<template>
  <div>
    <p>{{ $t('label.SignOutInProgress') }}</p>
  </div>
</template>

<script>

import axios from 'axios'

export default {
  async mounted () {
    await this.$store.dispatch('logout')
    window.localStorage.removeItem('jwt')
    delete axios.defaults.headers.common['Authorization']
    //this.$router.go(0)
    this.$router.push('/user/login')
  }
}
</script>
