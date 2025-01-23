// server/src/index.ts 
import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth'; // Auth ルートのインポート
import profileRoutes from './routes/profile'; // 追加
import cors from 'cors';
import './models'; 
import dotenv from 'dotenv';
import adminRoutes from './routes/admin';
import productRoutes from './routes/product';
import subscriptionRoutes from './routes/subscription';
import aiRoutes from './routes/ai';
import downloadRoutes from './routes/download';
import adRoutes from './routes/ad';
import helmet from 'helmet';

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
app.use(helmet());

// ルートのマウント
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // 追加
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/ad', adRoutes);

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
