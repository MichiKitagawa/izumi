// src/server.ts
import https from 'https';
import fs from 'fs';
import app from './index'; // 既存のExpressアプリ

const PORT = process.env.PORT || 5000;

const httpsOptions = {
  key: fs.readFileSync('path/to/your/private.key'),
  cert: fs.readFileSync('path/to/your/certificate.crt'),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Secure server is running on port ${PORT}`);
});
