import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

import AuthService from 'services/AuthService'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  isLoggedIn: !!localStorage.getItem('isLoggedIn'),
  loginPending: false,
  title: null,
  defaultTitle: 'Graaly',
  // for quest steps, keep track of objects given by setInterval() to clear them properly & avoid useless calls
  questSteps: {
    geolocation: {
      drawDirectionInterval: null
    }
  },
  lastLoadedRoute: null,
  user: null,
  currentEditedQuest: null,
  currentEditedStep: null,
  errorMessage: null,
  currentRun: null
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setTitle (state, newTitle) {
    state.title = newTitle
  },
  resetTitle (state) {
    state.title = state.defaultTitle
  },
  loginStart (state) {
    state.loginPending = true
  },
  loginSuccess (state, user) {
    state.isLoggedIn = true
    state.loginPending = false
    state.user = user
  },
  logout (state) {
    state.isLoggedIn = false
    state.user = null
  },
  setLastLoadedRoute(state, route) {
    state.lastLoadedRoute = route
  },
  setDrawDirectionInterval (state, intervalObject) {
    state.questSteps.geolocation.drawDirectionInterval = intervalObject;
  },
  setCurrentEditedQuest(state, quest) {
    state.currentEditedQuest = quest
  },
  setCurrentEditedStep(state, step) {
    state.currentEditedStep = step
  },
  setErrorMessage(state, message) {
    state.errorMessage = message
  },
  setCurrentRun(state, run) {
    state.currentRun = run
  }
}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
  setTitle: ({ commit }, newTitle) => commit('setTitle', newTitle),
  resetTitle: ({ commit }) => commit('resetTitle'),
  login: async ({ commit }, creds) => {
    commit('loginStart'); // show spinner
    let result = await AuthService.login(creds.email, creds.password)
    if (result.status === 200) {
      commit('loginSuccess', result.data.user)
      localStorage.setItem('isLoggedIn', true)
    }
    return result
  },
  logout: async ({ commit }) => {
    let result = await AuthService.logout()
    commit('logout')
    localStorage.setItem('isLoggedIn', false)
    return result
  },
  setLastLoadedRoute: ({ commit }, route) => commit('setLastLoadedRoute', route),
  // for step geolocation
  setDrawDirectionInterval: ({ commit }, intervalObject) => commit('setDrawDirectionInterval', intervalObject),
  // for quest creation/edition
  setCurrentEditedQuest: ({ commit }, quest) => commit('setCurrentEditedQuest', quest),
  setCurrentEditedStep: ({ commit }, step) => commit('setCurrentEditedStep', step),
  setErrorMessage: ({ commit }, message) => commit('setErrorMessage', message),
  // for quest playing
  setCurrentRun: ({ commit }, run) => commit('setCurrentRun', run)
}

// getters are functions
const getters = {}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [
    createPersistedState({
      getState: (key) => Cookies.getJSON(key),
      setState: (key, state) => { Cookies.set(key, state, { expires: parseInt(process.env.PERSIST_STATE_COOKIE_DURATION, 10), secure: true }) }
    })
  ]
})