import Vue from 'vue'
import Vuex from 'vuex'

import AuthService from 'services/AuthService'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  isLoggedIn: !!localStorage.getItem('isLoggedIn'),
  loginPending: false,
  title: null,
  defaultTitle: 'Graaly',
  // for graaly steps, keep track of objects given by setInterval() to clear them properly & avoid useless calls
  graalySteps: {
    geolocation: {
      drawDirectionInterval: null
    }
  },
  user: null,
  currentEditedQuest: null
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setTitle (state, newTitle) {
    state.title = newTitle;
  },
  resetTitle (state) {
    state.title = state.defaultTitle;
  },
  loginStart (state) {
    state.loginPending = true;
  },
  loginSuccess (state, user) {
    state.isLoggedIn = true;
    state.loginPending = false;
    state.user = user;
  },
  logout (state) {
    state.isLoggedIn = false;
  },
  setDrawDirectionInterval (state, intervalObject) {
    state.graalySteps.geolocation.drawDirectionInterval = intervalObject;
  },
  newQuestCreated(state, id) {
    state.currentEditedQuest = { id: id }
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
  // for step geolocation
  setDrawDirectionInterval: ({ commit }, intervalObject) => commit('setDrawDirectionInterval', intervalObject),
  // for quest creation/edition
  newQuestCreated: ({ commit }, id) => commit('newQuestCreated', id)
}

// getters are functions
const getters = {}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
