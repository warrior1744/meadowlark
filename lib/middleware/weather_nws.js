// const getWeatherData = () => [
//   {
//     location: {
//       name: 'Portland',
//     },
//     forecastUrl: 'https://api.weather.gov/gridpoints/PQR/112,103/forecast',
//     iconUrl: 'https://api.weather.gov/icons/land/day/tsra,40?size=medium',
//     weather: 'Chance Showers And Thunderstorms',
//     temp: '59 F',
//   },
//   {
//     location: {
//       name: 'Bend',
//     },
//     forecastUrl: 'https://api.weather.gov/gridpoints/PDT/34,40/forecast',
//     iconUrl: 'https://api.weather.gov/icons/land/day/tsra_sct,50?size=medium',
//     weather: 'Scattered Showers And Thunderstorms',
//     temp: '51 F',
//   },
//   {
//     location: {
//       name: 'Manzanita',
//     },
//     forecastUrl: 'https://api.weather.gov/gridpoints/PQR/73,120/forecast',
//     iconUrl: 'https://api.weather.gov/icons/land/day/tsra,90?size=medium',
//     weather: 'Showers And Thunderstorms',
//     temp: '55 F',
//   },
// ]

//chapter19. Integrating with Third-Party APIs
const NWSWeatherData = require('../weather_nws')
const getNWSWeatherData = NWSWeatherData([
  {
    name: 'Portland',
    coordinates: { x: 29, y: 44 },
  },
  {
    name: 'Bend',
    coordinates: { x: 78, y: 70 },
  },
  {
    name: 'Manzanita',
    coordinates: { x: 15, y: 63 },
  },
])

const NWSWeatherMiddleware = async (req, res, next) => {
  if(!res.locals.partials) res.locals.partials = {}
  res.locals.partials.NWSWeatherContext = await getNWSWeatherData()
  next()
}

module.exports = NWSWeatherMiddleware







