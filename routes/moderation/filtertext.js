const express = require('express')
const router = express.Router()

router.all('/', (req, res) => {
    const text = String(req.body.text)
    res.status(200).json({success: true, data: {AgeUnder13: text, Age13OrOver: text} })
})

module.exports = router