// src/models/Ad.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Ad extends Model {
  public id!: number;
  public adType!: string; // 'video', 'banner'
  public contentUrl!: string;
  public targetUrl!: string;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ad.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'ads',
  }
);

export default Ad;
