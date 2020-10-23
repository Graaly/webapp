/* eslint-disable */
export default {
  logEvent(category, action, label, sessionId = null) {
    dataLayer.push({
      'appEventCategory': category,
      'appEventAction': action,
      'appEventLabel': label,
      'sessionId': sessionId
    })
    dataLayer.push({ 'event': 'appEvent' })
  },

  logPage(path, name, sessionId = null) {
    dataLayer.push({
      'screenPath': path,
      'screenName': name,
      'sessionId': sessionId
    })
    // MP 2018-11-12 see https://github.com/Graaly/webapp/issues/176
    dataLayer.push({ 'event': 'appScreenView' })
  }
}
