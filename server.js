var http = require('https')
require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

const APP_ID = process.env.APP_ID
const SECRET_KEY = process.env.SECRET_KEY
const REDIRECT_URI = process.env.REDIRECT_URI
const FRONTEND_URL = process.env.FRONTEND_URL


app.get('/', (req, res) => {
  console.log(APP_ID)
  res.send(APP_ID)
})

app.get('/login', (req, res) => {
  const loginUrl = `https://connect.deezer.com/oauth/auth.php?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&perms=basic_access,email`
  res.redirect(loginUrl)
})

app.get('/deezer-login-callback', (req, res) => {
  const authCode = encodeURIComponent(req.query.code)
  const accessTokenUrl = `https://connect.deezer.com/oauth/access_token.php?app_id=${APP_ID}&secret=${SECRET_KEY}&code=${authCode}&output=json`
  http.get(accessTokenUrl, (tokenRes) => {
    let rawData = ''
    tokenRes.on('data', (chunk) => {
      rawData += chunk
    })
    tokenRes.on('end', () => {
      const resJson = JSON.parse(rawData)
      const accessToken = resJson.access_token
      const expires = new Date(Date.now() + resJson.expires * 1000)
      console.log(`${expires} `)
      res.cookie('accessToken', accessToken, {
          expires: expires,
          secure: true
        }).cookie('expires', expires, {
          expires: expires,
          secure: true
        })
        .redirect(FRONTEND_URL)
    });
  })
})


app.listen(port, () => {
  console.log(`deezync-backend listening at http://localhost:${port}`)
})
