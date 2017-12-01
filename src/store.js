import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  isLoggedIn: !!localStorage.getItem('token'),
  loginPending: false,
  title: null,
  defaultTitle: 'Graaly',
  graalyLevels: {
      1: 'Facile',
      2: 'Moyenne',
      3: 'Difficile'
    }
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
  loginSuccess (state) {
    state.isLoggedIn = true;
    state.loginPending = false;
  },
  logout (state) {
    state.isLoggedIn = false;
  }
}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
  setTitle: ({ commit }, newTitle) => commit('setTitle', newTitle),
  resetTitle: ({ commit }) => commit('resetTitle'),
  login({ commit }, creds) {
    commit('loginStart'); // show spinner
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem("token", "JWT")
        commit('loginSuccess')
        resolve()
      }, 1000)
    });
  },
  logout({ commit }) {
    localStorage.removeItem("token")
    commit('logout')
  }
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
