const express = require('express')
const router = express.Router()

router.all('/', (req, res) => {
    res.status(200).json({"gameAvatarType":"R6","allowCustomAnimations":"True","universeAvatarCollisionType":"OuterBox","universeAvatarBodyType":"Standard","jointPositioningType":"ArtistIntent","message":"","universeAvatarMinScales":{"height":0.9,"width":0.7,"head":0.95,"depth":0,"proportion":0,"bodyType":0},"universeAvatarMaxScales":{"height":1.05,"width":1,"head":1,"depth":0,"proportion":1,"bodyType":1},"universeAvatarAssetOverrides":[],"moderationStatus":null})
})

module.exports = router