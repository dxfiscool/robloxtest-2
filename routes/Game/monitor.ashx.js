const express = require('express')
const crypto = require('crypto')
const fs = require('fs')
const router = express.Router()

router.get('/', (req, res) => {
    const script = `\r\n
    local placeId, universeId, matchmakingContextId, gameCode, baseUrl, gameId, machineAddress, gsmInterval, maxPlayers, maxGameInstances, apiKey, preferredPlayerCapacity, placeVisitAccessKey, portD = ...
local access = true
local isCloudEdit = matchmakingContextId == 3
local assetGameUrl = "https://assetgame." .. baseUrl

-- Monitor Game Status LUA Script
-- Reports game stats to a web handler on regular intervals

-- Assumes the following local variables have been defined:
-- url - root url for the environment (e.g. www.roblox.com)
-- placeId - place being run
-- maxPlayers - maximum number of players allowed in this game
-- preferredPlayerCapacity - number of player slots reserved for social matchmaking
-- machineAddress - IP address of the server
-- gsmInterval - send the message no matter what on this interval
-- baseUrl - base url to build other urls
-- isCloudEdit - if the current server context is cloudEdit
-- -----------------------------------------------------------

startTime = tick()
networkServer = game:GetService("NetworkServer") 
playersService = game:GetService("Players")
httpService = game:GetService("HttpService")
pcall(function() playersService.MaxPlayers = maxPlayers end)
pcall(function() playersService.MaxPlayersInternal = maxPlayers end)
pcall(function() playersService.PreferredPlayersInternal = preferredPlayerCapacity end)
gsmUrl = "https://api." .. baseUrl
gameInstancesApiUrl = "https://api." .. baseUrl
apiProxyUrl = "https://api." .. baseUrl
playSessions = {}
playerJoinTimes = {}

local RCCKickDupeExists, RCCKickDupeEnabled = pcall(function()
	return settings():GetFFlag("RCCKickDuplicatePlayersOnJoin")
end)

local kickDuplicatePlayersRCC = RCCKickDupeExists and RCCKickDupeEnabled and not isCloudEdit;

function checkUnifiedPlayerPayloadFlag()
    local UnifiedPlayerPayloadExists, UnifiedPlayerPayloadEnabled = pcall(function () return settings():GetFFlag("UnifiedPlayerPayload") end)
    return UnifiedPlayerPayloadExists and UnifiedPlayerPayloadEnabled
end

function UrlEncode(s)
	s = string.gsub(s, "([&=+%c])", function (c)
		return string.format("%%%02X", string.byte(c))
	end)
	s = string.gsub(s, " ", "+")
	return s
end


function Split(str, pat)
   local t = {}  -- NOTE: use {n = 0} in Lua-5.0
   local fpat = "(.-)" .. pat
   local last_end = 1
   local s, e, cap = str:find(fpat, 1)
   while s do
      if s ~= 1 or cap ~= "" then
	 table.insert(t,cap)
      end
      last_end = e + 1
      s, e, cap = str:find(fpat, last_end)
   end
   if last_end <= #str then
      cap = str:sub(last_end)
      table.insert(t, cap)
   end
   return t
end


function CalculateAveragePing()
	local totalPing = 0
	local replicatorCount = 0
	local averagePing = 0
	local status, err = pcall(function()
		for _, r in ipairs(stats().Network:GetChildren()) do 
			if r.Name ~= "Packets Thread" then 
				r:GetValue() -- hax
				totalPing = totalPing + r.Ping:GetValue()
				replicatorCount = replicatorCount + 1
			end 
		end
		if replicatorCount > 0 then
			averagePing = totalPing / replicatorCount
		end
	end)
	if (not status) then
		PrintDebugMessage("CalculateAveragePing error = " .. err)
	end	
	return averagePing
end


function PrintDebugMessage(message)
	if message then
		-- print ("!GameServiceMonitor: " .. message)
		-- game:HttpPost(gsmUrl .. "/v1.0/LogLuaMessage?&apiKey=" .. apiKey .. "&text=" .. UrlEncode(message), "")
	end
end

function PrintErrorMessage(message)
	if message then
		print ("!GameServiceMonitor: " .. message)
		-- game:HttpPost(gsmUrl .. "/v1.0/LogLuaMessage?&apiKey=" .. apiKey .. "&text=" .. UrlEncode(message), "")
	end
end

function UpdatePresence(player, isDisconnect)
	local fullUrl = apiProxyUrl .. "/presence/"
	local queryParams = "?visitorId=" .. player.userId

	if isDisconnect then
		fullUrl = fullUrl .. "register-absence"
	else
		fullUrl = fullUrl .. "register-game-presence"
		queryParams = queryParams .. "&placeId=" .. placeId .. "&gameId=" .. gameId .. "&locationType=" .. ((isCloudEdit or matchmakingContextId == 4) and "CloudEdit" or "Game")
	end

	fullUrl = fullUrl .. queryParams

	PrintDebugMessage("Calling Api Proxy to update presence. URL: " .. fullUrl)

	game:HttpPost(fullUrl, "")
	return true
end

function GetPlayerPostData()
    local sessionArray = {}
    for _, player in ipairs(playersService:GetPlayers()) do
        local t =
        {
            UserId = player.userId,
            IsVr = player.VRDevice ~= "",
            GameTimeWhenJoined = playerJoinTimes[player.userId],
            GameSessionId = player:GetGameSessionID()
        }
        table.insert(sessionArray, t)
    end
    return httpService:JSONEncode({GameSessions = sessionArray})
end

function SendMessageToGamesApi(source, player)
    local postDataJson = ""
    local playerCSV = ""
    if checkUnifiedPlayerPayloadFlag() then
        postDataJson = GetPlayerPostData()
    else
	    -- Construct the player CSV
	    local comma = ","
	    local separator = ""
	    local postDataAsTable = {}

	    for _, playerObject in ipairs(playersService:GetPlayers()) do
		    playerCSV = playerCSV .. separator .. playerObject.userId
		    separator = comma

		    local session = playSessions[playerObject.userId]
		    if session ~= nil then
			    local t =
			    {
				    Id = playerObject.userId,
				    Age = session["Age"]
			    }
			    table.insert(postDataAsTable, t)
		    end
	    end
	    postDataJson = httpService:JSONEncode(postDataAsTable)
    end

	local w = stats().Workspace		
	local gameTime = tick() - startTime

	local fullUrl = ""
    if checkUnifiedPlayerPayloadFlag() then 
        fullUrl = gsmUrl .. "/gameserver/renew-lease/?apiKey=" .. apiKey
    else
        fullUrl = gsmUrl .. "/gameserver/renew-lease/?apiKey=" .. apiKey
    end
	fullUrl = fullUrl .. "&gameId=" .. gameId .."&placeId=" .. placeId .."&gameCapacity=" .. maxPlayers 
	fullUrl = fullUrl .. "&maximumGameInstances=" .. maxGameInstances .."&ipAddress=" .. machineAddress
    if not checkUnifiedPlayerPayloadFlag() then
        fullUrl = fullUrl .. "&playerIdsCsv=" .. playerCSV
    end
	fullUrl = fullUrl .. "&port=" .. portD .."&clientCount=" .. networkServer:GetClientCount()
	fullUrl = fullUrl .. "&gameTime=" .. gameTime
	fullUrl = fullUrl .. "&preferredPlayerCapacity=" .. preferredPlayerCapacity
	fullUrl = fullUrl .. "&eventSource=" .. source
	if player ~= nil then
		fullUrl = fullUrl .. "&originatingPlayerId=" .. player.userId
	end
	fullUrl = fullUrl .. "&gameCode="
	if gameCode ~= nil then
		fullUrl = fullUrl .. gameCode
	end
	fullUrl = fullUrl .. "&matchmakingContextId=" .. matchmakingContextId
    fullUrl = fullUrl .. "&isCloudEdit=" .. ((isCloudEdit or matchmakingContextId == 4) and "true" or "false")
	fullUrl = fullUrl .. "&rccVersion=" .. version()

	PrintDebugMessage("Calling Games API. Source: " .. source .. ", URL: " .. fullUrl .. " Post data (JSON}:" .. postDataJson)
    if networkServer:GetClientCount() > 0 then
    game:HttpPost(fullUrl, postDataJson, false, "application/json")
    end
	
	return true
end


function SendMessageToGameInstancesApi(source)
    local postDataJson = ""
    if checkUnifiedPlayerPayloadFlag() then
        postDataJson = GetPlayerPostData()
    else
	    local postDataAsTable = {}
	    for _, playerObject in ipairs(playersService:GetPlayers()) do
		    local session = playSessions[playerObject.userId]
		    if session ~= nil then
			    local isVr = false
			    pcall(function() isVr = playerObject.VRDevice ~= "" end)

			    local t = 
			    {
				    UserId = playerObject.userId, 
				    SessionId = session.SessionId, 
				    GameTimeWhenJoined = session.GameTimeWhenJoined,
				    ClientIpAddress = session.ClientIpAddress,
				    PlatformId = session.PlatformId,
				    Started = session.Started,
				    BrowserTrackerId = session.BrowserTrackerId,
				    PartyId = session.PartyId,
				    Age = session.Age,
				    IsVr = isVr,
			    }

			    if session.Latitude ~= nil and session.Latitude ~= "null" and session.Longitude ~= nil and session.Longitude ~= "null" then
				    local countryId = "null"
				    if session.CountryId ~= nil and session.CountryId ~= "null" then
					    countryId = session.CountryId
				    end

				    t.Geolocation = {
					    Latitude = session.Latitude,
					    Longitude = session.Longitude,
					    CountryId = countryId
				    }
			    end
			
			    table.insert(postDataAsTable, t)
		    end
	    end
	    postDataJson = httpService:JSONEncode(postDataAsTable)
    end

	local w = stats().Workspace		
	local gameTime = tick() - startTime
	local averagePing = CalculateAveragePing()
	
	local fullUrl = ""
    if checkUnifiedPlayerPayloadFlag() then
        fullUrl = gameInstancesApiUrl .. "/v2/CreateOrUpdate/?apiKey=" .. apiKey
    else
        fullUrl = gameInstancesApiUrl .. "/v1/CreateOrUpdate/?apiKey=" .. apiKey
    end
	fullUrl = fullUrl .. "&gameId=" .. gameId .."&placeId=" .. placeId .. "&gameCapacity=" .. maxPlayers
	fullUrl = fullUrl .. "&maximumGameInstances=" .. maxGameInstances .. "&serverIpAddress=" .. machineAddress
	fullUrl = fullUrl .. "&serverPort=" .. networkServer.Port .. "&fps=" .. w.FPS:GetValue()
	fullUrl = fullUrl .. "&heartbeatRate=" .. w.Heartbeat:GetValue()
	fullUrl = fullUrl .. "&ping=" .. averagePing .. "&gameTime=" .. gameTime
	fullUrl = fullUrl .. "&universeId=" .. universeId
	fullUrl = fullUrl .. "&gameCode="
	if gameCode ~= nil then
		fullUrl = fullUrl .. gameCode
	end
	fullUrl = fullUrl .. "&matchmakingContextId=" .. matchmakingContextId
	
	PrintDebugMessage("Calling Game Instances API. Source: " .. source .. ", URL: " .. fullUrl .. " Post data (json): " .. postDataJson)
	
	game:HttpPost(fullUrl, postDataJson, false, "application/json")
	return true
end

-- Send updates to Games API and Game Instances API every gsmInterval seconds
delay(0, function() 
	while networkServer.Port == 0 do
		wait(1)
	end

	while true do
		-- always send on gsmInterval, we also send on events when player join and leave.
		pcall(function() return SendMessageToGamesApi("HeartBeat", nil) end)
		pcall(function() return SendMessageToGameInstancesApi("HeartBeat") end)
		wait(gsmInterval) 
	end
end	
)

-- Events that make HTTP calls back to endpoints tracking player activity

local function onPlayerConnectingReportClientPresence(player)
	if assetGameUrl and access and placeId and player and player.userId then
		local didTeleportIn = "False"
		if player.TeleportedIn then didTeleportIn = "True" end

		game:HttpGet(assetGameUrl .. "/Game/ClientPresence.ashx?action=connect&PlaceID=" .. placeId .. "&UserID=" .. player.userId)
		if not isCloudEdit then
			game:HttpPost(assetGameUrl .. "/Game/PlaceVisit.ashx?UserID=" .. player.userId .. "&AssociatedPlaceID=" .. placeId .. "&placeVisitAccessKey=" .. placeVisitAccessKey .. "&IsTeleport=" .. didTeleportIn, "")
		end
	end
end

local function onPlayerConnectingReportClientPresence2(player)
	
	-- update playeSessions table
	local clientSessionId = player:GetGameSessionID()
	local parts = Split(clientSessionId, "|")

	local newSession = 
	{
		GameTimeWhenJoined = tick() - startTime,
		SessionId = parts[1],
		ClientIpAddress = parts[4],
		PlatformId = parts[5],
		Started = parts[6],
		BrowserTrackerId = parts[7],
		PartyId = parts[8],
		Age = parts[9],
		Latitude = parts[10],  -- nil if doesn't exist
		Longitude = parts[11],  -- nil if doesn't exist
		CountryId = parts[12]  -- nil if doesn't exist
	}

	playSessions[player.userId] = newSession
    playerJoinTimes[player.userId] = tick() - startTime

	-- Games API
	local success, err = pcall(function() return SendMessageToGamesApi("PlayerAdded", player) end)
	if (not success) then
		PrintErrorMessage("playersService.PlayerAdded error updating games api = " .. err)
	end
	
	-- Game Instances API
	success, err = pcall(function() return SendMessageToGameInstancesApi("PlayerAdded") end	)
	if (not success) then
		PrintErrorMessage("playersService.PlayerAdded error updating game instances api = " .. err)
	end	

	-- Api Proxy - Presence
	success, err = pcall(function() return UpdatePresence(player, false) end)
	if (not success) then
		PrintErrorMessage("playersService.PlayerAdded error updating presence = " .. err)
	end
end

local function onPlayerDisconnectingReportClientPresence(player)
	local isTeleportingOut = "False"
	if player.Teleported then isTeleportingOut = "True" end

	if assetGameUrl and access and placeId and player and player.userId then
		game:HttpGet(assetGameUrl .. "/Game/ClientPresence.ashx?action=disconnect&PlaceID=" .. placeId .. "&UserID=" .. player.userId .. "&IsTeleport=" .. isTeleportingOut)
	end
end

local function onPlayerDisconnectingReportClientPresence2(player)
	-- remove form playSessions table
	playSessions[player.userId] = nil
    playerJoinTimes[player.userId] = nil

	-- Games API
	local success, err = pcall(function() return SendMessageToGamesApi("PlayerRemoving", player) end)
	if (not success) then
		PrintErrorMessage("playersService.PlayerRemoving error updating games api = " .. err)
	end
	
	-- Game Instances API
	success, err = pcall(function() return SendMessageToGameInstancesApi("PlayerRemoving") end)
	if (not success) then
		PrintErrorMessage("playersService.PlayerRemoving error updating game instances api = = " .. err)
	end	

	-- Api Proxy - Presence
	success, err = pcall(function() return UpdatePresence(player, true) end)
	if (not success) then
		PrintErrorMessage("playersService.PlayerRemoving error updating presence = " .. err)
	end
end

if (kickDuplicatePlayersRCC or isCloudEdit) then
	playersService.PlayerConnecting:connect(function(player)
		pcall(function() onPlayerConnectingReportClientPresence2(player) end)
		pcall(function() onPlayerConnectingReportClientPresence(player) end)
	end)

	playersService.PlayerDisconnecting:connect(function(player)
		pcall(function() onPlayerDisconnectingReportClientPresence2(player) end)
		pcall(function() onPlayerDisconnectingReportClientPresence(player) end)
	end)
else
	playersService.PlayerAdded:connect(onPlayerConnectingReportClientPresence)
	playersService.PlayerAdded:connect(onPlayerConnectingReportClientPresence2)

	playersService.PlayerRemoving:connect(onPlayerDisconnectingReportClientPresence)
	playersService.PlayerRemoving:connect(onPlayerDisconnectingReportClientPresence2)
end

game.Close:connect(function()
	-- when game closes, notify Game Instances API
	local fullUrl = gameInstancesApiUrl .. "/gameserver/kill-server/?apiKey=" .. apiKey .. "&gameId=" .. gameId .."&placeId=" .. placeId .."&universeId=" .. universeId
	PrintDebugMessage("Calling Game Instances API. Source: GameClose, URL: " .. fullUrl)
	game:HttpPost(fullUrl, "", true)
end)
    `
    const signature = crypto.createSign('SHA1')
    signature.write(script)
    signature.end()
  
    const key = fs.readFileSync('./keys/PrivateKey.txt')
    const sig = signature.sign(key, 'base64')
  
    res.set('Content-Type', 'text/plain');
    res.send(`--rbxsig%${sig}%${script}`)
})
  
  
  module.exports = router