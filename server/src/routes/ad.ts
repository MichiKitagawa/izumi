// src/routes/ad.ts
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
    return; // 明示的に関数を終了
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

// 広告の取得（全ユーザー）
router.get('/', async (req: Request, res: Response) => {
  try {
    const ads = await Ad.findAll({ where: { active: true } });
    res.status(200).json({ ads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch ads.' });
  }
});

// 広告の更新（管理者専用）
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adType, contentUrl, targetUrl, active } = req.body;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      res.status(404).json({ message: 'Ad not found.' });
      return;
    }

    if (adType) {
      if (!['video', 'banner'].includes(adType)) {
        res.status(400).json({ message: 'Invalid ad type.' });
        return;
      }
      ad.adType = adType;
    }
    if (contentUrl) ad.contentUrl = contentUrl;
    if (targetUrl) ad.targetUrl = targetUrl;
    if (typeof active === 'boolean') ad.active = active;

    await ad.save();

    res.status(200).json({ message: 'Ad updated successfully.', ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ad update failed.' });
  }
});

// 広告の削除（管理者専用）
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      res.status(404).json({ message: 'Ad not found.' });
      return;
    }

    await ad.destroy();

    res.status(200).json({ message: 'Ad deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ad deletion failed.' });
  }
});

export default router;
