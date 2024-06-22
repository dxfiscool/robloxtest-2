const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({"Url":"https://cobalt.rip/images/DefaultGameThumbnail.png","Final":true,"SubstitutionType":0})
})

module.exports = router