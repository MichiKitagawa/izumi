// server/src/models/AIUsageHistory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class AIUsageHistory extends Model {
  public id!: number;
  public userId!: number;
  public feature!: string;
  public usageCount!: number;
  public resetDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIUsageHistory.init(
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
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    feature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    resetDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_usage_histories',
  }
);


export default AIUsageHistory;
