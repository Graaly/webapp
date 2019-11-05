
export default ({ router }) => {
  document.addEventListener('deviceready', 
    function() { 
      if (!window.hasOwnProperty("cordova")) {
        return
      }
      if (!universalLinks) {
        throw new Error('Required plugin cordova-plugin-deeplinks not found (universalLinks variable missing)')
      }
      // subscribing to a specific event did not work
      universalLinks.subscribe(null, function (eventData) {
        if (eventData.hash) {
          const hashParts = eventData.hash.split("/")
          if (hashParts[1] === 'quest') {
            if (hashParts[2] === 'play') {
              // opens the quest
              router.push("/quest/play/" + hashParts[3])
            }
          }
        }
      })
    }, 
  false) 
}
