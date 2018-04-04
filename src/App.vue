<template>
  <!-- Don't drop "q-app" class -->
  <!--div id="q-app"-->
    <q-layout id="q-app" ref="layout" view="lHh lpr lfr" :right-breakpoint="1100">
      <!-- Header -->
      <q-toolbar slot="header">
        <q-btn flat @click="$refs.layout.toggleLeft()">
          <q-icon name="menu" />
        </q-btn>
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn flat>
          <q-icon name="search" @click="displaySearch = !displaySearch" />
        </q-btn>
      </q-toolbar>
      <!-- Left Side Panel -->
      <div slot="left">
        <!-- warning: put only <q-side-link> components with routes here, no button with @click, $router.push() in @click function won't work -->
        <q-list no-border link v-if="">
          <q-side-link item to="/home" v-if="isLoggedIn">
            <q-item-side icon="location on" />
            <q-item-main :label="$t('message.QuestsMap')" />
          </q-side-link>
          <q-side-link item :to="'/team/' + user.team.currentId + '/members'" v-if="isLoggedIn">
            <q-item-side icon="group" />
            <q-item-main :label="$t('message.MyAgency')" />
          </q-side-link>
          <q-side-link item to="/user/profile/me" v-if="isLoggedIn">
            <q-item-side icon="account circle" />
            <q-item-main :label="$t('message.MyProfile')" />
          </q-side-link>
          <q-side-link item to="/quest/create" v-if="isLoggedIn">
            <q-item-side icon="fa-magic" />
            <q-item-main :label="$t('message.CreateAQuest')" />
          </q-side-link>
          <q-side-link item to="/user/login" v-if="!isLoggedIn">
            <q-item-side icon="vpn key" />
            <q-item-main :label="$t('message.Connection')" />
          </q-side-link>
          <q-side-link item to="/user/createAccount" v-if="!isLoggedIn">
            <q-item-side icon="vpn key" />
            <q-item-main :label="$t('message.SignUp')" />
          </q-side-link>
          <q-side-link item to="/user/logout" v-if="isLoggedIn">
            <q-item-side icon="power settings new" />
            <q-item-main :label="$t('message.SignOut')" />
          </q-side-link>
        </q-list>
      </div>
      <div class="row-auto">
        <form v-on:submit="submitSearchTxt">
          <q-search v-show="displaySearch" v-model="searchText" :placeholder="$t('message.SearchForAQuest')" />
        </form>
      </div>
      <!-- sub-routes get injected here: -->
      <!-- see https://laracasts.com/discuss/channels/vue/vue-2-reload-component-when-same-route-is-requested -->
      <router-view id="main-view" :key="$route.fullPath" />
      <div id="screen-too-large"><h5 class="text-center">{{ $t('message.GraalyIsOptimizedForSmallerScreens') }}</h5></div>
    </q-layout>
    
</template>

<script>
/*
 * Root component
 */

import { mapState } from 'vuex'
import AuthService from 'services/AuthService'
 
export default {
  data () {
    return {
      displaySearch: false,
      searchText: "",
      user: { name: "--", picture: "", id: "", team: { currentId: 0, profile: { score: { total: 0, members: 0 } } } }
    }
  },
  computed: mapState(['title', 'isLoggedIn']),
  updated () {
    this.$refs.layout.hideLeft()
    this.fixLayout();
  },
  mounted () {
    this.$refs.layout.hideLeft()
    this.fixLayout();
    
    // get connected user informations
    if (this.isLoggedIn) {
      this.getAccountInformations()
    }
  },
  watch: {
    '$route': function(value) {
      this.fixLayout();
      this.getAccountInformations()
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
      if (typeof mainview !== 'undefined') { 
        document.getElementById('main-view').style.height = computedHeight;
        document.getElementById('main-view').style.minHeight = computedHeight;
        document.getElementById('main-view').style.maxHeight = computedHeight;
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
