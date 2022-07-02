const data = require('../lib/data.js')

exports.newsletterSignup = (req, res) => {
    res.render('newsletter/newsletter-signup')
  }
exports.newsletter = (req, res) => { res.render('newsletter/newsletter')}
  
exports.newsletterSignupProcess = (req, res) => { //when the request is sent, you see this page by its action, then redirect
    const name = req.body.name || '', email = req.body.email || ''
    if(!data.VALID_EMAIL_REGEX.test(email)){  //input validation
      req.session.flash = {
        type: 'danger', intro: 'Validation error!', message: 'The email address you entered was not valid.',
      }
      return res.redirect(303, '/newsletter-signup')
    }
    class NewsletterSignup {  //fake "newsletter signup" interface
      constructor({ name, email}) {
        this.name = name
        this.email = email
      }
      async save() {
        let msg = 'data saved sucessfully Jim!' // here's where we would do the work of saving to a database
        return msg
      }
    }
    new NewsletterSignup({ name, email }).save()
      .then(() => {
        req.session.flash = {
          type: 'success', intro: 'Thank you! Jim (a flash message)', message: 'You have now been signed up for the newsletter.',
        }
        return res.redirect(303, '/newsletter-archive')
      })
      .catch(err => {
        req.session.flash = {
          type: 'danger', intro: 'Database error!', message: 'There was a database error; please try again later.',
        }
        return res.redirect(303, '/newsletter-archive')
      })
    // res.redirect(303, './newsletter-signup-thank-you')
}
exports.newsletterSignupThankYou = (req, res) => res.render('newsletter/newsletter-signup-thank-you')
exports.newsletterArchive = (req, res) => res.render('newsletter/newsletter-archive')
exports.api = { //when the newsletter is sent using the fetch() with the url, mothod, body and the headers
    newsletterSignup: (req, res) => {
      res.send({result: 'Success Jim Chang!'})
    }
}

  