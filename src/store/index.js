import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import * as Cookies from "js-cookie";

import AuthService from "services/AuthService";

import utils from "../includes/utils"

Vue.use(Vuex);

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  isLoggedIn: !!localStorage.getItem("isLoggedIn"),
  loginPending: false,
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
  // for quest steps, keep track of objects given by setInterval() & setTimeout() to clear them properly & avoid useless calls
  runningIntervalIds: [],
  runningTimeoutsIds: [],
  mediaStreams: [],
  isNetworkStable: null,
  networkCheckDelay: {
    initial: 5, // in seconds
    current: null
  }
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  loginStart(state) {
    state.loginPending = true;
  },
  loginSuccess(state, user) {
    state.isLoggedIn = true;
    state.loginPending = false;
    state.user = user;
  },
  logout(state) {
    state.user = null;
  },
  setLastLoadedRoute(state, route) {
    state.lastLoadedRoute = route;
  },
  setDrawDirectionInterval(state, intervalObject) {
    state.questSteps.geolocation.drawDirectionInterval = intervalObject;
  },
  setCurrentEditedQuest(state, quest) {
    state.currentEditedQuest = quest;
  },
  setCurrentEditedStep(state, step) {
    state.currentEditedStep = step;
  },
  setErrorMessage(state, message) {
    state.errorMessage = message;
  },
  setCurrentRun(state, run) {
    state.currentRun = run;
  },
  addTimeoutId(state, timeoutId) {
    state.runningTimeoutsIds.push(timeoutId);
  },
  clearTimeoutIds(state) {
    state.runningTimeoutsIds = [];
  },
  addIntervalId(state, intervalId) {
    state.runningIntervalIds.push(intervalId);
  },
  clearIntervalIds(state) {
    state.runningIntervalIds = [];
  },
  addMediaStream(state, stream) {
    state.mediaStreams.push(stream);
  },
  clearMediaStreams(state) {
    for (let stream of state.mediaStreams) {
      if (!stream || !stream.getTracks) {
        continue;
      }
      stream.getTracks().forEach(track => track.stop());
    }
    state.mediaStreams = [];
  },
  setNetworkStatus(state, status) {
    //console.log("*mutate setNetworkStatus*", status)
    state.isNetworkStable = Boolean(status)
  },
  setNetworkCheckDelay(state, delay) {
    //console.log("*mutate setNetworkCheckDelay*", delay)
    state.networkCheckDelay.current = delay
  }
}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
  login: async ({ commit }, creds) => {
    commit("loginStart"); // show spinner
    let result = await AuthService.login(creds.email, creds.password);
    if (result.status === 200) {
      commit("loginSuccess", result.data.user);
      localStorage.setItem("isLoggedIn", true);
    }
    return result;
  },
  logout: async ({ commit }) => {
    // TODO ON SERVER: calling logout should blacklist the JWT, see https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6
    let result = await AuthService.logout();
    commit("logout");
    return result;
  },
  setLastLoadedRoute: ({ commit }, route) =>
    commit("setLastLoadedRoute", route),
  // for step geolocation
  setDrawDirectionInterval: ({ commit, state }, intervalObject) => {
    if (intervalObject === null) {
      // call clearInterval first, if any is defined (avoids issues with hot reloading during dev)
      let drawDirectionInterval =
        state.questSteps.geolocation.drawDirectionInterval;
      if (drawDirectionInterval !== null) {
        window.clearInterval(drawDirectionInterval);
      }
    }
    commit("setDrawDirectionInterval", intervalObject);
  },
  // for quest creation/edition
  setCurrentEditedQuest: ({ commit }, quest) => commit("setCurrentEditedQuest", quest),
  setCurrentEditedStep: ({ commit }, step) => commit("setCurrentEditedStep", step),
  setErrorMessage: ({ commit }, message) => commit("setErrorMessage", message),
  // for quest playing
  setCurrentRun: ({ commit }, run) => commit("setCurrentRun", run),
  // for timeouts handling
  addTimeoutId: ({ commit }, timeoutId) => commit("addTimeoutId", timeoutId),
  clearTimeoutIds: ({ commit }) => commit("clearTimeoutIds"),
  // for intervals handling
  addIntervalId: ({ commit }, intervalId) => commit("addIntervalId", intervalId),
  clearIntervalIds: ({ commit }) => commit("clearIntervalIds"),
  addMediaStream: ({ commit }, stream) => commit("addMediaStream", stream),
  clearMediaStreams: ({ commit }) => commit("clearMediaStreams"),
  setNetworkStatus: ({ state, commit, dispatch }, status) => {
    //console.log('* action setNetworkStatus *', status, state.isNetworkStable)
    if (Boolean(status) !== state.isNetworkStable) {
      //console.log('*network status change detected!*')
      commit("setNetworkCheckDelay", null)
      //TEMP
      //dispatch("checkNetworkPeriodically")
    }
    commit("setNetworkStatus", status)
  },
  setNetworkCheckDelay: ({ commit }, delay) => commit("setNetworkCheckDelay", delay),
  /**
   * checks periodically network quality
   * insipired from https://dev.to/oskarcodes/quick-javascript-tip-setinterval-with-modifiable-delay-4h1g and https://github.com/HubSpot/offline
   */
  checkNetworkPeriodically: async ({ state, commit, dispatch }) => {
    let delay = state.networkCheckDelay
    let newCurrentDelay = delay.current
    
    // this will reset automatically network status & timeout
    // in case of network status change:
    // - failed call due to timeout when network status is defined as stable
    // - successful call when network status is defined as unstable
    
    // TEMPORARILY DISABLED FOR TESTING AXIOS RETRY
    //await NetworkService.basicApiCall()
    
    if (delay.current === null || !state.isNetworkStable) {
      newCurrentDelay = delay.initial
    } else {
      // when network is stable, increase the delay between each call, capped at 5 minutes (in seconds)
      newCurrentDelay = Math.min(delay.current * 1.5, 300)
    }
    commit("setNetworkCheckDelay", newCurrentDelay)
    //console.log('NETWORK WILL BE CHECKED IN ' + newCurrentDelay + ' SECONDS')
    await utils.sleep(newCurrentDelay * 1000)
    //TEMP
    //dispatch("checkNetworkPeriodically")
  }
};

// getters are functions
const getters = {};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [
    createPersistedState({
      getState: key => Cookies.getJSON(key),
      setState: (key, state) => {
        Cookies.set(key, state, {
          expires: parseInt(process.env.PERSIST_STATE_COOKIE_DURATION, 10),
          secure: true
        });
      }
    })
  ]
});
