let connected = false

// debug lists
let debugStack = []

let test = {
    ws: null,
    id: Math.random(),
    getDebugStack() {
        return debugStack
    },
    getWSObject() {
        return this.ws
    },
    /**
     * Connect to the websocket
     */
    Connect() {
        console.log('ws connecting')
        this.ws = new WebSocket('ws://localhost:3001')
        // When the connection is initiated
        this.ws.onopen = () => {
            console.log('connecting to WS')
        }

        this.ws.onmessage = data => {
            console.log('WS message received')

            // shorthand to avoid doing data.data all the time
            data = JSON.parse(data.data)

            // add the received data to a debug stack
            // clear the stack if too big
            if (debugStack.length > 250) {
                debugStack = []
            }
            debugStack.push(data)

            console.log(data)
            if (data.statusCode === 200) {
                console.log('🟢 200')
                switch (data.data.action) {
                    case 'connectHandler':
                        if (data.data.message === 'Connected Sucesfully') {
                            connected = true
                            console.log('Connected to WS :' + connected)
                            // now that we are connected we need to set the device type
                            this.Send('setDeviceType', { type: 'player' })
                        }
                        break
                }
            } else {
                console.log('🔴 Not 200')
            }
        }

        this.ws.onclose = () => {
            console.log('disconnected from WS')
            connected = false
            console.log('trying to reconnect');
            this.Connect();
        }

        this.ws.onerror = () => {
            console.log('error from WS')
        }
    },
    /**
     * Send data to the game Master
     * @param {*} data 
     */
    Send(action, data) {
        console.log('Sending data from instance : '+this.id)
        let datatemp = {
            action,
            data
        }
        console.log(datatemp)
        this.ws.send(JSON.stringify(datatemp))
    },
    /**
     * Kill the websocket connection
     */
    Disconnect() {
        console.log('Disconnecting from WS')
        if (this.ws !== null) {
            // close the connections
            this.ws.close()
            this.ws = null
            // empty the debug lists
            debugStack = []
        } else {
            console.error('WS is null ( not openned yet)')
        }
    }
}

export default test;