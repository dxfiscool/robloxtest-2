const express = require('express')
const path = require('path');
const router = express.Router()

router.get('/', (req, res) => {
    // not even going to bother to check if the file exists, because if it doesn't, we have a serious problem
    const filePath = path.join(__dirname, 'fflags', 'ClientAppSettings.json')
    res.sendFile(filePath)
  })
  
  module.exports = router