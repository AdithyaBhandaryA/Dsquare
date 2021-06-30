
const logger = require("../../utilities/logger");
const { INTERNALERROR, SUCCESS, NOTMATCHING, CREATED, FORBIDDEN, INVALIDID, EXPIRED, FAILED, NOTFOUND } = require('../../constants/types');
const auth = require('../../utilities/auth');
const { users, Otp, user_sessions: userSessions } = require('../../model');
const bcrypt = require('bcryptjs');
const { validateMobileNumber } = require('../../utils/methods');
const { sendOTPMessage } = require('../../utils/message');

/* Method to Generate a 6 digit random otp, sent to given mobile number */
exports.generateOTP = async function (payload, accessToken) {
  const { phoneNumber, deviceId } = payload
  logger.info(`Service: Generate otp method`)
  return new Promise(async (resolve, reject) => {
    try {
      /* check for access token */
      if (accessToken !== process.env.ACCESS_TOKEN) {
        return reject({
          status: FORBIDDEN,
          message: "Invalid Access token.!"
        });
      }
      /* check for mobile number validation */
      if (!validateMobileNumber(phoneNumber)) {
        return reject({
          status: INVALIDID,
          message: "Invalid Mobile Number.!"
        });
      }
      Otp.sequelize.transaction(async (transaction) => {

        /* check for otp already exist for the given mobile number */
        let otpExist = await Otp.findOne({
          attributes: ['otp'],
          where: { phoneNumber: phoneNumber }
        });

        /* check for otp already exist and previous otp is not expired then no need to generate new otp use the existing otp */
        if (otpExist && new Date().getTime() - otpExist.createdAt < process.env.OTP_EXPIRY_IN_MILLI_SECONDS) {
          sendOTPMessage(phoneNumber, otpExist.otp);
          return resolve({
            status: CREATED,
            message: "Otp generated successfully",
            otp: otpExist.otp
          });
        }

        let newOtp = Math.floor(100000 + Math.random() * 900000);
        let sendOTP = sendOTPMessage(phoneNumber, newOtp);
        if (sendOTP) {
          if (otpExist) {
            updateOTP(phoneNumber, newOtp, transaction).then(() => {
              return resolve({
                status: CREATED,
                message: "Otp generated and updated successfully",
                otp: newOtp
              });
            }).catch((error) => {
              logger.error(`Service: Otp generation failed ${JSON.stringify(error)}`)
              console.log(error)
              return reject({
                status: FAILED,
                message: "Otp generation failed"
              });
            });
          } else {
            saveOTP(phoneNumber, newOtp, transaction).then(() => {
              return resolve({
                status: CREATED,
                message: "Otp generated successfully",
                otp: newOtp
              });
            }).catch((error) => {
              logger.error(`Service: Otp generation failed ${JSON.stringify(error)}`)
              console.log(error)
              return reject({
                status: FAILED,
                message: "Otp generation failed"
              });
            });
          }
        } else {
          return reject({
            status: INTERNALERROR,
            message: "OTP sending failed"
          });
        }
      })
    } catch (error) {
      console.log(error)
      logger.error(`Service: Error in generate otp method ${JSON.stringify(error)}`)
      reject({
        status: INTERNALERROR,
      });
    }
  });
};

/**
 * To save new OTP
 * @author Adithya Bhandary
 * @param phoneNumber, otp, transaction
 * @returns response
 * */
const saveOTP = async (phoneNumber, otp, transaction) => {
  logger.info('Inside saveOTP method');
  return Otp.create(
    {
      phoneNumber: phoneNumber,
      otp: otp,
      createdAt: new Date().getTime()
    },
    transaction
  );
};

/**
 * To update new OTP
 * @author Adithya Bhandary
 * @param phoneNumber, otp, transaction
 * @returns response
 * */
const updateOTP = async (phoneNumber, otp, transaction) => {
  logger.info('Inside updateOTP method');
  return Otp.update(
    {
      otp: otp,
      createdAt: new Date().getTime()
    },
    { where: { phoneNumber: phoneNumber } },
    transaction
  );
};

