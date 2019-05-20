// replace console.log() in command line, adds 
// import example: import console from './consoleColor'

import chalk from 'chalk'

export default {
    // TODO refactor
    
    log: (...args) => {
        args = args.map((arg) => chalk.cyanBright(arg))
        console.log(...args)
    },
    
    error: (...args) => {
        if (args.length > 0) { args[0] = '❌ ' + args[0] }
        args = args.map((arg) => chalk.redBright(arg))
        console.log(...args)
    },
    
    warn: (...args) => {
        if (args.length > 0) { args[0] = '⚠️ ' + args[0] }
        args = args.map((arg) => chalk.yellowBright(arg))
        console.log(...args)
    },
    
    success: (...args) => {
        if (args.length > 0) { args[0] = '✔️ ' + args[0] }
        args = args.map((arg) => chalk.greenBright(arg))
        console.log(...args)
    }
}