// Requires
const express = require('express');
const path = require('path');
const mongodb = require('mongodb')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

// App
const app = express();
app.use(cookieParser())

// Variables
const port = 80;
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/roblox'
const dbName = 'roblox'

app.use('/static', express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Functions
function returnHtmlPage(name) {
  let htmlPage = name + '.html'
  let filePath = path.join(__dirname, 'pages', htmlPage);
  return filePath
}

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

// HTML pages
app.get('/', (req,res) => {
  let filePath = returnHtmlPage('index')
  res.sendFile(filePath)
})

app.get('/login', (req,res) => {
  let filePath = returnHtmlPage('login')
  res.sendFile(filePath)
})

// Client API's
app.get('/GetAllowedMD5Hashes', (req, res) => {
  res.status(200).json({data: ['Hello']})
})

app.get('/GetAllowedSecurityVersions', (req, res) => {
  res.status(200).json({data: ['0.235.0pcplayer']})
})

app.get('/Game/Join.ashx', (req, res) => {
  let joinscript = {
      ClientPort: 0,
      MachineAddress: '127.0.0.1',
      ServerPort: 53640,
      PingUrl: '',
      PingInterval: 120,
      UserName: 'Player',
      SeleniumTestMode: false,
      UserId: 0,
      SuperSafeChat: true,
      CharacterAppearance: 'https://api.roblox.com/v1.1/avatar-fetch/?placeId=0&userId=0',
      ClientTicket: '11/27/2016 9:55:58 AM;jg04OiujU7lnnZD0dLHI+Yu1zIorkPjhw94F1UZZTzos2vgj2qkDGuEmtNrDc/4CuL/Dmq5EPrJMaeyygqwUPyRpTavnN00pBQ/G+vYx6kce1hkEQHrYAuho1yKeq0gGVsDvloSuM/02ugH2zyEpf+fnMthIuk2LRcNRCYc4AaU=;MasBQ3GMHE4BIyflKr6kpE69YaT7AnmDoezxUFPn4lctSpqCUMOrsA41IfGzL2yWz8DKRc646P9/mi5rTP1Psc/+rIJNezIH4DU3eUZwReGVzQZ/nZgNI4GoumNMlv6qyA1oSmhvxE6UEWVM12cvSx3tJQI3yDIVqNrbJhNSexo=',
      GameId: '00000000-0000-0000-0000-000000000000',
      PlaceId: 0,
      MeasurementUrl: '',
      WaitingForCharacterGuid: '08d7557b-2843-4a03-82f7-2723e47e2371',
      BaseUrl: 'http://assetgame.roblox.com/',
      ChatStyle: 'Classic',
      VendorId: 0,
      ScreenShotInfo: '',
      VideoInfo: '<?xml version="1.0"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007"><media:group><media:title type="plain"><![CDATA[ROBLOX Place]]></media:title><media:description type="plain"><![CDATA[ For more games visit http://www.roblox.com]]></media:description><media:category scheme="http://gdata.youtube.com/schemas/2007/categories.cat">Games</media:category><media:keywords>ROBLOX, video, free game, online virtual world</media:keywords></media:group></entry>',
      CreatorId: 0,
      CreatorTypeEnum: 'User',
      MembershipType: 'None',
      AccountAge: 0,
      CookieStoreFirstTimePlayKey: 'rbx_evt_ftp',
      CookieStoreFiveMinutePlayKey: 'rbx_evt_fmp',
      CookieStoreEnabled: true,
      IsRobloxPlace: false,
      GenerateTeleportJoin: false,
      IsUnknownOrUnder13: true,
      SessionId: '89e81fb5-d1c8-48a9-a127-5d0d6bddaaac|00000000-0000-0000-0000-000000000000|0|207.241.231.247|5|2016-11-27T15:55:58.4473206Z|0|null|null|37.7811|-122.4625|1',
      DataCenterId: 0,
      UniverseId: 0,
      BrowserTrackerId: 0,
      UsePortraitMode: false,
      FollowUserId: 0,
      characterAppearanceId: 0
  }
  res.json(joinscript)
})

// API's

app.get('/v1/authorized', (req, res) => {
  let robloSecurity = req.cookies['.ROBLOSECURITY']
  console.log(robloSecurity)
  if (robloSecurity) {
    const user = decryptJWT(robloSecurity)
    res.status(200).json({username: user.username, userID: user.userId})
  } else {
    res.status(401).json({status: 'Unauthorized', message: 'You have to be logged in to perform this action'})
  }
})

app.post('/v1/login', async (req, res) => {
  let username = req.get('username')
  let userPassword = req.get('password')

  if (!username) {
    res.status(500).send('An username is required')
  }
  if (!userPassword) {
    res.status(500).send('A password is required')
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

      res.cookie('.ROBLOSECURITY', jwtToken, { httpOnly: true })

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

app.post('/v1/register', async (req, res) => {

  let username = req.get('username')
  let password = req.get('password')

  if (!username) {
    res.status(500).json({status: 'Failure', message: 'An username is required'})
  }
  if (!password) {
    res.status(500).json({status: 'Failure', message: 'A password is required'})
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
        res.status(500).send('This username is already in use')
        return
      }

      await users.insertOne({id: userID, username: username, password: hash})
      res.status(200).json({status: 'Success', message: 'Account registered'})
    } catch (err) {
      console.error(`An error occurred while executing the query: ${err}`)
      res.status(500).json({status: 'Internal Server Error', message: 'An error occured.'})

    } finally {
      client.close()
    }
} else {
  res.status(500).json({status: 'Failure', message: 'Invalid parameters'})
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
