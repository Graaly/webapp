// date format

import Moment from 'moment'

export default ({ Vue }) => {
  Vue.filter('formatDate', function(value) {
    // TODO : have locale configurable
    Moment.locale('fr')
    if (value) {
      return Moment(String(value)).fromNow()
    }
  })
}
