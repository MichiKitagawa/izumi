// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from 'jsonwebtoken';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader); // 追加
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  console.log('Extracted Token:', token); // 追加
  
  if (!token) {
    res.status(401).json({ message: 'No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Failed to authenticate token.' });
      return;
    }

    (req as any).user = decoded as JwtPayload & { id: number; email: string; role: string };
    next();
  });};

const authorizeRoles = (...roles: string[]) => {
  return (req: Request & { user?: { role: string } }, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access forbidden: insufficient rights.' });
      return;
    }
    next();
  };
};

export { authenticateToken, authorizeRoles };
