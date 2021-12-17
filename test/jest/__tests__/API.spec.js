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
  let testQuest, userId, stepId, runId, result
  let otherUserId = '5c0a8c3916de36467823623f'
  
  test('is launched in test environement', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
  
  test('get a reply from API server', async () => {
    let httpclient = axios.create({
      baseURL: process.env.SERVER_URL,
      withCredentials: true
    })
    result = await httpclient.get('/')
    expect(result.status).toBe(200)
    expect(result.data.message)
      .toBeDefined()
      .toContain('Welcome on Graaly API')
  })
  
  test('login failure', async () => {
    result = await AuthService.login('abcd', '1234')
    expect(result.status).toBe(401)
  })
  
  test('list nearest quests while not logged in', async () => {
    await listNearestQuests()
  })
  
  test('cannot get my own profile while not logged in', async () => {
    result = await AuthService.getAccount()
    expect(result.status).toBe(401)
    expect(result.data.message).toContain('authentication required')
  })
  
  test('get other user profile while not logged in', async () => {
    result = await AuthService.getAccount(otherUserId)
    expect(result.status).toBe(200)
    expect(result.data)
      .not.toHaveProperty('email')
      .not.toHaveProperty('password')
  })
  
  test('login success', async () => {
    let userEmail = 'maxime.pacary@gmail.com'
    result = await AuthService.login(userEmail, 'toto')
    
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
    result = await QuestService.getByIdOnline(testQuest.questId, 1)
    checkQuestProperties(result)
    
    // test "latest version" service as well
    result = await QuestService.getLastById(testQuest.questId)
    checkQuestProperties(result)
  })
  
  test('can start a run', async () => {
    let lang = 'fr'
    let remotePlay = true
    
    result = await RunService.init(testQuest.questId, 1, lang, remotePlay)
    
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
  
  test('can retrieve a quest step', async () => {
    result = await StepService.getById(stepId, 1)
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('stepId', stepId)
      .toHaveProperty('questId', testQuest.questId)
      .toHaveProperty('chapterId')
      .toHaveProperty('version')
      .toHaveProperty('title')
      .toHaveProperty('createdBy')
      .toHaveProperty('status')
      .toHaveProperty('number')
  })
  
  test('can retrieve next step', async () => {
    result = await RunService.getNextStep(testQuest.questId)
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('message')
      .toHaveProperty('next')
  })
  
  test('can stop a run', async () => {
    result = await RunService.endRun(runId)
    expect(result.status).toBe(200)
  })
  
  // creation
  
  test('can create a quest', async () => {
    result = await QuestService.create({
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
  
  test('can update profile', async () => {
    // already existing email
    let result = await AuthService.modifyAccount({
      name: 'Maxime modifié free',
      language: 'en',
      email: 'maxime.pacary@free.fr'
    })
    
    expect(result.status).toBe(400)
    expect(result.data.message).toContain('already exist')
    
    // available email
    result = await AuthService.modifyAccount({
      name: 'Maxime modifié',
      language: 'en',
      email: 'maxime.pacary@graaly.com'
    })
    
    expect(result.status).toBe(200)
    
    // change password (too weak)
    result = await AuthService.modifyAccount({
      oldPassword: 'toto',
      newPassword: 'titi'
    })
    
    expect(result.status).toBe(400)
    expect(result.data.message).toContain('too weak')
    
    // change password (strong)
    result = await AuthService.modifyAccount({
      oldPassword: 'toto',
      newPassword: 'a1B2$#x8z9h'
    })
    
    expect(result.status).toBe(200)
  })
  
  test('can get updated profile', async () => {
    let result = await AuthService.getAccount('me')
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('id', userId)
  })
  
  test('can get other users profile', async () => {
    let result = await AuthService.getAccount(otherUserId)
    
    expect(result.status).toBe(200)
    expect(result.data)
      .toHaveProperty('_id', otherUserId)
      .toHaveProperty('name', 'GAGAGAG')
  })
  
  // logout
  
  test('can logout', async () => {
    let result = await AuthService.logout()
    expect(result.status).toBe(200)
    expect(result.data).toContain('OK')
  })
  
  // create account
  
  test('can create account', async () => {
    // empty data => error
    let result = await AuthService.createAccount({})
    expect(result.status).toBe(400)
    
    // already existing => error
    result = await AuthService.createAccount({
      name: 'Maxime doublon',
      email: 'MAXIME.PACARY@GMAIL.COM',
      password: '12$4x6Z78€'
    })
    expect(result.status).toBe(400)
    
    // correct data => no error
    result = await AuthService.createAccount({
      name: 'Maxime Graaly',
      email: 'MAXIME@grAAly.com',
      password: '12$4x6Z78€'
    })
    expect(result.status).toBe(200)
  })
})

// -------------------- custom functions ----------------------

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