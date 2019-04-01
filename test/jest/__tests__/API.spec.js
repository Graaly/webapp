import axios from 'axios'
import https from 'https'
import fs from 'fs'

https.globalAgent.options.ca = fs.readFileSync('certs/webapp-dev-fullchain.pem')
https.globalAgent.keepAlive = true
axios.defaults.headers.common['origin'] = 'https://localhost:8080'
//axios.defaults.withCredentials = true // already done in Api.js
//axios.defaults.jar = cookieJar // unfortunately, does not work

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'

describe('Server API tests', () => {
  let testQuest
  
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
  
  test.todo('can start a quest')
  
  test.todo('can retrieve quest step')
  
  // creation
  
  test.todo('can create a quest')
  
  test.todo('can create a step')
  
  test.todo('can update a step')
  
  // profile
  
  test.todo('can get profile')
  
  test.todo('can update profile')
  
  test.todo('can get updated profile')
  
  test.todo('can get updated profile')
  
  // logout
  
  test.todo('can logout')
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