const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
    res.cookie('.ROBLOSECURITY', req.query.suggest, { httpOnly: false })
    res.status(200).json({status: 'Success', message: `Your cookie has been set to: ${req.query.suggest}`})
  })
  
  
  module.exports = router