// src/routes/profile.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import User from '../models/User';

const router = Router();

// ユーザープロファイル取得（認証のみ）
router.get(
  '/',
  authenticateToken,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    console.log('Request User:', req.user); // 追加
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      // データベースからユーザー情報を取得
      const userDetails = await User.findByPk(user.id, {
        attributes: ['id', 'email', 'name', 'profileImage', 'role', 'createdAt', 'updatedAt'],
      });

      if (!userDetails) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      res.json({ message: 'Profile data', user: userDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });

// ユーザープロファイル更新（認証と特定のロールのみ）
router.put(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'editor'), // 例: 'admin' と 'editor' ロールのみ更新可能
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const { name, profileImage } = req.body;

      // データベースでユーザーのプロファイルを更新
      const [updatedRowsCount, updatedRows] = await User.update(
        { name, profileImage },
        { where: { id: user.id }, returning: true }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      res.json({ message: 'Profile updated.', user: updatedRows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  });

export default router;
