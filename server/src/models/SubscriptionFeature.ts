// server/src/models/SubscriptionFeature.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SubscriptionFeature extends Model {
  public id!: number;
  public plan!: string;
  public feature!: string;
  public value!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SubscriptionFeature.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'subscription_features',
  }
);

export default SubscriptionFeature;
