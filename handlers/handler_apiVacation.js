const data = require('../lib/data')
const mongodb = require('../mongodb')//chapter13

exports.getVacationsApi = async (req, res) => {
    const vacations = await mongodb.getVacations({ available: true})
    res.json(vacations)
}

exports.getVacationBySkuApi = async (req, res) => {
    const vacation = await mongodb.getVacationBySku(req.params.sku)
    res.json(vacation)
}

exports.addVacationInSeasonListenerApi = async (req, res) => {
    await mongodb.addVacationInSeasonListener(req.params.sku, req.body.email)
    res.json({ message: 'success'})
}

exports.requestDeleteVacationApi = async (req, res) => {
    const { email, notes } = req.body
    res.status(500).json( { message: 'not yet implemented'})
}