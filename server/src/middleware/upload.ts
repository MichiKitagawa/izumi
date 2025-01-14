// server/src/middleware/upload.ts
import multer from 'multer';

// メモリストレージを使用
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
