/*
 * Main test script, launching test DB restoration & test suites.
 * Note that Graaly API server must be launched manually prior to running this script.
 *
 * useful DB commands:
 * 
 * - dump graaly DB:
 * mongodump --archive=graaly-db.gz --db=graaly --gzip
 * 
 * - import data from 'graaly' archive to 'graaly-test' DB
 * mongorestore --gzip --archive=test/graaly-db.gz --nsFrom "graaly.*" --nsTo "graaly-test.*"
 */

import { execSync } from 'child_process'
import chalk from 'chalk'
import testUtils from './testUtils'

const config = {
    DB_NAME: 'graaly-test',
    //SERVER_URL: 'https://localhost:3000',
    DUMP_FILE: 'test/graaly-db.gz'
}
//config.MONGOOSE_URL = 'mongodb://localhost/' + config.DB_NAME

main()
    .then(() => { console.success('Process finished') })
    .catch((err) => { console.error('Process stopped with error', err.stack) })

async function main () {
    console.log('Restoring clean test DB...')
    execSync('mongorestore --drop --gzip --archive=' + config.DUMP_FILE)
    console.success('DB Restored clean test DB')
    
    try {
        await testUtils.checkConnection("localhost", 3000 /* port */, 5000 /* timeout in ms */)
    } catch (err) {
        console.error('Could not reach API server, please start Graaly API server first.')
        throw err
    }
    console.success('API server is running')
    
    console.log('Run Jest test suite')
}

/*
* console messages with symbols & colors
*/

console.error = (...args) => {
    if (args.length > 0) { args[0] = '⚠️ ' + args[0] }
    args = args.map((arg) => chalk.redBright(arg))
    console.log(...args)
}

console.success = (...args) => {
    if (args.length > 0) { args[0] = '✓ ' + args[0] }
    args = args.map((arg) => chalk.greenBright(arg))
    console.log(...args)
}