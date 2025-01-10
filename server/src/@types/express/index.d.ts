// src/@types/express/index.d.ts
import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { File } from 'multer';

declare module 'express-serve-static-core' {
  interface Request {
    user?: DefaultJwtPayload & {
      id: number;
      email: string;
      role: string;
    };
    file?: File;
  }
}

export {}; // モジュールとして認識させるため追加
