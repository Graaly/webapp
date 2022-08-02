<template>
  <div class="q-py-md q-px-lg fixed-top" style="z-index: 99;">
    <icon-btn-square :color="color" icon="arrow_back" fill @click.native="back()"/>
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

</style>
