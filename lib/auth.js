const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const db = require('../mongodb')

//serializeUser determines which data of the user object should be stored in the session
//The result of the serializeUser method is attached to the session as
//req.session.passport.user = {}  //https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser((user, done) => {
    done(null, user._id)
})

//the first argument of deserializeUser (id) corresponds to the key of the user
//object that was given to the done function (done(null, user._id)) of serializeUser
passport.deserializeUser((id, done) => {
    db.getUserById(id)
    .then(user => {
        return done(null, user)
    })
    .catch(err => done(err, null))
})

module.exports = (app, options) => {
    if(!options.successRedirect) options.successRedirect = '/account'
    if(!options.failureRedirect) options.failureRedirect = '/login'
    return {
        init: function() {
            // var config = options.providers
            //configure Facebook strategy https://www.passportjs.org/packages/passport-facebook/
            passport.use(new FacebookStrategy({
                clientID: process.env.FACEBOOK_APPID,
                clientSecret: process.env.FACEBOOK_APPSECRET,
                callbackURL: (options.baseUrl || '')+ '/auth/facebook/callback',
            }, (accessToken, refreshToken, profile, done) => {
                const authId = 'facebook: '+profile.id
                db.getUserByAuthId(authId)
                    .then(user => {
                        if(user) return done(null, user)
                        db.addUser({
                            authId: authId,
                            name: profile.displayName,
                            created: new Date(),
                            role: 'customer',
                        })
                            .then(user => done(null, user))
                            .catch(err => done(err, null))
                    })
                    .catch(err => {
                        console.log('Whoops, there was an error authenticating with Facebook: ', err.message)
                        if(err) return done(err, null);
                    })
            }))
            // configure Google strategy
            passport.use(new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENTID,
                clientSecret: process.env.GOOGLE_CLIENTSECRET,
                callbackURL: (options.baseUrl || '')+ '/auth/google/callback',
            }, (token, tokenSecret, profile, done) => {
                const authId = 'google: '+ profile.id
                db.getUserByAuthId(authId)
                    .then(user => {
                        if(user) return done(null, user)
                        db.addUser({
                            authId: authId,
                            name: profile.displayName,
                            created: new Date(),
                            role: 'customer',
                        })
                            .then(user => done(null, user))
                            .catch(err => done(err, null))
                    })
                    .catch(err => {
                        console.log('Whoops, there was an error authenticating with Google: ', err.message)
                        if(err) return done(err, null);
                    })
            }))
            //configure Twitter Strategy
            passport.use(new TwitterStrategy({
                consumerKey: process.env.TWITTER_APIKEY,
                consumerSecret: process.env.TWITTER_APIKEYSECRET,
                callbackURL: (options.baseUrl || '')+ '/auth/twitter/callback',
            },(token, tokenSecret, profile, done) => {
               const authId = 'twitter: '+ profile.id
               db.getUserByAuthId(authId)
                    .then(user => {
                        if(user) return done(null, user)
                        db.addUser({
                            authId: authId,
                            name: profile.displayName,
                            created: new Date(),
                            role: 'customer',
                        })
                            .then(user => done(null, user))
                            .catch(err => done(err, null))
                    })
                    .catch(err => {
                        console.log('Whoops, there was an error authenticating with Twitter: ', err.message)
                        if(err) return done(err, null)
                    })
            }))
            //configure LinkedIn Strategy
            passport.use(new LinkedInStrategy({
                clientID: process.env.LINKEDIN_CLIENTID,
                clientSecret: process.env.LINKEDIN_CLIENTSECRET,
                callbackURL: (options.baseUrl || '')+ '/auth/linkedin/callback',
                scope: ['r_emailaddress', 'r_liteprofile'],
            },(accessToken, refreshToken, profile, done) => {
                const authId = 'linkedin: '+ profile.id
                db.getUserByAuthId(authId)
                .then(user => {
                    if(user) return done(null, user)
                    db.addUser({
                        authId: authId,
                        name: profile.displayName,
                        created: new Date(),
                        role: 'customer',
                    })
                        .then(user => done(null, user))
                        .catch(err => done(err, null))
                })
                .catch(err => {
                    console.log('Whoops, there was an error authenticating with LinkedIn: ', err.message)
                    if(err) return done(err, null)
                })
            }))

            app.use(passport.initialize())
            app.use(passport.session())
        },
        registerRoutes: () => {
            app.get('/auth/facebook', (req, res, next) => {
                if(req.query.redirect) req.session.authRedirect = req.query.redirect
                passport.authenticate('facebook')(req, res, next)
            })
            app.get('/auth/facebook/callback', passport.authenticate('facebook',  //https://www.passportjs.org/concepts/authentication/middleware/
                { failureRedirect: options.failureRedirect}),
                (req, res) => {
                    const redirect = req.session.authRedirect
                    console.log(`redirecting to >>> ${redirect}`)
                    if(redirect) delete req.session.authRedirect
                    res.redirect(303, redirect || options.successRedirect)
            })
            app.get('/auth/google', (req, res, next) => {
                if(req.query.redirect) req.session.authRedirect = req.query.redirect
                 passport.authenticate('google', { scope: ['profile'] })(req, res, next)
            })
            app.get('/auth/google/callback', passport.authenticate('google',
                { failureRedirect: options.failureRedirect}),
                (req, res) => {
                    const redirect = req.session.authRedirect
                    console.log(`redirecting to >>> ${redirect}`)
                    if(redirect) delete req.session.authRedirect
                    res.redirect(303, req.query.redirect || options.successRedirect)
            })
            app.get('/auth/twitter', (req, res, next) => {
                if(req.query.redirect) req.session.authRedirect = req.query.redirect
                passport.authenticate('twitter')(req, res, next)
            })
            app.get('/auth/twitter/callback', passport.authenticate('twitter',
                { failureRedirect: options.failureRedirect}),
                (req, res) => {
                    const redirect = req.session.authRedirect
                    console.log(`redirecting to >>> ${redirect}`)
                    if(redirect) delete req.session.authRedirect
                    res.redirect(303, req.query.redirect || options.successRedirect)
            })
            app.get('/auth/linkedin', (req, res, next) => {
                if(req.query.redirect) req.session.authRedirect = req.query.redirect
                passport.authenticate('linkedin', {state: ''})(req, res, next)
            })
            app.get('/auth/linkedin/callback', passport.authenticate('linkedin',
                { successRedirect: options.successRedirect, failureRedirect: options.failureRedirect}),
                (req, res) => {
                    const redirect = req.session.authRedirect
                    console.log(`redirecting to >>> ${redirect}`)
                    if(redirect) delete req.session.authRedirect
                    res.redirect(303, req.query.redirect || options.successRedirect)
            })
        },
    }
}