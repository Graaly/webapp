<template>
  <div class="background-404">
    <div class="absolute-center text-center">
      <p class="text-404">Error 404</p>
      <p class="text-not-found">Page not found</p>
      <text-btn-square
        style="width: 250px"
        submit
        @click.native="$router.push('/')"
        title="Go to home page"
        color="secondary"
        icon="home"
      />
    </div>
  </div>
</template>
<script>
import textBtnSquare from "../components/user/UI/textBtnSquare";

export default{
  name: "menu",
  components: {textBtnSquare}
}
</script>
<style scoped lang="scss">
.background-404 {
  height: 100vh;
  width: 100%;
  background-image: url('../statics/new/h-center-background.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
  color: white;

  .text-404 {
    font-size: 45px;
    padding: 0;
    margin: 0;
  }

  .text-not-found {
    padding: 0;
  }

}
</style>
