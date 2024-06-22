const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({data: ['9cef9f48e645cd3ea1b9abce083defa5']})
})
  
  
  module.exports = router