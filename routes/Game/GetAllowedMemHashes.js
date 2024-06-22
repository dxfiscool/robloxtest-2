const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({data: ['0,3050122181,1;1,816521661,2;3,1366335467,16;4,3001767742,64;5,3787107273,8192;12,1795571350,256']})
  })
  
  
  module.exports = router