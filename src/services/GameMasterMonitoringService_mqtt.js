var mqtt = require("mqtt");
var client = mqtt.connect("mqtts://test.mosquitto.org:8081");

let GMMS = {
  Send(questid, data) {
    const topic = "graaly/injest/" + questid;
    console.log("publishing on topic : " + topic);
    client.publish(topic, JSON.stringify(data));
  },
  SendChat(questid) {
    const topic = "graaly/chat/" + questid;
    console.log("publishing on topic : " + topic);
    client.publish(topic, { msg: "aaaaaaaaaaaaaaaaaaaaaa" });
  }
};

export default GMMS;
