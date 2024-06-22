// Requires
const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path')
const bodyParser = require('body-parser');

// App
const app = express();
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

// middleware for logging requests
app.use(function(req, res, next) {
  const timeNow = Date.now()
  res.on('finish', () => {
    const timeTaken = Date.now() - timeNow
    console.log(`[Cobalt.Website] - ${req.headers['x-forwarded-for']} - [${req.method}] - ${req.originalUrl} - ${res.statusCode} - ${timeTaken}ms`)
  })
  next()
})

// Variables
const port = 80;

app.use('/images', express.static('etc/images'));
app.use('/css', express.static('etc/css'));
app.use('/js', express.static('etc/js'));

// Functions
function returnHtmlPage(name) {
  let htmlPage = name + '.html'
  let filePath = path.join(__dirname, 'pages', htmlPage);
  return filePath
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

app.get('/upload', (req,res) => {
  let filePath = returnHtmlPage('upload')
  res.sendFile(filePath)
})

app.get('/create-game', (req,res) => {
  let filePath = returnHtmlPage('Create')
  res.sendFile(filePath)
})

app.get('/update-game', (req,res) => {
  let filePath = returnHtmlPage('update-place')
  res.sendFile(filePath)
})

app.listen(port, () => {
  console.log(`[Cobalt.Website] App listening on port ${port}`)
})

// route requires
const AntiCheatLog = require('./routes/Game/AntiCheatLog')
const ClientAppSettings = require('./routes/Game/ClientAppSettings')
const createjoinscript = require('./routes/Game/create-join-script')
const GetAllowedMD5Hashes = require('./routes/Game/GetAllowedMD5Hashes')
const GetAllowedMemHashes = require('./routes/Game/GetAllowedMemHashes')
const GetAllowedSecurityVersions = require('./routes/Game/GetAllowedSecurityVersions')
const JoinAshx = require('./routes/Game/Join.ashx')
const MachineConfiguration = require('./routes/Game/MachineConfiguration.ashx')
const Negotiate = require('./routes/Game/Negotiate.ashx')
const PlaceLauncher = require('./routes/Game/PlaceLauncher.ashx')
const validateMachine = require('./routes/Game/validate-machine')
const authorized = require('./routes/v1/Authorized')
const login = require('./routes/v1/Login')
const register = require('./routes/v1/Register')
const uploadAsset = require('./routes/v1/UploadAsset')
const asset = require('./routes/asset')
const productinfo = require('./routes/marketplace/productinfo')
const CreateGame = require('./routes/v1/CreateGame')
const loadplace = require('./routes/v1/load-place')
const HandleSocialRequest = require('./routes/Game/HandleSocialRequest.ashx')
const UpdateGame = require('./routes/v1/UpdateGame')
const startServer = require('./routes/Gameserver/start-server')
const renewLease = require('./routes/Gameserver/renew-lease')
const killServer = require('./routes/Gameserver/kill-server')
const monitorashx = require('./routes/Game/monitor.ashx')
const newFFlags = require('./routes/Game/NewFFlags')
const validatePlaceJoin = require('./routes/Game/ValidatePlaceJoin')
const assetThumbnailjson = require('./routes/asset-thumbnailJson')
const gameStartInfo = require('./routes/Game/game-start-info')
const status200 = require('./routes/Game/return200')
const filtertext = require('./routes/moderation/filtertext')

// routes
app.use('/Game/AntiCheatLog', AntiCheatLog)
app.use('/Setting/QuietGet/ClientAppSettings', ClientAppSettings)
app.use('/Game/create-join-script', createjoinscript)
app.use('/GetAllowedMD5Hashes', GetAllowedMD5Hashes)
app.use('/GetAllowedMemHashes', GetAllowedMemHashes)
app.use('/GetAllowedSecurityVersions', GetAllowedSecurityVersions)
app.use('/Game/Join.ashx', JoinAshx)
app.use('/game/MachineConfiguration.ashx', MachineConfiguration)
app.use('/Login/Negotiate.ashx', Negotiate)
app.use('/Game/PlaceLauncher.ashx', PlaceLauncher)
app.use('/game/validate-machine', validateMachine)
app.use('/Game/LuaWebService/HandleSocialRequest.ashx', HandleSocialRequest)
app.use('/v1/authorized', authorized)
app.use('/v1/login', login)
app.use('/v1/register', register)
app.use('/v1/upload-asset', uploadAsset)
app.use('/asset', asset)
app.use('/v1/asset', asset)
app.use('/marketplace/productinfo', productinfo)
app.use('/v1/create-game', CreateGame)
app.use('/v1/load-place', loadplace)
app.use('/v1/update-game', UpdateGame)
app.use('/gameserver/start-server', startServer)
app.use('/v2/CreateOrUpdate', renewLease)
app.use('/v2.0/Refresh', renewLease)
app.use('/v1/Close', killServer)
app.use('/game/monitor.ashx', monitorashx)
app.use('/v1/settings/application', newFFlags)
app.use('/universes/validate-place-join', validatePlaceJoin)
app.use('/asset-thumbnail/json', assetThumbnailjson)
app.use('/v1.1/game-start-info', gameStartInfo)
app.use('/presence/register-game-presence', status200)
app.use('/universes/validate-place-join', status200)
app.use('/Game/ClientPresence.ashx', status200)
app.use('/moderation/v2/filtertext', filtertext)