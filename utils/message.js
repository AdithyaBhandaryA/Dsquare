const restCall = require('./restCalls');
var config = require("../config/config.json");

exports.sendOTPMessage = async (mobileNumber, otp) => {
  return new Promise(async (resolve, reject) => {
    const sendOTP = {
      method: 'POST',
      url: config.development.MSG_SERVICE_URL,
      headers: {
        'content-type': 'application/json',
        'authkey': config.development.MSG_SERVICE_AUTH_KEY,
      },
      body: {
        "flow_id": config.development.MSG_SERVICE_FLOWID,
        "sender": config.development.MSG_SERVICE_SENDER,
        "recipients": [
          {
            "mobiles": `91${mobileNumber}`,
            "OTP": otp
          }
        ]
      },
      timeout: process.env.MSG_SERVICE_CALL_EXPIRY,
      json: true,
    };
    restCall.restAPICall(sendOTP).then((data) => {
      resolve(data)
    }).catch((error) => {
      resolve(error)
    })
  })
}