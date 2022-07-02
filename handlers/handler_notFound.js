exports.notFound = (req, res) => res.status(404).render('404')
exports.serverError = (err, req, res, next) => {
  console.error('** SERVER ERROR Jim~~ : '+ err.message, err.stack)
  res.status(500).render('error',
    {message: "Error 500, a serverError, You shouldn't have clicked that!"})
}