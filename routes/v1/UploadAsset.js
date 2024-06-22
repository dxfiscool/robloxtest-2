const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const multer = require('multer');

const mongodb = require('mongodb')

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
      const client = new MongoClient(url);
  
      try {
      const publicassetalue = req.headers['publicAsset']
  
      if (!req.file) {
        return res.status(400).json({status: 'Bad Request', message: 'No files were uploaded'})
      }
      const user = decryptJWT(robloSecurity)
  
      const fileUploaded = req.file
  
      await client.connect()
  
      const db = client.db(dbName)
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
  
      await assets.insertOne({assetID: assetID, assetHash: fileUploaded.filename, owner: user.userId, publicAsset: true, isMigratedAsset: false})
  
      res.status(200).json({status: 'Success', message: `Asset uploaded with ID: ${assetID}`})
  
    } catch (err) {
      console.error(`An error occured when uploading a file: ${err}`)
      res.status(500).json({status: 'Failure', message: 'Internal Server Error'})
    } finally {
      client.close()
    }
  } else {
    res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
  }
  })
  
  
  module.exports = router