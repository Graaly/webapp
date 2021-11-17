import { Notify } from "quasar";
import utils from "src/includes/utils";

const defaultSettings = {
  position: "top",
  actions: [{ icon: "close" }]
};

export default (message, type, actions, duration) => {
  let customSettings
  const isHybrid = window.cordova
  switch (type) {
    case "positive":
      customSettings = { icon: "check_circle", color: "positive", timeout: (duration ? duration : 4000) }
      break;
    case "warning":
      customSettings = { icon: "warning", color: "orange", timeout: (duration ? duration : 4000) }
      break;
    case "error":
      customSettings = { icon: "report_problem", color: "negative", timeout: (duration ? duration : 5000) }
      break;
    case "rightAnswer":
      customSettings = { color: "positive", timeout: (duration ? duration : 6000) }
      break;
    case "wrongAnswer":
      customSettings = { color: "orange", timeout: (duration ? duration : 3000) }
      break;
    case "readMore":
      customSettings = {
        icon: "info",
        color: "positive",
        timeout: 0,
        position: isHybrid ? "bottom" : "top-right"
      };
      break;
    default:
      customSettings = { icon: "info", color: "info", timeout: (duration ? duration : 3000) }
      break;
  }
  if (actions) {
    customSettings.actions = actions
  }

  var newNotification = Notify.create(
    Object.assign({ message }, defaultSettings, customSettings)
  );
  
  // Clear remaining notifications
  utils.clearAllNotifications()

  utils.notificationsArr.push(newNotification)

  return newNotification
};
