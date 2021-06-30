/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const logger = require('../utils/logger');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line import/no-dynamic-require
const config = require(`${__dirname}/../config/config.json`)[env];

// set environment variables
Object.keys(config).forEach((key) => {
  process.env[key] = config[key];
});

const db = {};
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
    {
      dialectOptions: {
        requestTimeout: 30000,
        connectTimeout: 60000
      },
      pool: {
        max: 10,
        min: 0,
        idle: 10000
      }
    }
  );
  sequelize
    .authenticate()
    .then(() => {
      logger.info(`Environment: ${env}`);
      logger.info('Connection has been established successfully.');
    })
    .catch((err) => {
      logger.info(err);
    });
}

fs.readdirSync(__dirname)
  .filter(
    file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js',
  )
  .forEach((file) => {
   // const model = sequelize.import(path.join(__dirname, file));
   const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)

    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
