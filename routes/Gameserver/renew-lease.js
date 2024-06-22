const express = require('express')
const router = express.Router()

const mongodb = require('mongodb');
const { parse } = require('uuid');

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

// TODO: This is gonna be the api for renewing jobs, gameserver will POST to this (rcc can be checked with the accesskey header). aka, finish this later!

router.all('/', async (req, res) => {
    const serverPort = parseInt(req.query.serverPort) // basically the job id
    const accesskey = req.query.apiKey
    const clientCount = parseInt(req.query.clientCount)
    if (accesskey == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
        const client = new MongoClient(url);

        const db = client.db(dbName)
        const gameservers = db.collection('gameservers')

        const gameserver = await gameservers.findOne({GSPort: serverPort})
        if (gameserver) {
            console.log(clientCount)
            if (clientCount > 0) {
                fetch(`http://localhost:5000/gameserver/renew-lease/?jobID=${gameserver.job}&RCCPort=${gameserver.RCCPort}`, {
                    method: "POST"
                  })
              res.status(200).json({status: 'Success', message: `Job: ${gameserver.job} renewed by 15 seconds`})
            } else {
                res.status(400).json({status: 'Bad Request', message: 'Will not renew job because 0 players inside'})
                return
            }


        } else {
            res.status(400).json({status: 'Bad Request', message: 'This job does not exist'})
            return
        }
    } else {
        res.status(401).json({status: 'Unauthorized', message: 'You are not authorized to perform this action.'})
        return
    }
})

module.exports = router