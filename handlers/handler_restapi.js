
//api page

exports.restapi = (req, res) => {
    res.render('REST/rest')
}


//facebook

exports.facebook_api = (req, res) => {
    res.render('REST/facebook/facebook_api')
}

//twitter

exports.twitter_api = (req, res) => {
    res.render('REST/twitter/twitter_api')
}


//google

exports.google_api = (req, res) => {
    res.render('REST/google/google_api')
}

//weatherforecast


exports.weather_api = (req, res) => {
    res.render('REST/weatherforecast/weather_api')
}

//ecpay api

exports.ecpay_api = (req, res) => {
    res.render('REST/ecpay/ecpay_api')
}
    



















