import axios from 'axios'

export default {
  async getUserMessages(userId) {
    return axios
      .get(`http://localhost:3000/messages/${userId}`)
      .then(response => response.data)
      .catch(error => error)
  }
}
