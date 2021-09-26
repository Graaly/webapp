var mqtt = require('mqtt')

const mqttUrl = 'ws://test.mosquitto.org:8080' // unencrypted, unauthenticated
//const mqttUrl = 'wss://test.mosquitto.org:8081' // encrypted, unauthenticated

const topic = 'test2'

var client = mqtt.connect(mqttUrl, { connectTimeout: 30000, reconnectPeriod: 1000 })

console.log("connecting...")

client.on("connect", function() {
  console.log("connected")
  client.subscribe(topic)
})

client.on("reconnect", function() {
  console.log("reconnecting...")
})

client.on("close", function() {
  console.log("connection closed")
})

client.on("disconnect", function() {
  console.log("disconnected")
})

client.on("end", function() {
  console.log("end")
})

client.on("error", function(error) {
  console.log("Can't connect", error)
})

client.on('message', function(topic, message, packet) {
  console.log("*** MESSAGE RECEIVED")
  console.log("message is "+ message)
  console.log("topic is "+ topic)
  //console.log("packet is "+ packet)
})