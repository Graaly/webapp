export default ({ router }) => {
  document.addEventListener(
    "deviceready",
    function() {
      if (!window.hasOwnProperty("cordova")) {
        return;
      }
      if (!universalLinks) {
        throw new Error(
          "Required plugin cordova-plugin-deeplinks not found (universalLinks variable missing)"
        );
      }
      // subscribing to a specific event did not work
      universalLinks.subscribe(null, function(eventData) {
        if (eventData.hash) {
          const hashParts = eventData.hash.split("/");
          if (hashParts[1] === "quest") {
            if (hashParts.length > 2 && hashParts[2] === "play") {
              if (hashParts.length > 4) {
                // open a private quest with a code
                router.push("/quest/play/" + hashParts[3] + "/" + hashParts[4]);
              } else {
                // opens the quest
                router.push("/quest/play/" + hashParts[3]);
              }
            }
          }
        }
      });
    },
    false
  );
};
