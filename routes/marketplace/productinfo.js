const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'
  
router.get('/', async (req, res) => {
    const assetID = parseInt(req.query.assetId)
    if (assetID) {
        const assetID2 = parseInt(req.query.assetId)

        let client = new MongoClient(url);
        await client.connect()
    
        const db = client.db(dbName)
        const games = await db.collection('games')
        const users = await db.collection('users')
        
        const game = await games.findOne({gameID: assetID2})
        if (game) {
            const user = await users.findOne({id: game.owner})

            res.set('Content-Type', 'application/json');
            res.status(200).json({"TargetId":assetID,"AssetId":assetID,"ProductId":assetID,"Name":game.name,"Description":game.description,"AssetTypeId":9,"IsForSale":false,"IsPublicDomain":false,"Creator":{"Id":user.id,"Name":user.username}})
            client.close()
        } else {
            res.status(400).json({Status: 'Bad Request', message: 'Invalid asset'})
            client.close()
        }

    } else {
        res.status(400).json({Status: 'Bad Request', message: 'Invalid parameters'})
        return
    }
})

module.exports = router