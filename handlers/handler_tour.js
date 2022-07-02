
const { tours } = require('../lib/data')


exports.tours = (req, res) => {
    const toursXml = '<?xml version="1.0"?><tours>' + 
    tours.map(p => `<tour price="${p.price}" id="${p.id}">${p.name}</tour>`
    ).join('')+'</tours>'
    const toursText = tours.map(p =>
      `${p.id}: ${p.name} (${p.price})`
      ).join('\n')
    res.format({
      'application/json': () => res.json(tours),
      'application/xml': () => res.type('application/xml').send(toursXml),
      'text/xml': () => res.type('text/xml').send(toursXml),
      'text/plain': () => res.type('text/plain').send(toursXml)
    })
  }
  exports.putTour = (req, res) => {
    const p = tours.find(p => p.id === parseInt(req.params.id))
    if(!p) return res.status(410).json({ error: 'No such tour exists' })
    if(req.body.name) p.name = req.body.name
    if(req.body.price) p.price = req.body.price
    res.json({ success: true })
  }
  //curl -X PUT http://localhost:3000/api/tour/0 -d price=129.99
  //curl -H 'Content-Type: application/json' -X PUT -d '{'price': 139.99}' http://localhost:3000/api/tour/0
  exports.deleteTour = (req, res) => {
    const idx = tours.findIndex(tour => tour.id === parseInt(req.params.id))
    if(idx < 0) return res.json({error: 'No such tour exists.'})
    tours.splice(idx, 1)
    res.json({success: true})
  }