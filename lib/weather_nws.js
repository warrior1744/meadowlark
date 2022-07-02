const https = require('https')
const { URL } = require('url')


//https://www.weather.gov/documentation/services-web-api
const _fetch = url => new Promise((resolve, reject) => {
  const { hostname, pathname, search } = new URL(url)
  const options = {
    hostname,
    path: pathname + search,
    headers: {
      'User-Agent': 'Meadowlark Travel'
    },
  }
  https.get(options, res => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => resolve(JSON.parse(data)))
  }).end()
})

module.exports = locations => {  //possible an array of locations with name and coordinates

  const cache = {
    refreshFrequency: 15 * 60 * 1000,
    lastRefreshed: 0,
    refreshing: false,
    forecasts: locations.map(location => ({ location })),
  }

  const updateNWSForecast = async forecast => {
    if(!forecast.data) {
     console.log(`forecast >>> ${JSON.stringify(forecast)}`)
      const { x, y } = forecast.location.coordinates
      const path = `/gridpoints/TOP/${x},${y}/forecast`
      const points = await _fetch('https://api.weather.gov' + path) //ex: https://api.weather.gov/points/39.7456,-97.0892
      forecast.data = points  //ex: https://api.weather.gov/gridpoints/TOP/31,80/forecast
    }
     
    const { properties: { periods} } = forecast.data
    const currentPeriod = periods[0]
    Object.assign(forecast, {
      iconUrl: currentPeriod.icon,
      weather: currentPeriod.shortForecast,
      temp: currentPeriod.temperature + ' ' + currentPeriod.temperatureUnit,
    })
    return forecast
  }

  const getNWSForecasts = async () => {
    if(Date.now() > cache.lastRefreshed + cache.refreshFrequency) {
      cache.refreshing = true
      cache.forecasts = await Promise.all(cache.forecasts.map(updateNWSForecast))
      cache.refreshing = false
    }
    return cache.forecasts
  }

  return getNWSForecasts

}
