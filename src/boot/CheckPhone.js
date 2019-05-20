
export default phoneNumber => {
  let phoneDigits = phoneNumber.match(/\d/g)
  
  if (phoneDigits.length === 10) {
    return true
  }

  return false
}
