const express = require('express')
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

router.get('/', async (req, res) => {
    if (req.headers['accesskey'] == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
        const placeId = parseInt(req.query.id)

        const client = new MongoClient(url);

        await client.connect()
       
        const db = await client.db(dbName)
        const assets = await db.collection('assets')
          
        const asset = await assets.findOne({assetID: placeId})

        const assetHash = asset.assetHash

        const filePath = `././assets/${assetHash}`

        res.status(200).download(filePath)

    } else {
        res.status(401).json({status: 'Unauthorized', message: 'You are not authorized to perform this action'})
    }
})

module.exports = router