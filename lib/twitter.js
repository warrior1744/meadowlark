const https = require('https')
const qs = require('querystringify')

module.exports = () => {

    //  https://developer.twitter.com/en/docs/authentication/oauth-2-0
    /*1. An application encodes its consumer key and secret into a specially encoded set of credentials.
      2. An application makes a request to the POST oauth2/token endpoint to exchange these credentials for a Bearer Token.
      3. When accessing the REST API, the application uses the Bearer Token to authenticate.*/   
    let accessToken = null
    const getAccessToken = async () => {
        if(accessToken) return accessToken
  /*1.*/const bearerToken = Buffer(encodeURIComponent(process.env.TWITTER_APIKEY)+':'+encodeURIComponent(process.env.TWITTER_APIKEYSECRET)).toString('base64')
        const options = {
            hostname: 'api.twitter.com',
            port: 443,
            method: 'POST',
            path: '/oauth2/token?grant_type=client_credentials',
            headers: {
                'Authorization': 'Basic ' + bearerToken,
                'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        }
        return new Promise((resolve, reject) =>
    /*2.*/      https.request(options, res => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    const auth = JSON.parse(data)
                    if(auth.token_type !== 'bearer')
                        return reject(new Error('Twitter auth failed Jim!.'))
                    accessToken = auth.access_token
                    return resolve(accessToken) /*3.*/
                })
            }).end()
        )
    }

    return {
        search: async (query, count) => {
            const accessToken = await getAccessToken()
            const options = {
                hostname: 'api.twitter.com',
                port: 443,
                mehtod: 'GET',
                path: '/1.1/search/tweets.json?q=' +
                    encodeURIComponent(query) +
                    '&count=' + (count || 10),
                headers: {
                    'Authorization': 'Bearer '+ accessToken,
                },
            }
            return new Promise((resolve, reject) =>
                https.request(options, res => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => resolve(JSON.parse(data)))
                }).end()
            )
        },
        embed: async (url, options = {}) => {
            options.url = url
            //options.hide_media = 1 //hide tweet media contents
            console.log(`embed: qs.stringified options >>> ${qs.stringify(options)}`)
            const accessToken = await getAccessToken()
            const requestOptions = {
                hostname: 'api.twitter.com',
                port: 443,
                method: 'GET',
                path: '/1.1/statuses/oembed.json?' + qs.stringify(options),
                headers: {
                    'Authorization' : 'Bearer '+ accessToken,
                },
            }
            return new Promise((resolve, reject) =>
                https.request(requestOptions, res => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => resolve(JSON.parse(data)))
                }).end()
            )
        },
    }
}