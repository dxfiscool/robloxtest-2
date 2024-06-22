const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()

router.get('/', (req, res) => {
    const applicationName = req.query.applicationName

    if (applicationName) {  
        const filePath = path.join(__dirname, 'fflags', applicationName+'.json')
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath)
        } else {
            res.status(400).json({status: 'Bad Request', message: 'Cannot find file'})
        }
    } else {
        res.status(400).json({status: 'Bad Request', message: 'An application name is required'})
    }
})

module.exports = router