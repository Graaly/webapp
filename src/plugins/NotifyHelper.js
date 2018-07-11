import { Notify } from 'quasar'

export default (message, type) => {
  switch (type) {
    case 'positive':
      Notify.create({message: message, position: 'top', icon: 'tag_faces', color: 'positive'})
      break
    case 'warning':
      Notify.create({message: message, position: 'top', icon: 'warning', color: 'orange'})
      break
    case 'error':
      Notify.create({message: message, position: 'top', icon: 'report_problem', color: 'negative'})
      break
    default:
      Notify.create({message: message, position: 'top', icon: 'info', color: 'info'})
      break
  }
}
