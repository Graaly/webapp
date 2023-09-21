<template>
  <div class="wrapper background-login">
    <div class="page-content" style="padding-bottom: 100px">
      <div class="centered">
        <img src="statics/new/logo-color-white.png" class="login-logo-top"/>
      </div>
      <div class="login-form q-pa-md">
        <create-profil-stepper/>
        <div class="centered q-mt-lg q-mb-lg">
          <a @click="goToSignIn()">{{ $t('label.IAlreadyHaveAnAccount') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import createProfilStepper from "components/user/createProfilStepper";

export default {
  components: {
    createProfilStepper
  },
  methods: {
    /*
     * Back to sign-in page
     */
    goToSignIn() {
      this.$router.push('/user/login')
    }
  }
}
</script>

<style scoped lang="scss">
.background-login {
  background-image: url('../../statics/new/h-top-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.login-logo-top{
  width: 25vh;
  margin-top: 10vh;
  margin-bottom: 5vh;
}
.login-form{
  max-width: 400px;
  margin: 0 auto;
}
</style>
