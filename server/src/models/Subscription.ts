import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Subscription extends Model {
  public id!: number;
  public userId!: number;
  public plan!: string; // 'Basic', 'Pro', 'Premium'
  public status!: string; // 'active', 'canceled'
  public startDate!: Date;
  public endDate!: Date | null;
  public stripeSubscriptionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
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
        model: 'users', // テーブル名
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
  }
);

export default Subscription;
