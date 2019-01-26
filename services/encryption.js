var crypto = require('crypto')
var {algorithm, key, iv} = require('../config/encryption-cfg')

function encrypt(text){
  const bufferedKey = Buffer.from(key, 'hex');
  const bufferedIv  = Buffer.from(iv, 'hex');
  var cipher = crypto.createCipheriv(algorithm, bufferedKey, bufferedIv)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex')
  return crypted
}
 
function decrypt(text){
  const bufferedKey = Buffer.from(key, 'hex');
  const bufferedIv  = Buffer.from(iv, 'hex');
  var decipher = crypto.createDecipheriv(algorithm,bufferedKey, bufferedIv)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8')
  return dec;
}

module.exports.encrypt = encrypt
module.exports.decrypt = decrypt