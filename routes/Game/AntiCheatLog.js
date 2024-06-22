const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
    // https://www.cobalt.rip/Game/AntiCheatLog&UserID=1&Resolution=1920x1200&Message=robert
    if (req.headers['accesskey'] == 'USxAeaZbgei4SsXVDPsm3kfEUvDBEkKo') {
      const client = new MongoClient(url);
      await client.connect()
  
      const db = client.db(dbName)
      const anticheat_logs = db.collection('anticheat_logs')
  
      await anticheat_logs.insertOne({UserID: req.query.UserID, Resolution: req.query.Resolution, Message: req.query.Message})
      req.status(200).json({status: 'Success', message: 'Successfully logged anti-cheat action'})
    } else {
      req.status(401).json({status: 'Unauthorized', message: 'You have to be authorized to perform this action'})
    }
  })

  module.exports = router