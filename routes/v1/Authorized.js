const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

function decryptJWT(cookie) {
  try {
   // const cookieToDecrypt = cookie.split('.')[1]
    const decoded = jwt.verify(cookie, 'Ao51gR0qZsDyeT1zUury03X/I4HulnuV7aL1D2181xU=')
    return decoded
  } catch (err) {
    console.error(`An error occured: ${err}`)
    return null
  }
}

router.get('/', (req, res) => {
    let robloSecurity = req.cookies['.ROBLOSECURITY']
    if (robloSecurity) {
      const user = decryptJWT(robloSecurity)
  
      if (user && user.username && user.userId) {
        res.status(200).json({status: 'Success', username: user.username, userID: user.userId})
      } else {
        res.status(401).json({status: 'Failure', message: 'Invalid cookie'})
      }
  
    } else {
      res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
    }
  })
  
  
  module.exports = router