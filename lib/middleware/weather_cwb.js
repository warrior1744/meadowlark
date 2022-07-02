// const { credentials } = require('../../config')
const https = require('https')
const { URL } = require('url')

const _fetch = url => new Promise((resolve, reject) => {
    const { hostname, pathname, search} = new URL(url)
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

//一般天氣預報-今明 36 小時天氣預報

async function CWBWeatherData() {

    const cache = {
        refreshFrequency: 15* 60* 1000,
        lastRefreshed: 0,
        refreshing: false,
        forecasts: {},
    }

    const updateCWBForecast = async forecasts=> {
        if(!forecasts.data) {
            const auth = process.env.CWB_APIAUTH
            const path = `/api/v1/rest/datastore/F-C0032-001?Authorization=${auth}&locationName=&elementName=`
            const points = await _fetch('https://opendata.cwb.gov.tw' + path)
            forecasts.data = points
        }
        const { records } = forecasts.data
        const startDate = (records.location[0].weatherElement[0].time[0].startTime)
        const endDate = (records.location[0].weatherElement[0].time[2].endTime)

        const data = Object.assign({}, {datasetDescription: records.datasetDescription}, 
                                       {location: records.location},
                                       {startDate: startDate},
                                       {endDate: endDate})
        return data
    }

    const getCWBForecasts = async () => {
        if(Date.now() > cache.lastRefreshed + cache.refreshFrequency){
            cache.refreshing = true
            cache.forecasts = await updateCWBForecast(cache.forecasts)
            cache.refreshing = false
        }
        return cache.forecasts
    }

    const result = await getCWBForecasts()
    return result
}//end function


const CWBWeatherMiddleware = async (req, res, next) => {
    if(!res.locals.partials) res.locals.partials = {}
    res.locals.partials.CWBWeatherContext = await CWBWeatherData()
    next()
}

module.exports = CWBWeatherMiddleware