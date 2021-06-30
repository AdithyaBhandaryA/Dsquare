const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const userSessions = sequelize.define('user_sessions', {
    userSessionId: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      field: 'user_session_id'
    },
    userId: { type: DataTypes.STRING, field: 'user_id' },
    phoneNumber: { type: DataTypes.STRING, field: 'phone_number' },
    token: { type: DataTypes.STRING, field: 'token' },
    deviceId: { type: DataTypes.STRING, field: 'device_id' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
    {
      tableName: 'user_sessions',
    }

  );
  userSessions.associate = function (models) {
    // associations can be defined here
    userSessions.belongsTo(models.users, {
      foreignKey: 'userId',
      field: 'user_id',
      onDelete: 'CASCADE',
    });
  };
  return userSessions;
};