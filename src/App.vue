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
        <q-list no-border link>
          <q-side-link item to="/graaly/search">
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
          <div class="q-item q-item-division relative-position q-item-link" @click="logout" v-if="isLoggedIn">
            <q-item-side icon="power settings new" />
            <q-item-main label="Déconnexion" />
          </q-item>
          </div>
          <!--
          <q-side-link item to="/test/geoloc">
            <q-item-main label="test geoloc"  />
          </q-side-link>
          <q-side-link item to="/test/orientation">
            <q-item-main label="test orientation"/>
          </q-side-link>
          <q-side-link item to="/test/photo">
            <q-item-main label="test photo" />
          </q-side-link>
          <q-side-link item to="/test/camera">
            <q-item-main label="test camera" />
          </q-side-link>
          -->
        </q-list>
      </div>
      <!-- sub-routes get injected here: -->
      <router-view id="main-view" />
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
    // layout page computed min-height is wrong (too high, includes browser title bar), leading to a
    // useless bottom overflow of 50px, at least on Android Chrome, and maybe other mobile browsers,
    // see https://stackoverflow.com/q/37112218/488666
    document.getElementById('q-app').style.height = window.innerHeight + "px"
    // there are better although more complex ways to avoid hardcoding header height here
    document.getElementById('main-view').style.height = (window.innerHeight - 50) + "px"
  },
  methods: {
    logout() {
      // TODO: return promise like login & change route when Promise is resolved
      this.$store.dispatch('logout')
      this.$router.push("/user/login")
    }
  }
}
</script>

<style>
/* required to avoid useless 50px overflow at bottom */
#q-app { min-height: 0px; }
.layout-page, .layout-page-container {
  overflow-y: hidden; /* can't easily override calc(100vm - 50px) on .layout-page */
  height: 100%;
}
#main-view { padding: 1rem; }

h1 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 0;
}
</style>
