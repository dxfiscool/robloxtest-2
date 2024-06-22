const express = require('express')
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

router.post('/', async (req, res) => {
    const accesskey = req.query.apiKey
    const placeId = parseInt(req.query.placeId)
    if (accesskey && accesskey == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
        const client = new MongoClient(url);

        const db = client.db(dbName)
        const gameservers = db.collection('gameservers')
    
        const gameserver = await gameservers.findOne({placeID: placeId})

        if (gameserver) {
            const gsJobID = gameserver.job
            await gameservers.deleteOne({ placeID: placeId })

            res.status(200).json({status: 'Success', message: `Killed job ${gsJobID}`})
        } else {
            res.status(400).json({message: 'Bad Request', message: 'This job does not exist'})
        }
    } else {
        res.status(401).json({message: 'Unauthorized', message: 'You are not authorized to perform this action'})
    }
})

module.exports = router