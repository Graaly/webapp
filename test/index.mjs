/*
 * Main test script, launching test DB restoration & test suites.
 * Note that Graaly API server must be launched manually prior to running this script.
 *
 * useful DB commands:
 * 
 * - dump graaly-test DB:
 * mongodump --archive=graaly-db.gz --db=graaly-test --gzip
 * 
 * - import data from 'graaly' archive to 'graaly-test' DB
 * mongorestore --drop --gzip --archive=test/graaly-db.gz --nsFrom "graaly.*" --nsTo "graaly-test.*"
 */

import { execSync, spawn } from 'child_process'
import testUtils from './testUtils'
import console from './consoleColor'

const config = {
    RUN: {
        RESTORE_DB: 1,
        LAUNCH_API: 0,
        LAUNCH_WEBAPP: 0,
        UNIT_TESTS: 1, // tests API only for the moment
        E2E_TESTS: 0
    },
    
    // settings
    DB_NAME: 'graaly-test',
    WEBAPP_URL: 'https-get://localhost:8080', // "https-get" instead of "https" is required for utility wait-on, used by utility start-server-and-test
    SERVER_HOST: 'localhost',
    SERVER_PORT: 3000,
    SERVER_PATH: '../server', // relative to webapp root dir
    DUMP_FILE: 'test/graaly-db.gz'
}
//config.MONGOOSE_URL = 'mongodb://localhost/' + config.DB_NAME

main()
    .then(() => { console.success('Process finished') })
    .catch((err) => { console.error('Process stopped with error', err.stack) })

async function main () {
    let serverProcess
    
    if (config.RUN.RESTORE_DB) {
        console.log('Restoring clean test DB...')
        execSync('mongorestore --drop --gzip --archive=' + config.DUMP_FILE)
        console.success('DB Restored')
    }
    
    if (config.RUN.LAUNCH_API) {
        console.log('Starting API server...')
    
        serverProcess = spawn('node', ['server.js', '--env=test'], { cwd: config.SERVER_PATH, stdio: 'inherit' })
        
        serverProcess = testUtils.addLoggingToProcess(serverProcess, 'API server') // default logging from spawned processes is very low
        
        if (!serverProcess) {
            throw new Error('Could not start API server.')
        }
        
        await testUtils.sleep(2000) // let server completely startup
        console.success('API server is running')
    }
    
    if (config.RUN.UNIT_TESTS) {
        console.log('Run unit tests')
        execSync('npm run test:unit', { stdio: 'inherit' })
    }
    
    if (config.RUN.E2E_TESTS) {
        console.log('Run end to end tests')
        
        if (config.RUN.LAUNCH_WEBAPP) {
            // otherwise start-server-and-test is stuck, see 
            //process.env.START_SERVER_AND_TEST_INSECURE = 1
            execSync('start-server-and-test start:dev ' + config.WEBAPP_URL + ' test:e2e:CI', { stdio: 'inherit' })
        } else {
            execSync('npm run test:e2e:CI', { stdio: 'inherit' })
        }
    }
    
    if (config.RUN.LAUNCH_API && serverProcess) {
        console.log('Stop API server')
        serverProcess.kill('SIGTERM')
    }
}