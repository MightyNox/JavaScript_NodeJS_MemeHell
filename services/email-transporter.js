const nodemailer = require('nodemailer')
const email = require('../config/email-transporter-cfg')

const transporter = nodemailer.createTransport({
    host: email.host,
    auth: {
      user: email.name,
      pass: email.passwd
    },
    tls: {rejectUnauthorized: false},
  }, {
    from: email.customName +" "+ email.name
  });

  module.exports = transporter
