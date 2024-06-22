const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const multer = require('multer')
const mongodb = require('mongodb')
const fs = require('fs')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'assets');
    },
    filename: function (req, file, cb) {
      const hash = crypto.createHash('sha256');
  
      if (file.buffer) {
        hash.update(file.buffer);
        const fileHash = hash.digest('hex');
        cb(null, fileHash);
      } else {
        fs.readFile(file.path, (err, data) => {
          if (err) {
            cb(err);
            return;
          }
          hash.update(data);
          const fileHash = hash.digest('hex');
          cb(null, fileHash);
        });
      } 
    }
  });

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

const upload = multer({ dest: 'assets' });

router.post('/', upload.single('file'), async (req, res) => {
    let robloSecurity = req.cookies['.ROBLOSECURITY']
    if (robloSecurity) {
        const user = decryptJWT(robloSecurity)

        const placeID = parseInt(req.get('placeID'))
    
        let client = new MongoClient(url);
        await client.connect()
    
        const db = client.db(dbName)
        const games = await db.collection('games')
        const assets = await db.collection('assets')
    
        const game = await games.findOne({gameID: placeID})
        if (game) {
            if (user.userId == game.owner) {
                // now we can replace the file
                const asset = await assets.findOne({assetID: game.assetID})
                const hash = asset.assetHash
                const filter = { assetHash: hash }

                if (!hash == 'defaultPlace') {
                    const updateInfo = {
                        $set: {
                            assetHash: `${req.file.filename}`
                        }
                    }
                    await assets.updateOne(filter, updateInfo)
                    res.status(200).json({status: 'Success', message: 'Game updated'})
                } else {
                    const updateInfo = {
                        $set: {
                            assetHash: `${req.file.filename}`
                        }
                    }
                    await assets.updateOne(filter, updateInfo)
                    fs.unlink(`././assets/${hash}`, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    res.status(200).json({status: 'Success', message: 'Game updated'})
                }
            } else {
                res.status(401).json({status: 'Unauthorized', message: 'You do not own this game'})
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })

            }
    
        } else {
            res.status(400).json({status: 'Bad Request', message: 'Invalid asset'})
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    } else {
      res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
      fs.unlink(req.file.path, (err) => {
        if (err) {
            console.log(err)
        }
    })
    }
})

module.exports = router