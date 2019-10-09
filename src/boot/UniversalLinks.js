
var subscribeToUniversalLinks = () => {
  if (!window.hasOwnProperty("cordova")) {
    return
  }
  if (!universalLinks) {
    throw new Error('Required plugin cordova-plugin-deeplinks not found (universalLinks variable missing)')
  }
  // subscribing to a specific event did not work
  universalLinks.subscribe(null, function (eventData) {
    // do some work
    console.log('Launched application from the link: ' + eventData.url, eventData)
    //window.location.url = "https://192.168.0.10:8080/#/quest/play/5d6d179ff151725398ea7975"
    router.push("/quest/play/5d6d179ff151725398ea7975")
  })
}

export default ({ router }) => {
  // something to do
  document.addEventListener('deviceready', subscribeToUniversalLinks, false) 
}
