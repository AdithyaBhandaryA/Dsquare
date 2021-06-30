/* eslint-disable func-names */
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    'users',
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      userName: { type: DataTypes.STRING, field: 'user_name' },
      firstName: { type: DataTypes.STRING, field: 'first_name' },
      lastName: { type: DataTypes.STRING, field: 'last_name' },
      age: { type: DataTypes.INTEGER, field: 'age' },
      phoneNumber: { type: DataTypes.STRING, field: 'phone_number' },
      password: {type: DataTypes.STRING, field: 'password'},
      isActive: { type: DataTypes.BOOLEAN, field: 'is_active' },
      isRegistered: {type: DataTypes.BOOLEAN, field: 'is_registered'},
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
    },
    {
      tableName: 'users',
    }
  );
  return users;
};

