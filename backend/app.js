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

app.yf = new YahooFantasy(
  APP_KEY,
  APP_SECRET,
  app.tokenCallback,
  `${BACKEND_URI}auth/yahoo/callback`
)

app.get('/auth/yahoo', (req, res) => {
  try {
    app.yf.auth(res)
  } catch (e) {
    console.log(e.description)
  }
})

app.get('/auth/yahoo/callback', (req, res) => {
  try {
    app.yf.authCallback(req, async (err) => {
      if (err) {
        return res.redirect('/error')
      }
      await delay(100)
      res.setHeader('Set-Cookie', [
        serialize('accessToken', app.yf.yahooUserToken, {
          path: '/',
          httpOnly: true
        }),
        serialize('refreshToken', app.yf.yahooRefreshToken, {
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
    console.log(e.description)
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
  try {
    app.yf.setUserToken(req.userToken)
    const data = await app.yf.user.game_teams('nhl')
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/league', middleware.userExtractor, async (req, res) => {
  app.yf.setUserToken(req.userToken)
  const data = await app.yf.league.settings(req.body.leagueKey)
  res.json(data)
})

app.post('/api/matchup', middleware.userExtractor, async (req, res) => {
  app.yf.setUserToken(req.userToken)
  const data = await app.yf.team.matchups(req.body.teamKey)
  res.json(data)
})

app.post('/api/teamstats', middleware.userExtractor, async (req, res) => {
  try {
    app.yf.setUserToken(req.userToken)
    const data = await app.yf.team.stats(req.body.teamKey)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})
