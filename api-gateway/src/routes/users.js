import { Router } from 'express';
import { authJwt } from '../middleware/authJwt.js';
import { User, UserInterest } from '../models/index.js';

const router = Router();

router.get('/me/interests', authJwt, async (req, res, next) => {
  try {
    const interests = await UserInterest.findAll({
      where: { user_id: req.userId },
      attributes: ['interest'],
    });
    res.json({ interests: interests.map((i) => i.interest) });
  } catch (err) {
    next(err);
  }
});

router.put('/me/interests', authJwt, async (req, res, next) => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'interests array is required' });
    }

    await UserInterest.destroy({ where: { user_id: req.userId } });
    const normalized = [...new Set(interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean))];
    if (normalized.length < 3) {
      return res.status(400).json({ error: 'At least 3 interests are required' });
    }
    await UserInterest.bulkCreate(
      normalized.map((interest) => ({ user_id: req.userId, interest }))
    );

    res.json({ interests: normalized });
  } catch (err) {
    next(err);
  }
});

router.patch('/me/onboarding', authJwt, async (req, res, next) => {
  try {
    const { completed } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.onboarding_completed = completed !== false;
    await user.save();
    res.json({ onboardingCompleted: user.onboarding_completed });
  } catch (err) {
    next(err);
  }
});

export default router;
