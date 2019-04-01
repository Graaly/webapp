import axios from 'axios'
import https from 'https'
import fs from 'fs'

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import StepService from 'services/StepService'

https.globalAgent.options.ca = fs.readFileSync('certs/webapp-dev-fullchain.pem')
https.globalAgent.keepAlive = true
axios.defaults.headers.common['origin'] = 'https://localhost:8080'
//axios.defaults.withCredentials = true // already done in Api.js
//axios.defaults.jar = cookieJar // unfortunately, does not work

describe('Server API tests', () => {
  let testQuest, userId, stepId, runId
  
  test('is launched in test environement', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
  
  test('get a reply from API server', async () => {
    let httpclient = axios.create({
      baseURL: process.env.SERVER_URL,
      withCredentials: true
    })
    const result = await httpclient.get('/')
    expect(result.status).toBe(200)
    expect(result.data.message)
      .toBeDefined()
      .toContain('Welcome on Graaly API')
  })
  
  test('login failure', async () => {
    let result = await AuthService.login('abcd', '1234')
    expect(result.status).toBe(401)
  })
  
  test('list nearest quests while not logged in', async () => {
    await listNearestQuests()
  })
  
  test('login success', async () => {
    let userEmail = 'maxime.pacary@gmail.com'
    let result = await AuthService.login(userEmail, 'toto')
    
    expect(result.status).toBe(200)
    expect(result.data.message)
      .toBeDefined()
      .toContain('login successful')
    expect(result.data.user).toBeDefined()
    expect(result.data.user._id).toBeDefined()
    expect(result.data.user.email)
      .toBeDefined()
      .toBe(userEmail)
      
    userId = result.data.user._id
  })
  
  // play
  
  test('can list quests once logged in', async () => {
    let results = await listNearestQuests()
    testQuest = results[0] // used for next tests
  })
  
  test('can get quest details', async () => {
    let result = await QuestService.getById(testQuest.questId, 1)
    
    expect(result.status).toBe(200)
    checkQuestProperties(result.data)
    
    // test "latest version" service as well
    result = await QuestService.getLastById(testQuest.questId)
    
    expect(result.status).toBe(200)
    checkQuestProperties(result.data)
  })
  
  test('can create a run', async () => {
    let lang = 'fr'
    let remotePlay = true
    let result = await RunService.init(testQuest.questId, 1, lang, remotePlay)
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('_id')
      .toHaveProperty('userId', userId)
      .toHaveProperty('questId', testQuest.questId)
      .toHaveProperty('currentStep')
      .toHaveProperty('currentChapter')
      .toHaveProperty('version', '1')
      .toHaveProperty('language', lang)
      .toHaveProperty('inventory', [])
      .toHaveProperty('userData')
      .toHaveProperty('questData')
      .toHaveProperty('remotePlay', remotePlay)
    
      runId = result.data._id
      stepId = result.data.currentStep
  })
  
  test('can retrieve quest step', async () => {
    // must call 'getNextStep' first
    let result = await RunService.getNextStep(runId)
    expect(result.status).toBe(200)
    
    result = await StepService.getById(stepId)
    //console.log('step', result.data, result.status)
    expect(result.status).toBe(200)
    expect(result.data.message).not.toContain('not allowed')
  })
  
  // not so simple; quest must be played entierely otherwise we get an HTTP 500 error
  test('can stop a run', async () => {
    let result = await RunService.endRun(runId)
    expect(result.status).toBe(200)
  })
  
  // creation
  
  test('can create a quest', async () => {
    let result = await QuestService.create({
      title: {'fr': 'Créée depuis API', 'en': 'Created from API'},
      description: {'fr': 'Desc API FR', 'en': 'Desc API EN'},
      mainLanguage: 'fr',
      editorsUserId: [ userId ]
    },
    'private')
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('questId')
      .toHaveProperty('version', '1')
      .toHaveProperty('description')
      .toHaveProperty('access', 'private')
      .toHaveProperty('languages', [])
  })
  
  test.todo('can create a step')
  
  test.todo('can update a step')
  
  // profile
  
  test('can get profile', async () => {
    let result = await AuthService.getAccount()
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('id', userId)
      .toHaveProperty('clientSupportedVersion')
      .toHaveProperty('email')
      .toHaveProperty('picture')
      .toHaveProperty('status')
      .toHaveProperty('isAdmin', false)
      .toHaveProperty('statistics')
      .toHaveProperty('story')
  })
  
  test.todo('can update profile')
  
  test.todo('can get updated profile')
  
  // logout
  
  test('can logout', async () => {
    let result = await AuthService.logout()
    console.log('logout', result.status, result.data)
    expect(result.status).toBe(200)
    expect(result.data).toContain('OK')
  })
})

// returns nearest quests
// used several times
const listNearestQuests = async () => {
  let grenobleCoords = { lat: 45.2, lng: 5.7 }
    let results = await QuestService.listNearest(grenobleCoords, 'all')
    expect(results.status).toBe(200)
    expect(results.data.length).toBeGreaterThan(0)
    results.data.forEach((result) => {
      expect(result)
        .toHaveProperty('_id')
        .toHaveProperty('questId')
        .toHaveProperty('version')
        .toHaveProperty('title')
        .toHaveProperty('mainLanguage')
        .toHaveProperty('authorUserId')
        .toHaveProperty('languages')
        .toHaveProperty('location')
    })
  return results.data
}

const checkQuestProperties = (questObject) => {
  expect(questObject)
    .toHaveProperty('questId')
    .toHaveProperty('version')
    .toHaveProperty('title')
    .toHaveProperty('picture')
    .toHaveProperty('authorUserId')
    .toHaveProperty('location')
    .toHaveProperty('location.coordinates')
}