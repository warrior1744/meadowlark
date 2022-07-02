const createTwitterClient = require('../lib/twitter')//chapter19
const twitterClient = createTwitterClient()//chapter19

const getTopTweets = async (twitterClient, search) => {
    const topTweets = {
      count: 4,
      lastRefreshed: 0,
      refreshInterval: 15*60*1000,
      tweets: [],
    }

      if(Date.now() > topTweets.lastRefreshed + topTweets.refreshInterval){
        const tweets = await twitterClient.search(search, topTweets.count)
        const formattedTweets = await Promise.all(
          tweets.statuses.map(async ({id_str, user}) => {
            const url = `https://twitter.com/${user.id_str}/statuses/${id_str}`
            const embeddedTweet = await twitterClient.embed(url, { omit_script: 1})
          return embeddedTweet.html
          })
        )
        topTweets.lastRefreshed = Date.now()
        topTweets.tweets = formattedTweets
      }
      return topTweets.tweets
  }

exports.tweets = async (req, res) => {
    const search = req.body.search || ''
    const tweetsResult = await getTopTweets(twitterClient, search)
    res.render('REST/twitter/tweets', { tweets: tweetsResult })
}