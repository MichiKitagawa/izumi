// src/models/Product.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import ProductVersion from './ProductVersion';
import DownloadHistory from './DownloadHistory';

class Product extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public category!: string;
  public fileUrl!: string;
  public thumbnailUrl!: string | null;
  public htmlContent!: string | null;
  public fileType!: string; // PDF, MP4, MP3
  public fileSize!: number; // in bytes
  public providerId!: number;
  public versionstatus!: string; // 'original'

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 関連プロパティの宣言
  public versions?: ProductVersion[];
  public downloadHistories?: DownloadHistory[];
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    versionstatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'original',
    },
  },
  {
    sequelize,
    tableName: 'products',
  }
);

export default Product;
