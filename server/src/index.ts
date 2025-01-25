// server/src/index.ts 
import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
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
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

// フロントエンドのURLを環境変数から取得
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORSの設定
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(helmet());

// Webhookエンドポイントの設定
app.use('/api/webhook', bodyParser.raw({ type: 'application/json' }));

// ルートのマウント
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
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
