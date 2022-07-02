module.exports = (req, res, next) => {
    // if there's a flash message, transfer
	// it to the context, then clear it
    res.locals.flash = req.session.flash
    delete req.session.flash //delete is an operater in ECMAScript. It can be used to remove object properties
    next()
}