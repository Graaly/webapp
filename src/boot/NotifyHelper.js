import { Notify } from "quasar";
import utils from "src/includes/utils";

export default (message, type, actions, duration, customColor) => {
  let customSettings
  const isHybrid = window.cordova
  let defaultSettings = {
    position: "top"
  };
  switch (type) {
    case "positive":
      customSettings = { icon: "check_circle", color: customColor ? customColor : "positive", timeout: (duration ? duration : 4000) }
      break;
    case "warning":
      customSettings = { icon: "warning", color: customColor ? customColor : "orange", timeout: (duration ? duration : 8000) }
      break;
    case "error":
      customSettings = { icon: "report_problem", color: customColor ? customColor : "negative", timeout: (duration ? duration : 8000) }
      break;
    case "rightAnswer":
      customSettings = { color: customColor ? customColor : "positive", timeout: (duration ? duration : 6000), multiLine: true }
      break;
    case "wrongAnswer":
      customSettings = { color: customColor ? customColor : "orange", timeout: (duration ? duration : 5000), multiLine: true }
      break;
    case "readMore":
      customSettings = {
        icon: "info",
        color: customColor ? customColor : "positive",
        timeout: 0,
        position: isHybrid ? "bottom" : "top-right"
      };
      defaultSettings.actions = [{ icon: "close" }]
      break;
    default:
      customSettings = { icon: "info", color: customColor ? customColor : "info", timeout: (duration ? duration : 3000) }
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
