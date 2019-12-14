const sgMail = require('@sendgrid/mail');
sendGridApiKey = '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'
sgMail.setApiKey(sendGridApiKey)

module.exports = { sgMail }