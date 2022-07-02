const products = [
    { id: 'hPc8YUbFuZM9edw4DaxwHk', name: 'Rock Climbing Expedition in Bend', price: 239.95, requiresWaiver: true },
    { id: 'eyryDtCCu9UUcqe9XgjbRk', name: 'Walking Tour of Portland', price: 89.95 },
    { id: '6oC1Akf6EbcxWZXHQYNFwx', name: 'Manzanita Surf Expedition', price: 159.95, maxGuests: 4 },
    { id: 'w6wTWMx39zcBiTdpM9w5J7', name: 'Wine Tasting in the Willamette Valley', price: 229.95 },
  ]

  async function getSpecialsFromDatabase(){ 
    return{ name: 'Sony 7.1 surround stereo system', price: '$39,990', brand: 'Sony'}
  } 

  const fortuneCookies = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple.",
    "The things you afraid to do is the most "
  ];

module.exports = {

    getProducts(req, res, next){
    res.locals.products = products
    next()
    },

    getProductsById(req, res, next){
        const productsById = products.reduce((byId, p) => {
        return Object.assign(byId, { [p.id]: p })//assign target { [p.id]: p } to source byId
      }, {})
      res.locals.productsById = productsById
      next()
    },

    async specials(req, res, next){
      res.locals.special = await getSpecialsFromDatabase()
      next()
    },

    heros : {
      marvel:{
              ironman: { name: "tony stark", bio: 'man in the iron and have lots of weapons.' },
              thor: { name: "thor odinson", bio: 'The son of Odin, thunder god processed the power of mojonir.' },
              hulk: { name: "bruce banner", bio: 'A green, buffed, and powerful monster.' },
            },
      dc:{
          superman: { name: "clark kent", bio: 'an alien with human form sent from the home planet Kryton in another space to avoid the destruction'},
          batman: { name: "bruce wayne", bio: 'A super rich guy who enjoys beating bad guys during the nights'},
          wonderwoman: { name: "diana prince", bio:"The daughter of Zeus, pocessed super human power and strength and magics"},
      },
    },

    tours : [
      { id: 0, name: 'Hood River', price: 99.99 },
      { id: 1, name: 'Oregon Coast', price: 149.95 },
    ],

    VALID_EMAIL_REGEX : new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
    '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
    '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'),

    getMonthName(month){
        const names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
      return names[month+1]
    },

    getMonthNameVersion2: ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"],
    secret : String(Math.random()),

    getFortune() {
      const idx = Math.floor(Math.random()*fortuneCookies.length);
      return fortuneCookies[idx];
    }
}