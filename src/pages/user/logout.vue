<template>
  <div>
    <p>{{ $t('label.SignOutInProgress') }}</p>
  </div>
</template>

<script>
export default {
  async mounted () {
    await this.$store.dispatch('logout')
    this.$router.push('/user/login')
  }
}
</script>
