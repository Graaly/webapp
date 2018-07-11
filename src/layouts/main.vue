<template>
  <q-layout view="lHh lpr lfr" :right-breakpoint="1100">
  
    <!------------------ MAIN PAGE AREA ------------------------>
    <q-page-container>
      <router-view id="main-view" :key="$route.fullPath" />
    </q-page-container>
    
    <!------------------ IF NOT A MOBILE DEVICE ------------------------>
    <div id="screen-too-large"><h5 class="text-center">{{ $t('message.GraalyIsOptimizedForSmallerScreens') }}</h5></div>
    
  </q-layout>
</template>

<script> 
export default {
  data () {
    return {
      user: { name: "--", picture: "", id: "", team: { currentId: 0, profile: { score: { total: 0, members: 0 } } } }
    }
  },
  updated () {
    this.fixLayout()
  },
  mounted () {
    this.fixLayout()
  },
  watch: {
    '$route': function(value) {
      this.fixLayout()
    }
  },
  methods: {
    /*async getAccountInformations() {
      let response = await AuthService.getAccount()
      if (response.data && response.data.name) {
      console.log(response.data)
        this.user = response.data
        
        // set the user language
        this.$i18n.locale = this.user.language 
      } else {
      console.log(response)
        //this.$router.push('/quest/search/text/' + this.searchText)
      }
    },*/
    fixLayout() {
      // layout page computed min-height is wrong (too high, includes browser title bar), leading to a
      // useless bottom overflow of 50px, at least on Android Chrome, and maybe other mobile browsers,
      // see https://stackoverflow.com/q/37112218/488666
      document.getElementById('q-app').style.height = window.innerHeight + "px"
      document.getElementById('q-app').style.minHeight = window.innerHeight + "px"
      document.getElementById('q-app').style.maxHeight = window.innerHeight + "px"
      // there are better although more complex ways to avoid hardcoding header height here
      let computedHeight = (window.innerHeight - 50) + "px";
      let mainview = document.getElementById('main-view')
      if (typeof mainview !== 'undefined' && mainview !== null) {
        mainview.style.height = computedHeight;
        mainview.style.minHeight = computedHeight;
        mainview.style.maxHeight = computedHeight;
      }
    }
  }
}
</script>
