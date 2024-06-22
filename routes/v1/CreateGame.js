const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

function decryptJWT(cookie) {
    try {
     // const cookieToDecrypt = cookie.split('.')[1]
      const decoded = jwt.verify(cookie, 'Ao51gR0qZsDyeT1zUury03X/I4HulnuV7aL1D2181xU=')
      return decoded
    } catch (err) {
      console.error(`An error occured: ${err}`)
      return null
    }
  }

router.post('/', async (req, res) => {
    let robloSecurity = req.cookies['.ROBLOSECURITY']
    if (robloSecurity) {
        const user = decryptJWT(robloSecurity)

        const client = new MongoClient(url);
        await client.connect()
        
        const db = client.db(dbName)
        const games = db.collection('games')

        const gameName = req.get('Gamename')
        const gameDescription = req.get('Gamedescription')
        
        if (gameName && gameDescription) {
            const amountOfGamesCount = await games.countDocuments({})
            const gameID = amountOfGamesCount + 1

            const assets = db.collection('assets')
  
            const assetIDq = { isMigratedAsset: false };
            const assetIDp = { assetID: 1, _id: 0 };
            const assetIDs = { assetID: -1 };
            const assetIDf = await assets.findOne(assetIDq, { projection: assetIDp, sort: assetIDs });
        
            let assetID;
            if (assetIDf) { // there might be no assets in the database
                assetID = assetIDf.assetID + 1;
            } else {
                assetID = 1;
            }
        
            await assets.insertOne({assetID: assetID, assetHash: 'defaultPlace', owner: user.userId, publicAsset: true, isMigratedAsset: false})

            await games.insertOne({gameID: gameID, name: gameName, description: gameDescription, owner: user.userId, assetID: assetID})

            res.status(200).json({status: 'Success', message: `Place created with ID: ${gameID}`})
            client.close()
        } else {
            res.status(400).json({status: 'Bad Request', message: 'Invalid parameters'})
        }
    } else {
        res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
        return
    }
})

module.exports = router