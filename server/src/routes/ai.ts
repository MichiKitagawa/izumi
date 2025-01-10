// server/src/routes/ad.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import Ad from '../models/Ad';

const router = Router();

// 広告の作成（管理者専用）
router.post('/', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { adType, contentUrl, targetUrl } = req.body;

  // 入力のバリデーション
  if (!['video', 'banner'].includes(adType)) {
    res.status(400).json({ message: 'Invalid ad type.' });
    return;
  }

  try {
    const ad = await Ad.create({
      adType,
      contentUrl,
      targetUrl,
      active: true,
    });

    res.status(201).json({ message: 'Ad created successfully.', ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ad creation failed.' });
  }
});

// 他のルートも同様に修正
