/* eslint-disable no-unreachable */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-unreachable */

const jwt = require('jsonwebtoken');

const issuer = 'Yantra Tantra';
//const mongoose = require("mongoose");
//const UserModel = mongoose.model("user");
const { ROLE_BUYER, ROLE_SELLER, ROLE_BOTH, ROLE_USER } = require('../utilities/constants/stringConstants')
//var config = require('../utilities/config/config')   
const env = process.env.NODE_ENV || 'development';

// const {
//   Admin, UserSessions, MasterAdminFeature, AdminFeatureAccessConfiguration,
// } = require('../models');


// Here we setup the security checks for the endpoints
// that need it (in our case, only /protected). This
// function will be called every time a request to a protected
// endpoint is received
exports.verifyToken = function (req, authOrSecDef, token, callback) {
  // these are the scopes/roles defined for the current endpoint
  const currentScopes = req.swagger.operation['x-security-scopes'];
  function sendError() {
    // console.log('error access denied');
    return req.res.status(403);
  }

  // validate the 'Authorization' header. it should have the following format:
  // 'Bearer tokenString'
  if (token && token.indexOf('Bearer ') === 0) {
    const tokenString = token.split(' ')[1];

    jwt.verify(tokenString, process.env.sharedSecret, async (verificationError, decodedToken) => {
      // check if the JWT was verified correctly

      if (
        verificationError == null
        && Array.isArray(currentScopes)
        && decodedToken
        && decodedToken.role
      ) {
        // check if the role is valid for this endpoint
        const roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
        // check if the issuer matches
        const issuerMatch = decodedToken.iss === issuer;
        req.auth = decodedToken;

        if(decodedToken.role == ROLE_USER || decodedToken.role == ROLE_BUYER || decodedToken.role == ROLE_SELLER || decodedToken.role == ROLE_BOTH){
          return callback(null);
        }

        // const sessionData = await UserModel.findOne({
        //   attributes: ['sessionId', 'loginType', 'socialLoginToken'],
        //   where: { sessionId: tokenString },
        // });

        // you can add more verification checks for the
        // token here if necessary, such as checking if
        // the username belongs to an active user
        // if (roleMatch && issuerMatch && sessionData) {
        //   // add the token to the request so that we
        //   // can access it in the endpoint code if necessary
        //   if (decodedToken.role === 'admin') {
        //     return callback(null);
        //   }

        //   req.headers.access_token = sessionData.socialLoginToken;
        //   // if there is no error, just return null in the callback

        //   if (sessionData.sessionId
        //     && sessionData.sessionId === tokenString) {
        //     switch (sessionData.loginType) {
        //       case 'facebook':
        //         return passportFacebook.authenticate('facebook-token', (error, user) => {
        //           if (user) {
        //             return callback(null);
        //           }
        //         })(req);
        //         break;

        //       case 'linkedin':
        //         return linkedinAuth(sessionData.socialLoginToken)
        //           .then(() => callback(null))
        //           .catch(() => callback(sendError()));
        //         break;

        //       default:
        //         return callback(null);
        //         break;
        //         // return the error in the callback if there is one
        //         return callback(sendError());
        //     }
        //   }
        // }
      }
      // return the error in the callback if the JWT was not verified
      return callback(sendError());
    });
  } else {
    // return the error in the callback if the Authorization header doesn't have the correct format
    return callback(sendError());
  }
};

exports.issueToken = function (userId,email, role) {
  const token = jwt.sign(
    {
      email: email,
      uid: userId,
      iss: issuer,
      role,
    },
    process.env.sharedSecret,
  );
  return `Bearer ${token}`;
};

// Admin
// exports.issueTokenAdmin = function (username, userId, role) {
//   const token = jwt.sign(
//     {
//       sub: username,
//       uid: userId,
//       iss: issuer,
//       role,
//     },
//     process.env.sharedSecret,
//     { expiresIn: 360000 },
//   );
//   return `Bearer ${token}`;
// };

exports.getUserDetails = function (req, token) {
  const currentScopes = req.swagger.operation['x-security-scopes'];
  return new Promise((resolve, reject) => {
    if (token && token.indexOf('Bearer ') === 0) {
      const tokenString = token.split(' ')[1];
      jwt.verify(
        tokenString,
        process.env.sharedSecret,
        (verificationError, decodedToken) => {
          // check if the JWT was verified correctly
          if (
            verificationError == null
            && Array.isArray(currentScopes)
            && decodedToken
            && decodedToken.uid
            && decodedToken.role
          ) {
            resolve({
              uid: decodedToken.uid,
              role: decodedToken.role,
            });
          }
        },
      );
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('error while fetching data from token');
    }
  });
};

// /**
//  * Checks authorization for the admin
//  * for any feature
//  */
// exports.verifyAdminAuth = function (adminId, featureName, type) {
//   return new Promise(async (resolve, reject) => {
//     const superAdmin = await Admin.findOne({
//       attributes: ['id'],
//       where: {
//         userId: adminId,
//         super: 1,
//       },
//     });

//     if (!superAdmin) {
//       const adminAuthData = await AdminFeatureAccessConfiguration.findOne({
//         attributes: ['permission'],
//         include: [{
//           model: MasterAdminFeature,
//           attributes: ['name'],
//           required: false,
//         }],
//         where: {
//           '$AdminFeatureAccessConfiguration.adminId$': adminId,
//           '$MasterAdminFeature.name$': featureName,
//         },
//       });

//       if (adminAuthData && (adminAuthData.permission === 1 || adminAuthData.permission === type)) {
//         resolve();
//       } else {
//         reject(new Error('Unauthorized access'));
//       }
//     }
//     resolve();
//   });
// };
