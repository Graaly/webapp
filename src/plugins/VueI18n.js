
import VueI18n from 'vue-i18n'
import messages from '../i18n/main.js'

export default ({ app, Vue }) => {
  Vue.use(VueI18n)

  app.i18n = new VueI18n({
    locale: 'fr',
    messages
  })
}
