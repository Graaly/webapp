var mqtt = require("mqtt");
import store from '../store/index'
import chat from './ChatService'
var client = mqtt.connect('wss://test.mosquitto.org:8081', { username: 'gm-dash', password: '26&8eoW$VXx!xh!f*h' });

let GMMS = {
  Connect(questId) {
    client = mqtt.connect('wss://test.mosquitto.org:8081')
    const topic = `graaly/${questId}/#`
    console.log('Connecting to mqtt')
    client.on('connect', function () {
      console.log('connected to Mqtt')
      client.subscribe(topic, function (err) {
        console.log('Subcribed to topic : ' + topic)
        if (err) {
          console.error(err)
        }
      })
    })
    client.on('message', function (topic, message) {
      const data = JSON.parse(message.toString())
      if (data.userId === store.state.user.id) {
        chat.getUserMessages(data.userId).then(response => {
          store.commit('setChatMessage', response)
        })
        if (data.admin) {
          store.commit('updateChatNotification')
        }
      }
    })
  },
  Send(questid, data) {
    const topic = `graaly/${questid}/injest/`;
    console.log("publishing on topic : " + topic);
    // console.log(data);
    client.publish(topic, JSON.stringify(data));
  },
  SendChat(questid, data) {
    const topic = `graaly/${questid}/chat/`;
    console.log("publishing on topic : " + topic);
    //console.log(JSON.stringify(data));
    client.publish(topic, JSON.stringify(data));
  }
};

export default GMMS;
