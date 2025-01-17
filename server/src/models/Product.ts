// src/models/Product.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Product extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public category!: string;
  public fileUrl!: string;
  public thumbnailUrl!: string
  public fileType!: string; // PDF, MP4, MP3
  public fileSize!: number; // in bytes
  public providerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
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
    },
  },
  {
    sequelize,
    tableName: 'products',
  }
);

export default Product;
