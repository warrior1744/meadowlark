const data = require('../lib/data.js')
const emailService = require('../lib/email')//chapter11


exports.checkout = (req, res) => {
    res.render('checkout')
  }

  
  exports.mycart = {

     checkout : (req, res, next) => {
        const cart = req.session.cart
        if(!cart){
          next(new Error('Cart does not exist.'))
        }
        const name = req.body.name || ''
        const email = req.body.email || ''
        if(!email.match(data.VALID_EMAIL_REGEX)) //input validation
          return res.next(new Error('Invalid email address Jim!'))
          // assign a random cart ID; normally we would use a database ID here
          cart.number = Math.random().toString().replace(/^0\.0*/, '')
          cart.billing = {
            name: name,
            email: email,
          }
          res.render('email/cart-thank-you', { layout: null, cart: cart},
          (err, html) => {
            if(err) console.log('error in email template')
           emailService.send(email, "Hood River tours on sale today!", html)
              .then(info => {
                console.log('The email has been sent Jim!', info)
                res.render('cart-thank-you', { cart: cart })
              })
              .catch(err => {
                console.error('Unable to send confirmation: ' + err.message)
              })
          })
      },

     add : (req, res) => {
        if(!req.session.cart) req.session.cart = { items: [] }
        const { cart } = req.session
        Object.keys(req.body).forEach(key => { //iterate the keys of the JSON object
          if(!key.startsWith('guests-')) return
          const productId = key.split('-')[1] //separate guests- and the id
          const product = res.locals.productsById[productId]
          const guests = Number(req.body[key])
          if(guests === 0) return // no guests to add
          if(!cart.items.some(item => item.product.id === productId)) cart.items.push({ product, guests: 0 })
          const idx = cart.items.findIndex(item => item.product.id === productId)
          const item = cart.items[idx]
          item.guests += guests
          if(item.guests < 0) item.guests = 0
          if(item.guests === 0) cart.items.splice(idx, 1)
        })
        res.redirect('/')
      },


  }