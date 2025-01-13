// server/src/server.ts
import app from './index'; // Expressアプリケーションのインポート
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// HTTP サーバーの起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
