const mongoose = require('mongoose')
const Vacation = require('./models/vacation.js')
mongoose.set('debug',true)
// const { credentials } = require('./config')
const connectionString  = process.env.MONGO_CONNECTIONSTRING
if(!connectionString){
    console.error('MongoDB connection string missing Jim!')
    process.exit(1)
}
mongoose.connect(connectionString, { useNewUrlParser: true })
const mongodb = mongoose.connection
mongodb.on('error', err =>{
    console.error('MongoDB error: '+ err.message)
    process.exit(1)
})
mongodb.once('open', () => console.log('mongoDB connection established'))

//produce vacation data if it doesn't exist
Vacation.find((err, vacations) => {
  if(err) return console.error(err)
  if(vacations.length) return

  new Vacation({
    name: 'Hood River Day Trip',
    slug: 'hood-river-day-trip',
    category: 'Day Trip',
    sku: 'HR199',
    description: 'Spend a day sailing on the Columbia and ' + 
      'enjoying craft beers in Hood River!',
    location: {
      search: 'Hood River, Oregon, USA',
    },
    price: 99.95,
    tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
  }).save()

  new Vacation({
    name: 'Oregon Coast Getaway',
    slug: 'oregon-coast-getaway',
    category: 'Weekend Getaway',
    sku: 'OC39',
    description: 'Enjoy the ocean air and quaint coastal towns!',
    location: {
      search: 'Cannon Beach, Oregon, USA',
    },
    price: 269.95,
    tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
  }).save()

  new Vacation({
    name: 'Military Summer Camp',
    slug: 'military-summer-camp',
    category: 'Hardcore',
    sku: 'T800',
    description: 'Welcome to mouthdropping and sureal real-world combat!',
    location: {
      search: 'Street, Paris, France',
    },
    price: 405.99,
    tags: ['military', 'summer camp', 'bootcamp'],
    inSeason: false,
    maximumGuests: 32,
    available: true,
    packagesSold: 2,
  }).save()

  new Vacation({
    name: 'Ready Player One',
    slug: 'ready-player-one',
    category: 'Simulation',
    sku: 'G304',
    description: 'Are you instrested in 3D real world of adventure?',
    location: {
      search: 'ShinWu, Taoyuan, Taiwan',
    },
    price: 360.33,
    tags: ['pro-gamer', '3D', 'adventure'],
    inSeason: false,
    maximumGuests: 1024,
    available: true,
    packagesSold: 894,
  }).save()

  new Vacation({
    name: 'Rock Climbing in Bend',
      slug: 'rock-climbing-in-bend',
      category: 'Adventure',
      sku: 'B99',
      description: 'Experience the thrill of climbing in the high desert.',
      location: {
        search: 'Bend, Oregon, USA',
      },
      price: 289.95,
      tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
      inSeason: true,
      requiresWaiver: true,
      maximumGuests: 4,
      available: false,
      packagesSold: 0,
      notes: 'The tour guide is currently recovering from a skiing accident.',
  }).save()
})


const VacationInSeasonListener = require('./models/vacationSeasonListener')
const User = require('./models/user') //chapter19

  module.exports = {
    getVacations: async (options = {}) => Vacation.find(options),
    addVacationInSeasonListener: async (sku, email) => {
      await VacationInSeasonListener.updateOne(
        { email },
        { $push: { skus: sku } },
        { upsert: true }
      )
    },
    getVacationBySku: async sku => Vacation.findOne({sku}), //chapter15
    addVacation: async data => new Vacation(data).save(), //chapter15
    deleteVacation: async id => Vacation.deleteOne({ _id: id}),

    getUserById: async id => User.findById(id),
    getUserByAuthId: async authId => User.findOne({authId}),
    addUser: async data => new User(data).save(),
    
    updateVacationBySku: async (sku, data) => Vacation.updateOne({ sku }, data), //chapter19
    close: () => mongoose.connection.close(),
  }




