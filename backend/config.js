const path = require('path')

const PRODUCTION = process.env.NODE_ENV === 'production' ? true : false
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config()
} else {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
}

const APP_KEY = process.env.APP_KEY
const APP_SECRET = process.env.APP_SECRET

const PORT = process.env.PORT

const FRONTEND_URI = process.env.FRONTEND_URI

const BACKEND_URI = process.env.BACKEND_URI

module.exports = {
  PRODUCTION,
  APP_KEY,
  APP_SECRET,
  PORT,
  FRONTEND_URI,
  BACKEND_URI
}
