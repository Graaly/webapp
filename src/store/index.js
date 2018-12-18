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
  currentRun: null,
  runningTimeoutsIds: []
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  loginStart (state) {
    state.loginPending = true
  },
  loginSuccess (state, user) {
    state.isLoggedIn = true
    state.loginPending = false
    state.user = user
  },
  logout (state) {
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
  },
  addTimeoutId(state, timeoutId) {
    state.runningTimeoutsIds.push(timeoutId)
  },
  clearTimeoutIds(state) {
    state.runningTimeoutsIds = []
  }
}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
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
    return result
  },
  setLastLoadedRoute: ({ commit }, route) => commit('setLastLoadedRoute', route),
  // for step geolocation
  setDrawDirectionInterval: ({ commit, state }, intervalObject) => {
    if (intervalObject === null) {
      // call clearInterval first, if any is defined (avoids issues with hot reloading during dev)
      let drawDirectionInterval = state.questSteps.geolocation.drawDirectionInterval
      if (drawDirectionInterval !== null) {
        window.clearInterval(drawDirectionInterval)
      }
    }
    commit('setDrawDirectionInterval', intervalObject)
  },
  // for quest creation/edition
  setCurrentEditedQuest: ({ commit }, quest) => commit('setCurrentEditedQuest', quest),
  setCurrentEditedStep: ({ commit }, step) => commit('setCurrentEditedStep', step),
  setErrorMessage: ({ commit }, message) => commit('setErrorMessage', message),
  // for quest playing
  setCurrentRun: ({ commit }, run) => commit('setCurrentRun', run),
  // for timeouts handling
  addTimeoutId: ({ commit }, timeoutId) => commit('addTimeoutId', timeoutId),
  clearTimeoutIds: ({ commit }) => commit('clearTimeoutIds')
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
      setState: (key, state) => { Cookies.set(key, state, { expires: 432000000, secure: true }) }
    })
  ]
})
