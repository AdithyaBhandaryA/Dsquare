/* eslint-disable func-names */
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    'Otp',
    {
      otp: { type: DataTypes.STRING, field: 'otp' },
      phoneNumber: { type: DataTypes.STRING, field: 'phone_number',primaryKey: true  },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
    },
    {
      tableName: 'otp',
    }
  );
  return Otp;
};

