const sgMail = require('@sendgrid/mail')
const Env = use('Env')
sendGridApiKey = Env.get('SEND_GRID_API_KEY')
sgMail.setApiKey(sendGridApiKey)

module.exports = { sgMail }