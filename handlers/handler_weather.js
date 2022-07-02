const https = require('https')
const { URL } = require('url')


const _fetch = url => new Promise((resolve, reject) => {
    const { hostname, pathname, search } = new URL(url)
    const options = {
      hostname,
      path: pathname + search,
    }
    https.get(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(JSON.parse(data)))
    }).end()
  })


//中央氣象局

const countyCode = {
  "桃園市":"F-D0047-007",
  "台北市":"F-D0047-063",
  "台南市":"F-D0047-079"
}

exports.cwb = async (req, res) => {
  res.render('REST/weatherforecast/cwb')
}

exports.cwbSearch = async (req, res) => {
  const limit = req.body.name || ''
  const county = req.body.county || ''
  const district = encodeURIComponent(req.body.district) || ''
  const auth = process.env.CWB_APIAUTH
  const path = `/api/v1/rest/datastore/${countyCode[county]}?Authorization=${auth}&limit=${limit}&locationName=${district}`
  const points = await _fetch('https://opendata.cwb.gov.tw' + path)
  res.json(points)
 // res.render('REST/weatherforecast/cwb_district_week', {result: JSON.stringify(points)})
}

