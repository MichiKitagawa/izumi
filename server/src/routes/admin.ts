// src/routes/admin.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import User from '../models/User';

const router = Router();

// ユーザー一覧の取得（管理者専用）
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
      });
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  // ユーザーのBAN
  router.post('/ban/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
    const userId = req.params.id;
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return; // 明示的に関数を終了
      }
      // ユーザーをBANするためのロジックを実装
      // 例: user.banned = true;
      // await user.save();
      res.status(200).json({ message: 'User banned successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  export default router;