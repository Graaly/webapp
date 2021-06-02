import axios from 'axios'

export default {
  async getUserMessages(userId) {
    return axios
      .get(`http://gmdash.api-graaly.com:3000:3000/messages/${userId}`)
      .then(response => response.data)
      .catch(error => error)
  }
}
