const main = require('./handlers/handler_main')
const misc = require('./handlers/handler_misc')
const tour = require('./handlers/handler_tour')
const newsletter = require('./handlers/handler_newsletter')
const vacation = require('./handlers/handler_vacation')
const cart = require('./handlers/handler_cart')
const apiVacation = require('./handlers/handler_apiVacation')
const auth = require('./handlers/handler_auth')

const rest = require('./handlers/handler_restapi')
const facebook = require('./handlers/handler_facebook.js')
const twitter = require('./handlers/handler_twitter.js')
const google = require('./handlers/handler_google.js')
const weather = require('./handlers/handler_weather.js')
const ecpay = require('./handlers/handler_ecpay.js')


const multiparty = require('multiparty')
module.exports = app => {
    
//main
    app.get('/', main.home)     //home pages becomes static
    app.get('/about', main.about)
    app.get('/login(-page)?', main.loginPage)  
    app.post('/login', main.login)
    app.get('/logout', main.logout)
//misc
    app.get('/headers', misc.headers)
    app.get('/json', misc.json)
    app.get('/greeting', misc.greeting )
    app.get('/set-random-userid', misc.setRandomUserid)
    app.get('/set-random-username',misc.setRandomUsername)
    app.get('/page-with-specials', misc.pageWithSpecials)
    app.get('/heros/:universe/:name', misc.heros)
    app.get('/custom-layout', misc.customLayout)
    app.get('/no-layout', misc.noLayout)
    app.get('/text', misc.text)
    app.get('/thank-you', misc.thankyou)
    app.get('/contact-error', misc.contactError)
    app.get('/section-test', misc.sectionTest)
    app.post('/process-contact', misc.processContact)
//tour
    app.get('/api/tours', tour.tours)
    app.put('/api/tour/:id', tour.putTour)
    app.delete('/api/tour/:id', tour.deleteTour)
//newsletter
    app.get('/newsletter-signup', newsletter.newsletterSignup)
    app.get('/newsletter', newsletter.newsletter)
    app.post('/newsletter-signup/process', newsletter.newsletterSignupProcess)
    app.get('/newsletter-signup/newsletter-signup-thank-you', newsletter.newsletterSignupThankYou)
    app.get('/newsletter-archive', newsletter.newsletterArchive)
    app.post('/api/newsletter-signup', newsletter.api.newsletterSignup)
//vacation
    app.get('/contest/vacation-photo', vacation.vacationPhotoContest)
    app.post('/contest/vacation-photo/:year/:month', (req, res) => { //app.post runs when the from is submitted
      const form = new multiparty.Form()
      form.parse(req, (err, fields, files) => {
        if(err) return vacation.vacationPhotoContestProcessError(req, res, err.message)
        vacation.vacationPhotoContestProcess(req, res, fields, files)
      })
    })
    app.get('/contest/vacation-photo-ajax', vacation.vacationPhotoContestAjax)
    app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {  //app.post runs when the from is submitted
      const form = new multiparty.Form()
      form.parse(req, (err, fields, files) => {
        if(err) return vacation.api.vacationPhotoContestProcessError(req, res, err.message)
        vacation.api.vacationPhotoContestProcess(req, res, fields, files)
      })
    })
    app.get('/contest/vacation-photo-thank-you', vacation.vacationPhotoContestProcessThankYou)
    app.get('/vacations', vacation.listVacations)
    app.get('/notify-me-when-in-season', vacation.notifyWhenInSeasonForm)
    app.post('/notify-me-when-in-season', vacation.notifyWhenInSeasonProcess)
    app.get('/set-currency/:currency', vacation.setCurrency)//redis
    //add vacation form submit
    app.get('/add-vacation', vacation.addVacation)
    app.post('/add-vacation-process', (req, res) => {
      const form = new multiparty.Form()
      form.parse(req, (err, fields) => {
        if(err) return vacation.api.vacationPhotoContestProcessError(req, res, err.message)
        vacation.api.addVacationProcess(req, res, fields)
      })
    })
    //manage vacations
    app.get('/manage-vacations', vacation.manageVacations)
    app.get('/vacation-delete/:name/:sku', vacation.deleteVacation)
    

//cart checkout 
    app.get('/checkout', cart.checkout)
    app.post('/cart/checkout', cart.mycart.checkout)
    app.post('/add-to-cart', cart.mycart.add)
//api vacation
//for the experimentation, append the link after home link on your browser, the json format will show
    app.get('/api/vacations', apiVacation.getVacationsApi)//testable
    app.get('/api/vacation/:sku', apiVacation.getVacationBySkuApi)//testable
    app.post('/api/vacation/:sku/notify-when-in-season', apiVacation.addVacationInSeasonListenerApi)//testable
    app.delete('/api/vacation/:sku', apiVacation.requestDeleteVacationApi)//testable
    
//third-party authentication
//chapter18 Role-Based Authorization
    const memeberOnly = (req, res, next) => {
      console.log(`req.user >>> ${req.user}, req.user.role >>> ${req.user.role}`)
      if(req.user && req.user.role === 'customer') return next()
      let queryString = encodeURIComponent('/account')
      res.redirect(303, '/login-page?redirect='+queryString)
    }

    const customerOnly = (req, res, next) => {
      if(req.user && req.user.role === 'customer') return next()
      res.redirect(303, '/unauthorized')
    }

    const employeeOnly = (req, res, next) => {
      if(req.user && req.user.role === 'employee') return next()
      next('route')
    }

    const allow = roles => (req, res, next) => {
      if(req.user && roles.split(',').includes(req.user.role)) return next()
      res.redirect(303, '/unauthorized')
    }

    app.get('/account', memeberOnly, auth.account.account)
    app.get('/account/order-history', customerOnly, auth.account.orderHistory)
    app.get('/account/email-prefs', customerOnly, auth.account.emailPrefs)
    app.get('/sales', employeeOnly, auth.sales)
    app.get('/unauthorized', auth.unauthorized)
    app.get('/logout', auth.logout)

//chapter19 Integrating with Third-Party API

    //handler_restapi
    app.get('/REST/rest', rest.restapi)
    app.get('/REST/facebook', rest.facebook_api)
    app.get('/REST/twitter', rest.twitter_api)
    app.get('/REST/google', rest.google_api)
    app.get('/REST/weatherforecast', rest.weather_api)

    //handler_facebook
    //handler_twitter
    app.post('/tweets', twitter.tweets)
    //handler_google
    app.get('/vacations-map', google.map)
    app.get('/youtube-data', google.youtube.search)
    //handler_weather
    app.get('/REST/weatherforecast/cwb', weather.cwb)
    app.post('/weather-forecast', weather.cwbSearch)



    //handler_ecpay

    // app.post('/REST/ecpay', ecpay.proceedPayment)
    app.get('/REST/ecpay', ecpay.proceedPayment) //the payment page , this is for testing
    app.post('/REST/ecpay/returnResult', ecpay.returnResult) //receive order info from ecpay 
    app.post('/REST/ecpay/orderResult', ecpay.orderResult)


    


}//close module.exports

