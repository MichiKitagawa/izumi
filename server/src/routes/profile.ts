// server/src/routes/profile.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import upload from '../middleware/upload';
import User from '../models/User';
import { uploadToS3 } from '../utils/s3';

const router = Router();

// ユーザープロファイル取得（認証のみ）
router.get(
  '/',
  authenticateToken,
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    console.log('Request User:', req.user);
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

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
  }
);

// ユーザープロファイル更新（認証と特定のロールのみ）
router.put(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'editor', 'subscriber'),
  upload.single('profileImage'),
  async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const { name } = req.body;
      let profileImage: string | undefined = undefined;

      if (req.file) {
        profileImage = await uploadToS3(req.file);
      }

      const updateData: any = { name };
      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      const [updatedRowsCount, updatedRows] = await User.update(
        updateData,
        { where: { id: user.id }, returning: true }
      );

      if (updatedRowsCount === 0) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const updatedUser = updatedRows[0].get({ plain: true }); // plain オブジェクトに変換
      res.json({ message: 'Profile updated.', user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

export default router;
