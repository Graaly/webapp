import axios from 'axios'

export default {
  async getUserMessages(userId) {
    return axios
      .get(`https://gmdash.api-graaly.com:3001/messages/${userId}`)
      .then(response => response.data)
      .catch(error => error)
  }
}
