<template>
  <q-layout view="lHh lpr lfr" :right-breakpoint="1100">
  
    <!------------------ MAIN PAGE AREA ------------------------>
    <q-page-container>
      <router-view id="main-view" :key="$route.fullPath" />
    </q-page-container>
    
    <!------------------ IF NOT A MOBILE DEVICE ------------------------>
    <div id="screen-too-large"><h5 class="text-center">{{ $t('label.GraalyIsOptimizedForSmallerScreens') }}</h5></div>
    
  </q-layout>
</template>

<script> 
export default {
  data () {
    return {
      user: { name: "--", picture: "", id: "", team: { currentId: 0, profile: { score: { total: 0, members: 0 } } } }
    }
  },
  mounted () {
    if (this.$store.state.user && this.$store.state.user.language) {
      this.$i18n.locale = this.$store.state.user.language
    } else {
      this.$i18n.locale = "fr"
    }
  },
  watch: {
    '$route': function(value) {
      if (this.$store.state.user && this.$store.state.user.language) {
        this.$i18n.locale = this.$store.state.user.language
      } else {
        // french default language
        this.$i18n.locale = "fr"
      }
    }
  },
  methods: {}
}
</script>
