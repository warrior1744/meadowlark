const catNames = require('cat-names')
const { heros } = require('../lib/data')

exports.headers = (req, res) => {
    res.render('headers')
    res.type('text/plain')
    const headers = Object.entries(req.headers)
       .map(([key, value]) => `${key}: ${value}`)
    res.send(headers.join('\n')+'\n'+req.url)
}
exports.json = (req, res) => res.render('json')

exports.greeting = (req, res)=> {
    const userid = req.cookies.userid
    const username = req.session.username
  res.render('greeting', {
    message: 'Hello esteemed programmer!',
    style: req.query.style,
    userid: userid,
    username: username
  })
  }
  
  exports.setRandomUserid = (req, res)=>{
    res.cookie('userid', (Math.random()*10000).toFixed(0))
    res.redirect('/greeting')
  }
  exports.setRandomUsername = (req, res)=>{
    req.session.username = catNames.random()
    res.redirect('/greeting')
  }

  exports.pageWithSpecials = (req, res) => {
    const specials = res.locals.special
    res.render('page-with-specials', specials)
  }

  exports.heros = (req, res, next) => {
    const universe = heros[req.params.universe]
    if(!universe) return next()
    const hero = universe[req.params.name]
    if(!hero) return next()
    res.render('heros', hero)
  }

  exports.customLayout = (req, res) => res.render('custom-layout', {layout: 'custom'})
  exports.noLayout = (req, res) => res.render('no-layout', { layout: null })
  exports.text = (req, res) => { 
      res.type('text/plain')
      res.send('this is a text test')
  }
  exports.thankyou = (req, res) => res.render('thank-you')
  exports.contactError = (req, res) => res.render('contact-error')
  //curl -X DELETE http://localhost:3000/api/tour/0
  exports.sectionTest = (req, res) => res.render('section-test')
  exports.processContact = (req, res) => {
    try {
      if(req.body.simulateError) throw new Error('error saving contact!')
      res.format({
        'text/html': () => res.redirect(303, '/thank-you'),
        'application/json': () => res.json({ success: true}),
      })
    } catch(err){
      res.format({
        'text/html': () => res.redirect(303, '/contact-error'),
        'application/json': () => res.status(500).json({
          error: 'error saving contact information'}),
      })
    }
  }