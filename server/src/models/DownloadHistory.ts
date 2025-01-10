//src/models/DownloadHistory.ts
// src/models/DownloadHistory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Product from './Product';

class DownloadHistory extends Model {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public downloadDate!: Date;
  public duration!: number; // ダウンロード時間（秒など）
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DownloadHistory.init(
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
    downloadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'download_histories',
  }
);

User.hasMany(DownloadHistory, { foreignKey: 'userId', as: 'downloadHistories' });
Product.hasMany(DownloadHistory, { foreignKey: 'productId', as: 'downloadHistories' });
DownloadHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DownloadHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default DownloadHistory;
