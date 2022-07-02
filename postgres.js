require('./postgres_init.js')
const _ = require('lodash')
const { Pool } = require('pg')
// const { credentials } = require('./config')
const connectionString = process.env.POSTGRES_CONNECTIONSTRING
const pool = new Pool({ connectionString })
module.exports = {
    getVacations: async() => {
        const { rows } = await pool.query('SELECT * FROM vacations')
        console.log(`retrieved rows -> ${rows}`)
        return rows.map(row => {
            // console.log(`row -> ${row}`)
            const vacation = _.mapKeys(row, (v, k) => _.camelCase(k))
            // console.log(`vacation -> ${JSON.stringify(vacation)}`)
            // console.log(`before: vacation.price -> ${vacation.price}`)
            vacation.price = parseFloat(vacation.price.replace(/^\$/, ''))//remove $
            // console.log(`after: vacation.price -> ${vacation.price}`)
            vacation.location = {
                search: vacation.locationSearch,
                coordinates: {
                    lat: vacation.locationLat,
                    lng: vacation.locationLng,
                },
            }
            // console.log(`vacation.location -> ${vacation.location}`)
            return vacation
        })
    },
    addVacationInSeasonListener: async(email, sku) => {
        await pool.query(
            'INSERT INTO vacation_in_season_listeners (email, sku) ' +
            'VALUES ($1, $2) ' +
            'ON CONFLICT DO NOTHING',
            [email, sku]
        )
    },
    getVacationBySku: async() => {},
    addVacation: async() => {},
    deleteVacatioin: async() => {},

    getUserById: async() => {},
    getUserByAuthId: async() => {},
    addUser: async() => {},
}