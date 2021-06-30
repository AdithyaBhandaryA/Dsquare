const requestWithPromise = require('request-promise');

const restAPICall = (options) => requestWithPromise(options);

module.exports = {
  restAPICall,
};
