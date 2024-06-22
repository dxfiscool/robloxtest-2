const express = require('express')
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

router.get('/', async (req, res) => {
    const userId = parseInt(req.query.playerid)

    if (userId) {
        const client = new MongoClient(url);
        await client.connect()
  
        const db = client.db(dbName)
        const users = db.collection('users')
  
        const user = await users.findOne({id: userId})
        if (user.isAdmin == true) {
            const xml = `<Value Type="boolean">true</Value>`

            res.set('Content-Type', 'text/xml')
            res.set('charset', 'utf-8')

            res.status(200).send(xml)
        } else {
            const xml = `<Value Type="boolean">false</Value>`

            res.set('Content-Type', 'text/xml')
            res.set('charset', 'utf-8')

            res.status(401).send(xml)
        }

    } else {
        res.status(400).json({status: 'Bad Request', message: 'Invalid parameters'})
    }
})

module.exports = router