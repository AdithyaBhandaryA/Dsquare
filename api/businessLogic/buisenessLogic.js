const UserService = require('../services/userService');
const logger = require('../../utilities/logger');

/* Method to Generate a 6 digit random otp sent to given mobile number */
exports.generateOTP = (payload, accessToken) => UserService.generateOTP(payload, accessToken);

/* Method to Verify otp sent to mobile phone */
exports.verifyOTP = (payload, accessToken) => UserService.verifyOTP(payload, accessToken);

// /* Method to login */
// exports.login = function (payload) {
//   logger.info(`Business Logic: Login method`)
//   return new Promise((resolve, reject) => UserService.login(payload)
//     .then((response) => {
//       resolve(response);
//     })
//     .catch((error) => {
//       logger.info(`Business Logic: Error in Login method ${error}`)
//       reject(error);
//     }));
// };
