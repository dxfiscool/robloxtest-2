const express = require('express')
const router = express.Router()

router.all('/', (req, res) => {
    const robloSecurity = req.cookies['.ROBLOSECURITY']
    if (robloSecurity) {
      const placeId = parseInt(req.query.placeId)

      if (placeId) {
        const response = {
          jobId: 'test',
          status: 2,
          joinScriptUrl: `http://www.cobalt.rip/Game/Join.ashx/?placeId=${placeId}&year=2013`,
          authenticationUrl: 'http://www.cobalt.rip/Game/Negotiate.ashx',
          authenticationTicket: robloSecurity,
          message: 'Testing'
        }
    
        res.status(200).send(response)
      } else {
        res.status(400).json({status: 'Bad Request', message: 'Invalid parameters'})
      }


    } else {
      res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
    }
  })

  module.exports = router