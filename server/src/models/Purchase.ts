// src/models/Purchase.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Product from './Product';

class Purchase extends Model {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public status!: string; // 'pending', 'completed', 'failed'
  public transactionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Purchase.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'purchases',
  }
);

User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Product.hasMany(Purchase, { foreignKey: 'productId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Purchase.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default Purchase;
