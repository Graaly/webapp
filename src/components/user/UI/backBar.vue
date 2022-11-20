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
    route: {
      type: String,
      default: 'none'
    },
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
      if (this.route == 'none')  {
        this.$router.go(-1)
      } else {
        this.$router.push('/' + this.route)
      }
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
