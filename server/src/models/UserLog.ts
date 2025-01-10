// src/models/UserLog.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class UserLog extends Model {
  public id!: number;
  public userId!: number;
  public action!: string; // 'login', 'logout', 'view_product', etc.
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_logs',
  }
);

User.hasMany(UserLog, { foreignKey: 'userId', as: 'logs' });
UserLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default UserLog;
