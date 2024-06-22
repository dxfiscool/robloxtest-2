const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    const robloSecurity = req.cookies['.ROBLOSECURITY']
    const placeId = parseInt(req.query.placeId)
  
    if (robloSecurity) {
      
      if (placeId) {
        res.set('Content-Type', 'text/plain');
        res.status(200).send(`RobloxPlayerBeta -j "http://www.cobalt.rip/game/PlaceLauncher.ashx?placeId=${placeId}" -t "${robloSecurity}" -a "http://www.cobalt.rip/Login/Negotiate.ashx"`) 
      } else {
        res.status(400).json({status: 'Bad Request', message: 'Invalid parameters'})
      }
     
    } else {
      res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
    }
  })

  module.exports = router