const nodemailer = require('nodemailer')
const htmlToFormattedText = require('html-to-formatted-text')

module.exports = () => {

    const mailTransport = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        auth:{
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
        },
    })

    const from = '"Jim Chang" <jim.chang@plaza-network.com>'
    const errorRecipient = 'warrior1744@gmail.com'

    return {
        send: (to, subject, html) =>
            mailTransport.sendMail({
                from,
                to,
                subject,
                html,
                text: htmlToFormattedText(html),
                attachments: [{
                    filename: 'log.png',
                    path:'./public/img/logo.png',
                    cid:'123456789@cid'

                }],
            }),
    }

}