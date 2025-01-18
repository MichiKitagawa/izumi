import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';

// 定義: Translationの属性
interface TranslationAttributes {
  id: number;
  productId: number;
  languageCode: string;
  translatedTitle: string;
  translatedDescription: string;
  translatedHtmlContent: string | null; // 新しく追加
  createdAt?: Date;
  updatedAt?: Date;
}

// IDとtranslatedHtmlContentはOptionalとして定義
interface TranslationCreationAttributes extends Optional<TranslationAttributes, 'id' | 'translatedHtmlContent'> {}

class Translation extends Model<TranslationAttributes, TranslationCreationAttributes> {
  public id!: number;
  public productId!: number;
  public languageCode!: string;
  public translatedTitle!: string;
  public translatedDescription!: string;
  public translatedHtmlContent!: string | null; // 新しく追加
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// モデル初期化
Translation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
      onDelete: 'CASCADE', // Productが削除されたら関連するTranslationも削除
    },
    languageCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    translatedTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    translatedDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    translatedHtmlContent: { // 新しく追加
      type: DataTypes.TEXT,
      allowNull: true, // 必須ではないため
    },
  },
  {
    sequelize,
    tableName: 'translations',
  }
);

// Productモデルとのリレーション
Product.hasMany(Translation, {
  foreignKey: 'productId',
  as: 'translations',
});
Translation.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

export default Translation;
