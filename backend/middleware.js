const userExtractor = (request, response, next) => {
  const accessTokenCookie = request.headers?.cookie
    ?.split('; ')
    ?.find((c) => c.startsWith('accessToken'))

  if (!accessTokenCookie) {
    return response.status(401).json({ error: 'token missing' })
  }

  request.userToken = accessTokenCookie.split('=')[1]

  next()
}

module.exports = { userExtractor }
