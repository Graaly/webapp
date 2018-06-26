import store from './store/index'

export default ({ router }) => {
  // required to always have header title rendered ("Carte", "Enquête"...) after route change
  // resetTitle() action is defined in store
  router.beforeEach((to, from, next) => {
    store.dispatch('resetTitle')
    next()
  })
}
