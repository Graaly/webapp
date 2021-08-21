// date format

import Moment from "moment"

export default ({ Vue }) => {
  Vue.filter("formatDate", function(value, lang) {
    // TODO : have locale configurable
    Moment.locale(lang)
    if (value) {
      return Moment(String(value)).fromNow()
    }
  });
};
