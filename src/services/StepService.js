import Api from 'services/Api'
import utils from 'src/includes/utils'

export default {
  async get (questId, stepNumber) {
    let res = await Api().get('steps?' + utils.encodeQueryData({questId: questId, number: stepNumber}))
    return res.data.shift()
  }
}