/* Method to Verify otp sent to mobile phone */
exports.verifyOTP = async function (payload, accessToken) {
  const { phoneNumber, otp, deviceId } = payload
  logger.info(`Service: Verify otp method`)
  return new Promise(async (resolve, reject) => {

    /* check for access token */
    if (accessToken !== process.env.ACCESS_TOKEN) {
      return reject({
        status: FORBIDDEN,
        message: "Invalid Access token.!"
      });
    }
    /* check for mobile number validation */
    if (!validateMobileNumber(phoneNumber)) {
      return reject({
        status: INVALIDID,
        message: "Invalid Mobile Number.!"
      });
    }
    Otp.sequelize.transaction(async (transaction) => {
      Otp.findOne({ where: { phoneNumber: phoneNumber } }).then(async (otpData) => {
        if (otpData) {
          /* otp from payload and otp in otp table against given phone number are matching or not */
          if (otpData.otp !== otp) {
            return reject({
              status: NOTMATCHING,
              message: "Wrong Otp"
            });
          }
          /* otp is expired or not */
          else if (new Date().getTime() - otpData.createdAt > process.env.OTP_EXPIRY_IN_MILLI_SECONDS) {
            return reject({
              status: EXPIRED,
              message: "Otp expired.!"
            });
          }
          else {
            const userExist = await users.findOne({ where: { phoneNumber: phoneNumber } });
            if (!userExist) {
              saveNewUser(phoneNumber, transaction).catch((error) => {
                return reject({
                  status: INTERNALERROR,
                  message: "Internal Server Error"
                });
              });
            }
            let tokenString = auth.issueToken("userModel._id", phoneNumber, "ROLE_BOTH");
            /* To Remove Bearer from token */
            sessionToken = tokenString.substr(tokenString.indexOf(' ') + 1);

            let sessionExist = await userSessions.findOne({ where: { deviceId: deviceId } });

            if (deviceId && sessionExist) {
              updateUserSession(phoneNumber, sessionToken, deviceId, transaction).then((data) => {
                return resolve({
                  status: SUCCESS,
                  message: "Correct Otp",
                  isRegistered: true,
                  token: tokenString
                });
              });
            }
            else {
              createUserSession(userExist.id, phoneNumber, sessionToken, deviceId, transaction)
                .then((data) => {
                  return resolve({
                    status: SUCCESS,
                    message: "Correct Otp",
                    isRegistered: true,
                    token: tokenString
                  });
                });
            }
          }
        } else {
          return reject({
            status: NOTFOUND,
            message: "Mobile number not found"
          });
        }
      }).catch((error) => {
        console.log(error)

        logger.error(`Service: Error in verify otp method ${JSON.stringify(error)}`)
        reject({
          status: INTERNALERROR,
          message: "Internal Server Error"
        });
      });
    });
  });
};

/**
 * To save new user
 * @author Adithya Bhandary
 * @param phoneNumber, transaction
 * @returns response
 * */
const saveNewUser = async (phoneNumber, transaction) => {
  logger.info('Inside saveOTP method');
  return users.create(
    {
      phoneNumber: phoneNumber,
      createdAt: new Date(),
      isActive: true,
      isRegistered: false
    },
    transaction
  );
};

/**
 * To create new user session
 * @author Adithya Bhandary
 * @param phoneNumber, token, deviceId, transaction
 * @returns response
 * */
const createUserSession = async (userId, phoneNumber, token, deviceId, transaction) => {
  logger.info('Inside createUserSession method');
  return userSessions.create(
    {
      userId: userId,
      phoneNumber: phoneNumber,
      token: token,
      deviceId: deviceId,
    },
    transaction
  );
};

/**
 * To update new user
 * @author Adithya Bhandary
 * @param phoneNumber, token, deviceId, transaction
 * @returns response
 * */
const updateUserSession = async (phoneNumber, token, deviceId, transaction) => {
  logger.info('Inside updateUserSession method');
  return userSessions.update(
    {
      token: token
    },
    { where: { deviceId: deviceId } },
    transaction
  );
};

// /* Method to Login */
// exports.login = (payload) => new Promise(async (resolve, reject) => {
//   try {
//     User.sequelize.transaction(async (transaction) => {
//       const userExist = await User.findOne({
//         where: { email: payload.email },
//       });
//       if (userExist) {
//         const passMatch = await bcrypt.compare(payload.password, userExist.password);
//         if (passMatch) {
//           const tokenString = auth.issueToken('userId', payload.email, payload.role);

//           /* To Remove Bearer from token */
//           const sessionToken = tokenString.substr(tokenString.indexOf(' ') + 1);
//           await userExist.update(
//             { token: sessionToken },
//             { returning: true, where: { email: payload.email } },
//           ).then(async () => { })
//           resolve({
//             status: SUCCESS,
//             message: 'Login success.',
//             token: tokenString
//           });
//         } else {
//           reject({
//             status: NOTMATCHING,
//             message: 'Wrong password.!',
//           });
//         }
//       }
//     });
//   } catch (error) {
//     reject({
//       status: INTERNALERROR,
//     });
//   }
// });