const express = require('express')
const argon2 = require('argon2')
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
    let password = req.get('password')
    
    if (!username) {
      res.status(401).json({status: 'Failure', message: 'An username is required'})
      return
    }
    if (!password) {
      res.status(401).json({status: 'Failure', message: 'A password is required'})
      return
    }
  
    let usernameRegex = /^[a-zA-Z0-9_]+$/
    let passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~`\-=/\\|'" ]+$/
  
    if (!usernameRegex.test(username)) {
      res.status(500).json({status: 'Failure', message: 'Invalid parameters'})
      return
    }
  
    if (!passwordRegex.test(password)) {
      res.status(500).json({status: 'Failure', message: 'Invalid parameters'})
      return
    }
  
    if (!username.length > 2 && !username.length < 21) {
      res.status(500).json({status: 'Failure', message: 'Invalid parameters'})
      return
    }
  
    if (username.length > 2 && username.length < 21 && password.length > 7 && password.length < 129) {
      const client = new MongoClient(url);
  
      try {
        client.connect()
  
        const db = client.db(dbName)
        const users = db.collection('users')
  
        const hash = await argon2.hash(password)
  
        const amountUsers = await users.countDocuments({})
        const userID = amountUsers + 1
  
        const user = await users.findOne({username: username})
        if (user) {
          res.status(401).json({status: 'Failure', message: 'This username is already in use'})
          return
        }
  
        await users.insertOne({id: userID, username: username, password: hash, isAdmin: false, created_at: Math.floor(Date.now() / 1000)})
        res.status(200).json({status: 'Success', message: 'Account registered'})
      } catch (err) {
        console.error(`An error occurred while executing the query: ${err}`)
        res.status(500).json({status: 'Internal Server Error', message: 'An error occured.'})
  
      } finally {
        client.close()
      }
  } else {
    res.status(400).json({status: 'Bad Request', message: 'Invalid parameters'})
    }
  })
  

  
  module.exports = router