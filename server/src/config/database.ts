// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('izumi_db', 'izumi_user', 'secure_password', {
  host: 'localhost',
  dialect: 'postgres',
});

export default sequelize;
