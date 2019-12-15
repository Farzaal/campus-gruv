const sgMail = require('@sendgrid/mail');
sendGridApiKey = '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'
sgMail.setApiKey(sendGridApiKey)

module.exports = { sgMail }