const data = require('../lib/data.js')

exports.home = (req, res) => {
  if(req.headers['x-forwarded-proto'] === 'https'){
    console.log('line is secure')
  }else{
    console.log('you are insecure!')
  }

  const cart = req.session.cart || { items: [] }
  const loginfo = req.session.loginfo
  const status = req.query.status
  const products = res.locals.products
  const context = { products, cart, loginfo, status }
  res.render('home', context) //rendering the page by sending the JSON context using destructuring assignment
}

exports.about = (req, res) => res.render('about',{fortune: data.getFortune(), layout: 'jimMain' })//layout:null => not using any layout

exports.loginPage = (req, res) => {
  let redirect = req.query.redirect
  res.render('login-page', {redirect: redirect})
}

exports.login = (req, res) => {
    req.session.loginfo = { username: req.body.username, password: req.body.password}
    req.session.authorized = true
    res.send({result: 'Success Jim Chang!'})
}

exports.logout = (req, res) => {
  delete req.session.loginfo
  delete req.session.authorized
  res.redirect('/?status= you are just logged out!')
}



