// server/src/index.ts
import 'module-alias/register';
import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth'; // Auth ルートのインポート
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// フロントエンドのURLを環境変数から取得（推奨）
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORSの設定
app.use(cors({
  origin: FRONTEND_URL, // フロントエンドのURLに合わせて調整
  credentials: true,
}));

app.use(express.json());

// ルートのマウント
app.use('/api/auth', authRoutes);

// 基本ルートの定義
app.get('/', (req, res) => {
  res.send('Hello izumi!');
});

// データベースの認証
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

export default app;
