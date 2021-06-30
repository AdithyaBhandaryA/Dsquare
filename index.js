//const connection = require("./model/mongoose");
const app = require('express')();
const http = require('http');
const path = require("path");
const swaggerTools = require('swagger-tools');
const YAML = require('yamljs');
// cross origin resource sharing
const cors = require('cors');
const auth = require("./utilities/auth");
// security issue fix
const helmet = require('helmet');

app.use(helmet()); 
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self' 'unsafe-inline'"],
  },
}));
 
app.use(cors());
module.exports = app;

const swaggerConfig = YAML.load('./api/swagger.yaml');
// production protocol https
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
  swaggerConfig.schemes = ['https'];
}
// swaggerRouter configuration
const options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './api/controllers'),
  useStubs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
};

const serverPort = process.env.PORT || 3000;

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerConfig, (middleware) => {
    // Interpret Swagger resources and attach metadata to request -
    // must be first in swagger-tools middleware chain 
    app.use('/', middleware.swaggerMetadata());

    app.use(
      middleware.swaggerSecurity({
        // manage token function in the 'auth' module
        Bearer: auth.verifyToken,
      }),
    );
  
    // Validate Swagger requests
    app.use('/', middleware.swaggerValidator());
  
    // Route validated requests to appropriate controller
    app.use('/', middleware.swaggerRouter(options));
  
    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());
    app.use('/ranking/api', middleware.swaggerUi());
  
    // Start the server
    http.createServer(app).listen(serverPort, () => {
      console.log(
        'Your server is listening on port %d (http://localhost:%d)',
        serverPort,
        serverPort,
      );
      console.log(
        'Swagger-ui is available on http://localhost:%d/docs',
        serverPort,
      );
    });
  });
  