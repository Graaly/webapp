import net from 'net'
import console from './consoleColor.mjs'

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
    },
    
    sleep: async (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
        
    addLoggingToProcess: (process, name) => {
        process.on('close', (code, signal) => {
            console.log(`<${name}> process exited (code=${code}, signal=${signal})`)
        })
        process.on('error', (err) => {
            console.error(`<${name}> failed to start`)
            throw err
        })
        /*process.stderr.on('data', (data) => {
            console.error(`<${name}>: ${data}`)
        })
        process.stdout.on('data', (data) => {
            console.log(`<${name}>: ${data}`)
        })*/
        return process
    }
}