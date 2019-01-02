import ga from '../statics/scripts/analytics.js'

export default ({ router }) => {
  router.afterEach((to, from) => {
console.log(to.path)
console.log(to.name)
    ga.logPage(to.path, to.name, '1234')
    // TODO : get sessionId = userId
    //ga.logPage(to.path, to.name, sessionId)
  })
}