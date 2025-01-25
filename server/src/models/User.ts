import { DataTypes, Model, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';
import DownloadHistory from './DownloadHistory';
import Subscription from './Subscription';

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public profileImage!: string;
  public role!: string; // 'subscriber', 'provider', 'admin'
  public stripeCustomerId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getProducts!: HasManyGetAssociationsMixin<Product>;
  public downloadHistories?: DownloadHistory[];
  public subscription?: Subscription;
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'subscriber',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
