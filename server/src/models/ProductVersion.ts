// src/models/ProductVersion.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Product } from './index';

interface ProductVersionAttributes {
  id: number;
  productId: number;
  dataType: string;       // "video" | "audio" | "text"
  languageCode: string;   // "ja", "en", etc.
  fileUrl: string | null; // 動画・音声の場合の URL
  fileType: string | null; // "mp4", "mp3", "pdf" など
  htmlContent: string | null; // テキストの場合の HTML
  isOriginal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductVersionCreationAttributes extends Optional<ProductVersionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isOriginal'> {}

class ProductVersion extends Model<ProductVersionAttributes, ProductVersionCreationAttributes> implements ProductVersionAttributes {
  public id!: number;
  public productId!: number;
  public dataType!: string;
  public languageCode!: string;
  public fileUrl!: string | null;
  public fileType!: string | null;
  public htmlContent!: string | null;
  public isOriginal!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public product?: Product;
}

ProductVersion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    dataType: {
      type: DataTypes.STRING(10), // "video", "audio", "text"
      allowNull: false,
    },
    languageCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileType: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isOriginal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'product_versions',
  }
);

export default ProductVersion;
