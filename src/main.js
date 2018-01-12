// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
// require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

// add icons (e.g. social icons)
import 'quasar-extras/fontawesome'

import Vue from 'vue'

import * as VueGoogleMaps from 'vue2-google-maps'
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDPcuabMP6UutEiabzd_CYaozuV5__DJaA',
    libraries: 'places' // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)
  }
})

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate);

import Quasar, { 
  QBtn, 
  QField, 
  QIcon, 
  QInput, 
  QItem,
  QItemMain, 
  QItemSide,
  QItemSeparator,
  QItemTile,
  QLayout, 
  QList, 
  QListHeader, 
  QRouteTab, 
  QSearch, 
  QSideLink,  
  QTabs, 
  QToolbar, 
  QToolbarTitle 
} from 'quasar'
import router from './router'
import store from './store'
// import App from 'src/App.vue'

Vue.config.productionTip = false
Vue.use(Quasar, {
  components: { 
    QBtn, 
    QField, 
    QIcon,    
    QInput, 
    QItem,
    QItemMain, 
    QItemSide,
    QItemSeparator,
    QItemTile,
    QLayout, 
    QList, 
    QListHeader, 
    QRouteTab, 
    QSearch, 
    QSideLink,  
    QTabs, 
    QToolbar, 
    QToolbarTitle
  }
})

if (__THEME === 'mat') {
  // require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'

/* eslint-disable no-new */
new Vue({
  el: '#q-app',
  store,
  router: router,
  render: h => h(require('./App').default)
})

// date format
import Moment from 'moment'
Vue.filter('formatDate', function(value) {
  if (value) {
    return Moment(String(value)).fromNow()
  }
})
