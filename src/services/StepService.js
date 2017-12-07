import Api from 'services/Api'
import utils from 'src/includes/utils'

export default {
  async get (graalyId, stepNumber) {
    let res = await Api().get('steps?' + utils.encodeQueryData({graalyId: graalyId, number: stepNumber}))
    return res.data.shift()
  }
}
