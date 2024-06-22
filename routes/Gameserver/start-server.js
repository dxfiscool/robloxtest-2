const express = require('express')
const uuid = require('uuid').v4
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

function getRandomPort() {
    const minPort = 50000;
    const maxPort = 60000;
    return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
}

router.post('/', async (req, res) => {
   const placeId = parseInt(req.query.placeId)
    const accesskey = req.query.accesskey
    if (placeId && accesskey && accesskey == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
        const client = new MongoClient(url);

        const db = client.db(dbName)
        const gameservers = db.collection('gameservers')

        const gameserverCheck = await gameservers.findOne({placeID: placeId})

        if (gameserverCheck == null) {
            // a gameserver doesnt exist for this place, yet
            const jobID = uuid()
            const expirationInSeconds = parseInt(30)
            const GSPort = parseInt(getRandomPort())
			const RCCPort = parseInt(getRandomPort())
        

			const OpenJob = await fetch(`http://localhost:5000/gameserver/start-server/?JobID=${jobID}&PlaceID=${placeId}&GSPort=${GSPort}&RCCPort=${RCCPort}`, {
				method: "POST"
			  })

            if (OpenJob) {
                res.status(200).json({status: 'Success', message: `Job opened with ID: ${jobID}`})
                await gameservers.insertOne({placeID: placeId, job: jobID, RCCPort: RCCPort, GSPort: GSPort})
            } 

        } else {
            res.status(400).json({status: 'Bad Request', message: 'A job is already open for this place'})
        }

    } else {
        res.status(401).json({status: 'Unauthorized', message: 'You are not authorized to perform this action'})
    }
})

module.exports = router