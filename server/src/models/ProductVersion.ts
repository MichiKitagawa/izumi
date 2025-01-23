// src/models/ProductVersion.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Product } from './index'; // models/index.ts からインポート

interface ProductVersionAttributes {
  id: number;
  productId: number;
  dataType: string;
  languageCode: string;
  versionData: object;
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
  public versionData!: object;
  public isOriginal!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 関連プロパティの宣言
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
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    languageCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    versionData: {
      type: DataTypes.JSONB,
      allowNull: false,
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
