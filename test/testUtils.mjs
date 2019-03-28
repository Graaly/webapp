import net from 'net'

export default {
    checkConnection: async (host, port, timeout) => {
        return new Promise(function(resolve, reject) {
            timeout = timeout || 10000;     // default of 10 seconds
            var timer = setTimeout(() => {
                socket.end()
                reject(new Error(timeout + "ms timeout reached"))
            }, timeout)
            var socket = net.createConnection(port, host, function() {
                clearTimeout(timer)
                socket.end()
                resolve()
            })
            socket.on('error', (err) => {
                clearTimeout(timer)
                reject(new Error("socket connection error: " + err))
            })
        })
    }
}