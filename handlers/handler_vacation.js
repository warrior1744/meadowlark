const data = require('../lib/data')
const postgres = require('../postgres')//chapter13
const mongodb = require('../mongodb')//chapter13
 const geocode = require('../mongodb-geocode')
//chapter13
const pathUtils = require('path')
const fs = require('fs')
const dataDir = pathUtils.resolve(__dirname, '..', 'data')//
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos')
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir) //create a data folder on the root working directory
if(!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir)//create a child folder of the data folder

function saveContestEntry(contestName, email, year, month, photoPath){
//TODO
}
// we'll want these promise-based versions of fs functions later
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)

function convertFromUSD(value, currency) {
  switch(currency){
    case 'USD': return value * 1
    case 'GBP': return value * 0.79
    case 'BTC': return value * 0.000078
    default: return NaN
  }
}

function generateSku(){
  const possibleSku = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let randomSku = ""
     for (let i=0;i<5; i++){
      randomSku += possibleSku.charAt(Math.floor(Math.random() *possibleSku.length))
  }
  return randomSku
}

//Chapter08 vacation context //old school form submission
exports.vacationPhotoContest = (req, res) => {
  const now = new Date()
  res.render('contest/vacation-photo', { year: now.getFullYear(), month:data.getMonthName(now.getMonth())})
}
exports.vacationPhotoContestProcessError = (req, res, fields, files) => { //if app.post goes wrong
  res.redirect(303, '/contest/vacation-photo-error')
}
exports.vacationPhotoContestProcess = (req, res, fields, files) => { //if app.post goes ok
  res.redirect(303, '/contest/vacation-photo-thank-you')
}
//Async form submission (recommended)
exports.vacationPhotoContestAjax = (req, res) => {
  const now = new Date()
  res.render('contest/vacation-photo-ajax', { year: now.getFullYear(), month: data.getMonthName(now.getMonth())})
}
exports.api = {
  vacationPhotoContestProcessError : (req, res, message) => {
  res.send({result: 'error', error: message})
  },

  vacationPhotoContestProcess : async (req, res, fields, files) => {
    // console.log(fields)
    const photo = files.photo[0] //get the uploaded photo properties
    const dir = vacationPhotosDir + '/' +Date.now() //create child folder and rename it as current date ouput
    const path = dir + '/' +photo.originalFilename 
    const readStream = fs.createReadStream(photo.path)//read the original file path
    const writeStream = fs.createWriteStream(path) //write to the destination
    // console.log(`the photo and user data has been uploaded ->\nfields -> ${JSON.stringify(fields)}\nfiles -> ${JSON.stringify(files)}\nphoto -> ${JSON.stringify(photo)}\ndir -> ${dir}\npath -> ${path}`)
    await mkdir(dir)
    // await rename(photo.path, path)
    await readStream.pipe(writeStream)
    await readStream.on('end', () => {
      fs.unlinkSync(photo.path)
    })
    saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path)
    res.send({ result: 'success' })
  },

  addVacationProcess : async (req, res, fields) => {
    delete fields['_csrf'] //we don't need csrf data for Vacation db

    for(const property in fields){
      const stringData = (fields[property])[0] //get the string from the each array
      if(property === 'location'){
        let location = stringData
        fields['location'] = {'search': location}
        continue
      }
      fields[property] = stringData
    }
    const tagArray = (fields['tags']).split(',')
    fields.tags = tagArray //replace tags data with an array of data
    fields.isSeason = (fields.isSeason === 'true') //convert to boolean
    fields.requiresWaiver = (fields.requiresWaiver === 'true')
    fields.available = (fields.available === 'true')
    let skuValue = fields['sku']    //prevent duplicat sku
    let existSku = await mongodb.getVacations({sku: skuValue})
    let notice = ''
    while(existSku.length > 0){
      notice = 'Your Sku had been altered to '
      skuValue = generateSku()
      fields['sku'] = skuValue
      existSku = await mongodb.getVacations({sku: skuValue})
    }
    await mongodb.addVacation(fields)
    await geocode.geocodeVacation(skuValue)
    res.send({result: 'success Jim!', 'sku': skuValue ,'notice': notice} )
  }

}//end exports.api
exports.vacationPhotoContestProcessThankYou = (req, res) => {
  res.render('contest/vacation-photo-thank-you')
}

exports.setCurrency = (req, res) => {
  req.session.currency = req.params.currency
  return res.redirect(303, '/vacations')
}

exports.listVacations = async (req, res) => {
  const vacations = await mongodb.getVacations()
  const currency = req.session.currency || 'USD'
  const context = {
    currency: currency,
    vacations: vacations.map(vacation => {
      return {
        sku: vacation.sku,
        name: vacation.name,
        description: vacation.description,
        inSeason: vacation.inSeason,
        price: convertFromUSD(vacation.price, currency),
        qty: vacation.qty,
      }
    })
  }
  switch(currency){
    case 'USD': context.currencyUSD = 'selected'; break
    case 'GBP': context.currencyGBP = 'selected'; break
    case 'BTC': context.currencyBTC = 'selected'; break
  }
  res.render('vacation/vacations', context)
}

exports.setCurrency = (req, res) => {
  req.session.currency = req.params.currency
  return res.redirect(303, '/vacations')
}

exports.notifyWhenInSeasonForm = (req, res) => {
  res.render('vacation/notify-me-when-in-season', { sku: req.query.sku})
}

exports.notifyWhenInSeasonProcess = async (req, res) => {
  const { email, sku} = req.body
  await mongodb.addVacationInSeasonListener(email, sku)
  return res.redirect(303, '/vacations')
}

exports.addVacation = (req, res) => {
  res.render('vacation/vacation-add')
}

exports.manageVacations = async (req, res) => {
  const vacations = await mongodb.getVacations()
  const context = {
    vacations: vacations.map(vacation => {
      return {
        sku: vacation.sku,
        name: vacation.name,
      }
    })
  }
  res.render('vacation/manage-vacations', context)
}

exports.deleteVacation = async (req, res) => {
  const {name, sku} = req.params
  const foundVacation = await mongodb.getVacationBySku({name, sku})
  const vacation_id = foundVacation._id
  await mongodb.deleteVacation(vacation_id)
  res.redirect('/manage-vacations')
}



