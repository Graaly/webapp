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

import { execSync, spawn } from 'child_process'
import testUtils from './testUtils'
import console from './consoleColor'

const config = {
    RESTORE_DB: 0,
    DB_NAME: 'graaly-test',
    //SERVER_URL: 'https://localhost:3000',
    SERVER_HOST: 'localhost',
    SERVER_PORT: 3000,
    SERVER_PATH: '../server',
    DUMP_FILE: 'test/graaly-db.gz'
}
//config.MONGOOSE_URL = 'mongodb://localhost/' + config.DB_NAME

main()
    .then(() => { console.success('Process finished') })
    .catch((err) => { console.error('Process stopped with error', err.stack) })

async function main () {
    if (config.RESTORE_DB) {
        console.log('Restoring clean test DB...')
        execSync('mongorestore --drop --gzip --archive=' + config.DUMP_FILE)
        console.success('DB Restored')
    } else {
        console.log('Skipping DB restore (config.RESTORE_DB is falsy)')
    }
    
    console.log('Starting API server...')
    
    let serverProcess = spawn('node', ['server.js', '--env=test'], { cwd: config.SERVER_PATH, stdio: 'inherit' })
    
    serverProcess = testUtils.addLoggingToProcess(serverProcess, 'API server') // default logging from spawned processes is very low
    
    if (!serverProcess) {
        throw new Error('Could not start API server.')
    }
    
    await testUtils.sleep(2000) // let server completely startup
    console.success('API server is running')
    
    console.log('Run Jest test suite')
    execSync('npm run test:unit', { stdio: 'inherit' })
    
    if (serverProcess) {
        console.log('Stop API server')
        serverProcess.kill('SIGTERM')
    }
}