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
      </q-toolbar>
      <!-- Left Side Panel -->
      <div slot="left">
        <!-- warning: put only <q-side-link> components with routes here, no button with @click, $router.push() in @click function won't work -->
        <q-list no-border link>
          <q-side-link item to="/graaly/search" v-if="isLoggedIn">
            <q-item-side icon="search" />
            <q-item-main label="Rechercher des Graalys" />
          </q-side-link>
          <q-side-link item to="/graaly/create" v-if="isLoggedIn">
            <q-item-side icon="create" />
            <q-item-main label="Créer des Graalys" />
          </q-side-link>
          <q-side-link item to="/user/profile" v-if="isLoggedIn">
            <q-item-side icon="account circle" />
            <q-item-main label="Mon profil" />
          </q-side-link>
          <q-side-link item to="/user/login" v-if="!isLoggedIn">
            <q-item-side icon="vpn key" />
            <q-item-main label="Connexion" />
          </q-side-link>
          <q-side-link item to="/user/logout" v-if="isLoggedIn">
            <q-item-side icon="power settings new" />
            <q-item-main label="Déconnexion" />
          </q-side-link>
        </q-list>
          
      </div>
      <!-- sub-routes get injected here: -->
      <!-- see https://laracasts.com/discuss/channels/vue/vue-2-reload-component-when-same-route-is-requested -->
      <router-view id="main-view" :key="$route.fullPath" />
    </q-layout>
    
  
</template>

<script>
/*
 * Root component
 */

import { mapState } from 'vuex'
 
export default {
  computed: mapState(['title', 'isLoggedIn']),
  updated () {
    this.$refs.layout.hideLeft()
    this.fixLayout();
  },
  mounted () {
    this.$refs.layout.hideLeft()
    this.fixLayout();
  },
  watch: {
    '$route': function(value) {
      this.fixLayout();
    }
  },
  methods: {
    fixLayout() {
      // layout page computed min-height is wrong (too high, includes browser title bar), leading to a
      // useless bottom overflow of 50px, at least on Android Chrome, and maybe other mobile browsers,
      // see https://stackoverflow.com/q/37112218/488666
      document.getElementById('q-app').style.height = window.innerHeight + "px"
      document.getElementById('q-app').style.minHeight = window.innerHeight + "px"
      document.getElementById('q-app').style.maxHeight = window.innerHeight + "px"
      // there are better although more complex ways to avoid hardcoding header height here
      let computedHeight = (window.innerHeight - 50) + "px";
      document.getElementById('main-view').style.height = computedHeight;
      document.getElementById('main-view').style.minHeight = computedHeight;
      document.getElementById('main-view').style.maxHeight = computedHeight;
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
