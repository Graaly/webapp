//import Api from 'services/Api'
import loadEnvVars from './config/index'
import axios from 'axios'
import https from 'https'

process.env = loadEnvVars('test')

describe('Server API tests', () => {
  it('must be launched in test environement', () => {
    expect(process.env.NODE_ENV).toBe('"testing"')
  })
  
  it('can get a reply from API server', async () => {
    let httpclient = axios.create({
      baseURL: JSON.parse(process.env.SERVER_URL),
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    const result = await httpclient.get('/')
    expect(result.status).toBe(200)
    expect(result.data.message)
      .toBeDefined()
      .toContain('Welcome on Graaly API')
  })
})
