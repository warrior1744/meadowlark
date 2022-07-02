const https = require('https')
const http = require('http')
const fs = require('fs')

const {google} = require('googleapis')
const youtube = google.youtube('v3')
const url = require('url')
const destroyer = require('server-destroy')
const people = google.people('v1')
const opn = require('open')

module.exports = () => 
{
  const getAccessToken = async () => 
  {
    let apiKey = process.env.GOOGLE_APIKEY
    let clientID = process.env.GOOGLE_CLIENTID
    let clientSecret = process.env.GOOGLE_CLIENTSECRET
    const redirectUrl = 'http://localhost:3000/oauth2callback'
    const oauth2Client = new google.auth.OAuth2(
        clientID,
        clientSecret,
        redirectUrl
    )
    google.options({auth: oauth2Client})
    const scopes = ['https://www.googleapis.com/auth/youtube.force-ssl',]
    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scopes.join(' '),
      });
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url.indexOf('/oauth2callback') > -1) {
              const qs = new url.URL(req.url, 'http://localhost:3000')
                .searchParams;
              res.end('Authentication successful! Please return to the console.');
              server.destroy();
              const {tokens} = await oauth2Client.getToken(qs.get('code'));
              oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates
              resolve(oauth2Client);
            }
          } catch (e) {
            reject(e);
          }
        })
        .listen(3000, () => {
          // open the browser to the authorize url to start the workflow
          opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
        });
      destroyer(server);
    })
  }//end getAccessToken function

    return {
      search: async () => {
        // retrieve user profile
        await getAccessToken()
        const res = await youtube.search.list({
          part: 'id,snippet',
          q: 'My Neighbor Totoro',
      });
      return res;
      },
      show: async () => {
        //write codes for retrieving id 
        //https://www.youtube.com/watch?v=[video id]

      },
    } 
}