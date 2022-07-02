
// const { credentials } = require('../config')
const createYoutubeClient = require('../lib/youtube')
const youtubeClient = createYoutubeClient()


exports.map = async (req, res) => {
    res.render('REST/google/vacations-map', { googleApiKey: process.env.GOOGLE_APIKEY})
}

exports.youtube = {
    search: async (req, res) => {
      const youtubeResult = await youtubeClient.search()
      const { items } = youtubeResult.data
      let context =''
      for(let i=0; i<items.length; i++){
        for( let key in items){
          let videoId = ''
          videoId = items[key].id.videoId
          context += ` <iframe id="ytplayer" type="text/html" width="640" height="360"
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&origin=http://example.com"
          frameborder="0"></iframe></br>`
        }
      }
      // res.json({youtubeResult})
      res.render('REST/google/youtube_data', { search: context})
    }
}

