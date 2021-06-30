const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const userSessionsHistory = sequelize.define('user_sessions_history', {
    userSessionsHistoryId: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      field: 'user_sessions_history_id'
    },
    userId: { type: DataTypes.STRING, field: 'user_id' },
    phoneNumber: { type: DataTypes.STRING, field: 'phone_number' },
    sessionId: { type: DataTypes.STRING, field: 'session_id' },
    ip: { type: DataTypes.STRING, field: 'ip' },
    userAgent: { type: DataTypes.STRING, field: 'user_agent' },
    platform: { type: DataTypes.STRING, field: 'platform' },
    platformVersion: { type: DataTypes.STRING, field: 'platform_version' },
    loginTime: { type: DataTypes.DATE, field: 'login_time' },
    device: { type: DataTypes.STRING, field: 'device' },
    logoutTime: { type: DataTypes.DATE, field: 'logout_time' },
    logoutType: { type: DataTypes.STRING, field: 'logout_type' },
    createdBy: { type: DataTypes.STRING, field: 'created_by' },
    updatedBy: { type: DataTypes.STRING, field: 'updated_by' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
    {
      tableName: 'user_sessions_history',
    }
  );
  userSessionsHistory.associate = function (models) {
    // associations can be defined here
    userSessionsHistory.belongsTo(models.users, {
      foreignKey: 'userId',
      field: 'user_id',
      onDelete: 'CASCADE',
    });
  };
  return userSessionsHistory;
};