const YahooFantasy = require('yahoo-fantasy')
const express = require('express')
const app = express()
const https = require('https')
const http = require('http')
const cors = require('cors')
const middleware = require('./middleware')
const bodyParser = require('body-parser')
const {
  PORT,
  FRONTEND_URI,
  BACKEND_URI,
  APP_KEY,
  APP_SECRET,
  PRODUCTION
} = require('./config')
require('dotenv').config()

const fs = require('fs')
const { serialize } = require('cookie')
const key = fs.readFileSync('./key.pem')
const cert = fs.readFileSync('./cert.pem')
const server = PRODUCTION
  ? http.createServer(app)
  : https.createServer({ key: key, cert: cert }, app)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(cors())
app.use(bodyParser.json())

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

app.use(express.static('build'))

const createYF = () => {
  return new YahooFantasy(
    APP_KEY,
    APP_SECRET,
    app.tokenCallback,
    `${BACKEND_URI}auth/yahoo/callback`
  )
}

app.get('/auth/yahoo', (req, res) => {
  const yf = createYF()
  try {
    yf.auth(res)
  } catch (e) {
    console.log('Auth error:', e.description)
  }
})

app.get('/auth/yahoo/callback', (req, res) => {
  const yf = createYF()
  try {
    yf.authCallback(req, async (err) => {
      if (err) {
        return res.redirect('/error')
      }
      await delay(100)
      res.setHeader('Set-Cookie', [
        serialize('accessToken', yf.yahooUserToken, {
          path: '/',
          httpOnly: true
        }),
        serialize('refreshToken', yf.yahooRefreshToken, {
          path: '/',
          httpOnly: true
        }),
        serialize('loggedIn', 'true', {
          path: '/',
          httpOnly: false
        })
      ])
      return res.redirect(FRONTEND_URI)
    })
  } catch (e) {
    console.log('Callback error:', e.description)
  }
})

app.get('/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', [
    serialize('accessToken', '', {
      path: '/',
      httpOnly: true,
      expires: new Date()
    }),
    serialize('refreshToken', '', {
      path: '/',
      httpOnly: true,
      expires: new Date()
    }),
    serialize('loggedIn', '', {
      path: '/',
      httpOnly: false,
      expires: new Date()
    })
  ])

  return res.redirect(FRONTEND_URI)
})

app.get('/api/team', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  try {
    yf.setUserToken(req.userToken)
    const data = await yf.user.game_teams('nhl')
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/league', middleware.userExtractor, async (req, res) => {
  try {
    const yf = createYF()
    yf.setUserToken(req.userToken)
    const data = await yf.league.settings(req.body.leagueKey)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/matchup', middleware.userExtractor, async (req, res) => {
  try {
    const yf = createYF()
    yf.setUserToken(req.userToken)
    const data = await yf.team.matchups(req.body.teamKey)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/teamstats', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  try {
    yf.setUserToken(req.userToken)
    const data = await yf.team.stats(req.body.teamKey)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/rosters', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  yf.setUserToken(req.userToken)
  try {
    console.log(req.body.teamKeys)
    const players = await yf.players.teams([req.body.teamKeys])
    const player_ids = players[0].players.map((player) => player.player_key)
    const opp_player_ids =
      players?.[1]?.players.map((player) => player.player_key) || null
    let player_data = {}
    if (opp_player_ids) {
      try {
        ;[player_data.team, player_data.opp] = await Promise.all([
          yf.players.fetch(player_ids, ['stats']),
          yf.players.fetch(opp_player_ids, ['stats'])
        ])
      } catch (e) {
        console.log(e)
      }
    } else {
      try {
        player_data.team = await yf.players.fetch(player_ids, ['stats'])
      } catch (e) {
        console.log(e)
      }
    }
    res.json(player_data)
  } catch (e) {
    console.log(e)
  }
  // res.status(401).send('Problem fetching player data')
})

app.post('/api/player', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  yf.setUserToken(req.userToken)
  try {
    const data = await yf.player.stats(req.body.playerId, req.body.week)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/players', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  yf.setUserToken(req.userToken)
  try {
    const data = await yf.players.stats(req.body.playerIds, req.body.week)
    res.json(data)
  } catch (e) {
    console.log(e)
    res.status(401).send('Please login')
  }
})

app.post('/api/allplayers', middleware.userExtractor, async (req, res) => {
  const yf = createYF()
  yf.setUserToken(req.userToken)
  try {
    const promises = []
    for (let i = 0; i < 300; i += 25) {
      promises.push(
        yf.players.leagues(
          [req.body.leagueKey],
          { sort: ['AR'], position: 'F,LW,RW,D', start: i, count: 25 },
          ['stats', 'ownership']
        )
      )
    }
    const results = await Promise.all(promises)
    const data = results.reduce((a, b) => [...a, ...b[0].players], [])
    res.json(data)
  } catch (e) {
    console.log(e)
    res.status(401).send('Please login')
  }
})
