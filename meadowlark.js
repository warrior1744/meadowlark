const express = require('express') //npm install express -g
const { engine } = require('express-handlebars') //npm install express-handlebars
const app = express()
const bodyParser = require('body-parser') //chapter08 => npm install body-parser
const cookieParser = require('cookie-parser') // chapter09 => npm install cookie-parser
const expressSession = require('express-session') // chapter09 => npm install express-session, this has to be put after cookieParser
const csrf = require('csurf')//chapter18
const morgan = require('morgan')//chapter12
const fs = require('fs')//chapter12
const cluster = require('cluster')//chapter12
const vhost = require('vhost')//chapter14
const Redis = require('ioredis')//chapter13 //please check https://www.npmjs.com/package/connect-redis
const RedisStore = require('connect-redis')(expressSession)//chapter13
const cors = require('cors')//chapter15
const http = require('http')//chapter18 Security
const dotenv = require('dotenv')
const NWSWeatherMiddleware = require('./lib/middleware/weather_nws')
const CWBWeatherMiddleware = require('./lib/middleware/weather_cwb')
const flashMiddleware = require('./lib/middleware/flash') //chapter09
const cartValidation = require('./lib/cartValidation')//chapter10
const { set } = require('lodash')
const data = require('./lib/data')
const options = {
  key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
  cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
}
const path = require('path')
dotenv.config()

//  https://www.npmjs.com/package/ioredis
const redisClient= new Redis(process.env.REDIS_URL)
redisClient.on('error', function (err) { console.log('Could not establish a connection with redis. ' + err) })
redisClient.on('connect', function (err) { console.log('Connected to redis successfully')})

const createAuth = require('./lib/auth')//chapter18 3rd-party auth

switch(app.get('env')) {
  case 'development':
    app.use(morgan('tiny'))
    break
  case 'production':
    const stream = fs.createWriteStream(__dirname + '/access.log',
      { flags: 'a' })
    app.use(morgan('combined', { stream }))
    break
}

app.use('/api', cors())//chapter15

app.set('view cache', true)//default is false in development mode
app.engine('handlebars', engine({  //configure Handlebars view engine by specifing the default layout 'main'
  defaultLayout: "main",
  helpers:{
    section: function(name, options){
      // console.log(`helpers:{ section: function(name, options)\n{name -> ${name}\noptions -> ${options}`)
      // console.log(`this -> ${this}\noptions.fn(this) -> ${options.fn(this)}}`)
      if(!this._sections) this._sections = {}
      this._sections[name] = options.fn(this)
      return null
    },
    sliceDate: function(date){   //I made some few helpers to slice the templating html content
      let d = date.slice(0, 10)  //before: "2022-05-19 06:00:00"   after: "2022-05-19"
      return d
    },
    sliceTime: function(time){
      let t = time.slice(11, 19)  //before: "2022-05-19 06:00:00"   after: "06:00:00"
      return t
    },
  },
}));//you can change the extension to .hbs by giving a new instance {extname: '.hbs'}
app.set('view engine', 'handlebars')

app.use('/public', express.static(__dirname+ '/public'))
app.use('/static', express.static('public/img'))//chapter 17, specify static link

// __dirname >  D:\Dropbox\Dev\WebDev\WebDev_with_Node_and_Express\projects\meadowlark\server

// if(process.env.NODE_ENV === 'production'){
//   app.use('/',express.static('public/build'))
// }else{
//   app.get('/', (req, res) => {
//     res.send('API is running...')
//   })
// }

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIESECRET))
app.use(expressSession({
  store: new RedisStore({ client: redisClient,}),
  cookie: { maxAge: 3 * 60 * 60 * 1000 },
  resave: false, //forces the session to be saved back to the store even if the request wasn't modified
  saveUninitialized: false, //get the user's permission before setting a cookie
  secret: process.env.COOKIESECRET, //the key used to sign the session ID cookie
}))

//3rd party authorization
const auth = createAuth(app, {
  baseUrl: process.env.BASE_URL,
  // providers: credentials.authProviders,
  successRedirect: '/account',
  failureRedirect: '/unauthorized',
})

auth.init() // auth.init() links in Passport middleware
auth.registerRoutes() //specify our auth routes

// app.use(csrf({ cookie: true }))
// app.use((req, res, next) => {
//   res.locals._csrfToken = req.csrfToken()
//   next()
// })

app.use((req, res, next) => {
  if(cluster.isWorker)
    console.log(`Worker ${cluster.worker.id} received request`)
    next()
})

//chapter18 implement csurf middleware and requrest csrf token

app.use(data.getProducts)
app.use(data.getProductsById)
app.use(data.specials)
app.use(cartValidation.resetValidation)
app.use(cartValidation.checkWaivers)
app.use(cartValidation.checkGuestCounts)
// app.use(NWSWeatherMiddleware)
app.use(CWBWeatherMiddleware)
app.use(flashMiddleware)

app.use((req, res, next) => {
  console.log(`The request URL is ${req.originalUrl}`)
  next()
})

var adminRouter = express.Router()
var apiRouter = express.Router()
app.use(vhost('admin.meadowlark.com', adminRouter))
app.use(vhost('api.meadowlark.com', apiRouter))
adminRouter.get('*', (req, res) => res.send('welcome, admin!'))
apiRouter.get('*', (req, res) => res.send('This is API page~'))

const addRoutes = require('./routes.js')//chapter14
addRoutes(app)//chapter14


//ch14/06-auto-views.js in the companion repo
const autoViews = {}
const { promisify } = require('util')
const fileExists = promisify(fs.exists)

app.use(async (req, res, next) => {
  const path = req.path.toLowerCase()
  let viewExists = await fileExists(__dirname + '/views' + path + '.handlebars')
  //check cache; if it's there, render the view
  if(autoViews[path]) {
    try{
      if(!viewExists) throw 'view does not exist. Relocated or removed ?'
      return res.render(autoViews[path])
    }catch (error){
      delete autoViews.path
      console.log(error)
    }
  }

  if(viewExists) { //if it's not in the cache, see if there's a .handlebars file that matches
    autoViews[path] = path.replace(/^\//, '')
    return res.render(autoViews[path])
  }
  next()
})

const error = require('./handlers/handler_notFound')
//app.get('*', (req, res) => res.send('welcome, user, you may enter the wrong url, please check the valid url'))
app.use(error.notFound)
app.use(error.serverError)

const port = process.env.PORT || 3033;
if(require.main === module){ //the script has been run directly; otherwise, it has been called with require from another script.
  //application run directly; start over server
  startServer(port)
}else{
  //application imported as a module via 'require': export
  //function to create server
  module.exports = startServer;
}

function startServer(port){
  http.createServer(options, app).listen(port, () => {
    console.log( `Express started in ` +
    `${app.get('env')} mode at http://localhost:${port}; ` +
    `press Ctrl-C to terminate.`)
  })
}