
const ecpay_payment = require('ecpay_aio_nodejs')

//Test Credit Card 4311-9522-2222-2222
//Valid  12/25
//Secure  222

function create_UUID(stringLen){
    var dt = new Date().getTime();
    const stringArr = ['x','y']
    let xyString = ''
    for(let i=0; i<stringLen; i++){
        const randomEle = Math.floor(Math.random()* stringArr.length)
        randomXY = stringArr[randomEle]
        xyString += randomXY
    }

    let uuid = xyString.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}


function barcode_generator(){
    var barcode ='/' + create_UUID(7)
    return barcode
}

const onTimeValue = function () {
    var date = new Date();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var mi = date.getMinutes();
    var ss = date.getSeconds();

    return [date.getFullYear(), "/" +
        (mm > 9 ? '' : '0') + mm, "/" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
};


const options = JSON.parse(process.env.ECPAY_OPTIONS)


exports.proceedPayment = (req, res) => {
    
    let base_param = {
        MerchantTradeNo: create_UUID(20), //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
        MerchantTradeDate: onTimeValue(), //ex: 2017/02/13 15:45:30
        TotalAmount: '1984',
        TradeDesc: 'testing by Jim Chang',
        ItemName: '哥吉拉玩偶一隻',
        ReturnURL: 'https://meadowlark1984.herokuapp.com/REST/ecpay/returnResult',
        // ChooseSubPayment: '',
        // OrderResultURL: 'https://meadowlark1984.herokuapp.com/REST/ecpay/orderResult',
        NeedExtraPaidInfo: 'Y',
        ClientBackURL: 'https://meadowlark1984.herokuapp.com',
        ItemURL: 'https://meadowlark1984.herokuapp.com',
        Remark: 'This is Remark',
        // HoldTradeAMT: '1',
        // StoreID: '',
        CustomField1: 'This is CustomField1',
        CustomField2: 'This is CustomField2',
        CustomField3: 'This is CustomField3',
        CustomField4: 'This is CustomField4'
        // Language: 'ENG'
    }

    let inv_params = {
        RelateNumber: create_UUID(30),  //請帶30碼uid ex: SJDFJGH24FJIL97G73653XM0VOMS4K
        CustomerID: '',  //會員編號
        CustomerIdentifier: '42845993',   //統一編號
        CustomerName: '張帥帥',
        CustomerAddr: '海奧華住宅',
        CustomerPhone: '0975661440',
        CustomerEmail: 'warrior1744@gmail.com',
        ClearanceMark: '2',
        TaxType: '1',
        CarruerType: '', //must be 3 when CustomerID is not empty
        CarruerNum: '',
        Donation: '0',
        LoveCode: '1234567',
        Print: '1', //can not be 1 when CustomerID is not empty
        InvoiceItemName: '哥吉拉玩偶|拉面|亂馬|手機|包包',
        InvoiceItemCount: '1|3|1|2|9',
        InvoiceItemWord: '個|碗|組|支|個',
        InvoiceItemPrice: '35|10|100|2000|30000',
        InvoiceItemTaxType: '1|1|1|1|1',
        InvoiceRemark: '測哥吉拉玩偶的說明|拉面的說明|亂馬的說明|手機的說明|包包的說明',
        DelayDay: '0',
        InvType: '07'
    }
    let ecpay = new ecpay_payment(options)
    let htm = ecpay.payment_client.aio_check_out_all(base_param, inv_params)
    // res.render('ecpay/payment', {layout: false, result: htm})
    res.send(htm)

}

exports.returnResult = (req, res) => {
    const body = req.body
    console.log(`received result >>> ${JSON.stringify(body)}`)
//  {
//   "AlipayID":"",
//   "AlipayTradeNo":"",
//   "amount":"1984",
//   "ATMAccBank":"",
//   "ATMAccNo":"",
//   "auth_code":"777777",
//   "card4no":"2222",
//   "card6no":"431195",
//   "CustomField1":"This is CustomField1",
//   "CustomField2":"This is CustomField2",
//   "CustomField3":"This is CustomField3",
//   "CustomField4":"This is CustomField4",
//   "eci":"0",
//   "ExecTimes":"",
//   "Frequency":"",
//   "gwsr":"12032911",
//   "MerchantID":"2000132",
//   "MerchantTradeNo":"3b81baad86ba917a3ab9",
//   "PayFrom":"",
//   "PaymentDate":"2022/06/30 11:54:55",
//   "PaymentNo":"",
//   "PaymentType":"Credit_CreditCard",
//   "PaymentTypeChargeFee":"40",
//   "PeriodAmount":"",
//   "PeriodType":"",
//   "process_date":"2022/06/30 11:54:55",
//   "red_dan":"0",
//   "red_de_amt":"0",
//   "red_ok_amt":"0",
//   "red_yet":"0",
//   "RtnCode":"1",
//   "RtnMsg":"交易成功",
//   "SimulatePaid":"0",
//   "staed":"0",
//   "stage":"0",
//   "stast":"0",
//   "StoreID":"",
//   "TenpayTradeNo":"",
//   "TotalSuccessAmount":"",
//   "TotalSuccessTimes":"",
//   "TradeAmt":"1984",
//   "TradeDate":"2022/06/30 11:53:44",
//   "TradeNo":"2206301153446220",
//   "WebATMAccBank":"",
//   "WebATMAccNo":"",
//   "WebATMBankName":"",
//   "CheckMacValue":"9C508BC0C8E19223E476240548B07C463F068BC5F72DE0A4593563A0EA6A3BBA"
//  }

}


exports.orderResult = (req, res) => {
    const body = req.body
    console.log(`received result >>> ${JSON.stringify(body)}`)
    const data = JSON.stringify(body)

    res.render('ecpay/orderResult', {result: data} )
}








