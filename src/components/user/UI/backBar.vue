<template>
  <div class="back-bar" :style="relative ? '' : 'fixed-top q-py-lg q-px-lg'">
    <div style="max-width: 400px; margin: 0 auto;">
      <icon-btn-square :color="color" icon="arrow_back" fill @click.native="back()"/>
    </div>
  </div>
</template>

<script>
import iconBtnSquare from "./iconBtnSquare";
export default {
  name: "backBar",
  components: {iconBtnSquare},
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    relative: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
 .back-bar{
   z-index: 99;
   width: 110px;

 }
</style>
