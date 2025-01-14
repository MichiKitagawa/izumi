// src/models/User.ts
import { DataTypes, Model, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public profileImage!: string;
  public role!: string; // 'subscriber', 'provider', 'admin'
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getProducts!: HasManyGetAssociationsMixin<Product>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.TEXT, // STRINGからTEXTに変更
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'subscriber',
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

User.hasMany(Product, { foreignKey: 'providerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

export default User;
