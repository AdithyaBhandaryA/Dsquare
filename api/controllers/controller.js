/**
 * @author Adithya Bhandary
 * @email adithya083@gmail.com
 * @create date 2021-06-27 
 * @desc [ controller that contains functions to perform various api actons ]
 */
var utils = require("../../utilities/writer");
var logger = require("../../utilities/logger");
const businesslogic = require("../businessLogic/buisenessLogic");
const { INTERNALERROR } = require('../../utilities/constants/types');


/* Method to Generate a 6 digit random otp sent to given mobile number */
module.exports.generateOTP = function generateOTP(req, res) {
  logger.info(`Controller: Inside generate otp method`)
  businesslogic.generateOTP(req.swagger.params.body.value, req.headers.accesstoken).then((respo) => {
    utils.writeJson(res, respo, respo.status);
  })
    .catch((error) => {
      logger.error(`Controller: Error in Generate otp method  ${JSON.stringify(error)}`)
      utils.writeJson(res, error, (error.status || INTERNALERROR));
    });
};


/* Method to Verify otp sent to mobile phone */
module.exports.verifyOTP = function verifyOTP(req, res) {
  logger.info(`Controller: Inside verify otp method`)
  businesslogic.verifyOTP(req.swagger.params.body.value, req.headers.accesstoken).then((respo) => {
    utils.writeJson(res, respo, respo.status);
  })
    .catch((error) => {
      logger.error(`Controller: Error in Verify otp method  ${JSON.stringify(error)}`)
      utils.writeJson(res, error, (error.status || INTERNALERROR));
    });
};

// /* Method to Login */
// module.exports.login = function login(req, res) {
//   logger.info(`Controller: Login method`)
//   businesslogic.login(req.swagger.params.body.value).then((respo) => {
//     utils.writeJson(res, respo, respo.status);
//   })
//     .catch((error) => {
//       logger.info(`Controller: Error in Login method  ${JSON.stringify(error)}`)
//       utils.writeJson(res, error, (error.status || INTERNALERROR));
//     });
// };
