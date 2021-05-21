var mqtt = require("mqtt");
var client = mqtt.connect('wss://test.mosquitto.org:8081', { username: 'gm-dash', password: '26&8eoW$VXx!xh!f*h' });

let GMMS = {
  Send(questid, data) {
    const topic = `graaly/${questid}/injest/`;
    console.log("publishing on topic : " + topic);
    // console.log(data);
    client.publish(topic, JSON.stringify(data));
  },
  SendChat(questid, data) {
    const topic = `graaly/${questid}/chat/`;
    console.log("publishing on topic : " + topic);
    console.log(JSON.parse(data));
    client.publish(topic, JSON.parse(data));
  }
};

export default GMMS;
