import { Notify } from 'quasar'
import utils from 'src/includes/utils'

const defaultSettings = {
  position: 'top',
  actions: [ { icon: 'close' } ]
}

export default (message, type, actions) => {
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
    case 'rightAnswer':
      customSettings = {color: 'positive', timeout: 4000}
      break
    case 'wrongAnswer':
      customSettings = {color: 'orange', timeout: 4000}
      break
    case 'readMore':
      customSettings = {icon: 'info', color: 'positive', timeout: 0, position: 'bottom'}
      break
    default:
      customSettings = {icon: 'info', color: 'info'}
      break
  }
  if (actions) {
    customSettings.actions = actions
  }
  
  var newNotification = Notify.create(Object.assign({ message }, defaultSettings, customSettings))
  
  utils.notificationsArr.push(newNotification)

  return newNotification
}
