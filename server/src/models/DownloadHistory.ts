// src/models/DownloadHistory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class DownloadHistory extends Model {
  public id!: number;
  public userId!: number;
  public productId!: number | null;
  public versionId!: number | null;
  public downloadDate!: Date;
  public duration!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 関連プロパティの宣言（オプション）
  public user?: any; // 型を適宜修正
  public product?: any;
  public version?: any;
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
        model: 'users', // テーブル名
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    versionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'product_versions',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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

export default DownloadHistory;
