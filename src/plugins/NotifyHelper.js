import { Notify } from 'quasar'

const defaultSettings = {
  position: 'top',
  actions: [ { icon: 'close' } ]
}

export default (message, type) => {
  let customSettings
  switch (type) {
    case 'positive':
      customSettings = {icon: 'check_circle', color: 'positive'}
      break
    case 'warning':
      customSettings = {icon: 'warning', color: 'orange'}
      break
    case 'error':
      customSettings = {icon: 'report_problem', color: 'negative'}
      break
    default:
      customSettings = {icon: 'info', color: 'info'}
      break
  }
  Notify.create(Object.assign({ message }, defaultSettings, customSettings))
}
