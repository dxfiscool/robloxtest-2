const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({data: ['0.367.0pcplayer']})
  })
  
  
  module.exports = router