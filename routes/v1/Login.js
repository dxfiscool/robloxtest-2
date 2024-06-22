const express = require('express')
const crypto = require('crypto')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const router = express.Router()

const mongodb = require('mongodb')

const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

function generateJWT(user) {
  return jwt.sign({
    userId: user.id,
    username: user.username,
  },
  'Ao51gR0qZsDyeT1zUury03X/I4HulnuV7aL1D2181xU=', // WARNING! this is the private key for signing, it should never be shown
  {
    expiresIn: '24h',
  }
  )
}


router.post('/', async (req, res) => {
    let username = req.get('username')
    let userPassword = req.get('password')
  
    if (!username) {
      res.status(401).json({status: 'Failure', message: 'An username is required'})
      return
    }
    if (!userPassword) {
      res.status(401).json({status: 'Failure', message: 'A password is required'})
      return
    }
  
    let client
  
    try {
      client = new MongoClient(url);
      await client.connect()
  
      const db = client.db(dbName)
      const users = db.collection('users')
  
      const user = await users.findOne({username: username})
  
      if (!user) {
        return res.status(404).send('User not found')
      }
  
      const password = user.password
  
      if (await argon2.verify(password, userPassword)) {
        const jwtToken = generateJWT(user)
  
        res.cookie('.ROBLOSECURITY', jwtToken, { httpOnly: false })
  
        res.status(200).json({status: 'Success', message: 'You have been logged in'})
      } else {
        res.status(401).json({status: 'Failure', message: 'Incorrect password'})
      }
  
    } catch(err) {
      console.error(`An error occured: ${err}`)
      res.status(500).json({status: 'Internal Server Error', message: 'An error occured'})
    } finally {
      client.close()
    }
  })

  module.exports = router