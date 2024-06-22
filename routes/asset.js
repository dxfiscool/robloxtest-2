const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
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

router.all('/', async (req, res) => {
    const assetID = parseInt(req.query.id)
    const isPlace = req.query.isPlace
    const robloSecurity = req.cookies['.ROBLOSECURITY']
    
    if (isPlace) {
        if (req.headers['accesskey'] == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
          const placeId = parseInt(req.query.id)
  
          const client = new MongoClient(url);
  
          await client.connect()
         
          const db = await client.db(dbName)
          const assets = await db.collection('assets')
          const games = await db.collection('games')
          
          const place = await games.findOne({gameID: placeId})
          const asset = await assets.findOne({assetID: place.assetID})
  
          const assetHash = asset.assetHash
  
          const filePath = `././assets/${assetHash}`
  
          res.status(200).download(filePath)
          return
  
      } else {
          res.status(401).json({status: 'Unauthorized', message: 'You are not authorized to perform this action'})
      }
    }


   // console.log(req.headers)
  
    const client = new MongoClient(url);
  
    try {
      const user = {}
      user.username = 'RCCService'
      user.userId = 1
  
      if (!req.headers['accesskey'] == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
        user = decryptJWT(robloSecurity)
      } 
  
      await client.connect()
       
      const db = await client.db(dbName)
      const assets = await db.collection('assets')
        
      const asset = await assets.findOne({assetID: assetID})
  
      if (asset) {
        if (asset.owner == user.userId || asset.publicAsset == true) {
          // user owns asset
          res.status(200).download(`./assets/${asset.assetHash}`)
        } else { // user doesn't own asset
          res.status(401).json({status: 'Unauthorized', message: 'You do not own this asset'})
        }
  
      } else {
      // migrate asset from Roblox
        
      const response = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${assetID}`) 
  
      if (response.ok) {
        const newUrl = response.url
        const newResponse = await fetch(newUrl)
  
        if (newResponse.ok) {
          const bufferArray = await newResponse.arrayBuffer()
          const buffer = Buffer.from(bufferArray);
            
          const hash = crypto.createHash('sha256')
          hash.update(buffer)
          const fileHash = hash.digest('hex')
  
          const fileName = fileHash.substring(0, 32);
    
          res.status(200).send(buffer)
        } else {
          res.status(404).json({status: 'Failure', message: 'An error occured whilst migrating the asset'})
          return
        }
  
      } else {
        res.status(404).json({status: 'Failure', message: 'An error occured whilst migrating the asset'})
        return
      }
  
    }
  
    } catch(err) {
      console.error(`An error occured whilst retrieving asset: ${err}`)
    } finally {
      client.close()
    }
  })

  module.exports = router