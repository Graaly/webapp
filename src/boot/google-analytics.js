import ga from '../statics/scripts/analytics.js'
import store from '../store/index'

export default ({ router }) => {
  router.afterEach((to, from) => {
    var userId = 'anonymous'
    if (store && store.state && store.state.user && store.state.user._id) {
      userId = store.state.user._id
    }
    ga.logPage(to.path, to.name, userId)
  })
}