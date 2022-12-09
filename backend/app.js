const YahooFantasy = require('yahoo-fantasy')
const express = require('express')
const app = express()
const https = require('https')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const fs = require('fs')
const { serialize } = require('v8')
const key = fs.readFileSync('./key.pem')
const cert = fs.readFileSync('./cert.pem')
const server = https.createServer({ key: key, cert: cert }, app)

app.use(cors())
app.use(bodyParser.json())

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

server.listen(3003, () => {
  console.log(`Server running on port ${3003}`)
})

app.yf = new YahooFantasy(
  process.env.APP_KEY,
  process.env.APP_SECRET,
  app.tokenCallback,
  'https://localhost:3003/auth/yahoo/callback'
)

app.get('/auth/yahoo', (req, res) => {
  try {
    app.yf.auth(res)
  } catch (e) {
    console.log('hey', e.description)
  }
})

app.get('/auth/yahoo/callback', (req, res) => {
  try {
    app.yf.authCallback(req, async (err) => {
      if (err) {
        return res.redirect('/error')
      }
      await delay(100)
      return res.redirect('http://localhost:3000/')
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
    })
  ])

  return res.json({ success: true })
})

app.get('/api/team', async (req, res) => {
  try {
    const data = await app.yf.user.game_teams('nhl')
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.post('/api/league', async (req, res) => {
  console.log(req.body)
  const data = await app.yf.league.settings(req.body.leagueKey)
  res.json(data)
})

app.post('/api/matchup', async (req, res) => {
  console.log(req.body)
  const data = await app.yf.team.matchups(req.body.teamKey)
  res.json(data)
})

app.post('/api/teamstats', async (req, res) => {
  try {
    console.log(req.body)
    const data = await app.yf.team.stats(req.body.teamKey)
    res.json(data)
  } catch (e) {
    console.log(e.description)
    res.status(401).send('Please login')
  }
})

app.get('/', async (req, res) => {
  try {
    const data = await app.yf.user.game_teams('nhl')
    let output = '<h2>Select Your Team</h2>'
    data['teams'][0]['teams'].forEach((team) => {
      output += `<a href="http://localhost:3000/"><div>
      <h2>${team.name}</h2>
      <img src="${team['team_logos'][0].url}" />
      </div></a>`
    })
    res.send(output)
  } catch (e) {
    const reason = e.description
    if (reason && reason.match(/Please provide valid credentials/)) {
      console.log('retrying')
      app.yf.auth(res)
    } else {
      console.log(e)
      res.send("<a href='/auth/yahoo'>Please click here to login</a>")
    }
  }
})
