<template>
  
  <q-layout view="lHh lpr lfr" :right-breakpoint="1100">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" icon="menu" />

        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn flat round dense @click="displaySearch = !displaySearch" icon="search" />
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer side="left" v-model="leftDrawerOpen">
        <q-list no-border link>
          <q-item @click.native="$router.push('/home')" v-if="isLoggedIn">
            <q-item-side icon="location on" />
            <q-item-main :label="$t('message.QuestsMap')" />
          </q-item>
          <q-item @click.native="$router.push('/team/' + user.team.currentId + '/members')" v-if="isLoggedIn">
            <q-item-side icon="group" />
            <q-item-main :label="$t('message.MyAgency')" />
          </q-item>
          <q-item @click.native="$router.push('/user/profile/me')" v-if="isLoggedIn">
            <q-item-side icon="account circle" />
            <q-item-main :label="$t('message.MyProfile')" />
          </q-item>
          <q-item @click.native="$router.push('/quest/create')" v-if="isLoggedIn">
            <q-item-side icon="fas fa-magic" />
            <q-item-main :label="$t('message.CreateAQuest')" />
          </q-item>
          <q-item @click.native="$router.push('/user/login')" v-if="!isLoggedIn">
            <q-item-side icon="vpn key" />
            <q-item-main :label="$t('message.Connection')" />
          </q-item>
          <q-item @click.native="$router.push('/user/createAccount')" v-if="!isLoggedIn">
            <q-item-side icon="vpn key" />
            <q-item-main :label="$t('message.SignUp')" />
          </q-item>
          <q-item @click.native="$router.push('/user/logout')" v-if="isLoggedIn">
            <q-item-side icon="power settings new" />
            <q-item-main :label="$t('message.SignOut')" />
          </q-item>
        </q-list>
      </q-layout-drawer>

    <div class="row-auto search">
      <form v-on:submit="submitSearchTxt">
        <q-search v-show="displaySearch" v-model="searchText" :placeholder="$t('message.SearchForAQuest')" />
      </form>
    </div>
    
    <q-page-container>
      <!-- <router-view id="main-view" :key="$route.fullPath" /> -->
      <router-view id="main-view" />
    </q-page-container>
    
    <div id="screen-too-large"><h5 class="text-center">{{ $t('message.GraalyIsOptimizedForSmallerScreens') }}</h5></div>
    
  </q-layout>
</template>

<script>
import { mapState } from 'vuex'
import AuthService from 'services/AuthService'
 
export default {
  data () {
    return {
      leftDrawerOpen: false,
      displaySearch: false,
      searchText: "",
      user: { name: "--", picture: "", id: "", team: { currentId: 0, profile: { score: { total: 0, members: 0 } } } }
    }
  },
  computed: mapState(['title', 'isLoggedIn']),
  updated () {
    this.showLeft = false
    this.fixLayout()
  },
  mounted () {
    this.showLeft = false
    this.fixLayout()
    
    // get connected user informations
    if (this.isLoggedIn) {
      this.getAccountInformations()
    }
  },
  watch: {
    '$route': function(value) {
      this.fixLayout()
      this.getAccountInformations()
      // hide search if user change page
      this.displaySearch = false
    }
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      if (response.data && response.data.name) {
        this.user = response.data
        
        // set the user language
        this.$i18n.locale = this.user.language 
      }
    },
    submitSearchTxt() {
      this.$router.push('/quest/search/text/' + this.searchText)
    },
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

<style>
h1 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 0;
}

.grow { flex-grow: 1; }
</style>
