
exports.account = {
    
    account: (req, res) => {
        if(!req.user)
        return res.redirect(303, '/unauthorized')
        res.render('account', { username: req.user.name })
    },
    orderHistory: (req, res) => {
        res.render('account/order-history')
    },
    emailPrefs: (req, res) => {
        res.render('account/email-prefs')
    },
}

exports.sales = (req, res) => {
    res.render('sales')
}

exports.unauthorized = (req, res) => {
    res.status(403).render('unauthorized')
}

exports.logout = (req, res) => {
    req.logout()
    res.redirect('/')
}